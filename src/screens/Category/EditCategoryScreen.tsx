// src/screens/EditCategoryScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { showNoticeForApi } from "../../ui/apiNotice";

// ⬅️ dopasuj ścieżki:
import { deleteCategory } from "../../api/Category/UI/REST/DELETE/DeleteCategory/DeleteCategoryController";
import { editCategory } from "../../api/Category/UI/REST/PATCH/EditCategoryController";

export default function EditCategoryScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const category = route.params?.category;

  const [name, setName] = useState(category?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const onSave = useCallback(async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      showNoticeForApi({ ok: false, message: "Minimum 2 znaki" } as any, {
        titleError: "Błąd",
      });
      return;
    }

    setSaving(true);
    const res = await editCategory({
      categoryId: category.id,
      name: trimmed,
    });
    setSaving(false);

    showNoticeForApi(res, {
      titleSuccess: "Gotowe",
      fallbackSuccessMsg: "Zmieniono nazwę kategorii.",
      titleError: "Nie udało się zaktualizować kategorii",
    });

    if (res.ok) nav.goBack();
  }, [name, category, nav]);

  const onDelete = useCallback(() => {
    Alert.alert(
      "Usunąć kategorię?",
      "Ubrania w tej kategorii nie zostaną usunięte.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            setRemoving(true);
            const res = await deleteCategory({ categoryId: category.id });
            setRemoving(false);

            showNoticeForApi(res, {
              titleSuccess: "Gotowe",
              fallbackSuccessMsg: "Kategoria usunięta.",
              titleError: "Nie udało się usunąć kategorii",
            });

            if (res.ok) nav.goBack();
          },
        },
      ]
    );
  }, [category, nav]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nazwa kategorii</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="np. Kurtki"
        style={styles.input}
      />

      <Pressable
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        disabled={saving}
        onPress={onSave}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Zapisz</Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.deleteBtn, removing && { opacity: 0.6 }]}
        disabled={removing}
        onPress={onDelete}
      >
        {removing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.deleteBtnText}>Usuń kategorię</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff", gap: 16 },
  label: { fontWeight: "600", fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },

  saveBtn: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  deleteBtn: {
    marginTop: 20,
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
