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

// ⬅️ te importy dopasuj do swojej ścieżki:
import type { Category } from "../../api/Category/Domain/Category";
import { getCategoriesCollection } from "../../api/Category/UI/REST/GET/GetCategoriesCollection/GetCategoriesCollectionOutputController";

export default function CategoryManagerScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getCategoriesCollection();
    setLoading(false);

    if (res.ok && res.data) {
      setItems(res.data.items ?? []);
    } else {
      showNoticeForApi(res, { titleError: "Nie udało się pobrać kategorii" });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const goEdit = (item: Category) => {
    nav.navigate("EditCategory", { category: item });
  };

  const goAdd = () => {
    nav.navigate("AddCategory");
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
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => goEdit(item)}>
            <Text style={styles.rowText}>{item.name}</Text>
            <Feather name="chevron-right" size={18} color="#999" />
          </Pressable>
        )}
      />

      <Pressable style={styles.addBtn} onPress={goAdd}>
        <Feather name="plus" size={18} color="#fff" />
        <Text style={styles.addBtnText}>Dodaj kategorię</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
  rowText: { fontSize: 16, color: "#111" },

  addBtn: {
    marginTop: 20,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
