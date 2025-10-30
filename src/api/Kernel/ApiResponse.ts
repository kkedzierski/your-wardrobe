import { TranslationServiceInstance } from "../../i18n/TranslationService";

// src/types/ApiResponse.ts
export const ApiErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNAUTHORIZED: "UNAUTHORIZED",
  INTERNAL: "INTERNAL",
} as const;

export type ApiErrorCode = keyof typeof ApiErrorCode;

type ApiResponseInitError = {
  ok: false;
  code: ApiErrorCode;
  message: string; // surowy tekst wejściowy (z serwisu)
  logInfo?: boolean;
  customLogMessage?: string | null;
};

type ApiResponseInitSuccess<TData> = {
  ok: true;
  data: TData;
};

/**
 * Klasa ApiResponse<T>
 * - używana jako wynik zwracany z serwisów domenowych
 * - automatycznie tłumaczy message (jeśli ok === false)
 * - automatycznie loguje, jeśli poproszono
 * - zachowuje się jak plain-object do użytku w UI
 */
export class ApiResponse<TData = unknown> {
  ok: boolean;
  code?: ApiErrorCode;
  message?: string;
  data?: TData;

  constructor(init: ApiResponseInitSuccess<TData> | ApiResponseInitError) {
    if (init.ok === true) {
      // sukces
      this.ok = true;
      this.data = init.data;
      // brak message/code w success
    } else {
      // błąd
      this.ok = false;
      this.code = init.code;

      // przetłumacz komunikat od razu
      const translated = TranslationServiceInstance.t(init.message);
      this.message = translated;

      // logowanie (opcjonalne)
      if (init.logInfo) {
        console.warn(
          "[ApiResponse]",
          {
            code: init.code,
            messageRaw: init.message,
          },
          init.customLogMessage ?? ""
        );
      }
    }
  }
}
