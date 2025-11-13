// src/screens/Tag/EditTagScreen.tsx
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
import { editTag } from "../../api/Tag/UI/REST/PATCH/EditTagController";
import { deleteTag } from "../../api/Tag/UI/REST/DELETE/DeleteTag/DeleteTagController";
import { TranslationServiceInstance } from "../../i18n/TranslationService";

export default function EditTagScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const tag = route.params?.tag;

  const [name, setName] = useState(tag?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const onSave = useCallback(async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      showNoticeForApi({ ok: false, message: "Minimum 2 characters" } as any, {
        titleError: "Invalid tag name",
      });
      return;
    }
    setSaving(true);
    const res = await editTag({ tagId: tag.id, name: trimmed });
    setSaving(false);

    showNoticeForApi(res, {
      titleSuccess: "Success",
      fallbackSuccessMsg: "Tag updated.",
      titleError: "Failed to update tag",
    });

    if (res.ok) nav.goBack();
  }, [name, tag, nav]);

  const onDelete = useCallback(() => {
    Alert.alert(
      TranslationServiceInstance.t("Delete tag?"),
      TranslationServiceInstance.t(
        "Clothes associated with this tag will not be deleted."
      ),
      [
        { text: TranslationServiceInstance.t("Cancel"), style: "cancel" },
        {
          text: TranslationServiceInstance.t("Delete"),
          style: "destructive",
          onPress: async () => {
            setRemoving(true);
            const res = await deleteTag({ tagId: tag.id });
            setRemoving(false);

            showNoticeForApi(res, {
              titleSuccess: "Success",
              fallbackSuccessMsg: "Tag deleted.",
              titleError: "Failed to delete tag",
            });

            if (res.ok) nav.goBack();
          },
        },
      ]
    );
  }, [tag, nav]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nazwa tagu</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="np. Klasyka"
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
          <Text style={styles.deleteBtnText}>Usuń tag</Text>
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
