import * as SQLite from "expo-sqlite";
// import Constants from "expo-constants";

export type DatabaseSingleton = SQLite.SQLiteDatabase;

let db: DatabaseSingleton | null = null;

// Dla kompatybilności Expo/DEV: próbuj process.env, potem Constants.manifest.extra.DB_NAME, potem default
const getDbName = (): string => {
  return process.env.DB_NAME;
};

export const getDb = (): DatabaseSingleton =>
  db || (db = SQLite.openDatabaseSync(getDbName()));
