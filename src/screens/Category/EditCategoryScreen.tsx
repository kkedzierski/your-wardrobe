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

import { deleteCategory } from "../../api/Category/UI/REST/DELETE/DeleteCategory/DeleteCategoryController";
import { editCategory } from "../../api/Category/UI/REST/PATCH/EditCategoryController";
import { TranslationServiceInstance } from "../../i18n/TranslationService";

export default function EditCategoryScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const category = route.params?.category;

  // awaryjnie, gdyby ktoś wszedł tu bez category
  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {TranslationServiceInstance.t("Category not found.")}
        </Text>
      </View>
    );
  }

  const [name, setName] = useState<string>(category.name ?? "");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const onSave = useCallback(async () => {
    const trimmed = name.trim();

    // lokalna walidacja – też przez showNoticeForApi,
    // żeby zachować ten sam UX co dla błędów z backendu
    if (trimmed.length < 2) {
      showNoticeForApi({ ok: false, message: "Minimum 2 characters" } as any, {
        titleError: "Error",
        // można dać translate: true (domyślne), więc "Minimum 2 characters"
        // i "Error" polecą przez TranslationService
      });
      return;
    }

    setSaving(true);
    const res = await editCategory({
      categoryId: category.id,
      name: trimmed,
    });
    setSaving(false);

    // Backend powinien ustawić message, np.:
    // - "Category name updated."
    // - "Category was not found."
    // - "Failed to update category."
    // showNoticeForApi najpierw spróbuje użyć res.message,
    // a gdy jej nie będzie, użyje fallbackSuccessMsg.
    showNoticeForApi(res, {
      titleSuccess: "Success",
      fallbackSuccessMsg: "Category name updated.",
      titleError: "Failed to update category.",
    });

    if (res.ok) {
      nav.goBack();
    }
  }, [name, category, nav]);

  const onDelete = useCallback(() => {
    Alert.alert(
      TranslationServiceInstance.t("Delete category?"),
      TranslationServiceInstance.t(
        "Clothes in this category will not be deleted."
      ),
      [
        {
          text: TranslationServiceInstance.t("Cancel"),
          style: "cancel",
        },
        {
          text: TranslationServiceInstance.t("Delete"),
          style: "destructive",
          onPress: async () => {
            setRemoving(true);
            const res = await deleteCategory({ categoryId: category.id });
            setRemoving(false);

            // Backend powinien zwracać message np.:
            // - "Category deleted."
            // - "Category was not found."
            // - "Category cannot be deleted because it is assigned to some clothes."
            // - "Failed to delete category."
            // showNoticeForApi pokaże dokładnie ten message (przetłumaczony przez t()).
            showNoticeForApi(res, {
              titleSuccess: "Success",
              fallbackSuccessMsg: "Category deleted.",
              titleError: "Failed to delete category.",
            });

            if (res.ok) {
              nav.goBack();
            }
          },
        },
      ]
    );
  }, [category, nav]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {TranslationServiceInstance.t("Category name")}
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={TranslationServiceInstance.t("e.g. Jackets")}
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
          <Text style={styles.saveBtnText}>
            {TranslationServiceInstance.t("Save")}
          </Text>
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
          <Text style={styles.deleteBtnText}>
            {TranslationServiceInstance.t("Delete category")}
          </Text>
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
