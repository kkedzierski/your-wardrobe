// src/i18n/TranslationService.ts
import i18n from "./i18n";

class TranslationService {
  t(message: string): string {
    // jeśli nie ma tłumaczenia, i18n.t zwróci dokładnie raw
    return i18n.t(message) ?? message;
  }
}

export const TranslationServiceInstance = new TranslationService();
