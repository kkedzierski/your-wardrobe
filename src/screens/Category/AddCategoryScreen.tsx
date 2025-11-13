import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { showNoticeForApi } from "../../ui/apiNotice";
import { postCreateCategory } from "../../api/Category/UI/REST/POST/CreateCategory/CreateCategoryController";
import type { Category } from "../../api/Category/Domain/Category";

type AddCategoryParams = {
  returnTo?: "CategoryManager";
  onCategoryCreated?: (category: Category) => void;
};

export default function AddCategoryScreen() {
  const nav = useNavigation<any>();
  const route =
    useRoute<RouteProp<Record<string, AddCategoryParams>, string>>();
  const { returnTo, onCategoryCreated } = route.params ?? {};

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = useCallback(async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      showNoticeForApi({ ok: false, message: "Minimum 2 characters" } as any, {
        titleError: "Invalid category name",
      });
      return;
    }

    setSaving(true);
    const res = await postCreateCategory({ name: trimmed });
    setSaving(false);

    showNoticeForApi(res, {
      titleSuccess: "Success",
      fallbackSuccessMsg: "Category added.",
      titleError: "Failed to add category.",
    });

    if (!res.ok) return;

    // 🔧 NORMALIZACJA
    const raw: any = res.data;
    const normalizedCategory: Category = {
      id: Number(
        raw.id ??
          raw.categoryId ??
          raw.category?.id ??
          raw.categoryID ??
          raw.category_id ??
          0
      ),
      name:
        raw.name ?? raw.categoryName ?? raw.category?.name ?? raw.label ?? "",
    };

    // callback dla EditCloth
    if (onCategoryCreated) {
      onCategoryCreated(normalizedCategory);
    }

    // nawigacja
    if (returnTo === "CategoryManager") {
      nav.navigate("CategoryManager");
    } else {
      nav.goBack();
    }
  }, [name, nav, returnTo, onCategoryCreated]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nazwa kategorii</Text>
      <TextInput
        placeholder="np. Koszulki"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoFocus
        accessibilityLabel="Pole nazwy kategorii"
      />
      <Pressable
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={onSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.saveText}>Zapisz</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "#fff" },
  label: { fontWeight: "600", marginBottom: 6 },
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
    marginTop: 12,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
