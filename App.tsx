import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { runMigrations } from "./src/db";
import { MigrationType } from "./src/db";

export default function App() {
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
      <Text>Hello up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
