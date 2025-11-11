📌 PROMPT SZABLON — komponent + endpoint (React-Native + warstwy domenowe)

Cel: Na podstawie poniższych wytycznych wygeneruj kompletny zestaw plików (z minimalnym, działającym kodem) dla funkcjonalności {OPIS FUNKCJONALNOŚCI} w domenie {DOMENA}.

Kontekst projektu (stałe)
• Monorepo React Native (Expo).
• Kod API w: src/api
• Domeny w src/api: Category, Cloth, Kernel, Outfit, Tag, User (może ich być więcej w przyszłości).
• Każda domena ma 4 warstwy: Ui, Infrastructure, Domain, Application.
• Komponenty UI w: src/components, używane w src/screens.
• Komunikacja z „API” jest lokalna (imitacja) i zwraca ApiResponse<T> z src/api/Kernel/ApiResponse.ts.
• Tłumaczenia: wyłącznie po pełnych zdaniach po angielsku (nie po kluczach) – mapowane w pl.json. Translacja odbywa się w warstwie prezentacji (helper UI), a nie w ApiResponse.
• Logowanie: brak logów w ApiResponse. Używaj osobnego Loggera (np. src/api/Kernel/Logger.ts) w Controllerze/Servisach/Repo.

Zasady komunikatów (ważne)
• ApiResponseError.message zawiera oryginalny tekst po angielsku (np. "Access to the camera is required."), bez auto-translacji w ApiResponse.
• ApiResponseSuccess domyślnie nie ma pola message. Komponent w razie potrzeby podaje „sukcesowe” zdanie po EN (np. "Photo added to wardrobe."), które helper przełoży na PL.
• Translacja odbywa się w helperze UI (np. apiNotice), który:
• przy error: tłumaczy res.message po zdaniu,
• przy success: tłumaczy opts.successTitle/opts.successMessage po zdaniu.
• Przykładowe wpisy w pl.json (po pełnych zdaniach):

```
{
  "Access to the camera is required.": "Zezwól na dostęp do aparatu.",
  "Taking photo was cancelled.": "Anulowano robienie zdjęcia.",
  "Failed to create cloth from photo.": "Nie udało się dodać zdjęcia.",
  "Done": "Gotowe",
  "Photo added to wardrobe.": "Zdjęcie dodane do garderoby.",
  "Error": "Błąd",
  "Operation completed.": "Operacja zakończona.",
  "Failed to add photo.": "Nie udało się dodać zdjęcia."
}
```

Zasady logowania
• Stwórz Kernel/Logger.ts z metodami info|warn|error delegującymi do console.\* (jedno miejsce na przyszłą zamianę).
• Logi diagnostyczne przy operacjach bazodanowych zostawiamy w repozytoriach (po COMMIT), jak w przykładzie.

Struktura do wygenerowania (dla {DOMENA} / {METODA_HTTP}) 1. UI / Controller
• src/api/{DOMENA}/Ui/REST/{METODA_HTTP}/{AKCJA}/{AKCJA}Controller.ts
• src/api/{DOMENA}/Ui/REST/{METODA_HTTP}/{AKCJA}/{AKCJA}Input.ts (najprostszy typ/DTO wejściowy)
• src/api/{DOMENA}/Ui/REST/{METODA_HTTP}/{AKCJA}/{AKCJA}Output.ts (jeśli potrzebny)
• Controller tworzy Command z Application/Commands i deleguje do Application/Services.
• Walidacja minimalna (tylko to, co konieczne dla UI).
• Zwraca ApiResponse<T>:
• przy sukcesie: Api.ok<T>(data)
• przy błędzie: Api.error(code, "English sentence.") — bez translacji w tym miejscu.
• Logowanie przez Logger. 2. Application
• src/api/{DOMENA}/Application/Commands/{AKCJA}DTO.ts
• src/api/{DOMENA}/Application/Services/{AKCJA}Handler.ts
• Serwis prosty, może korzystać z innych serwisów i Repo z Infrastructure. 3. Infrastructure
• src/api/{DOMENA}/Infrastructure/{OBIEKT}Repository.ts z metodami do DB. 4. Kernel / wspólne
• Nie zmieniaj ApiResponse.ts poza utrzymaniem reguły: brak translacji, brak logów.
• Dodaj/wykorzystaj Kernel/Logger.ts.
• Helper prezentacyjny: src/ui/apiNotice.ts (następca showAlertForApi) – tłumaczy po pełnych zdaniach (EN→PL), używa Alert lub innego UI-toast. 5. Komponent UI
• src/components/{NazwaKomponentu}.tsx
• Używa controllera i apiNotice(res, { successTitle, successMessage, errorTitle }). 6. Screen (opcjonalnie)
• Pokaż przykład użycia komponentu wewnątrz src/screens/{Screen}.tsx.

