// src/navigation/MainTabs.tsx
import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomeStack from "./stacks/HomeStack";
import WardrobeStack from "./stacks/WardrobeStack";
import OutfitStack from "./stacks/OutfitStack";
import ProfileStack from "./stacks/ProfileStack";
import SettingsStack from "./stacks/SettingsStack";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type MainTabParamList = {
  HomeTab: undefined;
  WardrobeTab: undefined;
  OutfitTab: undefined;
  ProfileTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4a90e2",
        tabBarInactiveTintColor: "#8a8a8a",
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIconStyle: { marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarStyle: {
          height: 56 + insets.bottom, // zwiększ wysokość o bezpieczny dół
          paddingBottom: Math.max(insets.bottom, 6),
          paddingLeft: insets.left, // zabezpiecz rogi / wycięcia ekranu
          paddingRight: insets.right,
          backgroundColor: "white",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-variant"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeStack}
        options={{
          title: "Garderoba",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="tshirt-crew-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="OutfitTab"
        component={OutfitStack}
        options={{
          title: "Outfit",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hanger" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: "Więcej",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cog-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
