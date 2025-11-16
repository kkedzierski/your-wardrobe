// src/components/__tests__/Fab.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Fab from "../Fab";

// Lokalny mock ikon – jeśli masz globalny w jest.setup.ts, możesz to usunąć
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const MockIcon = ({ name, ...props }: { name: string }) => (
    <Text {...props}>{name}</Text>
  );
  return {
    MaterialCommunityIcons: MockIcon,
  };
});

describe("Fab", () => {
  it("renderuje się z testID i domyślnym label 'Dodaj'", () => {
    const { getByTestId, getByLabelText } = render(
      // Props w komponencie mają też testID/accessibilityLabel,
      // ale typ Props ich nie zawiera, więc dla TS ratujemy się 'as any'
      (<Fab testID="fab-btn" />) as any
    );

    expect(getByTestId("fab-btn")).toBeTruthy();

    // Pressable ma accessibilityLabel ustawiony na label ?? "Dodaj"
    expect(getByLabelText("Dodaj")).toBeTruthy();
  });

  it("używa przekazanego label jako accessibilityLabel przycisku", () => {
    const { getByLabelText } = render((<Fab label="Dodaj ubranie" />) as any);

    expect(getByLabelText("Dodaj ubranie")).toBeTruthy();
  });

  it("wywołuje onPress po kliknięciu", () => {
    const onPressMock = jest.fn();

    const { getByLabelText } = render(
      (<Fab label="Dodaj element" onPress={onPressMock} />) as any
    );

    const button = getByLabelText("Dodaj element");
    fireEvent.press(button);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  // (opcjonalnie) jeśli masz mock ikon, możesz sprawdzić domyślną ikonę "plus"
  it("renderuje domyślną ikonę 'plus'", () => {
    const { getByText } = render((<Fab />) as any);

    // przy naszym mocku MaterialCommunityIcons jako <Text>{name}</Text>
    expect(getByText("plus")).toBeTruthy();
  });
});
