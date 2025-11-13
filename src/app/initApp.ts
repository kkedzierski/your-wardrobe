// src/app/initApp.ts
import { runMigrations, MigrationType } from "../db";
import { resetDatabase } from "../db/resetDatabase";
import { sanityCheckSqlite } from "../db/sanity";
import { ensureGuestUser } from "../auth/ensureGuestUser";

export type AppEnv = "dev" | "prod" | "test";

function resolveEnv(): AppEnv {
  const raw = process.env.ENV ?? "prod";
  if (raw === "dev" || raw === "test") return raw;
  return "prod";
}

export interface InitResult {
  userId: string;
}

export async function initApp(): Promise<InitResult> {
  const env = resolveEnv();
  console.log("🚀 initApp, env:", env);

  // 1) DEV: reset bazy (tylko na emulatorze / dev)
  if (env === "dev") {
    await resetDatabase();
    console.log("🧹 Usunięto bazę danych (dev)");
  }

  // 2) Migracje
  await runMigrations(MigrationType.Up);
  console.log("✅ Migracje OK");

  // 3) DEV: sanity check (ale NIE dotykamy tabel domenowych)
  if (env === "dev") {
    await sanityCheckSqlite();
  }

  // 4) Guest user
  const userId = await ensureGuestUser();
  console.log("👤 Active user UUID:", userId);

  return { userId };
}
