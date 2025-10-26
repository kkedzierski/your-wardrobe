import { getDb } from "./database";
import { Migration, MigrationResult } from "./Migration";
import { getUpMigrations, getDownMigrations } from "./MigrationsRegistry";

export class MigrationManager {
  private dbPromise = getDb();

  private async db() {
    return await this.dbPromise;
  }

  // już nam niepotrzebne splitSqlStatements jeżeli lecimy jednym execAsync
  // zostawiam tylko na wszelki wypadek, ale nie używamy
  private splitSqlStatements(sql: string): string[] {
    return sql
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);
  }

  public async getAppliedMigrationIds(): Promise<string[]> {
    const db = await this.db();

    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          migration_id TEXT UNIQUE NOT NULL
        );
      `);
    });

    const rows = await db.getAllAsync<{ migration_id: string }>(
      "SELECT migration_id FROM migrations"
    );

    return rows.map((r) => r.migration_id);
  }

  public async recordMigration(id: string): Promise<void> {
    const db = await this.db();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        "INSERT OR IGNORE INTO migrations (migration_id) VALUES (?);",
        [id]
      );
    });
  }

  public async removeMigrationRecord(id: string): Promise<void> {
    const db = await this.db();
    await db.withTransactionAsync(async () => {
      await db.runAsync("DELETE FROM migrations WHERE migration_id = ?;", [id]);
    });
  }

  private async execMigration(
    migration: Migration,
    up: boolean
  ): Promise<MigrationResult> {
    const db = await this.db();

    console.log("🔄 Running migration:", migration.id);

    // 1. Rozbijamy SQL na pojedyncze "kawałki" po średniku
    const statementsRaw = migration.sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // 2. Każdy kawałek klasyfikujemy jako TABLE / INDEX / OTHER
    const tableStatements: string[] = [];
    const indexStatements: string[] = [];
    const otherStatements: string[] = [];

    for (const raw of statementsRaw) {
      // Usuń linie komentarzy zaczynające się od `--`
      const cleaned = raw
        .split("\n")
        .map((line) => {
          const trimmed = line.trimStart();
          if (trimmed.startsWith("--")) {
            return ""; // wywalamy komentarz-linię
          }
          return line;
        })
        .join("\n")
        .trim();

      if (!cleaned) {
        continue;
      }

      const lower = cleaned.toLowerCase().trimStart();

      if (lower.startsWith("create table")) {
        tableStatements.push(cleaned);
      } else if (
        lower.startsWith("create index") ||
        lower.startsWith("create unique index")
      ) {
        indexStatements.push(cleaned);
      } else {
        otherStatements.push(cleaned);
      }
    }

    console.log("   parsed TABLE statements:", tableStatements.length);
    console.log("   parsed INDEX statements:", indexStatements.length);
    console.log("   parsed OTHER statements:", otherStatements.length);

    try {
      // FAZA 1: tworzymy tabele w transakcji
      await db.withTransactionAsync(async () => {
        for (const st of tableStatements) {
          console.log("   🏗 CREATE TABLE:", st);
          await db.execAsync(st + ";");
        }
      });

      // FAZA 2: tworzymy indeksy bez transakcji
      for (const st of indexStatements) {
        console.log("   🧱 CREATE INDEX (no tx):", st);
        await db.execAsync(st + ";");
      }

      // FAZA 3: inne komendy (tu raczej nic na razie nie masz, ale zostaje)
      for (const st of otherStatements) {
        console.log("   ✳ OTHER (no tx):", st);
        await db.execAsync(st + ";");
      }

      // FAZA 4: zapisz wpis o migracji
      if (up) {
        await this.recordMigration(migration.id);
      } else {
        await this.removeMigrationRecord(migration.id);
      }

      console.log("✅ Migration success:", migration.id);
      return { success: true };
    } catch (err: any) {
      console.error("❌ Migration failed in migration:", migration.id, err);
      return {
        success: false,
        error: err?.message ?? String(err),
      };
    }
  }

  public async applyAllUpMigrations(): Promise<MigrationResult[]> {
    console.log("▶ applyAllUpMigrations()");
    const applied = await this.getAppliedMigrationIds();
    console.log("   already applied:", applied);

    const toApply = getUpMigrations().filter((m) => !applied.includes(m.id));
    console.log(
      "   to apply:",
      toApply.map((m) => m.id)
    );

    const results: MigrationResult[] = [];
    for (const migration of toApply) {
      const res = await this.execMigration(migration, true);
      results.push(res);

      if (!res.success) {
        // jeżeli którakolwiek migracja się wywali, rzuć błąd,
        // żeby App.tsx .catch() to złapał
        throw new Error(
          `Migration ${migration.id} failed: ${res.error ?? "unknown error"}`
        );
      }
    }

    console.log("✅ All up migrations applied");
    return results;
  }

  public async applyAllDownMigrations(): Promise<MigrationResult[]> {
    console.log("▶ applyAllDownMigrations()");
    const applied = await this.getAppliedMigrationIds();
    console.log("   currently applied:", applied);

    const toRollback = getDownMigrations().filter(
      (m) =>
        typeof m.id === "string" &&
        (applied.includes(m.id.replace(".down", ".up")) ||
          applied.includes(m.id))
    );

    console.log(
      "   to rollback:",
      toRollback.map((m) => m.id)
    );

    const results: MigrationResult[] = [];
    for (const migration of toRollback.reverse()) {
      const res = await this.execMigration(migration, false);
      results.push(res);

      if (!res.success) {
        throw new Error(
          `Rollback ${migration.id} failed: ${res.error ?? "unknown error"}`
        );
      }
    }

    console.log("✅ All down migrations rolled back");
    return results;
  }
}
