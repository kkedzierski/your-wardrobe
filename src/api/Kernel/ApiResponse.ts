// src/api/Kernel/ApiResponse.ts
import { TranslationServiceInstance } from "../../i18n/TranslationService";

export const ApiErrorCode = {
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
  message: string; // przetłumaczony lub oryginalny tekst (EN->PL)
};

export type ApiResponseSuccess<T = unknown> = {
  ok: true;
  code: ApiSuccessCode; // zawsze "SUCCESS"
  data?: T;
};

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError;

type ErrorOptions = {
  logInfo?: boolean;
  customLogMessage?: string | null;
  params?: Record<string, unknown>;
};

const translateOrEcho = (msg: string, params?: Record<string, unknown>) => {
  try {
    const out = TranslationServiceInstance?.t
      ? TranslationServiceInstance.t(msg, params)
      : msg;
    return out ?? msg;
  } catch {
    return msg;
  }
};

export const Api = {
  ok<T = unknown>(data?: T): ApiResponseSuccess<T> {
    return { ok: true, code: ApiSuccessCode.SUCCESS, data };
  },

  error(
    code: ApiErrorCode,
    messageEN: string,
    opts: ErrorOptions = {}
  ): ApiResponseError {
    const translated = translateOrEcho(messageEN, opts.params);
    if (opts.logInfo) {
      console.warn(
        "[ApiResponse]",
        { code, messageRaw: messageEN },
        opts.customLogMessage ?? ""
      );
    }
    return { ok: false, code, message: translated };
  },
};
