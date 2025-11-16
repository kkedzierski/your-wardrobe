// src/db/database.ts
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system/legacy"; // stabilne mkdir/getInfo
import Constants from "expo-constants";

let db: SQLite.SQLiteDatabase | null = null;

// nazwa pliku (możesz zostawić jak było)
const DB_FILE =
  (Constants.expoConfig?.extra?.DB_NAME as string | undefined) ??
  "yourwardrobe.db";

export const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  // expo-sqlite samo wybierze domyślny katalog (defaultDatabaseDirectory)
  db = await SQLite.openDatabaseAsync(DB_FILE);

  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const dblist = await db.getAllAsync<{ file: string }>(
    "PRAGMA database_list;"
  );
  console.log("📍 DB opened:", dblist);

  return db;
};

export const closeDb = async () => {
  if (db) {
    try {
      await db.closeAsync();
    } catch (e) {
      console.warn("⚠️ Problem przy zamykaniu DB:", e);
    }
    db = null;
  }
};

export const getDatabaseFilePath = async () => {
  const baseDir = FileSystem.documentDirectory!;
  const sqliteDir = baseDir + "SQLite/";
  const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
  }
  return sqliteDir + DB_FILE;
};
