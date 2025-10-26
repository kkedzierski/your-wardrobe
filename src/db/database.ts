// src/db/database.ts
import * as SQLite from "expo-sqlite";
import Constants from "expo-constants";

export type DatabaseSingleton = SQLite.SQLiteDatabase;

let db: DatabaseSingleton | null = null;

// Nazwa bazy - tak jak miałeś
const getDbName = (): string => {
  return Constants.expoConfig?.extra?.DB_NAME ?? "yourwardrobe.db";
};

// Uwaga: teraz to jest ASYNC, bo openDatabaseAsync zwraca Promise.
export const getDb = async (): Promise<DatabaseSingleton> => {
  return db || (await SQLite.openDatabaseAsync(getDbName()));
};
