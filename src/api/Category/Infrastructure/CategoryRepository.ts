import { getDb } from "../../../db/database";
import { Logger } from "../../Kernel/Logger";
import { ResourceMutationStatus } from "../../Kernel/ResourceMutationStatus";
import type { Category } from "../Domain/Category";

export async function getAllCategories({
  userId,
  limit = 120,
  offset = 0,
  sort = "created_at:desc",
}: {
  userId?: string;
  limit?: number;
  offset?: number;
  sort?: "created_at:desc" | "created_at:asc" | "name:asc" | "name:desc";
} = {}): Promise<Category[]> {
  const t0 = Date.now();
  const db = await getDb();
  const orderBy =
    sort === "created_at:asc"
      ? "c.created_at ASC, c.id ASC"
      : sort === "name:asc"
      ? "c.name COLLATE NOCASE ASC, c.id DESC"
      : sort === "name:desc"
      ? "c.name COLLATE NOCASE DESC, c.id DESC"
      : "c.created_at DESC, c.id DESC";
  const sql = `
    SELECT
      c.id,
      c.user_id,
      c.name,
      c.created_at,
      c.updated_at
    FROM categories c
    WHERE (c.deleted_at IS NULL OR c.deleted_at IS NULL)
      ${userId ? "AND c.user_id = ?" : ""}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?;
  `;
  const params = userId ? [userId, limit, offset] : [limit, offset];
  const rows = await db.getAllAsync<Category>(sql, params);
  const elapsed = Date.now() - t0;
  Logger.info("CategoryRepository.getAllCategories", {
    rows: (rows ?? []).length,
    elapsedMs: elapsed,
    userId: userId ?? null,
    limit,
    offset,
    sort,
  });
  return rows ?? [];
}

export async function getCategoryById({
  userId,
  id,
}: {
  userId: string;
  id: number;
}): Promise<Category | undefined> {
  const db = await getDb();
  const t0 = Date.now();
  const whereUser = userId ? " AND c.user_id = ?" : "";
  const row = await db.getFirstAsync<Category>(
    `
    SELECT
      c.id,
      c.user_id,
      c.name,
      c.created_at,
      c.updated_at
    FROM categories c
    WHERE c.deleted_at IS NULL
      AND c.id = ?${whereUser}
    LIMIT 1
    `,
    userId ? [id, userId] : [id]
  );
  if (!row) return undefined;
  Logger.info("CategoryRepository.getCategoryById", {
    elapsedMs: Date.now() - t0,
    userId,
    id,
    found: !!row,
  });
  return row;
}

