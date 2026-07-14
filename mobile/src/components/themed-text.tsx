import { StyleSheet, Text, type TextProps } from "react-native";

import { ThemeColor, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "small"
    | "smallBold"
    | "subtitle"
    | "bodyBold"
    | "link"
    | "linkPrimary"
    | "code";
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = "default",
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? "text"] },
        type === "default" && styles.default,
        type === "title" && styles.title,
        type === "small" && styles.small,
        type === "smallBold" && styles.smallBold,
        type === "subtitle" && styles.subtitle,
        type === "bodyBold" && styles.bodyBold,
        type === "link" && styles.link,
        type === "linkPrimary" && styles.linkPrimary,
        type === "code" && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: Typography.small,
  smallBold: Typography.smallBold,
  default: Typography.body,
  bodyBold: Typography.bodyBold,
  title: Typography.title,
  subtitle: Typography.subtitle,
  link: {
    ...Typography.small,
    lineHeight: 30,
  },
  linkPrimary: {
    ...Typography.small,
    lineHeight: 30,
  },
  code: Typography.code,
});
