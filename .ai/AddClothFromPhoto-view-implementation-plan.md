# Plan implementacji widoku AddClothFromPhoto

## 1. Przegląd

Widok AddClothFromPhoto pozwala użytkownikowi dodać nowe ubranie do katalogu aplikacji poprzez wykonanie zdjęcia (lub zdjęć), ręczne lub automatyczne (AI) uzupełnienie metadanych (nazwa, kategoria, tagi, atrybuty) i zapisanie elementu do lokalnej bazy. Celem widoku jest zapewnienie szybkiego, wygodnego i intuicyjnego procesu dodania nowej części garderoby, zgodnego z podejściem "photo-first" i wymaganiami bezpieczeństwa/prywatności.

## 2. Routing widoku

Ścieżka: `/home` (jako ekran startowy/katalogowy, według planu UI)

## 3. Struktura komponentów

```
AddClothFromPhotoScreen
├── ImageCaptureSelector
│   └── ImagesPreviewList
├── ClothMetadataForm
│   ├── TextInput (Nazwa)
│   ├── TextInput (Opis)
│   ├── CategoryPicker
│   ├── TagsSelector
│   ├── AttributePickers (Kolor, Sezon, Marka, Lokalizacja)
│   └── AISuggestionsBanner (opcjonalnie)
├── ValidationErrors
└── SubmitButton
```

## 4. Szczegóły komponentów

### AddClothFromPhotoScreen

- **Opis:** Ekran-kontener obsługujący całą logikę dodawania ubrania.
- **Elementy:** ImageCaptureSelector, ClothMetadataForm, SubmitButton, ValidationErrors.
- **Interakcje:** Inicjacja zdjęć, zarządzanie stanem metadanych, obsługa walidacji i notyfikacji.
- **Walidacja:** Sprawdza czy jest co najmniej jedno zdjęcie oraz kluczowe pola przed wysyłką.
- **Typy:** AddClothFromPhotoViewModel, ClothFromPhotoDTO, ErrorViewModel.
- **Propsy:** Brak (lub ewentualnie context/providers).

### ImageCaptureSelector

- **Opis:** Komponent do wykonywania lub wyboru zdjęć ubrania.
- **Elementy:** Kamera/galeria, ImagesPreviewList, przycisk dodaj zdjęcie, przycisk usuń.
- **Interakcje:** Dodanie, podgląd, usunięcie zdjęcia, wybór głównego.
- **Walidacja:** Liczba zdjęć >0, rozmiar ≤ 3 MB, typ pliku (obraz).
- **Typy:** File/Blob[]
- **Propsy:** images: File[], onAdd, onRemove, onSelectMain

### ImagesPreviewList

- **Opis:** Przewijany podgląd wybranych zdjęć.
- **Elementy:** Miniatury, przycisk usuń, oznaczenie zdjęcia głównego.
- **Interakcje:** Zmiana kolejności, kasowanie.
- **Walidacja:** Opcjonalnie – liczba zdjęć ograniczona biznesowo.
- **Typy:** File/Blob[]
- **Propsy:** images, onRemove, mainImageIndex

### ClothMetadataForm

- **Opis:** Formularz metadanych ubrania.
- **Elementy:** Pola tekstowe, selecty, tag selector, AISuggestionsBanner.
- **Interakcje:** Wprowadzanie/walidacja danych, zaakceptowanie/wpisanie propozycji AI, wybór z list/kolekcji/tagów.
- **Walidacja:** Typ i długość tekstu, poprawność ID, format.
- **Typy:** name, description, categoryId, tags[], color, brand, season, location, aiSuggestions.
- **Propsy:** values, onChange, aiSuggestions, onAcceptSuggestion

### CategoryPicker, TagsSelector, AttributePickers

- **Opis:** Podkomponenty formularza do zarządzania polami wyboru i tagowania.
- **Elementy:** React Native Picker/Dropdown, input chips.
- **Interakcje:** Wybór/edycja/akceptacja wartości.
- **Walidacja:** Poprawność wyboru i zgodność ze słownikami aplikacji.
- **Typy:** referencyjne (np. Category, Tag)
- **Propsy:** zależne od pola

### AISuggestionsBanner

- **Opis:** Wyświetla podpowiedzi AI dla wybranych pól.
- **Elementy:** Propozycje, przyciski akceptacji/poprawy.
- **Interakcje:** Akceptowanie propozycji jednym tapnięciem.
- **Walidacja:** Brak (prezentacyjne)
- **Typy:** aiSuggestions
- **Propsy:** suggestions, onAccept

### ValidationErrors

- **Opis:** Prezentuje błędy walidacji/ostrzeżenia z formularza.
- **Elementy:** Lista komunikatów, ostrzeżenia inline.
- **Walidacja:** Agreguje błędy do wyświetlenia.
- **Typy:** ErrorViewModel
- **Propsy:** errors

### SubmitButton

- **Opis:** Przycisk główny zapisu/zatwierdzenia formularza.
- **Elementy:** Button, loader.
- **Interakcje:** OnPress (submit), disable podczas loadingu lub braku spełnienia wymagań.
- **Walidacja:** Nieaktywny jeśli nie spełniono walidacji.
- **Typy:** loading, isDisabled
- **Propsy:** onPress, disabled, loading

