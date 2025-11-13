// src/screens/OutfitScreen.tsx
import React from "react";
import styled from "styled-components/native";
import Fab from "../components/Fab";
import { TranslationServiceInstance } from "../i18n/TranslationService";

export default function OutfitScreen() {
  return (
    <Container accessibilityLabel="Widok Strojów">
      <Title>{TranslationServiceInstance.t("Outfits")}</Title>
      <Subtitle>
        {TranslationServiceInstance.t("Your outfits and styles")}
      </Subtitle>

      <InfoBox>
        <InfoTitle>🚧 W produkcji</InfoTitle>
        <InfoText>
          Ta funkcja jest aktualnie w przygotowaniu i będzie wkrótce dostępna.
        </InfoText>
      </InfoBox>

      <Fab
        label="+"
        onPress={() => {
          /* otwórz bottom sheet lub Create */
        }}
      />
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background: #fff;
  padding: 16px;
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

const InfoBox = styled.View`
  margin-top: 32px;
  padding: 20px;
  background: #f3f4f6;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const InfoTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #1b1b1b;
  margin-bottom: 6px;
`;

const InfoText = styled.Text`
  color: #444;
  font-size: 14px;
`;
