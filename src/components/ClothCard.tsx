// src/components/ClothCard.tsx
import React, { useState, useCallback } from "react";
import { Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Feather } from "@expo/vector-icons";

import { DeleteClothController } from "../api/Cloth/Ui/REST/DELETE/DeleteCloth/DeleteClothController";
import { showNoticeForApi } from "../ui/apiNotice";

type Props = {
  cloth: { id: number; name: string; thumbUrl?: string };
  userId?: string;
  onDeleted?: (clothId: number) => void;
  onEdit?: (clothId: number) => void;

  /** Batch-select API */
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (clothId: number) => void;
};

export default function ClothCard({
  cloth,
  userId,
  onDeleted,
  onEdit,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: Props) {
  const [loading, setLoading] = useState(false);

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
  }, []);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    const res = await DeleteClothController({ clothId: cloth.id, userId });
    setLoading(false);

    showNoticeForApi(res, {
      titleSuccess: "Gotowe",
      fallbackSuccessMsg: "Ubranie usunięte.",
      titleError: "Nie udało się usunąć ubrania",
    });

    if (res.ok) onDeleted?.(cloth.id);
  }, [cloth.id, userId, onDeleted]);

  const toggleSelect = useCallback(() => {
    onToggleSelect?.(cloth.id);
  }, [cloth.id, onToggleSelect]);

  const onPressCard = useCallback(() => {
    if (selectionMode) {
      toggleSelect();
      return;
    }
    // normalny tryb – pokaż menu akcji
    Alert.alert("Akcje", "", [
      { text: "Edytuj", onPress: () => onEdit?.(cloth.id) },
      { text: "Usuń", style: "destructive", onPress: confirmDelete },
      { text: "Zamknij", style: "cancel" },
    ]);
  }, [selectionMode, toggleSelect, onEdit, cloth.id, confirmDelete]);

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
          accessibilityLabel="Menu akcji"
          onPress={() => {
            Alert.alert("Akcje", "", [
              { text: "Edytuj", onPress: () => onEdit?.(cloth.id) },
              { text: "Usuń", style: "destructive", onPress: confirmDelete },
              { text: "Zamknij", style: "cancel" },
            ]);
          }}
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
