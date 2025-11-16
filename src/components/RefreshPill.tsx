// src/components/RefreshPill.tsx
import React from "react";
import styled from "styled-components/native";

type Props = {
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
};

export default function RefreshPill({
  label = "Odśwież",
  onPress,
  disabled,
  testID,
  accessibilityLabel,
}: Props) {
  return (
    <Wrap testID={testID} accessibilityLabel={accessibilityLabel}>
      <Btn
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        disabled={disabled}
      >
        <BtnText>{label}</BtnText>
      </Btn>
    </Wrap>
  );
}

const Wrap = styled.View`
  position: absolute;
  bottom: 88px; /* nad FABem */
  right: 16px;
`;

const Btn = styled.TouchableOpacity<{ disabled?: boolean }>`
  background: #111;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  padding: 10px 14px;
  border-radius: 999px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 8px;
  elevation: 5;
`;

const BtnText = styled.Text`
  color: #fff;
  font-weight: 700;
`;
