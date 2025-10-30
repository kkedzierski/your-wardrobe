import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { runMigrations, MigrationType } from "./src/db";
import "./src/i18n/i18n";

import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();

  useEffect(() => {
    runMigrations(MigrationType.Up)
      .then(() => console.log("Migracje OK"))
      .catch((err) => {
        console.error("❌ Migration error:", err.message);
        console.error("📄 Migration error details:", err);
        console.error("🧭 Stack trace:", err.stack);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text>{t("Hello up App.tsx to start working on your app!")}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

// style jak miałeś
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
