// src/components/WardrobeGrid.tsx
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  useWindowDimensions,
  View,
} from "react-native";
import styled from "styled-components/native";
import ClothCard from "./ClothCard";
import { getClothesCollection } from "../api/Cloth/Ui/REST/GET/GetClothesCollection/GetClothesCollectionOutputController";
import { batchDeleteCloths } from "../api/Cloth/Ui/REST/DELETE/BatchDeleteCloth/BatchDeleteClothController";
import { showNoticeForApi } from "../ui/apiNotice";
import { EventBus, EVENTS } from "../events/bus";
import { WardrobeFilter } from "../api/Cloth/Ui/REST/GET/GetClothesCollection/ClothesFilters";

export type Cloth = {
  id: number;
  name: string;
  thumbUrl?: string;
};

export type WardrobeGridHandle = {
  reload: () => Promise<void>;
};

type Props = {
  userId?: string;
  filters?: WardrobeFilter;
};
const GAP = 16;
const COLUMNS = 2;

const WardrobeGrid = forwardRef<WardrobeGridHandle, Props>(
  function WardrobeGrid({ userId, filters }: Props, ref) {
    const [items, setItems] = useState<Cloth[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ===== zaznaczanie
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const selectionMode = selectedIds.length > 0;

    const { width } = useWindowDimensions();
    const itemWidth = useMemo(() => {
      const horizontalPadding = 16 * 2;
      const totalGaps = GAP * (COLUMNS - 1);
      return (width - horizontalPadding - totalGaps) / COLUMNS;
    }, [width]);

    const fetchData = useCallback(async () => {
      const res = await getClothesCollection({
        limit: 100,
        offset: 0,
        sort: "created_at:desc",
        // 🔽 mapowanie filtrów na query:
        description: filters?.description,
        brand: filters?.brand,
        color: filters?.color,
        season: filters?.season,
        location: filters?.location,
        categoryName: filters?.categoryName,
        tagNames:
          filters?.tagNames && filters.tagNames.length
            ? filters.tagNames
            : undefined,
      });

      if (res.ok && res.data?.items) {
        setItems(res.data.items);
      } else if (!res.ok) {
        console.warn("Failed to get clothes:", res.message);
      }
    }, [userId, filters]);

    const reload = useCallback(async () => {
      setRefreshing(true);
      try {
        await fetchData();
      } finally {
        setRefreshing(false);
      }
    }, [fetchData]);

    useImperativeHandle(ref, () => ({ reload }), [reload]);

    useEffect(() => {
      (async () => {
        try {
          await fetchData();
        } finally {
          setLoading(false);
        }
      })();
    }, [fetchData]);

    // EventBus → po dodaniu zdjęcia odśwież
    const firstMountRef = useRef(true);
    useEffect(() => {
      const off = EventBus.on(EVENTS.WARDROBE_PHOTO_ADDED, () => {
        if (firstMountRef.current) return;
        reload();
      });
      firstMountRef.current = false;
      return () => off();
    }, [reload]);

    const onRefresh = useCallback(async () => {
      await reload();
    }, [reload]);

    // ===== zaznaczanie – logika
    const toggleSelect = useCallback((clothId: number) => {
      setSelectedIds((prev) =>
        prev.includes(clothId)
          ? prev.filter((id) => id !== clothId)
          : [...prev, clothId]
      );
    }, []);
    const clearSelection = useCallback(() => setSelectedIds([]), []);
    const handleDeletedSingle = useCallback((clothId: number) => {
      setItems((prev) => prev.filter((i) => i.id !== clothId));
      setSelectedIds((prev) => prev.filter((id) => id !== clothId));
    }, []);

    const handleBatchDelete = useCallback(async () => {
      if (selectedIds.length === 0) return;

      const res = await batchDeleteCloths({
        clothIds: selectedIds,
        userId,
      });

      showNoticeForApi(res, {
        titleSuccess: "Success",
        fallbackSuccessMsg:
          res.ok && res.data?.notFoundIds?.length
            ? "Some clothes were not found and were not deleted."
            : "Selected clothes deleted.",
        titleError: "Failed to delete clothes.",
      });

      if (res.ok) {
        const toRemove = new Set(res.data?.deletedIds ?? []);
        setItems((prev) => prev.filter((i) => !toRemove.has(i.id)));
        clearSelection();
      }
    }, [selectedIds, userId, clearSelection]);

    const renderItem: ListRenderItem<Cloth> = ({ item }) => {
      const isSelected = selectedIds.includes(item.id);
      return (
        <View style={{ width: itemWidth, marginBottom: GAP }}>
          <ClothCard
            cloth={item}
            userId={userId}
            onDeleted={handleDeletedSingle}
            onEdit={(id) => console.log("Edytuj", id)}
            selectionMode={selectionMode}
            selected={isSelected}
            onToggleSelect={toggleSelect}
          />
        </View>
      );
    };

    if (loading) {
      return (
        <LoadingBox>
          <ActivityIndicator size="large" />
        </LoadingBox>
      );
    }

    if (!items.length) {
      return (
        <EmptyBox accessibilityLabel="Brak ubrań">
          <EmptyTitle>Tu będzie Twoja garderoba</EmptyTitle>
          <EmptyText>Dodaj pierwsze ubranie przyciskiem „+”.</EmptyText>
        </EmptyBox>
      );
    }

    return (
      <GridWrapper>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={COLUMNS}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: selectionMode ? 64 : 8 }}
          extraData={selectedIds} // ⬅ ważne: żeby FlatList przerysował elementy zaznaczenia
        />

        {selectionMode && (
          <ActionBar>
            <ActionBtn
              onPress={handleBatchDelete}
              accessibilityLabel="Usuń zaznaczone"
            >
              <ActionText>Usuń zaznaczone ({selectedIds.length})</ActionText>
            </ActionBtn>
            <ActionBtnSecondary
              onPress={clearSelection}
              accessibilityLabel="Anuluj zaznaczanie"
            >
              <ActionTextSecondary>Anuluj</ActionTextSecondary>
            </ActionBtnSecondary>
          </ActionBar>
        )}
      </GridWrapper>
    );
  }
);

export default WardrobeGrid;

// ===== Styled =====
const GridWrapper = styled.View`
  flex: 1;
`;

const LoadingBox = styled.View`
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const EmptyBox = styled.View`
  padding: 24px;
  align-items: center;
  justify-content: center;
`;

const EmptyTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #1b1b1b;
`;

const EmptyText = styled.Text`
  margin-top: 8px;
  color: #666;
`;

const ActionBar = styled.View`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  background: #ffffff;
  border-radius: 12px;
  padding: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  elevation: 4;
  border: 1px solid #eee;
`;

const ActionBtn = styled.TouchableOpacity`
  background: #d32f2f;
  padding: 10px 14px;
  border-radius: 10px;
`;

const ActionText = styled.Text`
  color: #fff;
  font-weight: 700;
`;

const ActionBtnSecondary = styled.TouchableOpacity`
  padding: 10px 14px;
  border-radius: 10px;
  background: #f2f2f2;
`;

const ActionTextSecondary = styled.Text`
  color: #333;
  font-weight: 600;
`;
