import { Alert } from "react-native";
import {
  ApiResponse,
  ApiResponseSuccess,
  ApiResponseError,
} from "../api/Kernel/ApiResponse";

type Options = {
  successTitle?: string;
  successMessage?: string; // fallback jeśli brak message w success
  errorTitle?: string;
};

export function showAlertForApi<T>(res: ApiResponse<T>, opts: Options = {}) {
  if (res.ok) {
    const s = res as ApiResponseSuccess<T>;
    const title = opts.successTitle ?? "Done";
    const msg = s.message ?? opts.successMessage ?? "Operation completed.";
    Alert.alert(title, msg);
  } else {
    const e = res as ApiResponseError;
    const title = opts.errorTitle ?? "Error";
    Alert.alert(title, e.message);
  }
}
