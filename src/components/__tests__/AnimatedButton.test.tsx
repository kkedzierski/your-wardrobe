// src/components/AnimatedButton.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AnimatedButton from "../AnimatedButton";

describe("AnimatedButton", () => {
  it("wyświetla label przekazany w props", () => {
    const { getByText } = render(<AnimatedButton label="Zaloguj się" />);

    // Sprawdzamy, czy tekst jest w drzewie
    expect(getByText("Zaloguj się")).toBeTruthy();
  });

  it("wywołuje onPress po kliknięciu", () => {
    const onPressMock = jest.fn();

    const { getByText } = render(
      <AnimatedButton label="Kliknij mnie" onPress={onPressMock} />
    );

    const buttonText = getByText("Kliknij mnie");

    // Klikamy w tekst (który jest wewnątrz Pressable)
    fireEvent.press(buttonText);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("pasuje do snapshotu", () => {
    const { toJSON } = render(<AnimatedButton label="Snapshot" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
