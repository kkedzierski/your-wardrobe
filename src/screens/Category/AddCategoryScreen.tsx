// src/screens/AddCategoryScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { showNoticeForApi } from "../../ui/apiNotice";

// dopasuj import do swojej ścieżki:
import { postCreateCategory } from "../../api/Category/UI/REST/POST/CreateCategory/CreateCategoryController";

export default function AddCategoryScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = useCallback(async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      showNoticeForApi({ ok: false, message: "Min. 2 znaki" } as any, {
        titleError: "Błędna nazwa",
      });
      return;
    }
    setSaving(true);
    const res = await postCreateCategory({ name: trimmed });
    setSaving(false);

    showNoticeForApi(res, {
      titleSuccess: "Gotowe",
      fallbackSuccessMsg: "Kategoria dodana.",
      titleError: "Nie udało się dodać kategorii",
    });

    if (res.ok) {
      // ✅ Wstrzyknij nową kategorię do EditCloth i NIE wywołuj goBack();
      nav.navigate({
        name: "EditCloth",
        params: { newCategory: res.data },
        merge: true,
      });
      // brak nav.goBack(); — focus wróci sam i EditCloth odczyta newCategory
    }
  }, [name, nav]);

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
