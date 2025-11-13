// src/screens/HomeScreen.tsx
import React from "react";
import styled from "styled-components/native";
import AddClothFromCameraButton from "../components/AddClothFromCameraButton";
import { TranslationServiceInstance } from "../i18n/TranslationService";

export default function HomeScreen() {
  return (
    <Container accessibilityLabel="Widok Startowy">
      <Title>{TranslationServiceInstance.t("Your wardrobe")}</Title>
      <Subtitle>
        {TranslationServiceInstance.t(
          "Add a new piece of clothing with one click"
        )}
      </Subtitle>

      <AddClothFromCameraButton />

      <BelowHint>
        {TranslationServiceInstance.t(
          "Tip: take photos on a uniform background for better results"
        )}
        ✨
      </BelowHint>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background: #fff;
  padding: 16px;
`;

// const HeaderArea = styled.View`
//   margin-top: 16px;
//   margin-bottom: 24px;
// `;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: #1b1b1b;
`;
const Subtitle = styled.Text`
  color: #666;
  margin-top: 4px;
`;

const BelowHint = styled.Text`
  color: #6b7280;
  font-size: 12px;
  text-align: center;
  margin-top: 12px;
`;
