import { Link, type Href } from "expo-router";
import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button, Card, Chip, ScreenContainer } from "@/components/ui";
import { Spacing } from "@/constants/theme";

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
    <ScreenContainer>
      <View style={styles.header}>
        <Chip selected>{eyebrow}</Chip>
        <ThemedText type="title">{title}</ThemedText>
        <ThemedText themeColor="textSecondary">{summary}</ThemedText>
      </View>

      {children ? <Card>{children}</Card> : null}

      {links.length > 0 ? (
        <View style={styles.linkList}>
          {links.map((link) => (
            <Link href={link.href} key={link.label} asChild>
              <Button variant={link.href === "/" ? "ghost" : "secondary"}>
                {link.label}
              </Button>
            </Link>
          ))}
        </View>
      ) : null}
    </ScreenContainer>
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
  header: {
    gap: Spacing.two,
  },
  linkList: {
    gap: Spacing.two,
  },
});
