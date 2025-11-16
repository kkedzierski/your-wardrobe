// src/components/__tests__/AddClothFromCameraButton.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AddClothFromCameraButton from "../AddClothFromCameraButton";

// importy używane do mocków:
import { useNavigation } from "@react-navigation/native";
import { postCreateFromPhoto } from "../../api/Cloth/Ui/REST/POST/CreateFromPhoto/CreateFromPhotoController";
import { showNoticeForApi } from "../../ui/apiNotice";
import { TranslationServiceInstance } from "../../i18n/TranslationService";

// ----------------- MOCKI (bez odwołań do zmiennych z zewnątrz) -----------------

// 1. mock nawigacji – bez navigateMock z zewnątrz
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

// 2. mock API
jest.mock(
  "../../api/Cloth/Ui/REST/POST/CreateFromPhoto/CreateFromPhotoController",
  () => ({
    postCreateFromPhoto: jest.fn(),
  })
);

// 3. mock komunikatu API
jest.mock("../../ui/apiNotice", () => ({
  showNoticeForApi: jest.fn(),
}));

// 4. mock tłumaczeń – zwracamy po prostu key
jest.mock("../../i18n/TranslationService", () => ({
  TranslationServiceInstance: {
    t: (key: string) => key,
  },
}));

// ----------------- UŁATWIACZE: zrzutowane mocki -----------------

const mockedUseNavigation = useNavigation as jest.Mock;
const postCreateFromPhotoMock = postCreateFromPhoto as jest.Mock;
const showNoticeForApiMock = showNoticeForApi as jest.Mock;
// tu będziemy wrzucać funkcję navigate z beforeEach
let navigateMock: jest.Mock;

describe("AddClothFromCameraButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    navigateMock = jest.fn();

    // każdorazowo ustawiamy, co zwraca useNavigation
    mockedUseNavigation.mockReturnValue({
      navigate: navigateMock,
    });
  });

  it("renderuje stan początkowy (tekst)", () => {
    const { getByText, getByTestId, queryByText } = render(
      <AddClothFromCameraButton
        testID="add-cloth-from-camera"
        accessibilityLabel="Dodaj ubranie z aparatu"
      />
    );

    // testID z CardWrapper
    expect(getByTestId("add-cloth-from-camera")).toBeTruthy();

    // teksty z TranslationService.t (mock zwraca klucze)
    expect(getByText("Add clothing to wardrobe")).toBeTruthy();
    expect(
      getByText("Take a photo and automatically add to the wardrobe")
    ).toBeTruthy();

    // upewniamy się, że NIE jesteśmy w stanie loading
    expect(queryByText("Processing…")).toBeNull();
  });

  it("po kliknięciu wywołuje API, pokazuje loading i nawiguję do EditCloth przy sukcesie", async () => {
    postCreateFromPhotoMock.mockResolvedValue({
      ok: true,
      data: { clothId: "123" },
    });

    const { getByText, queryByText } = render(
      <AddClothFromCameraButton
        testID="add-cloth-from-camera"
        accessibilityLabel="Dodaj ubranie z aparatu"
      />
    );

    const buttonLabel = getByText("Add clothing to wardrobe");
    fireEvent.press(buttonLabel);

    // loading
    await waitFor(() => {
      expect(getByText("Processing…")).toBeTruthy();
    });

    expect(queryByText("📷")).toBeNull();

    expect(postCreateFromPhotoMock).toHaveBeenCalledTimes(1);
    expect(postCreateFromPhotoMock).toHaveBeenCalledWith({ main: true });

    expect(showNoticeForApiMock).toHaveBeenCalledTimes(1);
    expect(showNoticeForApiMock.mock.calls[0][0]).toEqual({
      ok: true,
      data: { clothId: "123" },
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("EditCloth", {
        clothId: 123,
      });
    });
  });

  it("nie nawiguję, jeśli API zwróci błąd", async () => {
    postCreateFromPhotoMock.mockResolvedValue({
      ok: false,
      data: null,
    });

    const { getByText } = render(
      <AddClothFromCameraButton
        testID="add-cloth-from-camera"
        accessibilityLabel="Dodaj ubranie z aparatu"
      />
    );

    fireEvent.press(getByText("Add clothing to wardrobe"));

    await waitFor(() => {
      expect(postCreateFromPhotoMock).toHaveBeenCalledTimes(1);
      expect(showNoticeForApiMock).toHaveBeenCalledTimes(1);
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("ignoruje kolejne kliknięcia, gdy jest w stanie loading", async () => {
    // zrobimy ręcznie kontrolowany Promise
    let resolvePromise: (value: any) => void;
    const apiPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    postCreateFromPhotoMock.mockReturnValue(apiPromise);

    const { getByText } = render(
      <AddClothFromCameraButton
        testID="add-cloth-from-camera"
        accessibilityLabel="Dodaj ubranie z aparatu"
      />
    );

    const buttonLabel = getByText("Add clothing to wardrobe");

    fireEvent.press(buttonLabel);
    fireEvent.press(buttonLabel); // drugie kliknięcie powinno być zignorowane

    expect(postCreateFromPhotoMock).toHaveBeenCalledTimes(1);

    // kończymy request
    resolvePromise!({
      ok: true,
      data: { clothId: "1" },
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("EditCloth", {
        clothId: 1,
      });
    });
  });
});
