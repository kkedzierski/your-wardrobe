// src/navigation/stacks/OutfitStack.tsx
import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OutfitScreen from "../../screens/OutfitScreen";
import { TranslationServiceInstance } from "../../i18n/TranslationService";
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
        options={{
          title: TranslationServiceInstance.t("Outfits"),
          testID: "OutfitTab",
          tabBarAccessibilityLabel: TranslationServiceInstance.t("Outfit tab"),
        }}
      />
      <Stack.Screen
        name="OutfitDetails"
        component={OutfitDetailsScreen}
        options={{ title: TranslationServiceInstance.t("Details") }}
      />
    </Stack.Navigator>
  );
}
