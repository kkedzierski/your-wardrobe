// src/db/resetDatabase.ts
import * as FileSystem from "expo-file-system/legacy";
import { closeDb, getDatabaseFilePath } from "./database";

export async function resetDatabase() {
  try {
    // 1) zamknij połączenie i wyzeruj globalne db
    await closeDb();

    // 2) ustal dokładny path używany przez getDb()
    const path = await getDatabaseFilePath();

    // 3) usuń plik bazy
    await FileSystem.deleteAsync(path, { idempotent: true });

    console.log("🧹 Usunięto bazę danych:", path);
  } catch (err) {
    console.error("❌ Błąd przy usuwaniu bazy:", err);
  }
}
