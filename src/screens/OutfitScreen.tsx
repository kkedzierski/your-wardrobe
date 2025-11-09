// src/screens/OutfitScreen.tsx
import React from "react";
import styled from "styled-components/native";
import Fab from "../components/Fab";

export default function OutfitScreen() {
  return (
    <Container accessibilityLabel="Widok Strojów">
      <Title>Stroje</Title>
      <Subtitle>Twoje zestawy i stylizacje</Subtitle>
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
