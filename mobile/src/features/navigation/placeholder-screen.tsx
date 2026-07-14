import { Link, type Href } from "expo-router";
import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";

export type PlaceholderLink = {
  href: Href;
  label: string;
};

type PlaceholderScreenProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  summary: string;
  links?: PlaceholderLink[];
}>;

export function PlaceholderScreen({
  children,
  eyebrow,
  links = [],
  summary,
  title,
}: PlaceholderScreenProps) {
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <ThemedText type="code" themeColor="textSecondary">
                {eyebrow}
              </ThemedText>
              <ThemedText type="title" style={styles.title}>
                {title}
              </ThemedText>
              <ThemedText themeColor="textSecondary">{summary}</ThemedText>
            </View>

            {children ? (
              <ThemedView type="backgroundElement" style={styles.panel}>
                {children}
              </ThemedView>
            ) : null}

            {links.length > 0 ? (
              <View style={styles.linkList}>
                {links.map((link) => (
                  <Link href={link.href} key={link.label} asChild>
                    <ThemedText type="linkPrimary" style={styles.link}>
                      {link.label}
                    </ThemedText>
                  </Link>
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

export const coreRouteLinks: PlaceholderLink[] = [
  { href: "/onboarding", label: "Onboarding" },
  { href: "/results", label: "Recommendation results" },
  {
    href: { pathname: "/places/[id]", params: { id: "demo-place" } },
    label: "Sample place detail",
  },
  {
    href: { pathname: "/plan/[id]", params: { id: "demo-plan" } },
    label: "Sample day plan",
  },
  { href: "/saved", label: "Saved places" },
  { href: "/settings", label: "Settings" },
];

export const homeLink: PlaceholderLink = {
  href: "/",
  label: "Back to home",
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    padding: Spacing.four,
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
  },
  panel: {
    borderRadius: Spacing.three,
    gap: Spacing.two,
    padding: Spacing.four,
  },
  linkList: {
    gap: Spacing.two,
  },
  link: {
    fontSize: 16,
    lineHeight: 28,
  },
});
