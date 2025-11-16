// src/screens/WardrobeScreen.tsx
import React, { useRef, useState, useCallback } from "react";
import styled from "styled-components/native";
import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import WardrobeGrid, {
  WardrobeGridHandle,
} from "../../components/WardrobeGrid";
import Fab from "../../components/Fab";
import RefreshPill from "../../components/RefreshPill";
import { postCreateFromPhoto } from "../../api/Cloth/Ui/REST/POST/CreateFromPhoto/CreateFromPhotoController";
import { showNoticeForApi } from "../../ui/apiNotice";
import { TranslationServiceInstance } from "../../i18n/TranslationService";
import TagPickerModal from "../../components/TagPickerModal";
import type { Tag } from "../../api/Tag/Domain/Tag";
import { WardrobeFilter } from "../../api/Cloth/Ui/REST/GET/GetClothesCollection/ClothesFilters";
import WardrobeFiltersModal from "../../components/WardrobeFiltersModal";

export default function WardrobeScreen() {
  const navigation = useNavigation<any>();
  const gridRef = useRef<WardrobeGridHandle>(null);
  const [busy, setBusy] = useState(false);
  // TAGI do filtrowania
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isTagPickerOpen, setTagPickerOpen] = useState(false);

  const [filters, setFilters] = useState<WardrobeFilter>({});
  const [activeFilters, setActiveFilters] = useState<
    { label: string; key: string }[]
  >([]);
  const [isFiltersOpen, setFiltersOpen] = useState(false);

  const handleFabPress = useCallback(async () => {
    if (busy) return;
    try {
      setBusy(true);
      const res = await postCreateFromPhoto({ main: true });

      showNoticeForApi(res, {
        titleSuccess: "Done",
        fallbackSuccessMsg: "Photo added to wardrobe.",
        titleError: "Error",
      });

      if (res.ok && res.data) {
        const { clothId } = res.data;

        navigation.navigate("EditCloth", {
          clothId: Number(clothId),
          // opcjonalnie: po zapisie odśwież garderobę
          onUpdated: () => {
            // EditCloth po udanym zapisie wywoła ten callback
            gridRef.current?.reload();
          },
        } as any);
      }
    } finally {
      setBusy(false);
    }
  }, [busy, navigation]);

  const onOpenCategories = useCallback(() => {
    // ➜ przejście do menedżera kategorii (edycja/usuwanie/dodawanie)
    navigation.navigate("CategoryManager");
  }, [navigation]);

  const onOpenFilters = useCallback(() => {
    setFiltersOpen(true);
  }, []);

  const onOpenTagsManager = useCallback(() => {
    navigation.navigate("TagManager");
  }, [navigation]);

  const applyFilters = useCallback(
    (next: WardrobeFilter) => {
      setFilters(next);

      const chips: { key: string; label: string }[] = [];

      if (next.brand) {
        chips.push({ key: "brand", label: `Marka: ${next.brand}` });
      }
      if (next.color) {
        chips.push({ key: "color", label: `Kolor: ${next.color}` });
      }
      if (next.season) {
        chips.push({ key: "season", label: `Sezon: ${next.season}` });
      }
      if (next.location) {
        chips.push({
          key: "location",
          label: `Lokalizacja: ${next.location}`,
        });
      }
      if (next.categoryName) {
        chips.push({
          key: "category",
          label: `Kategoria: ${next.categoryName}`,
        });
      }
      if (next.description) {
        chips.push({
          key: "description",
          label: `Opis: ${next.description}`,
        });
      }

      setActiveFilters(chips);
      gridRef.current?.reload();
    },
    [gridRef]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setActiveFilters([]);
    gridRef.current?.reload();
  }, [gridRef]);

  return (
    <Container
      testID="WardrobeScreen"
      accessibilityLabel={TranslationServiceInstance.t("Wardrobe screen")}
    >
      <Header>
        <View>
          <Title>{TranslationServiceInstance.t("Wardrobe")}</Title>
          <Subtitle>{TranslationServiceInstance.t("Your clothes")}</Subtitle>
        </View>

        <HeaderActions>
          <SmallBtn
            onPress={onOpenFilters}
            accessibilityLabel={TranslationServiceInstance.t("Filters")}
            testID="FiltersButton"
          >
            <Feather name="sliders" size={16} />
            <SmallBtnText>
              {TranslationServiceInstance.t("Filters")}
            </SmallBtnText>
          </SmallBtn>

          {!!activeFilters.length && (
            <SmallBtn
              onPress={clearFilters}
              accessibilityLabel={TranslationServiceInstance.t(
                "Remove filters"
              )}
              testID="RemoveFiltersButton"
            >
              <Feather name="x-circle" size={16} />
              <SmallBtnText>
                {TranslationServiceInstance.t("Remove filters")}
              </SmallBtnText>
            </SmallBtn>
          )}

          <SmallBtn
            onPress={onOpenCategories}
            accessibilityLabel={TranslationServiceInstance.t("Categories")}
            testID="CategoriesButton"
          >
            <Feather name="folder" size={16} />
            <SmallBtnText>
              {TranslationServiceInstance.t("Categories")}
            </SmallBtnText>
          </SmallBtn>

          <SmallBtn
            onPress={onOpenTagsManager}
            accessibilityLabel={TranslationServiceInstance.t("Tags")}
            testID="TagsButton"
          >
            <Feather name="tag" size={16} />
            <SmallBtnText>{TranslationServiceInstance.t("Tags")}</SmallBtnText>
          </SmallBtn>
        </HeaderActions>
      </Header>

      {/* Aktywne filtry (opcjonalnie) */}
      {!!activeFilters.length && (
        <ChipsRow>
          {activeFilters.map((f) => (
            <Chip key={f.key}>
              <ChipText>{f.label}</ChipText>
            </Chip>
          ))}
        </ChipsRow>
      )}

      <WardrobeGrid ref={gridRef} filters={filters} />

      <RefreshPill
        testID="RefreshButton"
        accessibilityLabel={TranslationServiceInstance.t("Refresh button")}
        label={TranslationServiceInstance.t("Refresh")}
        onPress={() => gridRef.current?.reload()}
        disabled={busy}
      />

      <Fab
        label={busy ? "…" : "+"}
        onPress={handleFabPress}
        disabled={busy}
        testID="AddNewClothingFromCameraButton"
        accessibilityLabel={TranslationServiceInstance.t(
          "Add new clothing from camera button"
        )}
        accessibilityHint={TranslationServiceInstance.t(
          "Open the camera and add a photo of clothing to the wardrobe"
        )}
      />
      <TagPickerModal
        visible={isTagPickerOpen}
        selected={selectedTags}
        onClose={() => setTagPickerOpen(false)}
        onSelect={(chosen) => setSelectedTags(chosen)}
        onAddNew={() => {
          setTagPickerOpen(false);
          navigation.navigate("AddTag", {
            onTagCreated: (tag: Tag) => {
              setSelectedTags((prev) => [...prev, tag]);
            },
          });
        }}
      />

      <WardrobeFiltersModal
        visible={isFiltersOpen}
        initialFilters={filters}
        onApply={applyFilters}
        onClear={clearFilters}
        onClose={() => setFiltersOpen(false)}
      />
    </Container>
  );
}

// ===== Styled =====
const Container = styled.View`
  flex: 1;
  padding: 16px;
  background-color: #f9f9f9;
`;
const Header = styled.View`
  margin-bottom: 12px;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
`;
const HeaderActions = styled.View`
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;
const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: #1b1b1b;
`;
const Subtitle = styled.Text`
  color: #666;
  margin-top: 4px;
`;
const SmallBtn = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  border-width: 1px;
  border-color: #e5e7eb;
  background: #fafafa;
`;
const SmallBtnText = styled.Text`
  color: #111827;
  font-weight: 600;
  font-size: 13px;
`;
const ChipsRow = styled.View`
  margin-bottom: 8px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;
const Chip = styled.View`
  padding: 6px 10px;
  border-radius: 999px;
  background: #f3f4f6;
`;
const ChipText = styled.Text`
  font-size: 12px;
  color: #374151;
`;
