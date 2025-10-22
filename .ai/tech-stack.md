Frontend – Expo (managed) + React Native:
• React Native + Expo → szybkie MVP na iOS/Android jednocześnie
• TypeScript → lepsze DX i mniej błędów
• React Navigation → stack/tabs i nawigacja ekranów
• React Native Paper → gotowe, dostępne komponenty UI
• expo-sqlite → lokalna baza z CRUD i prostymi migracjami SQL
• expo-camera + expo-image-manipulator + expo-file-system → zdjęcia, kompresja, miniatury i zapis
• expo-crypto → hash (SHA-256/MD5) do deduplikacji
• expo-local-authentication + expo-secure-store → ekran blokady: biometria + PIN (kontrola dostępu)
• react-i18next + react-native-localize → PL teraz, gotowość pod EN

Backend – offline-first (MVP), opcjonalny sync po MVP:
• MVP: brak backendu – wszystko lokalnie (maks. prywatność, mniejsza złożoność)
• Eksport/Import (backup v1) → plik ZIP (JSON metadanych + miniatury) przez systemowy „Udostępnij”
• Po MVP (opcjonalnie): Supabase (Auth + Postgres + Storage) do kont/logowania i ręcznego „Backup teraz”

AI – „AI-lite” jako dodatek (opcjonalne w MVP):
• Podpowiedzi kategorii/tagów z tekstu przez dostawcę LLM (np. OpenRouter/OpenAI); przełącznik „nie wysyłaj obrazów”
• Abstrakcja AiProvider → łatwo włączyć/wyłączyć lub podmienić model

CI/CD i Hosting:
• GitHub Actions → pipeline: lint + typecheck + test UI (jest + @testing-library/react-native)
• Expo EAS Build → buildy iOS/Android; EAS Update → OTA hotfixy
• Dystrybucja: Expo Go dla 2–3 testerów; opcjonalnie TestFlight/Google Play (APK/AAB)
• Monitoring (opcjonalnie): sentry-expo
• Publiczny URL (opcjonalnie): strona inf./polityka prywatności na GitHub Pages/Netlify

Spełnienie wymagań:
• Kontrola dostępu → biometria + PIN (SecureStore)
• CRUD → expo-sqlite + repo/metody (lista, dodaj, edytuj, usuń, filtry)
• Logika biznesowa → słowniki kategorii/kolorów/sezonów, filtry/sort, deduplikacja po hash
• PRD & dokumenty → katalog docs/ w repo (PRD, SystemDesign, Privacy, TestPlan, Roadmap)
• Testy → min. jeden test z perspektywy użytkownika (dodanie elementu → widoczny na liście)
• CI/CD → GitHub Actions (testy) + EAS Build/Update
• ⭐ Opcjonalnie: publiczne wydanie (APK/TestFlight) i/lub strona pod publicznym URL
