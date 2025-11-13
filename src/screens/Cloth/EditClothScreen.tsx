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
import {
  RouteProp,
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";

import { editCloth } from "../../api/Cloth/Ui/REST/PATCH/EditClothController";
import { getClothItem } from "../../api/Cloth/Ui/REST/GET/GetClothItem/GetClothItemController";
import type { GetClothItemOutput } from "../../api/Cloth/Ui/REST/GET/GetClothItem/GetClothItemOutput";
import { showNoticeForApi } from "../../ui/apiNotice";
import { TranslationServiceInstance } from "../../i18n/TranslationService";

import type { Category } from "../../api/Category/Domain/Category";
import CategoryPickerModal from "../../components/CategoryPickerModal";
import TagPickerModal from "../../components/TagPickerModal";
import type { Tag } from "../../api/Tag/Domain/Tag";

type Params = {
  clothId: number;
  userId?: string;
  title?: string;
  // opcjonalny prefilling, żeby uniknąć dodatkowego GET
  initialData?: Partial<GetClothItemOutput> & {
    categoryId?: number;
    categoryName?: string;
    category?: { id: number; name: string };
    tags?: Tag[];
  };
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

  const [name, setName] = useState<string>(initialData?.name ?? "");
  const [description, setDescription] = useState<string>(
    initialData?.description ?? ""
  );
  const [color, setColor] = useState<string>(initialData?.color ?? "");
  const [brand, setBrand] = useState<string>(initialData?.brand ?? "");
  const [location, setLocation] = useState<string>(initialData?.location ?? "");

  // Kategoria – inicjalizacja obsługuje i obiekt category, i parę categoryId/categoryName
  const [category, setCategory] = useState<Category | undefined>(
    initialData?.category
      ? { id: initialData.category.id, name: initialData.category.name }
      : initialData?.categoryId
      ? { id: initialData.categoryId, name: initialData.categoryName ?? "" }
      : undefined
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  // Stan tagów pobranych z initialData/tags lub pusty — analogicznie jak category
  const [tags, setTags] = useState<Tag[]>(initialData?.tags ?? []);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);

  const [screenLoading, setScreenLoading] = useState<boolean>(!initialData);
  const [saving, setSaving] = useState(false);

  // Tytuł
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title ? `Edytuj: ${title}` : "Edytuj ubranie",
    });
  }, [navigation, title]);

  // Prefill z API, gdy nie mamy initialData
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (initialData) return;
      if (!clothId) return;

      setScreenLoading(true);
      const res = await getClothItem({ id: clothId });
      setScreenLoading(false);
      if (!mounted) return;

      if (res.ok && res.data) {
        const d = res.data as any;
        setName(d.name ?? "");
        setDescription(d.description ?? "");
        setColor(d.color ?? "");
        setBrand(d.brand ?? "");
        setLocation(d.location ?? "");

        // ✅ preferuj d.category{ id, name }, fallback: categoryId/categoryName
        if (d.category?.id) {
          setCategory({ id: d.category.id, name: d.category.name });
        } else if (d.categoryId) {
          setCategory({ id: d.categoryId, name: d.categoryName ?? "" });
        }

        setTags(d.tags ?? []);

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

  React.useEffect(() => {
    if (name?.trim())
      navigation.setOptions({
        title: `${TranslationServiceInstance.t("Edytuj")}: ${name}`,
      });
  }, [name, navigation]);

  const onSave = useCallback(async () => {
    setSaving(true);
    const res = await editCloth({
      clothId,
      userId,
      name: name || undefined,
      description: description || undefined,
      color: color || undefined,
      brand: brand || undefined,
      location: location || undefined,
      categoryId: category?.id, // ⬅️ przekazujemy wybraną kategorię
      tagIds: tags.map((t) => String(t.id)), // API wymaga string[], albo zamień na number[] jeśli poprawisz backend!
    });
    setSaving(false);

    showNoticeForApi(res, {
      titleSuccess: "Done",
      fallbackSuccessMsg: "Cloth updated.",
      titleError: "Couldn't update cloth",
    });

    if (res.ok) {
      onUpdated?.({
        clothId,
        name: name || undefined,
        description: description || undefined,
        color: color || undefined,
        brand: brand || undefined,
        location: location || undefined,
        updatedAt: res.data?.updatedAt ?? "",
      });
      navigation.goBack();
    }
  }, [
    clothId,
    userId,
    name,
    description,
    color,
    brand,
    location,
    category,
    tags,
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
      <Field label={TranslationServiceInstance.t("Name")}>
        <TextInput
          placeholder={TranslationServiceInstance.t("e.g. T-shirt")}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      </Field>
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

      {/* ⬇️ KATEGORIA */}
      <Field label="Kategoria">
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={[
            styles.input,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#fff",
            },
          ]}
          accessibilityLabel="Wybierz kategorię"
        >
          <Text style={{ color: category ? "#111" : "#666" }}>
            {category ? category.name : "Wybierz lub dodaj…"}
          </Text>
          <Text style={{ color: "#999" }}>▾</Text>
        </Pressable>
      </Field>

      {/* ⬇️ TAGI */}
      <Field label="Tagi">
        <Pressable
          onPress={() => setTagPickerOpen(true)}
          style={[
            styles.input,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#fff",
              flexWrap: "wrap",
            },
          ]}
          accessibilityLabel="Wybierz tagi"
        >
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 }}
          >
            {tags.length ? (
              tags.map((tag) => (
                <View
                  key={tag.id}
                  style={[styles.tagChip, { marginRight: 6, marginBottom: 4 }]}
                >
                  <Text style={styles.tagText}>#{tag.name}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#666" }}>Wybierz lub dodaj…</Text>
            )}
          </View>
          <Text style={{ color: "#999", marginLeft: 6 }}>▾</Text>
        </Pressable>
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

      {/* Modal pickera kategorii */}
      <CategoryPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(c) => setCategory(c)}
        onAddNew={() => {
          setPickerOpen(false);
          navigation.navigate("AddCategory", {
            // NIE potrzebujemy returnTo, użyjemy callbacku:
            onCategoryCreated: (cat: Category) => {
              // to się wykona w momencie zapisu w AddCategory,
              // jeszcze zanim wrócisz goBack na EditCloth
              setCategory(cat);
            },
          } as any);
        }}
      />

      {/* Modal pickera tagów */}
      <TagPickerModal
        visible={tagPickerOpen}
        selected={tags}
        onClose={() => setTagPickerOpen(false)}
        onSelect={(chosen) => setTags(chosen)}
        onAddNew={() => {
          setTagPickerOpen(false);
          navigation.navigate("AddTag");
        }}
      />
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
  tagChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  tagText: { fontSize: 12, color: "#333" },
});
