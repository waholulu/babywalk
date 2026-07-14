import { Link } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button, Card, ScreenContainer } from "@/components/ui";
import { Radii, Spacing } from "@/constants/theme";
import { createAuthService, AuthStatus } from "@/features/auth";
import { readClientEnv } from "@/lib/env";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsScreen() {
  const clientEnv = useMemo(() => readClientEnv(), []);
  const authService = useMemo(
    () => (clientEnv.ok ? createAuthService(clientEnv.value) : undefined),
    [clientEnv],
  );
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AuthStatus>({
    kind: "guest",
    authAvailable: false,
  });
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const refreshStatus = useCallback(() => {
    if (authService === undefined) {
      return;
    }

    void authService.getStatus().then(setStatus);
  }, [authService]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  async function handleEmailSignIn() {
    if (authService === undefined) {
      return;
    }

    setIsBusy(true);
    const result = await authService.requestEmailSignIn(email);
    setMessage(result.message);
    setIsBusy(false);
  }

  async function handleSignOut() {
    if (authService === undefined) {
      return;
    }

    setIsBusy(true);
    const result = await authService.signOut();
    setMessage(result.message);
    refreshStatus();
    setIsBusy(false);
  }

  return (
    <ScreenContainer>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold" themeColor="primary">
          Settings
        </ThemedText>
        <ThemedText type="title">Preferences</ThemedText>
      </ThemedView>

      <Card>
        <View style={styles.stack}>
          <ThemedText type="subtitle">Account</ThemedText>
          <ThemedText themeColor="textSecondary">
            {status.kind === "signed_in"
              ? `Signed in as ${status.email ?? "parent account"}`
              : "Using SproutScout as a guest."}
          </ThemedText>

          {status.kind === "guest" && status.authAvailable ? (
            <EmailSignInForm
              email={email}
              isBusy={isBusy}
              onChangeEmail={setEmail}
              onSubmit={handleEmailSignIn}
            />
          ) : null}

          {status.kind === "guest" && !status.authAvailable ? (
            <ThemedView type="backgroundElement" style={styles.notice}>
              <ThemedText type="smallBold">Guest mode</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Optional sign-in appears after Supabase public auth values are
                configured. Planning inputs stay local while you are a guest.
              </ThemedText>
            </ThemedView>
          ) : null}

          {message === undefined ? null : (
            <ThemedView
              type="backgroundElement"
              accessibilityLiveRegion="polite"
              style={styles.notice}
            >
              <ThemedText type="small">{message}</ThemedText>
            </ThemedView>
          )}

          <Button
            variant="secondary"
            onPress={handleSignOut}
            disabled={isBusy}
            accessibilityLabel="Sign out and clear protected cache"
          >
            Sign out
          </Button>
        </View>
      </Card>

      <Link href="/" asChild>
        <Button variant="ghost">Back to home</Button>
      </Link>
    </ScreenContainer>
  );
}

function EmailSignInForm({
  email,
  isBusy,
  onChangeEmail,
  onSubmit,
}: {
  email: string;
  isBusy: boolean;
  onChangeEmail: (value: string) => void;
  onSubmit: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.stack}>
      <ThemedText type="smallBold">Email sign-in</ThemedText>
      <TextInput
        value={email}
        onChangeText={onChangeEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        accessibilityLabel="Parent email"
        placeholder="parent@example.com"
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            borderColor: theme.border,
            color: theme.text,
            backgroundColor: theme.background,
          },
        ]}
      />
      <Button
        onPress={onSubmit}
        disabled={isBusy}
        accessibilityLabel="Email me a sign-in link"
      >
        Email me a sign-in link
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  stack: {
    gap: Spacing.three,
  },
  notice: {
    borderRadius: Radii.medium,
    gap: Spacing.one,
    padding: Spacing.three,
  },
  input: {
    minHeight: 48,
    borderRadius: Radii.medium,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
