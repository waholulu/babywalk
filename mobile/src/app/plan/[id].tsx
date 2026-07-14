import { useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import {
  PlaceholderScreen,
  homeLink,
} from "@/features/navigation/placeholder-screen";

export default function DayPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      eyebrow="Day plan"
      title="Simple timeline"
      summary={`Placeholder for a one- or two-stop plan. Route id: ${id}`}
      links={[homeLink]}
    >
      <ThemedText>
        Future plans will include travel buffers, assumptions, backup ideas, and
        a return-home target without implying real-world timing is guaranteed.
      </ThemedText>
    </PlaceholderScreen>
  );
}
