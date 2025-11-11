import { getDb } from "../../../db/database";
import type { Tag } from "../Domain/Tag";

export async function insertTag({
  userId,
  name,
}: {
  userId: string;
  name: string;
}): Promise<{ tagId: number }> {
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
      `INSERT INTO tags (user_id, name, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      [userId, name, now, now]
    );
    const { id: tagId } = (await db.getFirstAsync<{ id: number }>(
      "SELECT last_insert_rowid() AS id"
    ))!;
    await db.execAsync("COMMIT");
    return { tagId };
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}

export async function getAllTags({
  userId,
  limit = 120,
  offset = 0,
  sort = "created_at:desc",
}: {
  userId?: string;
  limit?: number;
  offset?: number;
  sort?: "created_at:desc" | "created_at:asc" | "name:asc" | "name:desc";
} = {}): Promise<Tag[]> {
  const db = await getDb();
  const orderBy =
    sort === "created_at:asc"
      ? "t.created_at ASC, t.id ASC"
      : sort === "name:asc"
      ? "t.name COLLATE NOCASE ASC, t.id DESC"
      : sort === "name:desc"
      ? "t.name COLLATE NOCASE DESC, t.id DESC"
      : "t.created_at DESC, t.id DESC";

  const sql = `
    SELECT t.id, t.user_id, t.name, t.created_at, t.updated_at
      FROM tags t
     WHERE 1=1
       ${userId ? "AND t.user_id = ?" : ""}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?;
  `;
  const params = userId ? [userId, limit, offset] : [limit, offset];
  const rows = await db.getAllAsync<Tag>(sql, params);
  return rows ?? [];
}

export async function getTagById({
  userId,
  id,
}: {
  userId: string;
  id: number;
}): Promise<Tag | undefined> {
  const db = await getDb();
  const whereUser = userId ? " AND t.user_id = ?" : "";
  const row = await db.getFirstAsync<Tag>(
    `SELECT id, user_id, name, created_at, updated_at FROM tags t WHERE t.id = ?${whereUser} LIMIT 1`,
    userId ? [id, userId] : [id]
  );
  return row ?? undefined;
}

export async function updateTag(
  tagId: number,
  patch: {
    name?: string;
  },
  userId?: string
): Promise<{
  tagId: number;
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
  const sql = `UPDATE tags SET ${sets.join(", ")} WHERE id = ?${whereGate}`;
  args.push(tagId);
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
      } catch {}
    }
    throw e;
  }
  const whereSelectGate = userId ? " AND user_id = ?" : "";
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    updatedAt: number;
  }>(
    `SELECT id, name, updated_at AS updatedAt FROM tags WHERE id = ?${whereSelectGate}`,
    userId ? [tagId, userId] : [tagId]
  );
  if (!row) return null;
  return {
    tagId: row.id,
    name: row.name ?? undefined,
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export async function deleteTag(
  tagId: number,
  userId?: string
): Promise<boolean> {
  const db = await getDb();
  await db.execAsync("BEGIN");
  try {
    const whereTag = userId ? " AND user_id = ?" : "";
    const res = await db.runAsync(
      `DELETE FROM tags WHERE id = ?${whereTag}`,
      userId ? [tagId, userId] : [tagId]
    );
    await db.execAsync("COMMIT");
    const affected = (res as any)?.changes ?? 0;
    return affected > 0;
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}

export async function deleteTagsBatch(
  tagIds: number[],
  userId?: string
): Promise<{
  attempted: number;
  deletedCount: number;
  deletedIds: number[];
  notFoundIds: number[];
}> {
  const ids = Array.from(
    new Set((tagIds || []).filter((n) => Number.isFinite(n) && n > 0))
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
      const sql = `SELECT id FROM tags WHERE id IN (${ph})${
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
      const sqlDel = `DELETE FROM tags WHERE id IN (${ph})${
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

export async function setTagsForCloth(
  clothId: number,
  tagIds: number[],
  userId?: string
) {
  const db = await getDb();
  await db.execAsync("BEGIN");
  try {
    // (opcjonalnie) walidacja, że cloth należy do usera
    if (userId) {
      const owns = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM cloth WHERE id = ? AND user_id = ? LIMIT 1",
        [clothId, userId]
      );
      if (!owns?.id) {
        await db.execAsync("ROLLBACK");
        return { ok: false as const, reason: "NO_CLOTH" };
      }
    }

    // (opcjonalnie) walidacja, że wszystkie tagi należą do usera
    if (userId && tagIds.length) {
      const ph = tagIds.map(() => "?").join(",");
      const rows = await db.getAllAsync<{ id: number }>(
        `SELECT id FROM tags WHERE id IN (${ph}) AND user_id = ?`,
        [...tagIds, userId]
      );
      const found = new Set(rows?.map((r) => r.id) ?? []);
      const bad = tagIds.filter((id) => !found.has(id));
      if (bad.length) {
        await db.execAsync("ROLLBACK");
        return { ok: false as const, reason: "FOREIGN_TAG", bad };
      }
    }

    // wyczyść stare powiązania
    await db.runAsync(
      userId
        ? `DELETE FROM cloth_tags WHERE cloth_id = ?`
        : `DELETE FROM cloth_tags WHERE cloth_id = ?`,
      [clothId]
    );

    // wstaw nowe
    if (tagIds.length) {
      const values = tagIds.map(() => "(?, ?)").join(",");
      const args = tagIds.flatMap((tid) => [clothId, tid]);
      await db.runAsync(
        `INSERT INTO cloth_tags (cloth_id, tag_id) VALUES ${values}`,
        args
      );
    }

    await db.execAsync("COMMIT");
    return { ok: true as const };
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}
