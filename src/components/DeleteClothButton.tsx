// src/components/DeleteClothButton.tsx
import React, { useState } from "react";
import { ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import { deleteCloth } from "../api/Cloth/Ui/REST/DELETE/DeleteCloth/DeleteClothController";
import { showNoticeForApi } from "../ui/apiNotice";

type Props = {
  clothId: number;
  userId?: string;
  onDeleted?: (clothId: number) => void;
};

export default function DeleteClothButton({
  clothId,
  userId,
  onDeleted,
}: Props) {
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    setLoading(true);
    const res = await deleteCloth({ clothId, userId });
    setLoading(false);

    showNoticeForApi(res, {
      titleSuccess: "Done",
      fallbackSuccessMsg: "Cloth deleted.",
      titleError: "Couldn't remove cloth",
    });

    if (res.ok) onDeleted?.(clothId);
  };

  return (
    <BigBtn onPress={onPress} disabled={loading} accessibilityRole="button">
      {loading ? <ActivityIndicator /> : <BigBtnText>🗑 Usuń</BigBtnText>}
    </BigBtn>
  );
}

const BigBtn = styled.TouchableOpacity`
  margin-top: 8px;
  background: #b00020;
  padding: 10px 14px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;
const BigBtnText = styled.Text`
  color: #fff;
  font-weight: 800;
`;
