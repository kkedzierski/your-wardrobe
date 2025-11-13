// src/screens/Tag/AddTagScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { showNoticeForApi } from "../../ui/apiNotice";
import { postCreateTag } from "../../api/Tag/UI/REST/POST/CreateTag/CreateTagController";
import { TranslationServiceInstance } from "../../i18n/TranslationService";
import { Tag } from "../../api/Tag/Domain/Tag";

type AddTagParams = {
  returnTo?: "TagManager";
  onTagCreated?: (tag: Tag) => void;
};

export default function AddTagScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, AddTagParams>, string>>();
  const { onTagCreated, returnTo } = route.params ?? {};
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = useCallback(async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      showNoticeForApi({ ok: false, message: "Minimum 2 characters" } as any, {
        titleError: "Invalid tag name",
      });
      return;
    }
    setSaving(true);
    const res = await postCreateTag({ name: trimmed });
    setSaving(false);

    showNoticeForApi(res, {
      titleSuccess: "Success",
      fallbackSuccessMsg: "Tag added.",
      titleError: "Failed to add tag",
    });

    if (!res.ok) return;

    // Normalizacja na wzór kategorii
    const raw: any = res.data;
    const normalizedTag: Tag = {
      id: Number(raw.id ?? raw.tagId ?? raw.tag_id ?? 0),
      name: raw.name ?? raw.tagName ?? raw.label ?? "",
      user_id: raw.user_id ?? "",
      created_at: raw.created_at ?? 0,
      updated_at: raw.updated_at ?? 0,
    };

    if (onTagCreated) {
      onTagCreated(normalizedTag);
    }

    // nawigacja – jeśli przyszliśmy z TagManager, wróć tam
    if (returnTo === "TagManager") {
      nav.navigate("TagManager");
    } else {
      nav.goBack();
    }
  }, [name, nav, onTagCreated, returnTo]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nazwa tagu</Text>
      <TextInput
        placeholder="np. Vintage"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoFocus
        accessibilityLabel={TranslationServiceInstance.t("Tag name input")}
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
