import { getDb } from "./database";
import { Migration, MigrationResult } from "./Migration";
import { getUpMigrations, getDownMigrations } from "./MigrationsRegistry";

export class MigrationManager {
  db = getDb();

  public async getAppliedMigrationIds(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          "create table if not exists migrations (id integer primary key autoincrement, migration_id text unique not null)",
          [],
          () => {
            tx.executeSql(
              "select migration_id from migrations",
              [],
              (_, { rows }) => {
                const arr: string[] = [];
                for (let i = 0; i < rows.length; i++) {
                  arr.push(rows.item(i).migration_id);
                }
                resolve(arr);
              },
              (_, err) => {
                reject(err);
                return false;
              }
            );
          }
        );
      });
    });
  }

  private splitSqlStatements(sql: string): string[] {
    return sql
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);
  }

  public async recordMigration(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          "insert or ignore into migrations (migration_id) values (?)",
          [id],
          resolve,
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async removeMigrationRecord(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          "delete from migrations where migration_id = ?",
          [id],
          resolve,
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  private async execMigration(
    migration: Migration,
    up: boolean
  ): Promise<MigrationResult> {
    return new Promise((resolve) => {
      this.db.transaction(
        (tx) => {
          for (const statement of this.splitSqlStatements(migration.sql)) {
            tx.executeSql(statement);
          }
        },
        (err) =>
          resolve({
            success: false,
            error: err?.message ?? String(err),
          }),
        async () => {
          if (up) await this.recordMigration(migration.id);
          else await this.removeMigrationRecord(migration.id);
          resolve({ success: true });
        }
      );
    });
  }

  public async applyAllUpMigrations(): Promise<MigrationResult[]> {
    const applied = await this.getAppliedMigrationIds();
    const toApply = getUpMigrations().filter((m) => !applied.includes(m.id));
    const results: MigrationResult[] = [];
    for (const migration of toApply) {
      const res = await this.execMigration(migration, true);
      results.push(res);
    }
    return results;
  }

  public async applyAllDownMigrations(): Promise<MigrationResult[]> {
    // Kiery cofasz, kasujesz wpis z migrations
    const applied = await this.getAppliedMigrationIds();
    const toRollback = getDownMigrations().filter(
      (m) =>
        applied.includes(m.id.replace(".down", ".up")) || applied.includes(m.id)
    );
    const results: MigrationResult[] = [];
    for (const migration of toRollback.reverse()) {
      const res = await this.execMigration(migration, false);
      results.push(res);
    }
    return results;
  }
}
