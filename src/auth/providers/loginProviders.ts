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
    label: "Zaloguj e-mail / hasło",
    iconName: "email-outline",
    variant: "outline",
    enabled: false,
    // mode: "inline", // 👈 formularz w komponencie
    note: "wkrótce",
  },
  {
    id: "apple",
    label: "Zaloguj przez Apple",
    iconName: "apple",
    variant: "secondary",
    enabled: true,
  },
  {
    id: "google",
    label: "Zaloguj przez Google",
    iconName: "google",
    variant: "outline",
    enabled: false,
    note: "wkrótce",
  },
  // { id: "facebook", label: "Zaloguj przez Facebook", iconName: "facebook", variant: "outline", enabled: false, note: "wkrótce" },
];
