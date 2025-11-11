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
        <Stack.Screen
          name="EditCloth"
          component={EditClothScreen}
          options={{ headerShown: true, title: "Edycja ubrania" }}
        />
        <Stack.Screen
          name="ShowCloth"
          component={ShowClothScreen}
          options={{ headerShown: true, title: "Szczegóły ubrania" }}
        />
        <Stack.Screen
          name="AddCategory"
          component={AddCategoryScreen}
          options={{ headerShown: true, title: "Dodawanie kategorii" }}
        />
        <Stack.Screen
          name="EditCategory"
          component={EditCategoryScreen}
          options={{ headerShown: true, title: "Edycja kategorii" }}
        />
        <Stack.Screen
          name="CategoryManager"
          component={CategoryManagerScreen}
          options={{ headerShown: true, title: "Zarządzanie kategoriami" }}
        />
        <Stack.Screen
          name="AddTag"
          component={AddTagScreen}
          options={{ headerShown: true, title: "Dodawanie tagu" }}
        />
        <Stack.Screen
          name="EditTag"
          component={EditTagScreen}
          options={{ headerShown: true, title: "Edycja tagu" }}
        />
        <Stack.Screen
          name="TagManager"
          component={TagManagerScreen}
          options={{ headerShown: true, title: "Zarządzanie tagami" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
