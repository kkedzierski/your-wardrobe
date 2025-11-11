// src/screens/WardrobeScreen.tsx
import React, { useRef, useState } from "react";
import styled from "styled-components/native";
import WardrobeGrid, { WardrobeGridHandle } from "../components/WardrobeGrid";
import Fab from "../components/Fab";
import RefreshPill from "../components/RefreshPill";
import { postCreateFromPhoto } from "../api/Cloth/Ui/REST/POST/CreateFromPhoto/CreateFromPhotoController";
import { showNoticeForApi } from "../ui/apiNotice";

export default function WardrobeScreen() {
  const gridRef = useRef<WardrobeGridHandle>(null);
  const [busy, setBusy] = useState(false);

  const handleFabPress = async () => {
    if (busy) return;
    try {
      setBusy(true);
      const res = await postCreateFromPhoto({ main: true });
      showNoticeForApi(res, {
        titleSuccess: "Done",
        fallbackSuccessMsg: "Photo added to wardrobe.",
        titleError: "Error",
      });
      if (res.ok) {
        await gridRef.current?.reload(); // wymuś odświeżenie po dodaniu
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container accessibilityLabel="Widok Garderoby">
      <Header>
        <Title>Garderoba</Title>
        <Subtitle>Twoje ubrania</Subtitle>
      </Header>

      <WardrobeGrid ref={gridRef} />

      <RefreshPill
        label="Odśwież"
        onPress={() => gridRef.current?.reload()}
        disabled={busy}
      />

      <Fab
        label={busy ? "…" : "+"}
        onPress={handleFabPress}
        disabled={busy}
        accessibilityLabel="Dodaj nowe ubranie z aparatu"
        accessibilityHint="Otworzy aparat i doda zdjęcie ubrania do garderoby"
      />
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background: #fff;
  padding: 16px;
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
