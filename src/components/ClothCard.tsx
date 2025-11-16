// src/components/ClothCard.tsx
import React, { useState, useCallback } from "react";
import { Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // ⬅️

import { deleteCloth } from "../api/Cloth/Ui/REST/DELETE/DeleteCloth/DeleteClothController";
import { showNoticeForApi } from "../ui/apiNotice";
import { TranslationServiceInstance } from "../i18n/TranslationService";

type Props = {
  cloth: { id: number; name: string; thumbUrl?: string };
  userId?: string;
  onDeleted?: (clothId: number) => void;
  onUpdated?: (payload: {
    clothId: number;
    name?: string;
    description?: string;
    color?: string;
    brand?: string;
    location?: string;
    updatedAt: string;
  }) => void;

  /** Batch-select API */
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (clothId: number) => void;
};

export default function ClothCard({
  cloth,
  userId,
  onDeleted,
  onUpdated,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: Props) {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>(); // lub z typami Twojego stacka

  const handleDelete = useCallback(async () => {
    setLoading(true);
    const res = await deleteCloth({ clothId: cloth.id, userId });
    setLoading(false);

    showNoticeForApi(res, {
      titleSuccess: "Success",
      fallbackSuccessMsg: "Cloth deleted.",
      titleError: "Failed to delete cloth.",
    });

    if (res.ok) onDeleted?.(cloth.id);
  }, [cloth.id, userId, onDeleted]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      "Usunąć ubranie?",
      "Tej operacji nie można cofnąć.",
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Usuń", style: "destructive", onPress: handleDelete },
      ],
      { cancelable: true }
    );
  }, [handleDelete]);

  const toggleSelect = useCallback(() => {
    onToggleSelect?.(cloth.id);
  }, [cloth.id, onToggleSelect]);

  // ⬇️ TU: zwykłe kliknięcie otwiera ekran edycji
  const onPressCard = useCallback(() => {
    if (selectionMode) {
      toggleSelect();
      return;
    }
    // ⬇️ przejście do podglądu
    navigation.navigate("ShowCloth", {
      clothId: cloth.id,
      title: cloth.name,
    });
  }, [selectionMode, toggleSelect, navigation, cloth.id, cloth.name]);

  // menu „…”: dodaj „Podgląd” i „Edytuj”
  const openActions = useCallback(() => {
    if (selectionMode) {
      toggleSelect();
      return;
    }
    Alert.alert("Akcje", "", [
      {
        text: "Podgląd",
        onPress: () =>
          navigation.navigate("ShowCloth", {
            clothId: cloth.id,
            title: cloth.name,
          }),
      },
      {
        text: "Edytuj",
        onPress: () =>
          navigation.navigate("EditCloth", {
            clothId: cloth.id,
            userId,
            onUpdated,
            title: cloth.name,
          }),
      },
      { text: "Usuń", style: "destructive", onPress: confirmDelete },
      { text: "Zamknij", style: "cancel" },
    ]);
  }, [
    selectionMode,
    toggleSelect,
    confirmDelete,
    navigation,
    cloth.id,
    cloth.name,
    userId,
    onUpdated,
  ]);

  return (
    <Card
      accessibilityLabel={`Ubranie ${cloth.name}`}
      onLongPress={toggleSelect}
      onPress={onPressCard}
      activeOpacity={0.8}
      disabled={loading}
    >
      <ThumbWrapper>
        <Thumb
          source={cloth.thumbUrl ? { uri: cloth.thumbUrl } : undefined}
          style={selected ? { opacity: 0.6 } : undefined}
        />
        {selectionMode && (
          <SelectBadge>
            {selected ? (
              <Feather name="check-circle" size={22} color="#0f9d58" />
            ) : (
              <Feather name="circle" size={22} color="#bbb" />
            )}
          </SelectBadge>
        )}
      </ThumbWrapper>

      <Row>
        <Name numberOfLines={1}>{cloth.name}</Name>
        <MenuBtn
          accessibilityLabel={TranslationServiceInstance.t("Menu actions")}
          onPress={openActions}
          disabled={loading || selectionMode}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Feather name="more-horizontal" size={20} />
          )}
        </MenuBtn>
      </Row>
    </Card>
  );
}

const Card = styled(TouchableOpacity)`
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 8px;
  elevation: 2;
`;

const ThumbWrapper = styled.View`
  position: relative;
`;

const Thumb = styled.Image`
  width: 100%;
  aspect-ratio: 1;
  background: #f2f2f2;
`;

const SelectBadge = styled.View`
  position: absolute;
  left: 8px;
  top: 8px;
  background: #ffffffea;
  border-radius: 12px;
  padding: 2px;
`;

const Row = styled.View`
  padding: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Name = styled.Text`
  flex: 1;
  font-weight: 600;
  margin-right: 8px;
  color: #1b1b1b;
`;

const MenuBtn = styled.TouchableOpacity`
  padding: 6px;
  border-radius: 8px;
`;
