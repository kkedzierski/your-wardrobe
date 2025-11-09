import React, { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import styled from "styled-components/native";

import { postCreateFromPhoto } from "../api/Cloth/Ui/REST/POST/CreateFromPhoto/CreateFromPhotoController";
import { showAlertForApi } from "../ui/apiAlert";

export default function AddClothFromCameraButton() {
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    setLoading(true);
    const res = await postCreateFromPhoto({ main: true });
    setLoading(false);

    showAlertForApi(res, {
      successTitle: "Done",
      successMessage: "Photo added to wardrobe.",
      errorTitle: "Error",
    });
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
