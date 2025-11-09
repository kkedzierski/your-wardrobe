// src/db/database.ts
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system/legacy"; // stabilne mkdir/getInfo
import Constants from "expo-constants";

let db: SQLite.SQLiteDatabase | null = null;

// nazwa pliku (możesz zostawić jak było)
const DB_FILE = (
  Constants.expoConfig?.extra?.DB_NAME ?? "yourwardrobe.db"
).replace(/^\/+/, "");

export const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  // 1) upewnij się, że katalog do bazy istnieje: <Documents>/SQLite/
  const baseDir = FileSystem.documentDirectory; // np. file:///.../Documents/
  const sqliteDir = baseDir + "SQLite/";
  const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
  }

  // 2) pełna ścieżka do pliku bazy W KATALOGU PISALNYM
  const dbPath = sqliteDir + DB_FILE;

  // 3) otwórz po pełnej ścieżce (to klucz do uniknięcia readonly)
  db = await SQLite.openDatabaseAsync(dbPath);

  // 4) opcjonalnie: tryb WAL + FK
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");

  // 5) log pomocniczy
  const dblist = await db.getAllAsync<{ file: string }>(
    "PRAGMA database_list;"
  );
  console.log("📍 DB opened at:", dblist);

  return db;
};
