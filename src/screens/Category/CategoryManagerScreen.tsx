// src/screens/CategoryManagerScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
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

// ⬅️ dopasuj ścieżki
import type { Category } from "../../api/Category/Domain/Category";
import { getCategoriesCollection } from "../../api/Category/UI/REST/GET/GetCategoriesCollection/GetCategoriesCollectionOutputController";

// ten sam komponent co w ShowClothScreen
import UiButton from "../../components/UiButton";

export default function CategoryManagerScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (showSuccess = false) => {
    setLoading(true);
    const res = await getCategoriesCollection();
    setLoading(false);

    if (res.ok && res.data) {
      setItems(res.data.items ?? []);
    } else {
      if (!showSuccess) {
        showNoticeForApi(res, { titleError: "Failed to load categories." });
      }
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

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
        <Text style={{ marginTop: 8 }}>Wczytywanie…</Text>
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
          onPress={() => load(true)}
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

  container: { flex: 1, padding: 12 },

  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowText: { fontSize: 16, color: "#111" },

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
