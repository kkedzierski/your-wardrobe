// src/screens/EditClothScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { editCloth } from "../api/Cloth/Ui/REST/PATCH/EditClothController";
import { getClothItem } from "../api/Cloth/Ui/REST/GET/GetClothItem/GetClothItemController";
import type { GetClothItemOutput } from "../api/Cloth/Ui/REST/GET/GetClothItem/GetClothItemOutput";
import { showNoticeForApi } from "../ui/apiNotice";
import { TranslationServiceInstance } from "../i18n/TranslationService";

type Params = {
  clothId: number;
  userId?: string;
  title?: string;
  // opcjonalnie możesz przekazać gotowe dane, żeby uniknąć dodatkowego GET
  initialData?: Partial<GetClothItemOutput>;
  onUpdated?: (payload: {
    clothId: number;
    description?: string;
    color?: string;
    brand?: string;
    location?: string;
    updatedAt: string;
  }) => void;
};

export default function EditClothScreen() {
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const navigation = useNavigation<any>();

  const { clothId, userId, title, onUpdated, initialData } =
    route.params ?? ({} as Params);

  const [description, setDescription] = useState<string>(
    initialData?.description ?? ""
  );
  const [color, setColor] = useState<string>(initialData?.color ?? "");
  const [brand, setBrand] = useState<string>(initialData?.brand ?? "");
  const [location, setLocation] = useState<string>(initialData?.location ?? "");

  const [screenLoading, setScreenLoading] = useState<boolean>(!initialData); // jeśli nie mamy initialData → pobierzemy
  const [saving, setSaving] = useState(false);

  // ustaw tytuł – najpierw z params, a jeśli go brak, to z nazwy po fetchu
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title ? `Edytuj: ${title}` : "Edytuj ubranie",
    });
  }, [navigation, title]);

  // Prefill z API, gdy nie dostaliśmy initialData
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (initialData) return; // mamy dane z params
      if (!clothId) return;

      setScreenLoading(true);
      const res = await getClothItem({ id: clothId });
      setScreenLoading(false);

      if (!mounted) return;

      if (res.ok && res.data) {
        const d = res.data;
        setDescription(d.description ?? "");
        setColor(d.color ?? "");
        setBrand(d.brand ?? "");
        setLocation(d.location ?? "");
        if (!title && d.name) {
          navigation.setOptions({ title: `Edytuj: ${d.name}` });
        }
      } else {
        showNoticeForApi(res, { titleError: "Couldn't load cloth" });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [clothId, initialData, title, navigation]);

  const onSave = useCallback(async () => {
    setSaving(true);
    const res = await editCloth({
      clothId,
      userId,
      description: description || undefined,
      color: color || undefined,
      brand: brand || undefined,
      location: location || undefined,
    });
    setSaving(false);

    showNoticeForApi(res, {
      titleSuccess: "Done",
      fallbackSuccessMsg: "Cloth updated.",
      titleError: "Couldn't update cloth",
    });

    if (res.ok) {
      onUpdated?.(res.data as any);
      navigation.goBack();
    }
  }, [
    clothId,
    userId,
    description,
    color,
    brand,
    location,
    navigation,
    onUpdated,
  ]);

  if (screenLoading) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Field label={TranslationServiceInstance.t("Description")}>
        <TextInput
          placeholder={TranslationServiceInstance.t("e.g. Everyday tee")}
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />
      </Field>

      <Field label={TranslationServiceInstance.t("Color")}>
        <TextInput
          placeholder={TranslationServiceInstance.t("e.g. navy")}
          value={color}
          onChangeText={setColor}
          style={styles.input}
        />
      </Field>

      <Field label={TranslationServiceInstance.t("Brand")}>
        <TextInput
          placeholder="e.g. Acme"
          value={brand}
          onChangeText={setBrand}
          style={styles.input}
        />
      </Field>

      <Field label={TranslationServiceInstance.t("Location")}>
        <TextInput
          placeholder="e.g. Wardrobe B"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
      </Field>

      <Pressable
        style={[styles.saveBtn, (saving || screenLoading) && { opacity: 0.6 }]}
        onPress={onSave}
        disabled={saving || screenLoading}
      >
        {saving ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.saveText}>Save</Text>
        )}
      </Pressable>
    </View>
  );
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <View style={{ width: "100%" }}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
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
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
