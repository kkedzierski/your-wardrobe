// src/auth/AuthState.ts
export type AuthUser =
  | { kind: "guest" } // MVP
  | {
      kind: "oauth";
      provider: "apple" | "google";
      id: string;
      email?: string | null;
      name?: string | null;
    };
