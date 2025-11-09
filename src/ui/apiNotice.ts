// src/ui/apiNotice.ts
import { Alert } from "react-native";
import {
  ApiResponse,
  ApiResponseSuccess,
  ApiResponseError,
} from "../api/Kernel/ApiResponse";
import { TranslationServiceInstance } from "../i18n/TranslationService";

type Options = {
  titleSuccess?: string; // EN zdanie z pl.json, np. "Done"
  titleError?: string; // EN zdanie z pl.json, np. "Error"
  fallbackSuccessMsg?: string; // EN zdanie z pl.json, np. "Operation completed."
  /** domyślnie true – tłumaczymy zdania przez t(sentence) */
  translate?: boolean;
};

const tMaybe = (s: string | undefined, translate: boolean) => {
  if (!s) return s;
  if (!translate) return s;
  try {
    const t = TranslationServiceInstance?.t?.(s);
    return t ?? s;
  } catch {
    return s;
  }
};

export function showNoticeForApi<T>(res: ApiResponse<T>, opts: Options = {}) {
  const translate = opts.translate ?? true;
  const titleSuccess = tMaybe(opts.titleSuccess ?? "Done", translate) ?? "Done";
  const titleError = tMaybe(opts.titleError ?? "Error", translate) ?? "Error";
  const fallbackSuccess =
    tMaybe(opts.fallbackSuccessMsg ?? "Operation completed.", translate) ??
    "Operation completed.";

  if (res.ok) {
    const s = res as ApiResponseSuccess<T>;
    const msg =
      tMaybe(s.message ?? fallbackSuccess, translate) ?? fallbackSuccess;
    Alert.alert(titleSuccess, msg);
  } else {
    const e = res as ApiResponseError;
    const msg = tMaybe(e.message, translate) ?? e.message;
    Alert.alert(titleError, msg);
  }
}
