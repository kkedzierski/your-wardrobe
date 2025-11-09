// App.tsx
import "react-native-reanimated"; // pierwszy import!
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { runMigrations, MigrationType } from "./src/db";

import { ThemeProvider } from "styled-components/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { theme } from "./src/theme/theme";
import { AuthProvider } from "./src/auth/AuthContext";
import { ensureGuestUser } from "./src/auth/ensureGuestUser"; // 👈 DODANE
import { resetDatabase } from "./src/db/resetDatabase";
import AppLockGate from "./src/auth/AppLockGate";
import { getDb } from "./src/db/database";
import { sanityCheckSqlite } from "./src/db/sanity";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (process.env.ENV === "dev") {
          await resetDatabase();
          console.log("🧹 Usunięto bazę danych");
        }
        await runMigrations(MigrationType.Up);
        console.log("✅ Migracje OK");
        await sanityCheckSqlite(); // ⬅️ uruchom najpierw sanity

        const id = await ensureGuestUser();
        console.log("👤 Active user UUID:", id);

        // po ensure jeszcze raz policz
        const db = await getDb();
        const users = await db.getFirstAsync<{ c: number }>(
          "SELECT COUNT(*) c FROM users"
        );
        console.log("📊 Po ensure users:", users?.c);
        setReady(true);
      } catch (err: any) {
        console.error("❌ Migration/init error:", err?.message ?? err);
        console.error("📄 Details:", err);
      }
    })();
  }, []);

  if (!ready) {
    // Możesz tu wstawić Splash/Loader; Expo Splash i tak będzie przykrywać
    return null;
  }

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
