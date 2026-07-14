import { Tabs } from "expo-router";
import { Image, useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

const tabIcons = {
  index: require("@/assets/images/tabIcons/home.png"),
  explore: require("@/assets/images/tabIcons/explore.png"),
} as const;

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Image
              source={tabIcons.index}
              style={{ width: 22, height: 22, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <Image
              source={tabIcons.explore}
              style={{ width: 22, height: 22, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
