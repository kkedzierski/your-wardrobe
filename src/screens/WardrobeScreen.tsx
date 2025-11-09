import React from "react";
import styled from "styled-components/native";
import WardrobeGrid from "../components/WardrobeGrid";
import Fab from "../components/Fab";

export default function WardrobeScreen() {
  return (
    <Container accessibilityLabel="Widok Garderoby">
      <Header>
        <Title>Garderoba</Title>
        <Subtitle>Twoje ubrania </Subtitle>
      </Header>

      <WardrobeGrid />

      <Fab
        label="+"
        onPress={() => {
          /* np. nawiguj do akcji dodawania – jeśli używasz AddClothFromCameraButton gdzie indziej */
        }}
      />
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background: #fff;
  padding: 16px; /* pamiętaj: WardrobeGrid liczy padding 16px po bokach */
`;
const Header = styled.View`
  margin-bottom: 12px;
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
