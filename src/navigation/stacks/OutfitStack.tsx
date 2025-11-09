// src/navigation/stacks/OutfitStack.tsx
import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OutfitScreen from "../../screens/OutfitScreen";
function OutfitDetailsScreen() {
  return null;
}

export type OutfitStackParamList = {
  Outfit: undefined;
  OutfitDetails: { id: number };
};

const Stack = createNativeStackNavigator<OutfitStackParamList>();

export default function OutfitStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Outfit"
        component={OutfitScreen}
        options={{ title: "Stroje" }}
      />
      <Stack.Screen
        name="OutfitDetails"
        component={OutfitDetailsScreen}
        options={{ title: "Szczegóły" }}
      />
    </Stack.Navigator>
  );
}
