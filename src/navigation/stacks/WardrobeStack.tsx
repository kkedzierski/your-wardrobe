// src/navigation/stacks/WardrobeStack.tsx
import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WardrobeScreen from "../../screens/Cloth/WardrobeScreen";
// przykładowe szczegóły/edycja:
function WardrobeDetailsScreen() {
  return null;
}

export type WardrobeStackParamList = {
  Wardrobe: undefined;
  WardrobeDetails: { id: number };
};

const Stack = createNativeStackNavigator<WardrobeStackParamList>();

export default function WardrobeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Wardrobe"
        component={WardrobeScreen}
        options={{ title: "Garderoba" }}
      />
      <Stack.Screen
        name="WardrobeDetails"
        component={WardrobeDetailsScreen}
        options={{ title: "Szczegóły" }}
      />
    </Stack.Navigator>
  );
}
