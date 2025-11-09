// src/auth/ensureGuestUser.ts
import * as SecureStore from "expo-secure-store";
import { randomUUID } from "expo-crypto";
import { getDb } from "../db/database";

const KEY_ACTIVE = "active_user_id";

export async function ensureGuestUser(): Promise<string> {
  const db = await getDb();

  try {
    const saved = await SecureStore.getItemAsync(KEY_ACTIVE);
    console.log("🔐 SecureStore KEY_ACTIVE =", saved);

    if (saved) {
      const row = await db.getFirstAsync<{ id: string }>(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [saved]
      );
      console.log("🔎 users row by saved id:", row);

      if (!row?.id) {
        const now = Date.now();
        console.log("🧩 user not found → creating guest with id", saved);
        await db.runAsync(
          `INSERT INTO users (id, kind, role, created_at, updated_at)
           VALUES (?, 'guest', 'ROLE_USER', ?, ?)`,
          [saved, now, now]
        );
        const c = await db.getFirstAsync<{ c: number }>(
          "SELECT COUNT(*) c FROM users WHERE id = ?",
          [saved]
        );
        console.log("🧮 users count for saved =", c?.c);
      }
      return saved;
    }

    // brak w SecureStore → nowy gość
    const id = randomUUID();
    const now = Date.now();
    console.log("🆕 creating new guest user with id", id);

    await db.runAsync(
      `INSERT INTO users (id, kind, role, created_at, updated_at)
       VALUES (?, 'guest', 'ROLE_USER', ?, ?)`,
      [id, now, now]
    );

    const c2 = await db.getFirstAsync<{ c: number }>(
      "SELECT COUNT(*) c FROM users WHERE id = ?",
      [id]
    );
    console.log("🧮 users count for new id =", c2?.c);

    await SecureStore.setItemAsync(KEY_ACTIVE, id);
    console.log("🔐 saved KEY_ACTIVE in SecureStore");

    return id;
  } catch (e: any) {
    console.error("❌ ensureGuestUser failed:", e?.message ?? e);
    throw e;
  }
}

export async function getActiveUserId(): Promise<string> {
  const saved = await SecureStore.getItemAsync(KEY_ACTIVE);
  if (saved) return saved;
  return ensureGuestUser();
}
