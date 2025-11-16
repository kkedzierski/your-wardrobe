// src/components/AnimatedButton.tsx
import React from "react";
import styled from "styled-components/native";
import { Pressable } from "react-native";

type Props = React.ComponentProps<typeof Pressable> & { label: string };

export default function AnimatedButton({ label, ...rest }: Props) {
  return (
    <Pressable {...rest}>
      <BtnContainer>
        <BtnText>{label}</BtnText>
      </BtnContainer>
    </Pressable>
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
