// src/components/WardrobeFiltersModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import styled from "styled-components/native";
import { WardrobeFilter } from "../api/Cloth/Ui/REST/GET/GetClothesCollection/ClothesFilters";
import { TranslationServiceInstance } from "../i18n/TranslationService";

type Props = {
  visible: boolean;
  initialFilters?: WardrobeFilter;
  onApply: (filters: WardrobeFilter) => void;
  onClear: () => void;
  onClose: () => void;
};

const WardrobeFiltersModal: React.FC<Props> = ({
  visible,
  initialFilters,
  onApply,
  onClear,
  onClose,
}) => {
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState("");
  const [location, setLocation] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // kiedy otwieramy modal – wczytaj aktualne filtry
  useEffect(() => {
    if (!visible) return;

    setDescription(initialFilters?.description ?? "");
    setBrand(initialFilters?.brand ?? "");
    setColor(initialFilters?.color ?? "");
    setSeason(initialFilters?.season ?? "");
    setLocation(initialFilters?.location ?? "");
    setCategoryName(initialFilters?.categoryName ?? "");
  }, [visible, initialFilters]);

  const handleApply = () => {
    const next: WardrobeFilter = {
      description: description.trim() || undefined,
      brand: brand.trim() || undefined,
      color: color.trim() || undefined,
      season: season.trim() || undefined,
      location: location.trim() || undefined,
      categoryName: categoryName.trim() || undefined,
      // tagNames zostawiamy w gestii TagPickerModal
    };

    onApply(next);
    onClose();
  };

  const handleClear = () => {
    setDescription("");
    setBrand("");
    setColor("");
    setSeason("");
    setLocation("");
    setCategoryName("");

    onClear();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Backdrop>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <Sheet>
            <Header>
              <Title>{TranslationServiceInstance.t("Filters")}</Title>
              <CloseButton onPress={onClose}>
                <CloseText>✕</CloseText>
              </CloseButton>
            </Header>

            <Content>
              <Field>
                <Label>{TranslationServiceInstance.t("Description")}</Label>
                <Input
                  placeholder={TranslationServiceInstance.t(
                    "e.g. T-shirt, dress…"
                  )}
                  value={description}
                  onChangeText={setDescription}
                />
              </Field>

              <Field>
                <Label>{TranslationServiceInstance.t("Brand")}</Label>
                <Input
                  placeholder={TranslationServiceInstance.t("e.g. Nike")}
                  value={brand}
                  onChangeText={setBrand}
                />
              </Field>

              <Field>
                <Label>{TranslationServiceInstance.t("Color")}</Label>
                <Input
                  placeholder={TranslationServiceInstance.t("e.g. Black")}
                  value={color}
                  onChangeText={setColor}
                />
              </Field>

              <Field>
                <Label>{TranslationServiceInstance.t("Season")}</Label>
                <Input
                  placeholder={TranslationServiceInstance.t(
                    "e.g. Summer, Winter…"
                  )}
                  value={season}
                  onChangeText={setSeason}
                />
              </Field>

              <Field>
                <Label>{TranslationServiceInstance.t("Location")}</Label>
                <Input
                  placeholder={TranslationServiceInstance.t("e.g. Wardrobe B")}
                  value={location}
                  onChangeText={setLocation}
                />
              </Field>

              <Field>
                <Label>{TranslationServiceInstance.t("Category")}</Label>
                <Input
                  placeholder={TranslationServiceInstance.t("e.g. T-shirts")}
                  value={categoryName}
                  onChangeText={setCategoryName}
                />
              </Field>

              {/* Tagi zostawiamy osobnemu TagPickerModal */}
            </Content>

            <Footer>
              <SecondaryButton onPress={handleClear}>
                <SecondaryButtonText>
                  {TranslationServiceInstance.t("Clear")}
                </SecondaryButtonText>
              </SecondaryButton>

              <PrimaryButton onPress={handleApply}>
                <PrimaryButtonText>
                  {TranslationServiceInstance.t("Apply")}
                </PrimaryButtonText>
              </PrimaryButton>
            </Footer>
          </Sheet>
        </KeyboardAvoidingView>
      </Backdrop>
    </Modal>
  );
};

export default WardrobeFiltersModal;

// ===== styled =====
const Backdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.35);
  justify-content: flex-end;
`;

const Sheet = styled.View`
  background-color: #ffffff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 16px;
  max-height: 80%;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 4px 8px;
`;

const CloseText = styled.Text`
  font-size: 18px;
  color: #6b7280;
`;

const Content = styled.ScrollView`
  max-height: 360px;
`;

const Field = styled.View`
  margin-bottom: 10px;
`;

const Label = styled.Text`
  font-weight: 600;
  margin-bottom: 4px;
  color: #111827;
`;

const Input = styled(TextInput)`
  border-width: 1px;
  border-color: #e5e7eb;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 15px;
  background-color: #f9fafb;
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  gap: 8px;
`;

const SecondaryButton = styled.TouchableOpacity`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border-width: 1px;
  border-color: #e5e7eb;
  background-color: #f9fafb;
  align-items: center;
`;

const SecondaryButtonText = styled.Text`
  color: #374151;
  font-weight: 600;
`;

const PrimaryButton = styled.TouchableOpacity`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  background-color: #111827;
  align-items: center;
`;

const PrimaryButtonText = styled.Text`
  color: #ffffff;
  font-weight: 700;
`;
