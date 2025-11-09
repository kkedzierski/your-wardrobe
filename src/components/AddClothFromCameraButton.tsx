// AddClothFromCameraButton.tsx
import React, { useState } from "react";
import { ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import { postCreateFromPhoto } from "../api/Cloth/Ui/REST/POST/CreateFromPhoto/CreateFromPhotoController";
import { showNoticeForApi } from "../ui/apiNotice";

export default function AddClothFromCameraButton() {
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    try {
      setLoading(true);
      const res = await postCreateFromPhoto({ main: true });
      showNoticeForApi(res, {
        titleSuccess: "Done",
        fallbackSuccessMsg: "Operation completed.",
        titleError: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BigBtn onPress={onPress} disabled={loading} accessibilityRole="button">
      {loading ? (
        <ActivityIndicator />
      ) : (
        <BigBtnText>📷 Dodaj ubranie do garderoby</BigBtnText>
      )}
    </BigBtn>
  );
}

const BigBtn = styled.TouchableOpacity`
  margin-top: 16px;
  background: #111;
  padding: 14px 16px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
`;
const BigBtnText = styled.Text`
  color: #fff;
  font-weight: 800;
`;
