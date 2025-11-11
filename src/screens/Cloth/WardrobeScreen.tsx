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

export default function WardrobeScreen() {
  const navigation = useNavigation<any>();
  const gridRef = useRef<WardrobeGridHandle>(null);
  const [busy, setBusy] = useState(false);

  // (opcjonalnie) tu możesz trzymać aktywne filtry, np. categoryId/tagi/kolor itd.
  const [activeFilters] = useState<{ label: string; key: string }[]>([]);

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
      if (res.ok) {
        await gridRef.current?.reload(); // wymuś odświeżenie po dodaniu
      }
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const onOpenCategories = useCallback(() => {
    // ➜ przejście do menedżera kategorii (edycja/usuwanie/dodawanie)
    navigation.navigate("CategoryManager");
  }, [navigation]);

  const onOpenFilters = useCallback(() => {
    // ➜ tu podepnij swój arkusz filtrów (BottomSheet/Modal)
    // np. navigation.navigate("FiltersSheet") lub setFiltersOpen(true)
    showNoticeForApi({ ok: true } as any, {
      titleSuccess: "TODO",
      fallbackSuccessMsg: "Tu otworzysz arkusz filtrów.",
      titleError: "Error",
    });
  }, []);

  return (
    <Container accessibilityLabel="Widok Garderoby">
      <Header>
        <View>
          <Title>Garderoba</Title>
          <Subtitle>Twoje ubrania</Subtitle>
        </View>

        {/* Pasek akcji w prawym górnym rogu */}
        <HeaderActions>
          <SmallBtn onPress={onOpenFilters} accessibilityLabel="Filtry">
            <Feather name="sliders" size={16} />
            <SmallBtnText>Filtry</SmallBtnText>
          </SmallBtn>

          <SmallBtn onPress={onOpenCategories} accessibilityLabel="Kategorie">
            <Feather name="folder" size={16} />
            <SmallBtnText>Kategorie</SmallBtnText>
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

      <WardrobeGrid ref={gridRef} />

      <RefreshPill
        label="Odśwież"
        onPress={() => gridRef.current?.reload()}
        disabled={busy}
      />

      <Fab
        label={busy ? "…" : "+"}
        onPress={handleFabPress}
        disabled={busy}
        accessibilityLabel="Dodaj nowe ubranie z aparatu"
        accessibilityHint="Otworzy aparat i doda zdjęcie ubrania do garderoby"
      />
    </Container>
  );
}

// ===== Styled =====
const Container = styled.View`
  flex: 1;
  background: #fff;
  padding: 16px;
`;

const Header = styled.View`
  margin-bottom: 12px;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
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

const HeaderActions = styled.View`
  flex-direction: row;
  gap: 8px;
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
