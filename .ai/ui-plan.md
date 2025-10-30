# Architektura UI dla Your Wardrobe

## 1. Przegląd struktury UI

Aplikacja składa się z pięciu głównych sekcji dostępnych przez dolne menu (tab bar): Home, Garderoba, Outfit, Profil, Ustawienia/Więcej. Wykorzystuje nawigację stack (szczegóły/edycja), bottom sheets/modale (szybka edycja, działania krytyczne) oraz FAB-y do nawigacji i szybkich akcji. Filtry i smart listy są stale dostępne w głównych widokach. Wszystkie ścieżki projektowane są z myślą o offline-first, zgodności WCAG, bezpieczeństwie oraz prostocie obsługi.

## 2. Lista widoków

### Home

- **Ścieżka:** /home
- **Cel:** Szybki start dodawania ubrania (ze zdjęciem/manualnie); podgląd ostatnich działań, status synchronizacji
- **Kluczowe dane:** Akcje „Zrób zdjęcie”, „Dodaj bez zdjęcia”; skróty do ostatnich aktywności/smart list; status sync
- **Komponenty:** 2 duże CTA, sekcja aktywności, wskaźnik sync, toast/error/info
- **UX/dostępność/bezp:** Duży kontrast, focus na głównych CTA, prosty tab order

### Garderoba (Wardrobe)

- **Ścieżka:** /wardrobe
- **Cel:** Przegląd, filtrowanie, batch działania na ubraniach; szybka edycja kategorii/tagów
- **Kluczowe dane:** Lista/siatka ubrań, sticky filtry (kategoria, tag, smart list), przycisk „Dodaj” (FAB)
- **Komponenty:** Grid/List, FilterBar, SmartListTabs, FAB, BottomSheet (edit), Empty/Loader/Error
- **UX/dostępność/bezp:** Ciągły dostęp do filtrów, aria-label do batch select, tryb dark/light, pull-to-refresh, obsługa screenreadera

### Szczegóły ubrania

- **Ścieżka:** /wardrobe/:id
- **Cel:** Szczegółowy podgląd ubrania, zdjęcia, atrybutów, historii; możliwość edycji/usunięcia
- **Kluczowe dane:** Carousel zdjęć, atrybuty, tagi, kategoria, log zmian, akcje edytuj/usuń
- **Komponenty:** ImageCarousel, Attributes, TagList, CategoryPill, Edit/Delete actions, Modal (confirm)
- **UX/dostępność/bezp:** Pokaz/edycja ze stack, focus modal, duża ikona kasowania, confirm frazą

### Dodanie/Edycja ubrania

- **Ścieżka:** /add-cloth, /edit-cloth/:id
- **Cel:** Dodawanie przez zdjęcie/manual, obsługa AI-suggest, przypisanie atrybutów/kategorii
- **Kluczowe dane:** Form/stepper: zdjęcia → meta → AI suggest (opcjonalnie) → podgląd
- **Komponenty:** Camera, PhotoUploader, FormStepper, AICategorySuggest, BottomSheet/Modal, Toast
- **UX/dostępność/bezp:** Walidacja na bieżąco, feedback błędów, loading/skeletony, offline-first

### Outfits

- **Ścieżka:** /outfits
- **Cel:** Przegląd, tworzenie, modyfikacja zestawów ubrań
- **Kluczowe dane:** Lista outfitów, skład/outfit builder, szczegóły
- **Komponenty:** OutfitList, FAB, OutfitDetails, MultiSelect, OutfitBuilder, Error/Empty
- **UX/dostępność/bezp:** Multi-select, focus na builderze, ikony/aria-label

### Historia zmian

- **Ścieżka:** /history
- **Cel:** Podgląd zmian (audyt), przefiltrowanie wg typu/daty, szczegóły zmian
- **Kluczowe dane:** Lista logów (data, typ, opis), widok detalu (stare/nowe wartości)
- **Komponenty:** HistoryList, FilterBar, LogDetails, Loader/Empty
- **UX/dostępność/bezp:** Screenreader support, duży kontrast, daty jako focusable

