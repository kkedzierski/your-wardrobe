import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  FlatList,
} from "react-native";
import styled from "styled-components/native";
import { getActiveUserId } from "../auth/ensureGuestUser";
import {
  fetchWardrobePhotosAll,
  WardrobePhoto,
} from "../api/Cloth/Infrastructure/ClothRepository";
import { useFocusEffect } from "@react-navigation/native";
import { EventBus, EVENTS } from "../events/bus";

const GAP = 8;
const NUM_COLUMNS = 3;

export default function WardrobeGrid() {
  const [data, setData] = useState<WardrobePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemSize = useMemo(() => {
    const width = Dimensions.get("window").width;
    const horizontalPadding = 32; // 16 + 16 z ekranu
    const totalGap = GAP * (NUM_COLUMNS - 1);
    const usable = width - horizontalPadding - totalGap;
    return Math.floor(usable / NUM_COLUMNS);
  }, []);

  const load = useCallback(async () => {
    try {
      setError(null);
      await getActiveUserId(); // jeśli chcesz filtrować po userId, pobierz tu
      const rows = await fetchWardrobePhotosAll();
      setData(rows);
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się pobrać zdjęć.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const off = EventBus.on(EVENTS.WARDROBE_PHOTO_ADDED, () => {
      load();
    });
    return off; // unsubscribe
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  if (error) {
    return (
      <Centered>
        <InfoText>😕 {error}</InfoText>
        <Retry onPress={load}>
          <RetryText>Spróbuj ponownie</RetryText>
        </Retry>
      </Centered>
    );
  }

  if (!data.length) {
    return (
      <EmptyWrap
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <EmptyBox>
          <EmptyTitle>Brak zdjęć</EmptyTitle>
          <EmptySub>
            Dodaj pierwsze ubranie z aparatu, a pojawi się tutaj.
          </EmptySub>
        </EmptyBox>
      </EmptyWrap>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(it) => String(it.id)}
      numColumns={NUM_COLUMNS}
      // styl dla wierszy (kolumn) – odstępy między kafelkami
      columnWrapperStyle={{ gap: GAP }}
      // styl dla zawartości – dolny padding
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({ item, index }) => (
        <Tile
          style={{
            width: itemSize,
            height: itemSize,
            marginTop: index < NUM_COLUMNS ? 0 : GAP,
          }}
          accessibilityLabel={`Zdjęcie ubrania #${item.id}`}
        >
          <Thumb source={{ uri: item.file_path }} />
        </Tile>
      )}
    />
  );
}

/* === styles === */
const Tile = styled.View`
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
`;
const Thumb = styled.Image`
  width: 100%;
  height: 100%;
`;
const Centered = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const InfoText = styled.Text`
  color: #1b1b1b;
`;
const Retry = styled.TouchableOpacity`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #111;
`;
const RetryText = styled.Text`
  color: #fff;
  font-weight: 700;
`;
const EmptyWrap = styled.ScrollView`
  flex: 1;
`;
const EmptyBox = styled.View`
  margin-top: 48px;
  background: #f7f8fb;
  border-radius: 16px;
  padding: 16px;
  align-self: center;
  width: 90%;
`;
const EmptyTitle = styled.Text`
  font-size: 16px;
  font-weight: 800;
  color: #1b1b1b;
`;
const EmptySub = styled.Text`
  color: #6b6b6b;
  margin-top: 6px;
`;
