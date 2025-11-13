import { TranslationServiceInstance } from "../../i18n/TranslationService";

export type LoginProviderId = "email" | "apple" | "google" | "facebook";

export type ProviderConfig = {
  id: LoginProviderId;
  label: string;
  iconName: string; // MaterialCommunityIcons
  variant: "primary" | "secondary" | "outline";
  enabled: boolean; // steruje wygaszeniem/disabled
  note?: string; // np. "wkrótce"
  mode?: "button" | "inline"; // 👈 email może być "inline" (formularz)
};

export const LOGIN_PROVIDERS: ProviderConfig[] = [
  {
    id: "email",
    label: TranslationServiceInstance.t("Login with email / password"),
    iconName: "email-outline",
    variant: "outline",
    enabled: false,
    note: TranslationServiceInstance.t("soon"),
  },
  {
    id: "apple",
    label: TranslationServiceInstance.t("Login with Apple"),
    iconName: "apple",
    variant: "secondary",
    enabled: true,
  },
  {
    id: "google",
    label: TranslationServiceInstance.t("Login with Google"),
    iconName: "google",
    variant: "outline",
    enabled: false,
    note: TranslationServiceInstance.t("soon"),
  },
  // { id: "facebook", label: "Zaloguj przez Facebook", iconName: "facebook", variant: "outline", enabled: false, note: "wkrótce" },
];