export async function insertCategory({
  userId,
  name,
}: {
  userId: string;
  name: string;
}): Promise<{ categoryId: number }> {
  const db = await getDb();
  const now = Date.now();
  // upewnij się, że user istnieje
  const u = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM users WHERE id = ? LIMIT 1",
    [userId]
  );
  if (!u?.id) {
    await db.runAsync(
      `INSERT INTO users (id, kind, role, created_at, updated_at)
       VALUES (?, 'guest', 'ROLE_USER', ?, ?)`,
      [userId, now, now]
    );
  }
  await db.execAsync("BEGIN");
  try {
    await db.runAsync(
      `INSERT INTO categories (user_id, name, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      [userId, name, now, now]
    );
    const { id: categoryId } = (await db.getFirstAsync<{ id: number }>(
      "SELECT last_insert_rowid() AS id"
    ))!;
    await db.execAsync("COMMIT");
    return { categoryId };
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}

export async function updateCategory(
  categoryId: number,
  patch: {
    name?: string;
  },
  userId?: string
): Promise<{
  categoryId: number;
  name?: string;
  updatedAt: string;
} | null> {
  const db = await getDb();
  const sets: string[] = [];
  const args: any[] = [];
  if (typeof patch.name !== "undefined") {
    sets.push("name = ?");
    args.push(patch.name);
  }
  if (sets.length === 0) {
    return null;
  }
  const nowMs = Date.now();
  sets.push("updated_at = ?");
  args.push(nowMs);
  const whereGate = userId ? " AND user_id = ?" : "";
  const sql = `UPDATE categories SET ${sets.join(
    ", "
  )} WHERE id = ?${whereGate}`;
  args.push(categoryId);
  if (userId) args.push(userId);
  let committed = false;
  await db.execAsync("BEGIN");
  try {
    const res = await db.runAsync(sql, args);
    const affected = (res as any)?.changes ?? 0;
    await db.execAsync("COMMIT");
    committed = true;
    if (affected === 0) {
      return null;
    }
  } catch (e) {
    if (!committed) {
      try {
        await db.execAsync("ROLLBACK");
      } catch (e) {
        Logger.error("CategoryRepository.updateCategory: error", {
          categoryId,
          userId,
          error: String(e),
        });
      }
    }
    throw e;
  }
  const whereSelectGate = userId ? " AND user_id = ?" : "";
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    updatedAt: number;
  }>(
    `SELECT id, name, updated_at AS updatedAt FROM categories WHERE id = ?${whereSelectGate}`,
    userId ? [categoryId, userId] : [categoryId]
  );
  if (!row) return null;
  return {
    categoryId: row.id,
    name: row.name ?? undefined,
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export async function deleteCategory(
  categoryId: number,
  userId?: string
): Promise<ResourceMutationStatus> {
  const db = await getDb();
  await db.execAsync("BEGIN");

  try {
    const whereUser = userId ? " AND user_id = ?" : "";

    // 1️⃣ Sprawdź, czy kategoria istnieje
    const category = await db.getFirstAsync(
      `SELECT id FROM categories WHERE id = ?${whereUser} LIMIT 1`,
      userId ? [categoryId, userId] : [categoryId]
    );

    if (!category) {
      await db.execAsync("ROLLBACK");
      return ResourceMutationStatus.NOT_FOUND;
    }

    // 2️⃣ Sprawdź powiązania — czy kategoria jest używana
    const inUse = await db.getFirstAsync(
      `SELECT 1 FROM cloth WHERE category_id = ?${whereUser} LIMIT 1`,
      userId ? [categoryId, userId] : [categoryId]
    );

    if (inUse) {
      await db.execAsync("ROLLBACK");
      return ResourceMutationStatus.IN_USE;
    }

    // 3️⃣ Usuń kategorię
    const res = await db.runAsync(
      `DELETE FROM categories WHERE id = ?${whereUser}`,
      userId ? [categoryId, userId] : [categoryId]
    );

    await db.execAsync("COMMIT");

    const affected = (res as any)?.changes ?? 0;

    return affected > 0
      ? ResourceMutationStatus.SUCCESS
      : ResourceMutationStatus.NOT_FOUND; // fallback, choć nie powinno tu trafić
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}

export async function deleteCategoriesBatch(
  categoryIds: number[],
  userId?: string
): Promise<{
  attempted: number;
  deletedCount: number;
  deletedIds: number[];
  notFoundIds: number[];
}> {
  const ids = Array.from(
    new Set((categoryIds || []).filter((n) => Number.isFinite(n) && n > 0))
  );
  if (ids.length === 0) {
    return { attempted: 0, deletedCount: 0, deletedIds: [], notFoundIds: [] };
  }
  const db = await getDb();
  await db.execAsync("BEGIN");
  try {
    const MAX_PARAMS = 900;
    const existingIds: number[] = [];
    for (let i = 0; i < ids.length; i += MAX_PARAMS) {
      const part = ids.slice(i, i + MAX_PARAMS);
      const ph = part.map(() => "?").join(",");
      const sql = `SELECT id FROM categories WHERE id IN (${ph})${
        userId ? " AND user_id = ?" : ""
      }`;
      const rows = await db.getAllAsync<{ id: number }>(
        sql,
        userId ? [...part, userId] : [...part]
      );
      for (const r of rows ?? []) existingIds.push(r.id);
    }
    if (existingIds.length === 0) {
      await db.execAsync("COMMIT");
      return {
        attempted: ids.length,
        deletedCount: 0,
        deletedIds: [],
        notFoundIds: ids,
      };
    }
    let totalChanges = 0;
    for (let i = 0; i < existingIds.length; i += MAX_PARAMS) {
      const part = existingIds.slice(i, i + MAX_PARAMS);
      const ph = part.map(() => "?").join(",");
      const sqlDel = `DELETE FROM categories WHERE id IN (${ph})${
        userId ? " AND user_id = ?" : ""
      }`;
      const res = await db.runAsync(
        sqlDel,
        userId ? [...part, userId] : [...part]
      );
      totalChanges += (res as any)?.changes ?? 0;
    }
    await db.execAsync("COMMIT");
    const notFound = ids.filter((id) => !existingIds.includes(id));
    return {
      attempted: ids.length,
      deletedCount: totalChanges,
      deletedIds: existingIds,
      notFoundIds: notFound,
    };
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}
