// src/components/Fab.tsx
import React from "react";
import styled from "styled-components/native";
import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = { label?: string; onPress?: () => void; iconName?: string };

export default function Fab({
  label,
  onPress,
  iconName = "plus",
  testID,
  accessibilityLabel,
}: Props) {
  return (
    <Wrapper
      pointerEvents="box-none"
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <Pressable
        onPress={onPress}
        transition={{ type: "timing", duration: 120 }}
        accessibilityRole="button"
        accessibilityLabel={label ?? "Dodaj"}
      >
        <Btn>
          <MaterialCommunityIcons
            name={iconName as any}
            size={26}
            color="#fff"
          />
        </Btn>
      </Pressable>
    </Wrapper>
  );
}

const Wrapper = styled.View`
  position: absolute;
  right: 16px;
  bottom: 24px;
`;
const Btn = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #4a90e2;
  align-items: center;
  justify-content: center;
  elevation: 6;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 6px;
  shadow-offset: 0px 2px;
`;
