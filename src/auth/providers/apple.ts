// src/auth/providers/apple.ts
import * as Apple from "expo-apple-authentication";

export async function signInWithAppleNative(): Promise<{
  id: string;
  email?: string | null;
  name?: string | null;
} | null> {
  if (!(await Apple.isAvailableAsync())) return null;
  const res = await Apple.signInAsync({
    requestedScopes: [
      Apple.AppleAuthenticationScope.FULL_NAME,
      Apple.AppleAuthenticationScope.EMAIL,
    ],
  });
  return {
    id: res.user,
    email: res.email ?? null,
    name: res.fullName?.givenName ?? null,
  };
}
