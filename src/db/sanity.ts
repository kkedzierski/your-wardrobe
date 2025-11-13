// src/db/sanity.ts
import { getDb } from "./database";

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

  // 2) ewentualnie: sprawdź, czy istnieją tabele domenowe (bez insertów)
  const usersTable = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users';"
  );
  console.log("🔬 SANITY: users table exists?", !!usersTable?.name);

  // 3) summary log
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
