// src/components/TagPickerModal.tsx
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
import { getTagsCollection } from "../api/Tag/UI/REST/GET/GetTagsCollection/GetTagsCollectionOutputController";
import { Tag } from "../api/Tag/Domain/Tag";
import { TranslationServiceInstance } from "../i18n/TranslationService";

// Typy przekazywanych propsów
export type TagPickerModalProps = {
  visible: boolean;
  selected: Tag[];
  onClose: () => void;
  onSelect: (tags: Tag[]) => void;
  onAddNew: () => void; // przejście do AddTagScreen
};

export default function TagPickerModal({
  visible,
  selected,
  onClose,
  onSelect,
  onAddNew,
}: TagPickerModalProps) {
  const [items, setItems] = useState<Tag[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(
    new Set(selected.map((t) => t.id))
  );

  // Wczytaj listę tagów po otwarciu
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const res = await getTagsCollection();
      if (cancelled) return;

      setLoading(false);

      if (res.ok && res.data?.items) {
        setItems(res.data.items as Tag[]);
      }

      // ustaw zaznaczenia na podstawie aktualnego selected
      setChecked(new Set(selected.map((t) => t.id)));
    };

    void load();

    // cleanup, żeby nie ustawiać stanu po odmontowaniu
    return () => {
      cancelled = true;
    };
  }, [visible, selected]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => i.name.toLowerCase().includes(s));
  }, [q, items]);

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    const selectedTags = items.filter((t) => checked.has(t.id));
    onSelect(selectedTags);
    onClose();
  };

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
            <Text style={styles.title}>
              {TranslationServiceInstance.t("Select tags")}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel={TranslationServiceInstance.t("Close")}
            >
              <Feather name="x" size={20} />
            </Pressable>
          </View>

          <View style={styles.search}>
            <Feather name="search" size={16} />
            <TextInput
              placeholder={TranslationServiceInstance.t("Search tag")}
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
                <Pressable style={styles.row} onPress={() => toggle(item.id)}>
                  <Text style={styles.check}>
                    {checked.has(item.id) ? "☑" : "☐"}
                  </Text>
                  <Text style={styles.rowText}>{item.name}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ padding: 16, color: "#666" }}>
                  {TranslationServiceInstance.t("No tags")}
                </Text>
              }
            />
          )}

          <Pressable
            style={styles.addBtn}
            onPress={onAddNew}
            accessibilityLabel={TranslationServiceInstance.t("Add new tag")}
          >
            <Feather name="plus" size={16} />
            <Text style={{ marginLeft: 8, color: "#111" }}>
              {TranslationServiceInstance.t("Add tag")}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.saveBtn, { marginTop: 8 }]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>
              {TranslationServiceInstance.t("Confirm selection")}
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
    paddingBottom: 12,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  check: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
    color: "#111",
  },
  rowText: { fontSize: 16 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
