import { PropsWithChildren } from "react";
import {
  Pressable,
  StyleSheet,
  View,
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
  const chipStyle = [
    styles.chip,
    {
      backgroundColor: selected ? theme.primarySoft : theme.background,
      borderColor: selected ? theme.primary : theme.border,
    },
    style,
  ];

  if (props.onPress === undefined && props.onLongPress === undefined) {
    return (
      <View accessibilityRole="text" style={chipStyle}>
        <ThemedText
          type="smallBold"
          themeColor={selected ? "primary" : "textSecondary"}
        >
          {children}
        </ThemedText>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [chipStyle, pressed && styles.pressed]}
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
    minHeight: 44,
    borderRadius: Radii.round,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.78,
  },
});
