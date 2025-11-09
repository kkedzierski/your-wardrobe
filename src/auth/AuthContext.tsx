// src/auth/AuthContext.tsx
import React from "react";
import * as SecureStore from "expo-secure-store";
import { AuthUser } from "./AuthState";
import { ensureGuestUser } from "./ensureGuestUser";

const KEY = "authUser";

type Ctx = {
  /** Stan tożsamości (guest / oauth) */
  user: AuthUser;
  /** Lokalny identyfikator aktywnego użytkownika (UUID) — zawsze string po hydratacji */
  userId: string | null;

  /** Logowanie / połączenia */
  connectApple: () => Promise<void>;
  connectGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;

  /** „Wyloguj” – wraca do trybu guest; NIE czyści userId/ danych lokalnych */
  disconnect: () => Promise<void>;

  /** Czy kontekst jest już gotowy (po wczytaniu SecureStore + ensureGuestUser) */
  ready: boolean;
};

export const AuthContext = React.createContext<Ctx>({} as any);
export const useAuth = () => React.useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser>({ kind: "guest" });
  const [userId, setUserId] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  // 1) Wczytaj stan auth (guest/oauth) z SecureStore
  React.useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(KEY);
        if (raw) setUser(JSON.parse(raw));
      } finally {
        // nic — hydratacja usera nie blokuje gościa
      }
    })();
  }, []);

  // 2) Upewnij się, że istnieje lokalny user i mamy jego UUID
  React.useEffect(() => {
    (async () => {
      const id = await ensureGuestUser();
      setUserId(id);
      setReady(true);
    })();
  }, []);

  const persist = async (u: AuthUser) => {
    setUser(u);
    await SecureStore.setItemAsync(KEY, JSON.stringify(u));
  };

  const connectApple = async () => {
    const { signInWithAppleNative } = await import("./providers/apple");
    const info = await signInWithAppleNative();
    if (info) {
      await persist({
        kind: "oauth",
        provider: "apple",
        id: info.id,
        email: info.email,
        name: info.name,
      });
    }
    // Uwaga: userId (UUID) pozostaje bez zmian – to lokalna tożsamość / właściciel danych
  };

  const connectGoogle = async () => {
    console.warn("Google OAuth: do konfiguracji po MVP");
    // Po wdrożeniu:
    // const info = await signInWithGoogleNative();
    // if (info) await persist({ kind: "oauth", provider: "google", id: info.id, email: info.email, name: info.name });
  };

  const loginWithEmail = async (email: string, password: string) => {
    // TODO: Podłącz backend (Supabase/Firebase/własne API)
    // Poniżej stub, który symuluje udane logowanie e-mail/hasło:
    console.log("loginWithEmail()", { email });
    await persist({
      kind: "oauth",
      provider: "email",
      id: email, // identyfikator providera e-mail – często userId z backendu; na razie użyj e-maila jako ID
      email,
      name: null,
    });
  };

  const disconnect = async () => {
    // „Wyloguj” – wracamy do trybu guest. NIE czyścimy userId (UUID)
    await SecureStore.deleteItemAsync(KEY);
    setUser({ kind: "guest" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        connectApple,
        connectGoogle,
        loginWithEmail,
        disconnect,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
