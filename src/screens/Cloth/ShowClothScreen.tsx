// src/screens/ShowClothScreen.tsx
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { getClothItem } from "../../api/Cloth/Ui/REST/GET/GetClothItem/GetClothItemController";
import type { GetClothItemOutput } from "../../api/Cloth/Ui/REST/GET/GetClothItem/GetClothItemOutput";
import { showNoticeForApi } from "../../ui/apiNotice";
import { TranslationServiceInstance } from "../../i18n/TranslationService";
import UiButton from "../../components/UiButton";

type Props = { clothId: number };

const screenW = Dimensions.get("window").width;
const HERO_SIDE = screenW - 32; // padding 16 + 16

// Jeśli backend zwraca ścieżki względne — podmień na swój base URL.
// Gdy zwracasz pełne http(s) URL, zostaw pusty string.
const BASE_URL = "";
const absolutize = (u?: string | null) =>
  !u ? undefined : u.startsWith("http") ? u : `${BASE_URL}${u}`;

export function ShowClothScreenView({ clothId }: Props) {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<
    | (GetClothItemOutput & {
        photos?: {
          id: number;
          url: string;
          main: boolean;
          createdAt: number;
        }[];
        thumbUrl?: string | null;
      })
    | null
  >(null);

  const load = React.useCallback(
    async (showSuccess = false) => {
      setLoading(true);
      const res = await getClothItem({ id: clothId });
      if (res.ok) {
        setData(res.data as any);
        if (showSuccess) {
          showNoticeForApi(res, {
            titleSuccess: "Done",
            fallbackSuccessMsg: "Operation completed.",
            titleError: "Couldn't get cloth",
          });
        }
      } else {
        showNoticeForApi(res, { titleError: "Couldn't get cloth" });
      }
      setLoading(false);
    },
    [clothId]
  );

  React.useEffect(() => {
    load(false);
  }, [load]);

  const goEdit = React.useCallback(() => {
    navigation.navigate("EditCloth", {
      clothId,
      title: data?.name,
      initialData: data ?? undefined,
      onUpdated: () => load(false),
    });
  }, [navigation, clothId, data, load]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        data ? (
          <Pressable
            onPress={goEdit}
            accessibilityLabel="Edytuj"
            style={{ paddingHorizontal: 12, paddingVertical: 8 }}
            hitSlop={8}
          >
            <Feather name="edit-3" size={18} />
          </Pressable>
        ) : null,
      title: data?.name || TranslationServiceInstance.t("New Cloth"),
    });
  }, [navigation, data, goEdit]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No data.</Text>
        <UiButton
          title="Retry"
          variant="secondary"
          onPress={() => load(false)}
        />
      </View>
    );
  }

  // Hero image: najpierw thumbUrl, potem fallback do photos[0]/main
  let imageUrl: string | undefined = absolutize(data.thumbUrl ?? undefined);
  if (!imageUrl && Array.isArray(data.photos) && data.photos.length) {
    const main = data.photos.find((p) => p.main) ?? data.photos[0];
    imageUrl = absolutize(main?.url);
  }

  const t = (k: string) => TranslationServiceInstance.t(k);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HERO FOTO */}
        <View style={styles.heroWrap} accessibilityLabel="Zdjęcie ubrania">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.hero}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.hero, styles.heroPlaceholder]}>
              <Feather name="image" size={32} color="#9ca3af" />
              <Text style={{ color: "#9ca3af", marginTop: 6 }}>
                {t("No photo")}
              </Text>
            </View>
          )}
        </View>

        {/* Tytuł */}
        <Text style={styles.title}>{data.name}</Text>

        {/* ===== Sekcja: Kategoria ===== */}
        <Text style={styles.sectionLabel}>{t("Category")}</Text>
        <View style={styles.metaRow}>
          {data.category ? (
            <View style={styles.badgePrimary}>
              <Text style={styles.badgePrimaryText}>{data.category.name}</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgeDashed]}>
              <Text style={styles.badgeText}>{t("No category")}</Text>
            </View>
          )}
        </View>

        {/* ===== Sekcja: Tagi ===== */}
        <Text style={styles.sectionLabel}>{t("Tags")}</Text>
        <View style={styles.metaRow}>
          {!!(data.tags && data.tags.length) ? (
            <View style={styles.tagsWrap}>
              {data.tags.slice(0, 12).map((tag) => (
                <View key={tag.id} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.tagChip, styles.tagChipEmpty]}>
              <Text style={styles.tagTextEmpty}>{t("No tags")}</Text>
            </View>
          )}
        </View>

        {/* Dane opisowe */}
        {data.description ? (
          <Text style={styles.row}>
            {t("Description")}: {data.description}
          </Text>
        ) : null}
        {data.brand ? (
          <Text style={styles.row}>
            {t("Brand")}: {data.brand}
          </Text>
        ) : null}
        {data.color ? (
          <Text style={styles.row}>
            {t("Color")}: {data.color}
          </Text>
        ) : null}
        {data.season ? (
          <Text style={styles.row}>
            {t("Season")}: {data.season}
          </Text>
        ) : null}
        {data.location ? (
          <Text style={styles.row}>
            {t("Location")}: {data.location}
          </Text>
        ) : null}
      </ScrollView>

      {/* Pasek akcji */}
      <View style={styles.actionBar}>
        <UiButton
          title={t("Refresh")}
          variant="ghost"
          iconLeftName="refresh-ccw"
          onPress={() => load(true)}
          style={{ flex: 1 }}
        />
        <View style={{ width: 10 }} />
        <UiButton
          title={t("Edit")}
          variant="primary"
          iconLeftName="edit-3"
          onPress={goEdit}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

export default function ShowClothScreen({ route, navigation }: any) {
  const { clothId, title } = route.params ?? {};
  React.useEffect(() => {
    if (title) navigation?.setOptions?.({ title });
  }, [title, navigation]);

  return <ShowClothScreenView clothId={clothId} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: { marginTop: 8 },
  errorText: { marginBottom: 12 },
  container: { padding: 16, gap: 8, paddingBottom: 112 },
  title: { fontSize: 20, fontWeight: "600", marginTop: 6, marginBottom: 8 },
  row: { fontSize: 14, marginBottom: 4 },

  heroWrap: { width: "100%", alignItems: "center" },
  hero: {
    width: HERO_SIDE,
    height: HERO_SIDE,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
  },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },

  sectionLabel: {
    fontSize: 12,
    color: "#6b7280", // slate-500
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },

  // Category badges
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  badgeDashed: {
    borderStyle: "dashed",
  },
  badgeText: { color: "#555", fontSize: 13 },
  badgePrimary: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  badgePrimaryText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // Tags chips
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  tagChipEmpty: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tagText: { fontSize: 12, color: "#333" },
  tagTextEmpty: { fontSize: 12, color: "#6b7280" },

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
