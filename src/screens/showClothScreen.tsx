// src/screens/ShowClothScreen.tsx
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";
import { getClothItem } from "../api/Cloth/Ui/REST/GET/GetClothItem/GetClothItemController";
import type { GetClothItemOutput } from "../api/Cloth/Ui/REST/GET/GetClothItem/GetClothItemOutput";
import { showNoticeForApi } from "../ui/apiNotice";
import { TranslationServiceInstance } from "../i18n/TranslationService";

type Props = { clothId: number };

// 👉 to jest Twój dotychczasowy komponent, tylko pod nową nazwą:
export function ShowClothScreenView({ clothId }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<GetClothItemOutput | null>(null);

  const load = React.useCallback(
    async (showSuccess = false) => {
      setLoading(true);
      const res = await getClothItem({ id: clothId });
      if (res.ok) {
        setData(res.data);
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
        <Button title="Retry" onPress={() => load(false)} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{data.name}</Text>

      {data.description ? (
        <Text style={styles.row}>
          {TranslationServiceInstance.t("Description")}: {data.description}
        </Text>
      ) : null}
      {data.brand ? (
        <Text style={styles.row}>
          {TranslationServiceInstance.t("Brand")}: {data.brand}
        </Text>
      ) : null}
      {data.color ? (
        <Text style={styles.row}>
          {TranslationServiceInstance.t("Color")}: {data.color}
        </Text>
      ) : null}
      {data.season ? (
        <Text style={styles.row}>
          {TranslationServiceInstance.t("Season")}: {data.season}
        </Text>
      ) : null}
      {data.location ? (
        <Text style={styles.row}>Location: {data.location}</Text>
      ) : null}

      {data.category ? (
        <Text style={styles.row}>Category: {data.category.name}</Text>
      ) : null}

      {!!(data.tags && data.tags.length) ? (
        <Text style={styles.row}>
          Tags: {data.tags.map((t) => t.name).join(", ")}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button title="Refresh" onPress={() => load(true)} />
      </View>
    </ScrollView>
  );
}

// 👉 wrapper dla nawigacji (pobiera clothId z route.params)
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
  container: { padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  row: { fontSize: 14, marginBottom: 4 },
  actions: { marginTop: 16 },
});
