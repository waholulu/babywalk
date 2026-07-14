import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button, Card, ErrorState, ScreenContainer } from "@/components/ui";
import { Radii, Spacing } from "@/constants/theme";
import { getPlaceDetailModel, PlaceDetailFact } from "./place-detail";

type PlaceDetailScreenProps = {
  id: string;
};

export function PlaceDetailScreen({ id }: PlaceDetailScreenProps) {
  const detail = getPlaceDetailModel(id);

  if (detail === null) {
    return (
      <ScreenContainer>
        <ErrorState
          title="Place not found"
          message="This local fixture could not be found."
        />
        <Link href="/results" asChild>
          <Button variant="secondary">Back to results</Button>
        </Link>
      </ScreenContainer>
    );
  }

  const { candidate } = detail;

  return (
    <ScreenContainer>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold" themeColor="primary">
          Place detail
        </ThemedText>
        <ThemedText type="title">{candidate.name}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {candidate.area.label}
        </ThemedText>
      </ThemedView>

      <Card>
        <SectionTitle title="Structured facts" />
        <FactGrid facts={detail.facts} />
      </Card>

      <Card>
        <SectionTitle title="Schedule" />
        <FactGrid facts={detail.scheduleFacts} />
      </Card>

      <Card>
        <SectionTitle title="Amenities" />
        <FactGrid facts={detail.amenityFacts} />
      </Card>

      <Card>
        <SectionTitle title="Verify before leaving" />
        {detail.verifyNotes.map((note) => (
          <ThemedText key={note} type="small" themeColor="warning">
            {note}
          </ThemedText>
        ))}
      </Card>

      <Card>
        <SectionTitle title="Actions" />
        <View style={styles.actions}>
          {detail.actions.map((action) => (
            <Button
              key={action.label}
              disabled
              variant="secondary"
              accessibilityLabel={action.label}
              accessibilityHint={action.disabledReason}
              style={styles.actionButton}
            >
              {action.label}
            </Button>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Save, visit, block, and report actions are placeholders.
        </ThemedText>
      </Card>

      <View style={styles.navigation}>
        <Link href="/results" asChild>
          <Button variant="secondary">Back to results</Button>
        </Link>
        <Link href="/" asChild>
          <Button variant="ghost">Back to home</Button>
        </Link>
      </View>
    </ScreenContainer>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <ThemedText type="bodyBold">{title}</ThemedText>;
}

function FactGrid({ facts }: { facts: PlaceDetailFact[] }) {
  return (
    <View style={styles.factGrid}>
      {facts.map((fact) => (
        <ThemedView key={fact.label} type="background" style={styles.fact}>
          <ThemedText type="small" themeColor="textSecondary">
            {fact.label}
          </ThemedText>
          <ThemedText
            type="smallBold"
            themeColor={fact.confidence === "unknown" ? "warning" : "text"}
          >
            {fact.value}
          </ThemedText>
        </ThemedView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  factGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  fact: {
    flex: 1,
    minWidth: 140,
    borderRadius: Radii.medium,
    gap: Spacing.one,
    padding: Spacing.two,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    minWidth: 148,
  },
  navigation: {
    gap: Spacing.two,
  },
});
