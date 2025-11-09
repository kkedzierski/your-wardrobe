// src/screens/HomeScreen.tsx
import React from "react";
import styled from "styled-components/native";
import AddClothFromCameraButton from "../components/AddClothFromCameraButton";

export default function HomeScreen() {
  return (
    <Container accessibilityLabel="Widok Startowy">
      <Subtitle>Tutaj możesz dodać ubranie do garderoby</Subtitle>
      <AddClothFromCameraButton />
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background: #fff;
  padding: 16px;
`;
const Subtitle = styled.Text`
  color: #666;
  margin-top: 4px;
`;
