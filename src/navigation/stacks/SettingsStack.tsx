// src/navigation/stacks/SettingsStack.tsx
import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../../screens/Settings/SettingsScreen";
function SettingsDetailsScreen() {
  return null;
}

export type SettingsStackParamList = {
  Settings: undefined;
  SettingsDetails: { id: number };
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Ustawienia" }}
      />
      <Stack.Screen
        name="SettingsDetails"
        component={SettingsDetailsScreen}
        options={{ title: "Szczegóły" }}
      />
    </Stack.Navigator>
  );
}
