// src/api/Cloth/Infrastructure/ClothRepository.ts
import { getDb } from "../../../db/database";
import { Logger } from "../../Kernel/Logger";
import { Cloth } from "../Domain/Cloth";

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

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Zbiorcze usuwanie ubrań:
 *  - ogranicza IN (...) do max ~900 parametrów (bezpieczny margines)
 *  - transakcja: BEGIN → (DELETE photos) → (DELETE cloth) → COMMIT
 *  - zwraca: ile prób, ile faktycznie usunięto, które ID nie istniały / nie należały do usera
 */
export async function deleteClothesBatch(
  clothIds: number[],
  userId?: string
): Promise<{
  attempted: number;
  deletedCount: number;
  deletedIds: number[];
  notFoundIds: number[];
}> {
  const ids = Array.from(
    new Set((clothIds || []).filter((n) => Number.isFinite(n) && n > 0))
  );
  if (ids.length === 0) {
    return { attempted: 0, deletedCount: 0, deletedIds: [], notFoundIds: [] };
  }

  const db = await getDb();
  const t0 = Date.now();
  await db.execAsync("BEGIN");
  try {
    // 1) Ustal, które ID faktycznie istnieją (i należą do usera, jeśli podany)
    const MAX_PARAMS = 900;
    const existingIds: number[] = [];
    for (const part of chunk(ids, MAX_PARAMS)) {
      const ph = part.map(() => "?").join(",");
      const sql = `
        SELECT id FROM cloth
         WHERE id IN (${ph})
           ${userId ? "AND user_id = ?" : ""}
           AND (deleted_at IS NULL OR deleted_at IS NULL)
      `;
      const rows = await db.getAllAsync<{ id: number }>(
        sql,
        userId ? [...part, userId] : [...part]
      );
      for (const r of rows ?? []) existingIds.push(r.id);
    }

    if (existingIds.length === 0) {
      await db.execAsync("COMMIT");
      Logger.warn("deleteClothesBatch: no matching ids", {
        attempted: ids.length,
        userId: userId ?? null,
      });
      return {
        attempted: ids.length,
        deletedCount: 0,
        deletedIds: [],
        notFoundIds: ids,
      };
    }

    // 2) Usuń powiązane zdjęcia
    for (const part of chunk(existingIds, MAX_PARAMS)) {
      const ph = part.map(() => "?").join(",");
      const sqlPhotos = `
        DELETE FROM cloth_photos
         WHERE cloth_id IN (${ph})
           ${userId ? "AND user_id = ?" : ""}
      `;
      await db.runAsync(sqlPhotos, userId ? [...part, userId] : [...part]);
    }

    // 3) Usuń cloth
    let totalChanges = 0;
    for (const part of chunk(existingIds, MAX_PARAMS)) {
      const ph = part.map(() => "?").join(",");
      const sqlCloth = `
        DELETE FROM cloth
         WHERE id IN (${ph})
           ${userId ? "AND user_id = ?" : ""}
      `;
      const res = await db.runAsync(
        sqlCloth,
        userId ? [...part, userId] : [...part]
      );
      totalChanges += (res as any)?.changes ?? 0;
    }

    await db.execAsync("COMMIT");

    const notFound = ids.filter((id) => !existingIds.includes(id));
    const elapsed = Date.now() - t0;

    Logger.info("ClothRepository.deleteClothesBatch", {
      attempted: ids.length,
      matched: existingIds.length,
      deleted: totalChanges,
      elapsedMs: elapsed,
      userId: userId ?? null,
    });

    return {
      attempted: ids.length,
      deletedCount: totalChanges, // powinno równać się existingIds.length
      deletedIds: existingIds,
      notFoundIds: notFound,
    };
  } catch (e) {
    await db.execAsync("ROLLBACK");
    Logger.error("ClothRepository.deleteClothesBatch error", {
      ids,
      userId,
      error: String(e),
    });
    throw e;
  }
}

export async function deleteCloth(
  clothId: number,
  userId?: string
): Promise<boolean> {
  const db = await getDb();
  await db.execAsync("BEGIN");
  try {
    // (opcjonalnie) najpierw usuń photos powiązane
    const wherePhotos = userId ? " AND user_id = ?" : "";
    await db.runAsync(
      `DELETE FROM cloth_photos WHERE cloth_id = ?${wherePhotos}`,
      userId ? [clothId, userId] : [clothId]
    );

    // usuń rekord cloth
    const whereCloth = userId ? " AND user_id = ?" : "";
    const res = await db.runAsync(
      `DELETE FROM cloth WHERE id = ?${whereCloth}`,
      userId ? [clothId, userId] : [clothId]
    );

    await db.execAsync("COMMIT");

    // res.changes bywa dostępne w różnych wrapperach; gdy brak, sprawdzaj selektem.
    const affected = (res as any)?.changes ?? 0;
    if (affected === 0) {
      Logger.warn("ClothRepository.deleteCloth: no rows affected", {
        clothId,
        userId,
      });
    }
    return affected > 0;
  } catch (e) {
    await db.execAsync("ROLLBACK");
    Logger.error("ClothRepository.deleteCloth: error", {
      clothId,
      userId,
      error: String(e),
    });
    throw e;
  }
}

export type GetAllClothsSort =
  | "created_at:desc"
  | "created_at:asc"
  | "name:asc"
  | "name:desc";

export type ClothListItem = {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
  thumbUrl?: string;
};

export async function getAllCloths({
  userId,
  limit = 120,
  offset = 0,
  sort = "created_at:desc",
}: {
  userId?: string;
  limit?: number;
  offset?: number;
  sort?: GetAllClothsSort;
} = {}): Promise<ClothListItem[]> {
  const t0 = Date.now();
  const db = await getDb();

  const orderBy =
    sort === "created_at:asc"
      ? "c.created_at ASC, c.id ASC"
      : sort === "name:asc"
      ? "c.name COLLATE NOCASE ASC, c.id DESC"
      : sort === "name:desc"
      ? "c.name COLLATE NOCASE DESC, c.id DESC"
      : "c.created_at DESC, c.id DESC"; // domyślnie created_at:desc

  const sql = `
    SELECT
      c.id,
      c.user_id,
      c.name,
      c.description,
      c.created_at,
      c.updated_at,
      (
        SELECT p.file_path
          FROM cloth_photos p
         WHERE p.cloth_id = c.id
           AND (p.deleted_at IS NULL OR p.deleted_at IS NULL)
         ORDER BY p.main DESC, p.created_at DESC, p.id DESC
         LIMIT 1
      ) AS thumb_path
    FROM cloth c
    WHERE (c.deleted_at IS NULL OR c.deleted_at IS NULL)
      ${userId ? "AND c.user_id = ?" : ""}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?;
  `;

  const params = userId ? [userId, limit, offset] : [limit, offset];
  const rows = await db.getAllAsync<{
    id: number;
    user_id: string;
    name: string;
    description: string | null;
    created_at: number;
    updated_at: number;
    thumb_path?: string | null;
  }>(sql, params);

  const result: ClothListItem[] =
    (rows ?? []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      description: r.description,
      created_at: r.created_at,
      updated_at: r.updated_at,
      thumbUrl: r.thumb_path ?? undefined,
    })) ?? [];

  const elapsed = Date.now() - t0;
  Logger.info("ClothRepository.getAllCloths", {
    rows: result.length,
    elapsedMs: elapsed,
    userId: userId ?? null,
    limit,
    offset,
    sort,
  });

  return result;
}
