// src/navigation/MainTabs.tsx
import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomeStack from "./stacks/HomeStack";
import WardrobeStack from "./stacks/WardrobeStack";
import OutfitStack from "./stacks/OutfitStack";
import SettingsStack from "./stacks/SettingsStack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TranslationServiceInstance } from "../i18n/TranslationService";
import { Pressable } from "react-native";

export type MainTabParamList = {
  HomeTab: undefined;
  WardrobeTab: undefined;
  OutfitTab: undefined;
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
          title: TranslationServiceInstance.t("Home"),
          tabBarAccessibilityLabel: TranslationServiceInstance.t("Home tab"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-variant"
              size={size}
              color={color}
            />
          ),
          tabBarButton: (props: any) => (
            <Pressable
              onPress={props.onPress}
              style={props.style}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityState={props.accessibilityState}
              testID="HomeTab"
            >
              {props.children}
            </Pressable>
          ),
        }}
      />
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeStack}
        options={{
          title: TranslationServiceInstance.t("Wardrobe"),
          tabBarAccessibilityLabel:
            TranslationServiceInstance.t("Wardrobe tab"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="tshirt-crew-outline"
              size={size}
              color={color}
            />
          ),
          tabBarButton: (props: any) => (
            <Pressable
              onPress={props.onPress}
              style={props.style}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityState={props.accessibilityState}
              testID="WardrobeTab"
            >
              {props.children}
            </Pressable>
          ),
        }}
      />
      <Tab.Screen
        name="OutfitTab"
        component={OutfitStack}
        options={{
          title: TranslationServiceInstance.t("Outfits"),
          tabBarAccessibilityLabel: TranslationServiceInstance.t("Outfit tab"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hanger" size={size} color={color} />
          ),
          tabBarButton: (props: any) => (
            <Pressable
              onPress={props.onPress}
              style={props.style}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityState={props.accessibilityState}
              testID="OutfitTab"
            >
              {props.children}
            </Pressable>
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: TranslationServiceInstance.t("Settings"),
          tabBarAccessibilityLabel:
            TranslationServiceInstance.t("Settings tab"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cog-outline"
              size={size}
              color={color}
            />
          ),
          tabBarButton: (props: any) => (
            <Pressable
              onPress={props.onPress}
              style={props.style}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityState={props.accessibilityState}
              testID="SettingsTab"
            >
              {props.children}
            </Pressable>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
