// src/auth/providers/google.ts
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";

// Użycie w komponencie jest najprostsze — ale do prostoty zrobimy helper funkcyjny:
export async function signInWithGoogleAuth(): Promise<{
  id: string;
  email?: string | null;
  name?: string | null;
} | null> {
  // dynamiczny import hooka w komponencie jest wygodniejszy;
  // na szybko: użyj expo-auth-session promptAsync przez mini-komponent lub zrób ekran „Połącz konto”.
  return null;
}
