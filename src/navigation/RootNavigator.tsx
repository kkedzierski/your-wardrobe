// src/navigation/RootNavigator.tsx
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import MainTabs from "./MainTabs";
import ProfileScreen from "../screens/Settings/ProfileScreen";
import SyncSettingsScreen from "../screens/Settings/SyncSettingsScreen";
import LoginOptionsScreen from "../screens/Settings/LoginOptionsScreen";
import EditClothScreen from "../screens/Cloth/EditClothScreen";
import AddCategoryScreen from "../screens/Category/AddCategoryScreen";
import ShowClothScreen from "../screens/Cloth/ShowClothScreen";
import EditCategoryScreen from "../screens/Category/EditCategoryScreen";
import CategoryManagerScreen from "../screens/Category/CategoryManagerScreen";
import AddTagScreen from "../screens/Tag/AddTagScreen";
import EditTagScreen from "../screens/Tag/EditTagScreen";
import TagManagerScreen from "../screens/Tag/TagManagerScreen";
import { TranslationServiceInstance } from "../i18n/TranslationService";
import WardrobeScreen from "../screens/Cloth/WardrobeScreen";

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs: undefined;
  Profile: undefined;
  SyncSettings: undefined;
  LoginOptions: undefined;
  EditCloth: undefined;
  ShowCloth: undefined;
  AddCategory: undefined;
  EditCategory: undefined;
  CategoryManager: undefined;
  AddTag: undefined;
  EditTag: undefined;
  TagManager: undefined;
  Wardrobe: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          headerBackTitle: TranslationServiceInstance.t("Back"),
        }}
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
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Profile"),
          }}
        />

        <Stack.Screen
          name="SyncSettings"
          component={SyncSettingsScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Sync Settings"),
          }}
        />
        <Stack.Screen
          name="LoginOptions"
          component={LoginOptionsScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Login"),
          }}
        />
        <Stack.Screen
          name="EditCloth"
          component={EditClothScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Edit Cloth"),
          }}
        />
        <Stack.Screen
          name="ShowCloth"
          component={ShowClothScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Cloth Details"),
          }}
        />
        <Stack.Screen
          name="AddCategory"
          component={AddCategoryScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Add Category"),
          }}
        />
        <Stack.Screen
          name="EditCategory"
          component={EditCategoryScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Edit Category"),
          }}
        />
        <Stack.Screen
          name="CategoryManager"
          component={CategoryManagerScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Category Manager"),
          }}
        />
        <Stack.Screen
          name="AddTag"
          component={AddTagScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Add Tag"),
          }}
        />
        <Stack.Screen
          name="EditTag"
          component={EditTagScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Edit Tag"),
          }}
        />
        <Stack.Screen
          name="TagManager"
          component={TagManagerScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Tag Manager"),
          }}
        />
        <Stack.Screen
          name="Wardrobe"
          component={WardrobeScreen}
          options={{
            headerShown: true,
            title: TranslationServiceInstance.t("Wardrobe"),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
