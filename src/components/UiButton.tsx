// src/ui/UiButton.tsx
import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { TranslationServiceInstance } from "../i18n/TranslationService";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

type Props = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  iconLeftName?: React.ComponentProps<typeof Feather>["name"];
  iconRightName?: React.ComponentProps<typeof Feather>["name"];
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export default function UiButton({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  size = "md",
  iconLeftName,
  iconRightName,
  style,
  accessibilityLabel,
}: Props) {
  const styles = getStyles(variant, size);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      android_ripple={
        Platform.OS === "android"
          ? {
              color: variant === "ghost" ? "#e5e7eb" : "#11182722",
              radius: 200,
            }
          : undefined
      }
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? TranslationServiceInstance.t(title)
      }
      hitSlop={8}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          {iconLeftName ? (
            <Feather
              name={iconLeftName}
              size={size === "sm" ? 16 : 18}
              color={styles.label.color as string}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text style={styles.label} numberOfLines={1}>
            {TranslationServiceInstance.t(title)}
          </Text>
          {iconRightName ? (
            <Feather
              name={iconRightName}
              size={size === "sm" ? 16 : 18}
              color={styles.label.color as string}
              style={{ marginLeft: 8 }}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

function getStyles(variant: Variant, size: Size) {
  const palette = {
    primaryBg: "#111827",
    primaryFg: "#ffffff",
    secondaryBg: "#f3f4f6",
    secondaryFg: "#111827",
    ghostBg: "transparent",
    ghostFg: "#111827",
    border: "#e5e7eb",
  };

  const paddings =
    size === "sm"
      ? { py: 10, px: 12, radius: 10, font: 14 }
      : { py: 14, px: 16, radius: 12, font: 16 };

  const base: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: paddings.py,
    paddingHorizontal: paddings.px,
    borderRadius: paddings.radius,
    borderWidth: variant === "secondary" ? StyleSheet.hairlineWidth : 0,
    borderColor: variant === "secondary" ? palette.border : "transparent",
    backgroundColor:
      variant === "primary"
        ? palette.primaryBg
        : variant === "secondary"
        ? palette.secondaryBg
        : palette.ghostBg,
  };

  const label = {
    color:
      variant === "primary"
        ? palette.primaryFg
        : variant === "secondary"
        ? palette.secondaryFg
        : palette.ghostFg,
    fontWeight: "700" as const,
    fontSize: paddings.font,
  };

  return StyleSheet.create({
    base,
    label,
    pressed: { opacity: 0.9 },
    disabled: { opacity: 0.6 },
  });
}
