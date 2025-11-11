// src/api/Cloth/Infrastructure/ClothRepository.ts
import { getDb } from "../../../db/database";
import { Logger } from "../../Kernel/Logger";
import type { Cloth, NewClothWithPhotoDraft } from "../Domain/Cloth";

export async function insertClothWithPhoto(p: NewClothWithPhotoDraft) {
  const db = await getDb();
  const now = Date.now();

  // upewnij się, że user istnieje (idempotentnie)
  const u = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM users WHERE id = ? LIMIT 1",
    [p.userId]
  );
  if (!u?.id) {
    await db.runAsync(
      `INSERT INTO users (id, kind, role, created_at, updated_at)
       VALUES (?, 'guest', 'ROLE_USER', ?, ?)`,
      [p.userId, now, now]
    );
  }

  await db.execAsync("BEGIN");
  try {
    await db.runAsync(
      `INSERT INTO cloth (user_id, name, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [p.userId, p.name ?? "Nowe ubranie", p.description ?? null, now, now]
    );

    const { id: clothId } = (await db.getFirstAsync<{ id: number }>(
      "SELECT last_insert_rowid() AS id"
    ))!;

    await db.runAsync(
      `INSERT INTO cloth_photos (cloth_id, user_id, file_path, hash, main, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clothId, p.userId, p.filePath, p.hash, p.main ?? 1, now]
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
} = {}): Promise<Cloth[]> {
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
    userId: string;
    name: string;
    description: string | null;
    created_at: number;
    updated_at: number;
    thumb_path?: string | null;
  }>(sql, params);

  const result: Cloth[] =
    (rows ?? []).map((r) => ({
      id: r.id,
      userId: r.userId,
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

export async function updateCloth(
  clothId: number,
  patch: {
    description?: string;
    color?: string;
    brand?: string;
    location?: string;
  },
  userId?: string
): Promise<{
  clothId: number;
  description?: string;
  color?: string;
  brand?: string;
  location?: string;
  updatedAt: string; // ISO dla UI
} | null> {
  const db = await getDb();

  // 1) Zbuduj SET zanim ruszysz transakcję
  const sets: string[] = [];
  const args: any[] = [];

  if (typeof patch.description !== "undefined") {
    sets.push("description = ?");
    args.push(patch.description);
  }
  if (typeof patch.color !== "undefined") {
    sets.push("color = ?");
    args.push(patch.color);
  }
  if (typeof patch.brand !== "undefined") {
    sets.push("brand = ?");
    args.push(patch.brand);
  }
  if (typeof patch.location !== "undefined") {
    sets.push("location = ?");
    args.push(patch.location);
  }

  if (sets.length === 0) {
    Logger.warn("ClothRepository.updateCloth: empty patch", {
      clothId,
      userId,
    });
    return null;
  }

  // 2) Ustal updated_at jako INTEGER (epoch ms)
  const nowMs = Date.now();
  sets.push("updated_at = ?");
  args.push(nowMs);

  const whereGate = userId ? " AND user_id = ?" : "";
  const sql = `UPDATE cloth SET ${sets.join(", ")} WHERE id = ?${whereGate}`;
  args.push(clothId);
  if (userId) args.push(userId);

  let committed = false;
  await db.execAsync("BEGIN"); // lub "BEGIN IMMEDIATE"

  try {
    const res = await db.runAsync(sql, args);
    const affected = (res as any)?.changes ?? 0;

    await db.execAsync("COMMIT");
    committed = true;

    if (affected === 0) {
      Logger.warn("ClothRepository.updateCloth: no rows affected", {
        clothId,
        userId,
      });
      return null;
    }
  } catch (e) {
    if (!committed) {
      // ROLLBACK tylko jeśli transakcja wciąż otwarta
      try {
        await db.execAsync("ROLLBACK");
      } catch {}
    }
    Logger.error("ClothRepository.updateCloth: error", {
      clothId,
      userId,
      error: String(e),
    });
    throw e;
  }

  // 3) Post-commit SELECT poza blokiem transakcji + z aliasami
  const whereSelectGate = userId ? " AND user_id = ?" : "";
  const row = await db.getFirstAsync<{
    id: number;
    description: string | null;
    color: string | null;
    brand: string | null;
    location: string | null;
    updatedAt: number; // alias z updated_at
  }>(
    `
    SELECT
      id,
      description,
      color,
      brand,
      location,
      updated_at AS updatedAt
    FROM cloth
    WHERE id = ?${whereSelectGate}
    `,
    userId ? [clothId, userId] : [clothId]
  );

  Logger.info("Repo committed cloth update", { clothId });

  if (!row) return null;

  return {
    clothId: row.id,
    description: row.description ?? undefined,
    color: row.color ?? undefined,
    brand: row.brand ?? undefined,
    location: row.location ?? undefined,
    updatedAt: new Date(row.updatedAt).toISOString(), // konwersja ms -> ISO
  };
}

type ClothRow = {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  brand: string | null;
  color: string | null;
  season: string | null;
  location: string | null;
  createdAt: number; // masz INTEGER w DB
  updatedAt: number;
  categoryId: number | null;
};

export async function getClothById({
  userId,
  id,
}: {
  userId: string;
  id: number;
}): Promise<Cloth | undefined> {
  const db = await getDb();
  const t0 = Date.now();

  const whereUser = userId ? " AND c.user_id = ?" : "";
  const clothRow = await db.getFirstAsync<ClothRow>(
    `
    SELECT
      c.id            AS id,
      c.user_id       AS userId,
      c.name          AS name,
      c.description   AS description,
      c.brand         AS brand,
      c.color         AS color,
      c.season        AS season,
      c.location      AS location,
      c.created_at    AS createdAt,
      c.updated_at    AS updatedAt,
      c.category_id   AS categoryId
    FROM cloth c
    WHERE c.deleted_at IS NULL
      AND c.id = ?${whereUser}
    LIMIT 1
    `,
    userId ? [id, userId] : [id]
  );

  if (!clothRow) {
    Logger.info("ClothRepository.getClothById", {
      elapsedMs: Date.now() - t0,
      userId,
      id,
      hit: false,
    });
    return undefined;
  }

  // --- Kategoria (opcjonalna; tabela: categories) ---
  let category: Cloth["category"] = null;
  if (clothRow.categoryId != null) {
    const cat = await db.getFirstAsync<{ id: number; name: string }>(
      `
      SELECT id, name
      FROM categories
      WHERE id = ?
        AND deleted_at IS NULL
        AND user_id = ?
      LIMIT 1
      `,
      [clothRow.categoryId, clothRow.userId]
    );
    if (cat) category = { id: cat.id, name: cat.name };
  }

  // --- Tagi (opcjonalne; tabele: tags + cloth_tags) ---
  const tags =
    (await db.getAllAsync<{ id: number; name: string }>(
      `
      SELECT t.id AS id, t.name AS name
        FROM cloth_tags ct
        JOIN tags t ON t.id = ct.tag_id
       WHERE ct.cloth_id = ?
         AND t.user_id = ?
      ORDER BY t.name COLLATE NOCASE ASC
      `,
      [clothRow.id, clothRow.userId]
    )) ?? [];

  const entity: Cloth = {
    id: clothRow.id,
    userId: clothRow.userId,
    name: clothRow.name,
    description: clothRow.description ?? null,
    brand: clothRow.brand ?? null,
    color: clothRow.color ?? null,
    season: clothRow.season ?? null,
    location: clothRow.location ?? null,
    category, // null kiedy brak kategorii
    tags, // [] kiedy brak tagów
    createdAt: clothRow.createdAt,
    updatedAt: clothRow.updatedAt,
  };

  Logger.info("ClothRepository.getClothById", {
    elapsedMs: Date.now() - t0,
    userId,
    id,
    hit: true,
    hasCategory: !!category,
    tags: tags.length,
  });

  return entity;
}
