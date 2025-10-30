# API Endpoint Implementation Plan: Tworzenie ubrania ze zdjęcia (`/api/clothes/from-photo`)

## 1. Przegląd punktu końcowego

REST API służące do tworzenia nowego rekordu ubrania (Cloth) przy podejściu photo-first: użytkownik dostarcza zdjęcie, a dodatkowe metadane są opcjonalne. Opcjonalnie API wywołuje i zwraca sugestie dotyczące metadanych wygenerowane przez AI na podstawie zdjęcia lub tekstu.

## 2. Szczegóły żądania

- **Metoda HTTP:** `POST`
- **Struktura URL:** `/api/clothes/from-photo`
- **Parametry wejściowe:**
  - **Wymagane:**
    - `photo` – plik zdjęcia (multipart/form-data, pole file, typ obrazu/ograniczenie rozmiaru)
  - **Opcjonalne:**
    - `name` (string)
    - `description` (string)
    - `category_id` (integer)
    - `color` (string)
    - `brand` (string)
    - `season` (string)
    - `location` (string)
    - `tags` (array[int] lub serializowane, zależnie od implementacji backendu)
    - `ai_suggestions` (boolean, domyślnie true)
- **Request Body:**  
  multipart/form-data, zawierające główne zdjęcie oraz dowolne pole metadanych ubrania.

## 3. Wykorzystywane typy

- `ClothFromPhotoDTO` — typ odpowiedzi zgodny z formatem zwrotnym endpointu (zawiera pólka `name`, `photos[]`, `ai_suggestions`)
- `PhotoDTO` — typ osadzonego zdjęcia (zawiera id, is_main, file_path itd.)
- `AiClothSuggestionDTO` — typ zagnieżdżony w odpowiedzi z sugestiami AI (opcjonalny)
- `ClothCreateCommand` (adaptacja na multipart/form-data, analogiczny model w warstwie walidacji)
- Bazowe typy: `Cloth`, `ClothPhoto`, `Category`, `Tag`

## 4. Szczegóły odpowiedzi

- **Status:** 201 Created
- **Body (application/json):**
  - `id` (number) — id utworzonego ubrania
  - `name` (string)
  - `photos` (array[PhotoDTO])
  - `ai_suggestions` (AiClothSuggestionDTO, opcjonalnie)
- **Przykład odpowiedzi:**

```json
{
  "id": 101,
  "name": "",
  "photos": [{ "id": 999, "main": true, "file_path": "..." }],
  "ai_suggestions": {
    "name": "T-shirt Adidas",
    "category": "koszulka",
    "season": "summer"
  }
}
```

- **Kody statusu:**

  - `201 Created` — sukces
  - `400 Bad Request` — nieprawidłowe dane wejściowe, brak pliku, niewspierany format, brak wymaganego pola
  - `401 Unauthorized` — nieautoryzowany użytkownik/brak aktualnej sesji
  - `404 Not Found` — brak zasobu (np. podano nieistniejący `category_id` lub `tag_id`)

  - `500 Internal Server Error` — nieoczekiwany błąd (np. błąd podczas zapisu do DB albo przetwarzania AI)

## 5. Przepływ danych

1. Odbiór żądania multipart/form-data.
2. Walidacja obecności i typu pliku zdjęcia oraz pozostałych pól (typ, format, długość).
3. Zapis pliku zdjęcia (np. poprzez expo-file-system, ścieżka do lokalnego storage).
4. Utworzenie rekordu Photo i Cloth w bazie danych (relacja 1:N – pierwsze zdjęcie jako main).
5. Powiązanie rekordu z kategorią, tagami (weryfikacja istnienia ID).
6. Jeśli opcja `ai_suggestions` jest aktywna, przesłanie pliku do warstwy AI (lokalnie lub przez AI provider), zwrócenie/metadanych.
7. Złożenie odpowiedzi poprzez zmapowanie DB modeli na `ClothFromPhotoDTO`.
8. Zwrócenie odpowiedzi z kodem 201.

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie:**
  - Uwierzytelnienie użytkownika np. poprzez `expo-local-authentication` lub globlany token session (jeśli obecny w MVP).
  - Sprawdzenie user_id, czy kategoria/tag/foto są własnością użytkownika.
- **Walidacja pliku:**
  - Ograniczenie rozszerzeń i typu MIME (wyłącznie obrazy: JPEG, PNG).
  - Limit rozmiaru pliku (np. 5MB MAX).
  - Weryfikacja przed nadpisaniem ścieżek na dysku.
- **Dane powiązane:**
  - Walidacja ID kategorii oraz tagów (należą do usera).
- **AI privacy:**
  - Jeśli wyłączone ai_suggestions – nie wysyłać zdjęcia do dostawcy LLM.
- **Ochrona przed DoS:**
  - Ograniczenie liczby żądań/uploadów i ochrony anty-floodowej.

## 7. Obsługa błędów

- Walidacja: Brak wymaganych pól (photo), złe typy/metadane, za duży plik – 400 Bad Request
- Użytkownik nieautoryzowany — 401 Unauthorized
- Nieistniejąca kategoria/tag — 404 Not Found
- Błędy uploadu pliku lub zapisu bazy — 500 Internal Server Error
- Błąd integracji z AI — 500 Internal Server Error, z logowaniem błędu przy zachowaniu głównej funkcjonalności endpointu, jeśli AI nie jest kluczowy

## 8. Rozważania dotyczące wydajności

- Asynchroniczny zapis pliku oraz operacje AI (można ewentualnie dać loading/progress w UI).
- Lokalna kompresja zdjęcia przed uploadem (expo-image-manipulator).
- Ograniczenie wymiarów zdjęcia po stronie klienta.
- Batch insert tagów/relacji zamiast pojedynczych zapytań.
- Cache'owanie listy kategorii/tagów na potrzeby walidacji po stronie frontend/back.

## 9. Kroki implementacji

1. Opracuj walidator i parser żądania multipart/form-data dla zdjęcia oraz opcjonalnych pól.
2. Dodaj/rozszerz serwis obsługi zdjęć (PhotoService) – zapisz plik lokalnie
3. Dodaj/rozszerz ClothService – utwórz ubranie wraz z powiązaniem ze zdjęciem głównym oraz metadanymi.
4. Zaimplementuj walidację powiązań (kategoria, tagi) – sprawdź istnienie i własność usera.
5. (Opcjonalnie) Dodaj/rozszerz AiSuggestionService – integracja z AI providerem pod opcję ai_suggestions.
6. Zaimplementuj obsługę zwrotną i budowanie odpowiedzi DTO.
7. Zapewnij i przetestuj obsługę kodów HTTP oraz potencjalnych przypadków błędów.
8. Zabezpiecz punkt końcowy pod względem uwierzytelnienia, walidacji oraz obsługi plików.
