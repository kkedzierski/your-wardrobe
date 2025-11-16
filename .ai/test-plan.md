## 1. Podsumowanie projektu i głównych funkcjonalności

- Aplikacja Expo/React Native (`App.tsx`) do katalogowania ubrań offline-first z lokalną bazą SQLite (`src/db`), zapisem zdjęć w pamięci urządzenia i obsługą gościa (`ensureGuestUser`).
- Kluczowe moduły: dodawanie ubrań aparatem (`postCreateFromPhoto` → `createClothFromPhoto` → `ClothRepository`), widok garderoby z filtrami i masowym usuwaniem (`WardrobeScreen`, `WardrobeGrid`), menedżery kategorii i tagów (ekrany w `src/screens/Category|Tag`).
- Bezpieczeństwo/dostęp: kontekst uwierzytelnienia z SecureStore + AppLock z biometrią (`AppLockGate`), opcjonalne podłączenia OAuth.
- UX: wielojęzyczność (pl/en) przez `react-i18next`, nawigacja stack/tab (`RootNavigator`, `MainTabs`), komponenty własne i Paper.
- Infrastruktura: migracje SQL, event bus do odświeżania UI, docelowo CI (GitHub Actions) i EAS Build.

## 2. Strategia testowania dostosowana do stosu technologicznego

- **Warstwa domenowa/API (`src/api`)**: testy jednostkowe usług i repozytoriów z realnym `expo-sqlite` w pamięci (lub `sqlite3` w node) uruchamiane przez Jest + `ts-jest`. Mocki `expo-file-system`, `expo-crypto` do deterministycznych hashy.
- **Warstwa UI (`src/screens`, `src/components`)**: testy komponentów i hooków w @testing-library/react-native z makietą NavigationContainer i i18n. Snapshoty ograniczone do elementów stylu.
- **Integracje natywne (camera, biometria, SecureStore)**: hybrydowe testy wykonywane w Expo Go/Dev Client przy użyciu Detox lub Maestro; natywne moduły mockowane w unitach, realne ścieżki walidowane w E2E.
- **Offline-first & migracje**: pipeline testowy od `initApp` (reset/migracje/sanity) po `ensureGuestUser`, z walidacją idempotentności oraz rollbacków (użycie `MigrationManager` na czystej bazie per test).
- **CI/CD**: integrować zestaw testów w GitHub Actions (lint + jest), a E2E uruchamiać w EAS Build preview lub przy użyciu Expo Application Services Test.

## 3. Poziomy testowania z rekomendacjami

- **Testy jednostkowe**
  - `src/app/initApp.ts`: symulacja różnych `ENV`, sprawdzenie migracji i sanity check.
  - Serwisy `CreateClothFromPhotoHandler`, `HashService`, `SaveImageService`, `AuthContext` reducer. Mock `EventBus`, `expo-image-picker`, `expo-file-system`.
  - Repozytoria SQLite (`ClothRepository`, `CategoryRepository`, `TagRepository`): testy transakcji, filtrów, limitów i walidacji userId.
- **Testy integracyjne**
  - `WardrobeGrid` + `getClothesCollection`: mock warstwy REST tak, aby sprawdzić filtrowanie i batch delete (kontrola `showNoticeForApi`).
  - Przepływ kategorii/tagów: od ekranów po API (`getCategoriesCollection`, `CreateCategoryHandler`).
  - Auth/AppLock: symulacja scenariuszy SecureStore + LocalAuthentication (sukces, odrzucenie, brak konfiguracji).
- **Testy systemowe / E2E**
  - Scenariusze na fizycznych urządzeniach/emulatorach: start aplikacji, przejście przez Home → aparat → edycja, włączenie AppLock, przegląd filtrów Wardrobe, eksport/backup gdy zostanie dodany.
  - Narzędzie: Detox z `expo-dev-client` lub Maestro (skrypty YAML). Uwzględnić mock serwisy AI (off toggle).
- **Testy niefunkcjonalne**
  - Wydajność listy garderoby (płynność przy 200+ rekordach) – profilowanie `FlatList`.
  - Zużycie pamięci dyskowej zdjęć, spójność plików vs DB (narzędzie sanity).
  - Bezpieczeństwo: sprawdzenie, że dane SecureStore nie są czyszczone przy logout, a AppLock blokuje UI przy porażce.

## 4. Priorytetowe obszary testowania

