// src/api/Kernel/ApiResponse.ts
export const ApiErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNAUTHORIZED: "UNAUTHORIZED",
  INTERNAL: "INTERNAL",
} as const;
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export const ApiSuccessCode = {
  SUCCESS: "SUCCESS",
} as const;
export type ApiSuccessCode =
  (typeof ApiSuccessCode)[keyof typeof ApiSuccessCode];

export type ApiResponseError = {
  ok: false;
  code: ApiErrorCode;
  /** ZAWSZE surowe EN – bez tłumaczenia tutaj */
  message: string;
  /** opcjonalny techniczny kontekst do logów / debug */
  meta?: Record<string, unknown>;
};

export type ApiResponseSuccess<T = unknown> = {
  ok: true;
  code: ApiSuccessCode; // zawsze "SUCCESS"
  data?: T;
  /** opcjonalny EN komunikat dla UI */
  message?: string;
};

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError;

export const Api = {
  ok<T = unknown>(data?: T, message?: string): ApiResponseSuccess<T> {
    return { ok: true, code: ApiSuccessCode.SUCCESS, data, message };
  },

  error(
    code: ApiErrorCode,
    messageEN: string,
    meta?: Record<string, unknown>
  ): ApiResponseError {
    return { ok: false, code, message: messageEN, meta };
  },
};
