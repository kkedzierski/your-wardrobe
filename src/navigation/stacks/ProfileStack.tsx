// src/navigation/stacks/ProfileStack.tsx
import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../screens/Settings/ProfileScreen";
function ProfileDetailsScreen() {
  return null;
}

export type ProfileStackParamList = {
  Profile: undefined;
  ProfileDetails: { id: number };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profil" }}
      />
      <Stack.Screen
        name="ProfileDetails"
        component={ProfileDetailsScreen}
        options={{ title: "Szczegóły" }}
      />
    </Stack.Navigator>
  );
}