### Profil użytkownika

- **Ścieżka:** /profile
- **Cel:** Informacje i akcje dotyczące konta; migracja, logowanie, usunięcie danych
- **Kluczowe dane:** Dane konta, status/konto/tryb gościa, zgody, feedback bezpieczeństwa
- **Komponenty:** UserStatus, MigrateButton, MagicLinkForm, DeleteData, ConsentSwitches, Modal
- **UX/dostępność/bezp:** Akcje krytyczne — modal z wymuszeniem frazy, jasny feedback, aria

### Ustawienia/Więcej

- **Ścieżka:** /settings
- **Cel:** Pełna edycja kategorii, tagów, zarządzanie sync, podgląd konfiguracji
- **Kluczowe dane:** Listy kategorii/tagów z CRUD i sortowaniem, info o stanie sync, sekcja opt-in na AI/privacy
- **Komponenty:** CategoryList, TagList, SettingsSwitches, ExportData, DevTools (opcjonalnie)
- **UX/dostępność/bezp:** Focus na formularze, clear modale, slices info/alert, obsługa screenreadera

## 3. Mapa podróży użytkownika

1. **Dodanie ubrania (photo-first):**
   - Home/FAB → Kamera → Zrób zdjęcie → AI-suggest (jeśli włączone) → Podgląd/edycja → Zapis → Garderoba
2. **Dodanie ubrania (manualne):**
   - Home/FAB → Formularz meta → (opcjonalnie zdjęcie) → Zapis → Garderoba
3. **Przegląd/edycja ubrań:**
   - Garderoba → Filtruj/szukaj/smart-listy → Szczegóły → (Edycja przez bottom sheet/modal) → Powrót
4. **Tworzenie outfitu:**
   - Outfits → FAB → Wybierz ubrania → Konfigurator/skład → Podgląd/Zapis
5. **Akcje krytyczne (usuwanie danych/konta):**
   - Profil/Ustawienia → Delete → Modal z frazą → Feedback → (Ekran startowy)
6. **Historia zmian:**
   - Profil/Więcej → Historia → Lista zmian → Szczegół loga

## 4. Układ i struktura nawigacji

- **Bottom Tab Bar (5 sekcji):** Home, Garderoba, Outfit, Profil, Ustawienia/Więcej (stały; znika przy modalu)
- **Stack Navigation:** Szczegóły/edycja ubrania, detale outfitu, edytory, historia
- **FAB-y:** Zawsze widoczne do dodawania/zapoczątkowania kluczowych akcji
- **Bottom Sheet/Modal:** Szybka edycja, batch select, AI suggest, zgody/critical actions
- **Pull-to-refresh:** na listach, garderobie, outfitach
- **Wskaźnik synchronizacji:** Ikona/przy menu, toast przy zmianie online/offline lub queue limit

## 5. Kluczowe komponenty wielokrotnego użytku

- **FAB (dodawanie, batch action) i FloatingActionList**
- **Lista/siatka ubrań, SmartListTabs i filtr StickyFilterBar**
- **BottomSheet/Modal do edycji, AI suggest, potwierdzeń**
- **PhotoUploader, Camera, ImageCarousel**
- **Category/TagSelector – quick edit w bottomsheet/modal/view**
- **Loader, EmptyState, ErrorState (uniwersalne dla każdej listy/ekranu)**
- **PullToRefreshProvider**
- **UserStatus, SyncIndicator, ConsentSwitch**
- **Toast/Snackbar do feedbacku, errorów, walidacji**

Wszystko projektowane pod:

- Pełną dostępność (ARIA, dark/light, duże fonty, focus, opisane przyciski)
- Bezpieczeństwo (modal crit op./fraza, wyraźny feedback na delete/migrację)
- Offline-first (obsługa offline queue, widoczne statusy/warnings)
- Przejrzyste error/empty/loading states — konsekwentnie zawsze obsłużone na poziomie UI
