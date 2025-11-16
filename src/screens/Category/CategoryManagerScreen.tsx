// src/screens/Category/CategoryManagerScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { showNoticeForApi } from "../../ui/apiNotice";

import type { Category } from "../../api/Category/Domain/Category";
import { getCategoriesCollection } from "../../api/Category/UI/REST/GET/GetCategoriesCollection/GetCategoriesCollectionOutputController";

import UiButton from "../../components/UiButton";
import { TranslationServiceInstance } from "../../i18n/TranslationService";

export default function CategoryManagerScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // efekt tylko do pierwszego załadowania
  useEffect(() => {
    let cancelled = false;

    const fetchInitial = async () => {
      const res = await getCategoriesCollection();

      if (cancelled) {
        return;
      }

      if (res.ok && res.data) {
        setItems(res.data.items ?? []);
      } else {
        showNoticeForApi(res, { titleError: "Failed to load categories." });
      }

      setLoading(false);
    };

    void fetchInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  // loader używany tylko z przycisku Refresh
  const load = async (showSuccess = false) => {
    const res = await getCategoriesCollection();

    if (res.ok && res.data) {
      setItems(res.data.items ?? []);
    } else {
      if (!showSuccess) {
        showNoticeForApi(res, { titleError: "Failed to load categories." });
      }
    }

    setLoading(false);
  };

  const goEdit = (item: Category) => {
    nav.navigate("EditCategory", { category: item });
  };

  const goAdd = () => {
    nav.navigate("AddCategory", { returnTo: "CategoryManager" });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>
          {TranslationServiceInstance.t("Loading…")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => goEdit(item)}>
            <Text style={styles.rowText}>{item.name}</Text>
            <Feather name="chevron-right" size={18} color="#999" />
          </Pressable>
        )}
      />

      {/* Pasek akcji jak w ShowClothScreen */}
      <View style={styles.actionBar}>
        <UiButton
          title="Refresh"
          variant="ghost"
          iconLeftName="refresh-ccw"
          onPress={() => {
            setLoading(true);
            void load(true);
          }}
          style={{ flex: 1 }}
        />

        <View style={{ width: 10 }} />

        <UiButton
          title="Add"
          variant="primary"
          iconLeftName="plus"
          onPress={goAdd}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  container: {
    flex: 1,
    padding: 12,
  },

  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowText: {
    fontSize: 16,
    color: "#111",
  },

  actionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "#ffffffee",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
  },
});