- **Pipeline zdjęcia**: uprawnienia kamery, zapis pliku, hash, insert do SQLite, emisja eventu (`postCreateFromPhoto`, `createClothFromPhoto`).
- **Inicjalizacja aplikacji**: `initApp` (reset dev, migracje, sanity) + `ensureGuestUser` (odczyt/zapis SecureStore).
- **Widok Garderoby**: filtry, tagi, zaznaczanie i batch delete (`WardrobeScreen`, `WardrobeGrid`, `batchDeleteCloths`).
- **CRUD kategorii/tagów**: walidacje unikalności, aktualizacje list, komunikaty błędów.
- **AppLock i auth**: poprawne zachowanie przy włączonej biometrii, brak deadlocków przy odrzuceniu.

## 5. Rekomendowane narzędzia i frameworki testowe

- **Jednostkowe/integracyjne**: Jest 29 + `@testing-library/react-native` (już w `package.json`), `jest-expo` preset, `ts-jest` do TS, `msw/native` do stubowania warstwy REST jeśli potrzeba.
- **Mocki natywne**: `expo-jest-mocks`, manualne mocki dla `expo-camera`, `expo-image-picker`, `expo-secure-store`, `expo-local-authentication`.
- **Baza danych**: `expo-sqlite/async` w trybie testowym, ewentualnie `better-sqlite3` przy testach Node dla szybszego wykonania.
- **E2E**: Detox + `expo-dev-client` (Android/iOS) lub Maestro Cloud dla scenariuszy CTA; alternatywnie `@expo/e2e`.
- **Analiza pokrycia**: `jest --coverage` + raporty LCOV w GitHub Actions; integracja z Codecov opcjonalnie.

## 6. Przykładowe scenariusze testowe

- **Dodanie ubrania aparatem**
  - Start z pustą garderobą → tap na `AddClothFromCameraButton` → przyznanie uprawnień → wykonanie zdjęcia.
  - Oczekiwane: komunikat sukcesu, nowy rekord w SQLite (`cloth`, `cloth_photos`), event `WARDROBE_PHOTO_ADDED` odświeża `WardrobeGrid`, nawigacja do `EditCloth`.
- **Zarządzanie filtrami garderoby**
  - Wprowadź kilka ubrań z różnymi `brand`, `tagNames`.
  - W `WardrobeScreen` otwórz filtry, ustaw brand/tag, zastosuj i obserwuj, że `getClothesCollection` otrzymuje odpowiednie parametry, a lista zawiera tylko trafienia; usuń filtry i potwierdź pełną listę.
- **Batch delete z potwierdzeniem**
  - Zaznacz wiele elementów, wykonaj `batchDeleteCloths`, przerwij po drodze (np. brak jednego ID).
  - Oczekiwane: API zwraca `deletedIds` oraz `notFoundIds`, UI pokazuje odpowiedni komunikat, lista aktualizuje się bez duplikatów.
- **Menedżer kategorii**
  - Dodaj kategorię (UI → `CreateCategoryHandler`), edytuj nazwę, usuń.
  - Waliduj unikalność per user, komunikaty błędów, odświeżenie listy i powrót do poprzedniego ekranu.
- **Init + AppLock**
  - Ustaw `ENV=dev`, uruchom aplikację: baza resetuje się, migracje przechodzą, `ensureGuestUser` tworzy rekord.
  - Włącz `BIOMETRICS_KEY`, zablokuj aplikację; przy starcie wymagane uwierzytelnienie, odrzucenie blokuje UI, akceptacja wpuszcza do `RootNavigator`.

## 7. Plan wykonania testów

- **Sprint 1 (setup + fast unit tests)**
  - Skonfigurować `jest-expo`, mocki Expo, pipeline GitHub Actions.
  - Napisać testy `initApp`, `ensureGuestUser`, repozytoriów SQLite, serwisów zapisu obrazu/hash.
- **Sprint 2 (UI + integracje)**
  - Pokryć `HomeScreen`, `WardrobeGrid`, Category/Tag ekrany w @testing-library.
  - Dodać testy integracyjne REST (mock API) dla filtrów i batch delete.
- **Sprint 3 (E2E + niefunkcjonalne)**
  - Przygotować build dev-client, napisać scenariusze Detox/Maestro (dodanie ubrania, AppLock, filtry).
  - Testy dostępności/lokalizacji, sanity wydajności listy.
- **Ciągła regresja**
  - Uruchamiać unit/integration w każdym PR; E2E na nocnych buildach lub przed releasem.
  - Każda migracja SQL wymaga dedykowanego testu smoke + sanity z `sanityCheckSqlite`.
- **Wejścia/wyjścia**
  - Artefakty: raport pokrycia, logi E2E, checklisty manualne (kamera, biometria).
  - Kryterium wyjścia MVP: 100% krytycznych scenariuszy (dodanie, filtr, delete, AppLock) przechodzi w CI + na fizycznym urządzeniu, brak blockerów P0.
