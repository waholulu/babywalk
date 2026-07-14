import { StyleSheet, View } from "react-native";

import { getEnvironmentBannerLabel } from "@/components/environment-banner-label";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { AppEnvironment } from "@/lib/env";

type EnvironmentBannerProps = {
  appEnv: AppEnvironment;
};

export function EnvironmentBanner({ appEnv }: EnvironmentBannerProps) {
  const label = getEnvironmentBannerLabel(appEnv);

  if (label === null) {
    return null;
  }

  return (
    <View
      accessibilityLabel={`${label} environment`}
      accessibilityRole="text"
      style={[
        styles.banner,
        appEnv === "staging" ? styles.staging : styles.local,
      ]}
    >
      <ThemedText type="smallBold" style={styles.text}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  local: {
    backgroundColor: Colors.light.primary,
  },
  staging: {
    backgroundColor: Colors.light.accent,
  },
  text: {
    color: Colors.light.textInverse,
  },
});
