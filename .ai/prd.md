# Dokument wymagań produktu (PRD) - Your Wardrobe

## 1. Przegląd produktu

Twoja szafa to aplikacja typu offline-first na platformy iOS/Android (React Native), której celem jest umożliwienie użytkownikom łatwego katalogowania, zarządzania oraz organizowania własnej garderoby. System wspiera ręczne i automatyczne kategoryzowanie ubrań, oferuje zaawansowane przeszukiwanie własnych zasobów. Projekt powstał, by zredukować chaos w przechowywaniu ubrań i eliminować niepotrzebne zakupy, jednocześnie dbając o bezpieczeństwo i prywatność danych.

## 2. Problem użytkownika

Użytkownicy nie wiedzą dokładnie, jakie ubrania posiadają i gdzie są one przechowywane, co prowadzi do nadmiaru przedmiotów, nieużywanych ubrań i trudności z organizacją. Dodatkowe komplikacje pojawiają się przy zmianie miejsca zamieszkania, sezonowej wymianie rzeczy lub chęci prowadzenia minimalistycznego stylu życia. Brak narzędzi do łatwego i szybkiego zapisywania oraz przeglądania zasobów utrudnia kontrolę nad garderobą.

## 3. Wymagania funkcjonalne

1. Dodawanie ubrań poprzez wykonywanie zdjęć (możliwość wielokrotnych zdjęć na jeden element)
2. Ręczne oraz automatyczne (AI) (po MVP) kategoryzowanie ubrań
3. Edycja, przeglądanie i usuwanie ubrań oraz kategorii
4. Obsługa atrybutów (atrybuty nie są wymagane): kolor, rozmiar, marka, sezon, lokalizacja
5. Mechanizm tagowania wielowartościowego oraz możliwość edycji kategorii/tagów przez użytkownika
6. Automatyczna propozycja kategorii/atrybutów przez AI z mechanizmem potwierdzania/korekty przez użytkownika
7. Kolejka synchronizacji offline z obsługą limitów (500 MB/500 zdjęć), trybu Wi-Fi domyślnie, backoff i ekranem zarządzania zadaniami po MVP
8. Media pipeline: upload ≤ 3 MB/zdjęcie, generowanie 3 rozmiarów, lokalny cache, opcjonalne usuwanie tła
9. Profile użytkowników: tryb gościa, przejście na konto przez e-mail z magic link, szyfrowanie danych lokalnie i w tranzycie, „tylko Wi-Fi”
10. Szybkie wyszukiwanie, inteligentne listy (ostatnio dodane, nieużywane 90 dni, „piwnica” po MVP ), filtry po atrybutach
11. Zgody na przetwarzanie danych, twarde usunięcie danych na żądanie, zgodność z RODO

## 4. Granice produktu

- Brak możliwości dobierania stroju/outfitu na podstawie garderoby w MVP
- Brak importu zdjęć z galerii w MVP
- Brak udostępniania garderoby i integracji (np. Vinted) w MVP
- Wyłącznie synchronizacja przy dostępności sieci Wi-Fi (default/offline-first)
- Limity: max 500 zdjęć lub 500 MB w kolejce, max 3 MB na zdjęcie
- AI inference może być realizowane w chmurze, wariant on-device nieprzesądzony lecz poza MVP
- Eksport/Import danych (np. CSV/ZIP) – decyzja poza MVP

## 5. Historyjki użytkowników

### US-001: Dodanie ubrania

- Tytuł: Dodanie nowego ubrania ze zdjęciem
- Opis: Jako użytkownik chcę dodać nowe ubranie, wykonać jedno lub kilka zdjęć, przypisać kategorię/atrybuty i zapisać je w katalogu offline.
- Kryteria akceptacji:
  - Ubranie posiada co najmniej jedno zdjęcie
  - Możliwość dodania wielu zdjęć po MVP
  - Możliwość przypisania kategorii/atrybutów ręcznie lub przez AI po MVP

### US-002: Kategoryzacja AI po MVP

- Tytuł: Automatyczna kategoryzacja przez AI
- Opis: Jako użytkownik chcę, by aplikacja automatycznie sugerowała kategorię i atrybuty ubrania, abym mógł je zaakceptować lub poprawić jednym tapnięciem.
- Kryteria akceptacji:
  - Każde zdjęcie analizowane przez AI z wynikiem i progiem pewności
  - Możliwość jednego tapnięcia na „akceptuj/popraw”
  - Logowanie decyzji użytkownika co do propozycji AI

### US-003: Przegląd, edycja i usuwanie ubrań

- Tytuł: Organizacja garderoby
- Opis: Jako użytkownik chcę łatwo przeglądać, edytować i usuwać ubrania oraz decydować o ich atrybutach i zdjęciach.
- Kryteria akceptacji:
  - Przegląd ubrań listą lub z filtrami
  - Edytowanie atrybutów, zdjęć, kategorii
  - Usuwanie ubrania z bazy

### US-004: Kategoryzacja i tagowanie ręczne

- Tytuł: Ręczna kategoryzacja i tagowanie
- Opis: Jako użytkownik chcę samodzielnie przypisywać i edytować kategorie, tagi oraz atrybuty
- Kryteria akceptacji:
  - Możliwość przypisania kategorii/tagów z listy lub własnych
  - Edycja i usuwanie kategorii/tagów

### US-005: Szybkie wyszukiwanie

- Tytuł: Intuicyjne wyszukiwanie oraz listy
- Opis: Jako użytkownik chcę wyszukiwać ubrania po dowolnym atrybucie.
- Kryteria akceptacji:
  - Szybka wyszukiwarka

### US-006: Masowe akcje usunięcia

- Tytuł: Usunięcie masowo ubrań
- Opis: Jako użytkownik chcę zaznaczyć ubrania masowo i usunąć
- Kryteria akceptacji:
  - Wybór wielu elementów
  - Masowa akcja: usunięcie

### US-008: Obsługa konta użytkownika i bezpieczeństwo

- Tytuł: Bezpieczna rejestracja, logowanie i przechowywanie danych
- Opis: Jako użytkownik chcę zacząć w trybie gościa, a następnie przejść do konta (e-mail/magic link) - po MVP bez utraty danych, z zachowaniem pełnego bezpieczeństwa i prywatności.
- Kryteria akceptacji:
  - Tryb gościa z możliwością migracji na konto
  - Szyfrowanie danych lokalnie i w tranzycie
  - Magic link/mail do logowania - po MVP

### US-009: Zgody, prywatność, usuwanie danych - po MVP

- Tytuł: Zarządzanie zgodami i prywatnością
- Opis: Jako użytkownik chcę mieć wyraźny wybór co do udziału w trenowaniu modeli AI oraz możliwość twardego usunięcia moich danych.
- Kryteria akceptacji:
  - Zgody na przetwarzanie i udział w trenowaniu – opt-in
  - Twarde usuwanie danych na żądanie (bez odzyskiwania)

## 6. Metryki sukcesu

- Akceptacja kategorii przez użytkowników dla AI ≥75% (wskaźnik: główna kategoria AI zaakceptowana bez korekty)
- Wskaźnik wypełnienia atrybutów: % elementów z kompletem atrybutów (kategoria + lokalizacja + sezon)
