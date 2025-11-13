import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { theme } from "./src/theme/theme";
import { AuthProvider } from "./src/auth/AuthContext";
import AppLockGate from "./src/auth/AppLockGate";
import { initApp } from "./src/app/initApp";

type InitState =
  | { status: "idle" | "loading" }
  | { status: "ready"; userId: string }
  | { status: "error"; error: Error };

export default function App() {
  const [init, setInit] = useState<InitState>({ status: "loading" });

  useEffect(() => {
    (async () => {
      try {
        const result = await initApp();
        setInit({ status: "ready", userId: result.userId });
      } catch (e: any) {
        console.error("❌ App init failed:", e);
        setInit({
          status: "error",
          error: e instanceof Error ? e : new Error(String(e)),
        });
      }
    })();
  }, []);

  if (init.status === "loading") {
    // można tu dać swój Splash/Loader
    return null;
  }

  if (init.status === "error") {
    // PROSTA strona błędu – lepsze niż „cisza”
    return (
      <GestureHandlerRootView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ThemeProvider theme={theme}>
          {/* tu możesz dać ładny ekran z "Spróbuj ponownie" itp. */}
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  // init.status === "ready"
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <AppLockGate>
            <RootNavigator />
          </AppLockGate>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
