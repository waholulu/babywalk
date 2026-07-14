import { PropsWithChildren } from "react";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = PropsWithChildren<
  PressableProps & {
    variant?: ButtonVariant;
    style?: StyleProp<ViewStyle>;
  }
>;

export function Button({
  children,
  disabled,
  style,
  variant = "primary",
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const backgroundColor =
    variant === "primary"
      ? theme.primary
      : variant === "danger"
        ? theme.dangerSoft
        : variant === "secondary"
          ? theme.primarySoft
          : "transparent";
  const borderColor =
    variant === "ghost" ? theme.border : (backgroundColor ?? theme.border);
  const textColor =
    variant === "primary"
      ? "textInverse"
      : variant === "danger"
        ? "danger"
        : "primary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <ThemedText type="bodyBold" themeColor={textColor} style={styles.label}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: Radii.medium,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  label: {
    textAlign: "center",
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.45,
  },
});
