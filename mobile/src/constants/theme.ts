/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform, type TextStyle } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    textInverse: "#ffffff",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    border: "#D9DCE3",
    primary: "#117A65",
    primaryPressed: "#0D5F4E",
    primarySoft: "#DDF3EC",
    accent: "#B85534",
    warning: "#8A5A00",
    danger: "#B3261E",
    dangerSoft: "#FCE8E6",
    shadow: "#000000",
  },
  dark: {
    text: "#ffffff",
    textInverse: "#000000",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
    border: "#3A3D43",
    primary: "#5ED3B1",
    primaryPressed: "#3EB692",
    primarySoft: "#123B33",
    accent: "#F29A73",
    warning: "#F4C95D",
    danger: "#FFB4AB",
    dangerSoft: "#4A1F1B",
    shadow: "#000000",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  small: 4,
  medium: 8,
  large: 12,
  round: 999,
} as const;

export const Typography = {
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 700,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 700,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  code: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: Platform.OS === "android" ? "700" : "500",
    fontFamily: Fonts.mono,
  },
} as const satisfies Record<string, TextStyle>;

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: Colors.light.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
