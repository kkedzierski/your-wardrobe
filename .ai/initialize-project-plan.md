# Plan inicjalizacji projektu Expo React Native

Poniżej znajduje się lista komend i rekomendacji, aby utworzyć repozytorium startowe (empty skeleton) bazujące na wymaganiach PRD oraz stacku technologicznym:

## 1. Inicjalizacja projektu

```sh
# Instalacja narzędzi jeśli nie masz:
npm install -g expo-cli eas-cli

# Stwórz nowy projekt Expo (z TypeScript):
expo init your-wardrobe --template expo-template-blank-typescript
cd your-wardrobe
```

## 2. Dodanie zależności tech-stacku

```sh
# Nawigacja:
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context

# Komponenty UI:
npx expo install react-native-paper

# SQLite:
npx expo install expo-sqlite

# Kamera, zdjęcia, pliki:
npx expo install expo-camera expo-image-manipulator expo-file-system

# Hash i deduplikacja:
npx expo install expo-crypto

# Biometria, PIN, storage:
npx expo install expo-local-authentication expo-secure-store

# Mi18n:
npx expo install react-i18next react-native-localize

# E2E/testy UI (setup później):
npm install --save-dev @testing-library/react-native jest
```

## 3. Struktura katalogów/projektu

Zalecane katalogi/pliki (możesz utworzyć puste):

- `src/` (cały kod aplikacji)
  - `navigation/`, `screens/`, `components/`, `hooks/`, `providers/`, `utils/`, `services/`
- `assets/` (ikony, zdjęcia, obrazy aplikacji)
- `docs/` (przenieś PRD, tech-stack itp.)
- `__tests__/` (testy integracyjne/E2E)
- `.env` (zmienne środowiskowe)

## 4. Konfiguracja GIT oraz CI

```sh
git init
echo 'node_modules\n.env\ndist' > .gitignore
git add .
git commit -m 'Initial project skeleton for your-wardrobe'
```

Dodaj lub skonfiguruj:

- `.github/workflows/ci.yml` – workflow pod lint/typecheck/test (wzoruj się na best-practice repo Expo)

## 5. Konfiguracja EAS (buildy/prerelease/OTA)

```sh
eas init
```

Zalecane kolejne kroki:

- Skonfigurować EAS Build, EAS Update
- Dodać monitoring (Sentry) według potrzeb
- Dodaj przykładowy test UI (np. dodanie elementu)
