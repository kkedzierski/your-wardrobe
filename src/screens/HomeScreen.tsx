// src/screens/HomeScreen.tsx
import React from "react";
import styled from "styled-components/native";
import AddClothFromCameraButton from "../components/AddClothFromCameraButton";

export default function HomeScreen() {
  return (
    <Container accessibilityLabel="Widok Startowy">
      <HeaderArea>
        <Headline>Twoja garderoba</Headline>
        <Lead>Dodaj nowe ubranie jednym kliknięciem</Lead>
      </HeaderArea>

      {/* Hero CTA zajmujący ~50% ekranu */}
      <AddClothFromCameraButton />

      <BelowHint>
        Wskazówka: rób zdjęcia na jednolitym tle dla lepszych wyników ✨
      </BelowHint>
    </Container>
  );
}

const Container = styled.SafeAreaView`
  flex: 1;
  background: #fff;
  padding: 16px;
`;

const HeaderArea = styled.View`
  padding: 4px;
  margin-bottom: 24px;
`;

const Headline = styled.Text`
  color: #111827;
  font-size: 22px;
  font-weight: 800;
`;

const Lead = styled.Text`
  color: #6b7280;
  margin-top: 2px;
`;

const BelowHint = styled.Text`
  color: #6b7280;
  font-size: 12px;
  text-align: center;
  margin-top: 12px;
`;
