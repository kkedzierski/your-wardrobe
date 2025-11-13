// src/screens/Tag/TagManagerScreen.tsx
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
import type { Tag } from "../../api/Tag/Domain/Tag";
import { getTagsCollection } from "../../api/Tag/UI/REST/GET/GetTagsCollection/GetTagsCollectionOutputController";
import UiButton from "../../components/UiButton";
import { TranslationServiceInstance } from "../../i18n/TranslationService";

export default function TagManagerScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (showSuccess = false) => {
    setLoading(true);
    const res = await getTagsCollection();
    setLoading(false);

    if (res.ok && res.data) {
      setItems(res.data.items ?? []);
      // opcjonalnie: showSuccess => pokaż komunikat "odświeżono"
    } else {
      if (!showSuccess) {
        showNoticeForApi(res, { titleError: "Failed to load tags." });
      }
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const goEdit = (item: Tag) => {
    nav.navigate("EditTag", { tag: item });
  };

  const goAdd = () => {
    nav.navigate("AddTag", { returnTo: "TagManager" });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>
          {TranslationServiceInstance.t("Loading…")}
        </Text>
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

      {/* Pasek akcji jak przy kategoriach */}
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
