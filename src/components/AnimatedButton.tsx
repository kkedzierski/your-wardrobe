// src/components/AnimatedButton.tsx
import React from "react";
import styled from "styled-components/native";
import { MotiPressable } from "moti/interactions";

type Props = React.ComponentProps<typeof MotiPressable> & { label: string };

export default function AnimatedButton({ label, ...rest }: Props) {
  return (
    <MotiPressable
      {...rest}
      animate={({ pressed }) => {
        "worklet";
        return { scale: pressed ? 0.97 : 1 };
      }}
      transition={{ type: "timing", duration: 120 }}
    >
      <BtnContainer>
        <BtnText>{label}</BtnText>
      </BtnContainer>
    </MotiPressable>
  );
}

const BtnContainer = styled.View`
  background-color: ${({ theme }) => theme.colors?.primary ?? "#4a90e2"};
  padding: 14px 28px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

const BtnText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 16px;
`;
