// src/api/Cloth/Infrastructure/ClothRepository.ts
import { getDb } from "../../../db/database";

/** INSERT (jak miałeś) + logi po COMMIT */
type NewClothWithPhotoPayload = {
  user_id: string; // UUID (TEXT)
  file_path: string; // file://...
  hash: string;
  main?: 0 | 1;
  name?: string;
  description?: string | null;
};

export async function insertClothWithPhoto(p: NewClothWithPhotoPayload) {
  const db = await getDb();
  const now = Date.now();

  // upewnij się, że user istnieje (idempotentnie)
  const u = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM users WHERE id = ? LIMIT 1",
    [p.user_id]
  );
  if (!u?.id) {
    await db.runAsync(
      `INSERT INTO users (id, kind, role, created_at, updated_at)
       VALUES (?, 'guest', 'ROLE_USER', ?, ?)`,
      [p.user_id, now, now]
    );
  }

  await db.execAsync("BEGIN");
  try {
    await db.runAsync(
      `INSERT INTO cloth (user_id, name, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [p.user_id, p.name ?? "Nowe ubranie", p.description ?? null, now, now]
    );

    const { id: clothId } = (await db.getFirstAsync<{ id: number }>(
      "SELECT last_insert_rowid() AS id"
    ))!;

    await db.runAsync(
      `INSERT INTO cloth_photos (cloth_id, user_id, file_path, hash, main, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clothId, p.user_id, p.file_path, p.hash, p.main ?? 1, now]
    );

    await db.execAsync("COMMIT");

    // 👇 twarde logi diagnostyczne po zapisie
    const dbg = await db.getAllAsync<{
      seq: number;
      name: string;
      file: string;
    }>("PRAGMA database_list;");
    const cntUsers = await db.getFirstAsync<{ c: number }>(
      "SELECT COUNT(*) c FROM users"
    );
    const cntCloth = await db.getFirstAsync<{ c: number }>(
      "SELECT COUNT(*) c FROM cloth"
    );
    const cntPhotos = await db.getFirstAsync<{ c: number }>(
      "SELECT COUNT(*) c FROM cloth_photos"
    );
    console.log("💾 insertClothWithPhoto → DB:", dbg);
    console.log(
      "💾 totals → users:",
      cntUsers?.c,
      "cloth:",
      cntCloth?.c,
      "photos:",
      cntPhotos?.c
    );

    return { clothId };
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}

/** === Typ do siatki === */
export type WardrobePhoto = {
  id: number;
  cloth_id: number;
  user_id: string; // UUID (TEXT)
  file_path: string; // file://...
  hash?: string;
  main: number; // 0/1
  created_at: number;
};

/** === Wszystkie zdjęcia (bez filtra użytkownika) === */
export async function fetchWardrobePhotosAll({
  limit = 120,
  offset = 0,
}: { limit?: number; offset?: number } = {}): Promise<WardrobePhoto[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<WardrobePhoto>(
    `SELECT id, cloth_id, user_id, file_path, hash, main, created_at
       FROM cloth_photos
      WHERE deleted_at IS NULL OR deleted_at IS NULL
   ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows ?? [];
}

/** === Tylko zdjęcia danego usera (gdy chcesz filtrować) === */
export async function fetchWardrobePhotosByUser(
  userId: string,
  { limit = 120, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<WardrobePhoto[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<WardrobePhoto>(
    `SELECT id, cloth_id, user_id, file_path, hash, main, created_at
       FROM cloth_photos
      WHERE user_id = ?
        AND (deleted_at IS NULL OR deleted_at IS NULL)
   ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows ?? [];
}

/** === (opcjonalnie) szybkie policzenie fot dla usera — do diagnostyki === */
export async function countPhotosForUser(userId: string) {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) c FROM cloth_photos WHERE user_id = ?",
    [userId]
  );
  return row?.c ?? 0;
}
