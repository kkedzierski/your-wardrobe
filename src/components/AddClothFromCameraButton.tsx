// AddClothFromCameraButton.tsx
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable } from "react-native";
import styled from "styled-components/native";
import { postCreateFromPhoto } from "../api/Cloth/Ui/REST/POST/CreateFromPhoto/CreateFromPhotoController";
import { showNoticeForApi } from "../ui/apiNotice";

export default function AddClothFromCameraButton() {
  const [loading, setLoading] = useState(false);
  const halfHeight = useMemo(
    () => Math.round(Dimensions.get("window").height * 0.5),
    []
  );

  const onPress = async () => {
    if (loading) return; // bezpieczeństwo na szybkie tapy
    try {
      setLoading(true);
      const res = await postCreateFromPhoto({ main: true });
      showNoticeForApi(res, {
        titleSuccess: "Gotowe",
        fallbackSuccessMsg: "Operacja zakończona.",
        titleError: "Błąd",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      style={{ minHeight: halfHeight }}
      accessible
      accessibilityRole="button"
      accessibilityHint="Otwiera aparat i dodaje zdjęcie ubrania do garderoby"
      accessibilityState={{ disabled: loading, busy: loading }}
      testID="add-from-camera"
    >
      <Pressable
        onPress={onPress}
        disabled={loading}
        hitSlop={8}
        accessibilityRole="button"
      >
        {({ pressed }) => (
          <Card pressed={pressed} disabled={loading}>
            <IconWrap>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <IconText aria-hidden>📷</IconText>
              )}
            </IconWrap>

            <Title>
              {loading ? "Przetwarzanie…" : "Dodaj ubranie do garderoby"}
            </Title>
            <Subtitle>
              {loading
                ? "Proszę czekać, zapisujemy pozycję"
                : "Zrób zdjęcie i automatycznie dodaj do szafy"}
            </Subtitle>
          </Card>
        )}
      </Pressable>
    </CardWrapper>
  );
}

const CardWrapper = styled.View`
  width: 100%;
  padding: 0 8px;
`;

const Card = styled.View<{ pressed?: boolean; disabled?: boolean }>`
  background: ${({ pressed }) => (pressed ? "#0f0f0f" : "#111")};
  opacity: ${({ disabled }) => (disabled ? 0.9 : 1)};
  border-radius: 20px;
  padding: 24px;
  justify-content: center;
  align-items: center;

  /* delikatna karta: cień i obrys dla iOS/Android */
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 12px;
  shadow-offset: 0px 6px;
  elevation: 6;
`;

const IconWrap = styled.View`
  margin-bottom: 12px;
`;

const IconText = styled.Text`
  font-size: 42px;
`;

const Title = styled.Text`
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
`;

const Subtitle = styled.Text`
  color: #d1d5db;
  font-size: 14px;
  margin-top: 6px;
  text-align: center;
`;
