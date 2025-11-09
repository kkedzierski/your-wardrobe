import * as FileSystem from "expo-file-system/legacy";

export async function resetDatabase(dbName = "yourwardrobe.db") {
  const path = `${FileSystem.documentDirectory}SQLite/${dbName}`;
  try {
    await FileSystem.deleteAsync(path, { idempotent: true });
    console.log("🧹 Usunięto bazę danych:", path);
  } catch (err) {
    console.error("❌ Błąd przy usuwaniu bazy:", err);
  }
}
