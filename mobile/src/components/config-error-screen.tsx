import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Card, ScreenContainer } from "@/components/ui";
import { Spacing } from "@/constants/theme";
import { ClientEnvIssue } from "@/lib/env";

type ConfigErrorScreenProps = {
  issues: ClientEnvIssue[];
};

export function ConfigErrorScreen({ issues }: ConfigErrorScreenProps) {
  return (
    <ScreenContainer>
      <Card>
        <View style={styles.stack}>
          <ThemedText type="subtitle" themeColor="danger">
            Configuration needed
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Update your local environment and restart Expo. The app only shows
            variable names here, never secret values.
          </ThemedText>
          <View style={styles.stack}>
            {issues.map((issue) => (
              <ThemedText type="code" key={`${issue.name}-${issue.reason}`}>
                {issue.name}: {issue.reason}
              </ThemedText>
            ))}
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Start from mobile/.env.example for the current local setup.
          </ThemedText>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.two,
  },
});
