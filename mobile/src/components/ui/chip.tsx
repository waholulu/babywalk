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

type ChipProps = PropsWithChildren<
  PressableProps & {
    selected?: boolean;
    style?: StyleProp<ViewStyle>;
  }
>;

export function Chip({ children, selected, style, ...props }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.primarySoft : theme.background,
          borderColor: selected ? theme.primary : theme.border,
        },
        pressed && styles.pressed,
        style,
      ]}
      {...props}
    >
      <ThemedText
        type="smallBold"
        themeColor={selected ? "primary" : "textSecondary"}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    borderRadius: Radii.round,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.78,
  },
});
