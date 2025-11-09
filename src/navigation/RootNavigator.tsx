// src/navigation/RootNavigator.tsx
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import MainTabs from "./MainTabs";
import ProfileScreen from "../screens/Settings/ProfileScreen";
import SyncSettingsScreen from "../screens/Settings/SyncSettingsScreen";
import LoginOptionsScreen from "../screens/Settings/LoginOptionsScreen";

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs: undefined;
  Profile: undefined;
  SyncSettings: undefined;
  LoginOptions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: "fade" }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ title: "Powrót" }}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: true, title: "Profil" }}
        />

        <Stack.Screen
          name="SyncSettings"
          component={SyncSettingsScreen}
          options={{ headerShown: true, title: "Synchronizacja" }}
        />
        <Stack.Screen
          name="LoginOptions"
          component={LoginOptionsScreen}
          options={{ headerShown: true, title: "Logowanie" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
