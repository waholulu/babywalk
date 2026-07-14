import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ConfigErrorScreen } from "@/components/config-error-screen";
import { EnvironmentBanner } from "@/components/environment-banner";
import { readClientEnv } from "@/lib/env";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const clientEnv = readClientEnv();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {clientEnv.ok ? (
        <>
          <EnvironmentBanner appEnv={clientEnv.value.appEnv} />
          <Slot />
        </>
      ) : (
        <ConfigErrorScreen issues={clientEnv.issues} />
      )}
    </ThemeProvider>
  );
}