## 5. Typy

- **AddClothFromPhotoViewModel:**

```
type AddClothFromPhotoViewModel = {
  photos: File[];
  name: string;
  description: string;
  categoryId: number | null;
  tags: number[];
  color: string;
  brand: string;
  season: string;
  location: string;
  aiSuggestions?: AISuggestions;
};
```

- **AISuggestions:**

```
type AISuggestions = {
  name?: string;
  category?: string;
  season?: string;
  color?: string;
  brand?: string;
  // inne pola zgodne z API
};
```

- **ErrorViewModel:**

```
type ErrorViewModel = {
  field: string;
  message: string;
};
```

- **ClothFromPhotoDTO:** — Zgodny z odpowiedzią backendu, np.:

```
type ClothFromPhotoDTO = {
  id: number;
  name: string;
  photos: { id: number; main: boolean; file_path: string; }[];
  ai_suggestions?: AISuggestions;
  // inne metadane zgodne z API/DTO
};
```

## 6. Zarządzanie stanem

- Stan główny: zarządzany lokalnie w AddClothFromPhotoScreen (useState/useReducer), opcjonalnie context jeśli reużywane w większej strukturze.
- Proponowane custom hooki:
  - **useClothFormState** — pełen zarządca stanu i walidacji pól.
  - **useImagePicker** — obsługa wybierania i kompresowania zdjęć.
  - **useAISuggestions** — żądanie i przetwarzanie odpowiedzi AI oraz zarządzanie ich akceptacją.
- Stan zwraca: bieżące wartości pól, błędy walidacji, loading, aiSuggestions, info o sukcesie/błędzie.

## 7. Integracja API

- **Wywołanie:** POST `/api/clothes` (wg implementacji, możliwie `/api/clothes/from-photo`)
- **Żądanie:** multipart/form-data:
  - `photo[]`: pliki zdjęć (min. jeden wymagany, max wg limitów)
  - Pola opcjonalne: name, description, category_id, color, brand, season, location, tags[], ai_suggestions (flaga)
- **Odpowiedź:** `ClothFromPhotoDTO` (id, name, photos[], ai_suggestions, ...)
- **Obsługiwane akcje frontendowe:**
  - Przesłanie formularza, oczekiwanie na odpowiedź, prezentacja wyniku/sukcesu/błędu.
  - Pobranie i prezentacja sugestii AI, opcjonalna akceptacja przez użytkownika.

## 8. Interakcje użytkownika

- Dodanie zdjęcia za pomocą aparatu lub z galerii, usunięcie, oznaczenie głównego.
- Uzupełnienie metadanych: wpisywanie tekstu, wybór tagów/kategorii/atrybutów.
- (Opcjonalnie) Akceptacja/propozycja AI dla kategorii/nazwy/sezonu.
- Submit (przycisk zapisz): walidowana wysyłka formularza, loading, feedback.
- Obsługa błędów inline i jako toast/notyfikacja.

## 9. Warunki i walidacja

- Musi być min. jedno zdjęcie (blokada submitu lub komunikat).
- Każda fotografia ≤ 3 MB (ostrzeganie użytkownika/upload z kompresją).
- Weryfikacja typów pól (string, number, listy ID, – sprawdzanie kompletności wymaganych na danym etapie).
- Walidacja wybranych pól (np. długość name/description; poprawny wybór categoryId/tagów).
- Błędny upload/format: blokada z jasnym powiadomieniem.
  - Walidacja po stronie komponentów children i agregowanie w głównym kontenerze.

## 10. Obsługa błędów

- Komunikaty walidacyjne inline (pod polami) i zbiorcze (lista na górze).
- Toasty/globalne notyfikacje dla sukcesów/błędów API.
- Obsługa braku zdjęć/dużych plików (pre upload warning).
- Obsługa błędów sieci/API (timeout, 422, 500 – komunikaty przyjazne użytkownikowi w języku aplikacji).
- Wsparcie dla scenariuszy edge-case: np. brak miejsca na dysku, odrzucony upload.

## 11. Kroki implementacji

1. Stworzenie struktury katalogu widoku i głównego kontenera AddClothFromPhotoScreen.
2. Implementacja i integracja ImageCaptureSelector wraz z obsługą robienia i usuwania zdjęć.
3. Implementacja ImagesPreviewList oraz obsługi wyboru zdjęcia głównego.
4. Utworzenie formularza metadanych (ClothMetadataForm) oraz podkomponentów (CategoryPicker, TagsSelector, AttributePickers).
5. Dodanie AISuggestionsBanner oraz logiki prezentacji i akceptacji sugestii AI.
6. Wyprowadzenie customowych hooków do zarządzania stanem (useClothFormState, useImagePicker, useAISuggestions).
7. Implementacja przycisku SubmitButton wraz z loadingiem i walidacjami.
8. Integracja walidacji i komunikatów błędów (ValidationErrors, error toast).
9. Podłączenie całości do API / obsługa request-response + mapowanie typów.
10. Testowanie validacji wejścia, edge-case’ów oraz błędnych scenariuszy backend (symulacje).
11. Integracja i18n dla tekstów statycznych i dynamicznych.
12. QA oraz testy użytkownika (dodawanie, feedback, poprawność wyświetlania).
