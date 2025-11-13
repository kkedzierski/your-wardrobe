// src/navigation/stacks/HomeStack.tsx
import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../screens/HomeScreen";
import { TranslationServiceInstance } from "../../i18n/TranslationService";
function HomeDetailsScreen() {
  return null;
}

export type HomeStackParamList = {
  Home: undefined;
  HomeDetails: { id: number };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: TranslationServiceInstance.t("Home") }}
      />
      <Stack.Screen
        name="HomeDetails"
        component={HomeDetailsScreen}
        options={{ title: TranslationServiceInstance.t("Details") }}
      />
    </Stack.Navigator>
  );
}
