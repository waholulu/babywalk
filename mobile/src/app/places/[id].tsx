import { useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ErrorState } from "@/components/ui";
import {
  PlaceholderScreen,
  homeLink,
} from "@/features/navigation/placeholder-screen";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      eyebrow="Place detail"
      title="Place facts"
      summary={`Placeholder for structured place details. Route id: ${id}`}
      links={[homeLink]}
    >
      <ThemedText>
        Future details will show only sourced facts, freshness, official links,
        verification notes, save actions, and incorrect-data feedback.
      </ThemedText>
      <ErrorState
        title="Preview error state"
        message="Future provider failures will show bounded recovery copy."
      />
    </PlaceholderScreen>
  );
}
