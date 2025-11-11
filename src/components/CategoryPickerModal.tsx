// src/components/CategoryPickerModal.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Category } from "../api/Category/Domain/Category";
import { getCategoriesCollection } from "../api/Category/UI/REST/GET/GetCategoriesCollection/GetCategoriesCollectionOutputController";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (cat: Category) => void;
  onAddNew: () => void; // przejście do AddCategoryScreen
};

export default function CategoryPickerModal({
  visible,
  onClose,
  onSelect,
  onAddNew,
}: Props) {
  const [items, setItems] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      const res = await getCategoriesCollection();
      setLoading(false);
      if (res.ok && res.data?.items) setItems(res.data.items as Category[]);
    })();
  }, [visible]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => i.name.toLowerCase().includes(s));
  }, [q, items]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Wybierz kategorię</Text>
            <Pressable onPress={onClose} accessibilityLabel="Zamknij">
              <Feather name="x" size={20} />
            </Pressable>
          </View>

          <View style={styles.search}>
            <Feather name="search" size={16} />
            <TextInput
              placeholder="Szukaj..."
              value={q}
              onChangeText={setQ}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>

          {loading ? (
            <View style={{ padding: 16, alignItems: "center" }}>
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(i) => String(i.id)}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={styles.rowText}>{item.name}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ padding: 16, color: "#666" }}>
                  Brak kategorii
                </Text>
              }
            />
          )}

          <Pressable
            style={styles.addBtn}
            onPress={onAddNew}
            accessibilityLabel="Dodaj nową kategorię"
          >
            <Feather name="plus" size={16} />
            <Text style={{ marginLeft: 8, color: "#111" }}>
              Dodaj kategorię
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#0006", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: { fontWeight: "700", fontSize: 16 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
  },
  row: { paddingHorizontal: 16, paddingVertical: 12 },
  rowText: { fontSize: 16 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    justifyContent: "center",
  },
});
