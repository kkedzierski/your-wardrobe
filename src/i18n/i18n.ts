// src/i18n/i18n.ts
import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import pl from "./locales/pl.json";

// Pobierz listę preferowanych języków urządzenia (np. [{ languageCode: "pl", ... }])
const locales = Localization.getLocales();
const deviceLangCode = locales[0]?.languageCode ?? "pl";

// Ustal język startowy aplikacji
const initialLng = deviceLangCode.startsWith("pl") ? "pl" : "en";

const options: InitOptions = {
  resources: {
    en: { translation: en },
    pl: { translation: pl },
  },
  lng: initialLng,
  fallbackLng: "en",

  // react-native / i18next combo czasem wymaga jawnej wersji kompatybilności JSON
  compatibilityJSON: "v4",

  // używamy całych zdań jako kluczy ("No photo file in the request.")
  keySeparator: false,

  interpolation: {
    escapeValue: false, // RN nie potrzebuje escapowania HTML
  },
};

// Inicjalizacja i18n (raz dla całej aplikacji)
i18n.use(initReactI18next).init(options as InitOptions);

export default i18n;
