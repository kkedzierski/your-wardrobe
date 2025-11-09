// src/db/sanity.ts
import { getDb } from "./database";
import { randomUUID } from "expo-crypto";

export async function sanityCheckSqlite() {
  const db = await getDb();

  console.log("🔬 SANITY: PRAGMA database_list");
  const dblist = await db.getAllAsync<{
    seq: number;
    name: string;
    file: string;
  }>("PRAGMA database_list;");
  console.log("   →", dblist);

  // 1) testowa tabela i insert
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _sanity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      val TEXT
    );
  `);
  await db.runAsync("INSERT INTO _sanity (val) VALUES (?)", [
    new Date().toISOString(),
  ]);
  const s = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) c FROM _sanity;"
  );
  console.log("🔬 SANITY: _sanity count =", s?.c);

  // 2) spróbujmy wprost wstawić gościa (identyczny INSERT jak w ensure)
  const testId = randomUUID();
  const now = Date.now();
  try {
    await db.runAsync(
      `INSERT INTO users (id, kind, role, created_at, updated_at)
       VALUES (?, 'guest', 'ROLE_USER', ?, ?)`,
      [testId, now, now]
    );
    const u = await db.getFirstAsync<{ c: number }>(
      "SELECT COUNT(*) c FROM users WHERE id = ?",
      [testId]
    );
    console.log("🔬 SANITY: users row for testId exists? =", u?.c);
  } catch (e: any) {
    console.error("❌ SANITY: INSERT INTO users failed:", e?.message ?? e);
  }

  // 3) zbiorcze liczby
  const users = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) c FROM users;"
  );
  const cloth = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) c FROM cloth;"
  );
  const photos = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) c FROM cloth_photos;"
  );
  console.log(
    "📊 SANITY totals → users:",
    users?.c,
    "cloth:",
    cloth?.c,
    "photos:",
    photos?.c
  );
}
