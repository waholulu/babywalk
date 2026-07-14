import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

import { Button } from "./button";
import { Card } from "./card";

type FeedbackStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function LoadingState({ message = "Loading" }: { message?: string }) {
  const theme = useTheme();

  return (
    <Card style={styles.centered}>
      <ActivityIndicator color={theme.primary} />
      <ThemedText themeColor="textSecondary">{message}</ThemedText>
    </Card>
  );
}

export function EmptyState({
  actionLabel,
  message,
  onAction,
  title,
}: FeedbackStateProps) {
  return (
    <FeedbackState
      actionLabel={actionLabel}
      message={message}
      onAction={onAction}
      title={title}
    />
  );
}

export function ErrorState({
  actionLabel,
  message,
  onAction,
  title,
}: FeedbackStateProps) {
  return (
    <FeedbackState
      actionLabel={actionLabel}
      message={message}
      onAction={onAction}
      tone="danger"
      title={title}
    />
  );
}

function FeedbackState({
  actionLabel,
  message,
  onAction,
  title,
  tone = "neutral",
}: FeedbackStateProps & { tone?: "neutral" | "danger" }) {
  return (
    <Card>
      <View style={styles.stack}>
        <ThemedText
          type="bodyBold"
          themeColor={tone === "danger" ? "danger" : "text"}
        >
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{message}</ThemedText>
        {actionLabel && onAction ? (
          <Button
            variant={tone === "danger" ? "danger" : "secondary"}
            onPress={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
  },
  stack: {
    gap: Spacing.two,
  },
});