API Notice — kontrakt helpera (zastępuje showAlertForApi)
• Plik: src/ui/apiNotice.ts
• Wejście:

```
type Options = {
  successTitle?: string;      // EN sentence
  successMessage?: string;    // EN sentence (fallback)
  errorTitle?: string;        // EN sentence
  as?: "alert" | "toast";     // sposób wyświetlenia; domyślnie "alert"
};
```

    •	Działanie:
    •	Jeśli res.ok: wyświetl {title, message} biorąc z opts (EN), przepuść przez TranslationService.t(sentence) → pokaż PL (jeśli dostępne).
    •	Jeśli błąd: res.message (EN) → t() → pokaż PL. Tytuł z opts.errorTitle (EN) → t().
    •	Jeśli brak tłumaczenia → pokaż oryginalne EN.
    •	Nie logować tutaj (to tylko prezentacja).

Wejście do tego prompta (zmienne)
• {DOMENA}: np. Cloth
• {AKCJA}: krótka nazwa, np. CreateFromPhoto
• {METODA_HTTP}: GET|POST|PATCH|DELETE
• {OPIS FUNKCJONALNOŚCI}: 1–2 zdania co ma się wydarzyć
• {NAZWA_KOMPONENTU}: np. AddClothFromCameraButton
• {SUCCESS_TITLE_EN}: np. Done
• {SUCCESS_MESSAGE_EN}: np. Photo added to wardrobe.
• {ERROR_TITLE_EN}: np. Error
• (opc.) {INPUT_FIELDS}: jakie pola trafiają do Input/DTO
• (opc.) {REPO_OPERACJE}: krótko, co repo ma zrobić

Oczekiwany format odpowiedzi 1. Drzewko plików (z pełnymi ścieżkami). 2. Kod dla każdego pliku – osobne bloki, gotowe do wklejenia. 3. Checklist wdrożeniowy (kroki po skopiowaniu plików). 4. Dopiski do pl.json (jeśli trzeba). 5. Krótki przykład użycia komponentu na screenie.

⸻

✨ PRZYKŁAD — wypełniony prompt

Utwórz funkcjonalność:
• {DOMENA}: Cloth
• {AKCJA}: CreateFromPhoto
• {METODA_HTTP}: POST
• {OPIS FUNKCJONALNOŚCI}: Zrób zdjęcie i dodaj je do garderoby użytkownika.
• {NAZWA_KOMPONENTU}: AddClothFromCameraButton
• {SUCCESS_TITLE_EN}: Done
• {SUCCESS_MESSAGE_EN}: Photo added to wardrobe.
• {ERROR_TITLE_EN}: Error
• {INPUT_FIELDS}: main?: boolean, forceExt?: string
• {REPO_OPERACJE}: insert cloth + photo, utwórz usera gdy brak, logi po COMMIT.

Zwróć: drzewko plików, wszystkie pliki z gotowym kodem (Controller/Input/DTO/Service/Repo/Logger/apiNotice/Komponent), wpisy do pl.json, checklistę.

⸻

Dodatkowe zasady jakości
• Trzymaj się prostych, jawnych typów w Input/Output/DTO.
• Controller nie tłumaczy i nie loguje przez console.\*; korzysta z Logger.
• ApiResponse:
• Error: Api.error(code, "English sentence.")
• Success: Api.ok<T>(data) (bez message)
• Helper apiNotice tłumaczy po zdaniach EN (nie po kluczach).
• W komponentach RN/Expo domyślnie używaj Alert; pozwól przełączyć na toast przez opts.as.
• Kod gotowy do wklejenia — bez pomijania importów.

⸻

Mini-szablon wywołania (krótka wersja do wklejenia)

„Stwórz endpoint i komponent wg standardu:
• Domena: {DOMENA}
• Akcja/HTTP: {AKCJA} / {METODA_HTTP}
• Komponent: {NAZWA_KOMPONENTU}
• Opis: {OPIS FUNKCJONALNOŚCI}
• Success (EN): {SUCCESS_TITLE_EN} / {SUCCESS_MESSAGE_EN}
• Error title (EN): {ERROR_TITLE_EN}
• Input: {INPUT_FIELDS}
• Repo: {REPO_OPERACJE}
Zwróć drzewko plików, pełny kod wszystkich plików, wpisy do pl.json, checklistę.”
