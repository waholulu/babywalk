import { PropsWithChildren } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Radii, Shadows, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ children, style }: CardProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.card,
        { borderColor: theme.border, shadowColor: theme.shadow },
        Shadows.card,
        style,
      ]}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.medium,
    borderWidth: 1,
    gap: Spacing.two,
    padding: Spacing.four,
  },
});
