import { Link } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button, Card, ErrorState, ScreenContainer } from "@/components/ui";
import { Radii, Spacing } from "@/constants/theme";
import {
  createInitialPlaceActionState,
  createLocalPlaceActionsRepository,
  PlaceActionState,
} from "@/data/repositories";
import { buildPlaceActionButtons } from "./place-actions";
import { getPlaceDetailModel, PlaceDetailFact } from "./place-detail";

type PlaceDetailScreenProps = {
  id: string;
};

export function PlaceDetailScreen({ id }: PlaceDetailScreenProps) {
  const detail = getPlaceDetailModel(id);
  const actionsRepository = useMemo(
    () => createLocalPlaceActionsRepository(),
    [],
  );
  const [actionState, setActionState] = useState<PlaceActionState>(
    createInitialPlaceActionState(),
  );
  const [actionMessage, setActionMessage] = useState<string | undefined>(
    undefined,
  );
  const [actionError, setActionError] = useState<string | undefined>(undefined);
  const [isActionBusy, setIsActionBusy] = useState(false);

  const refreshActionState = useCallback(() => {
    void actionsRepository.getState().then(setActionState);
  }, [actionsRepository]);

  useEffect(() => {
    refreshActionState();
  }, [refreshActionState]);

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
  const actionButtons = buildPlaceActionButtons(id, actionState, isActionBusy);

  async function runAction(actionId: "save" | "visit" | "block" | "report") {
    if (actionId === "report") {
      return;
    }

    const previousState = actionState;
    const isSaved = previousState.savedPlaceIds.includes(id);
    const isBlocked = previousState.blockedPlaceIds.includes(id);

    setActionError(undefined);
    setActionMessage(undefined);
    setIsActionBusy(true);

    try {
      if (actionId === "save") {
        const nextSaved = !isSaved;
        setActionState({
          ...previousState,
          savedPlaceIds: toggleId(previousState.savedPlaceIds, id, nextSaved),
        });
        await actionsRepository.setSaved(id, nextSaved);
        setActionMessage(nextSaved ? "Saved." : "Removed from saved.");
      }

      if (actionId === "visit") {
        setActionState({
          ...previousState,
          visitedPlaceIds: toggleId(previousState.visitedPlaceIds, id, true),
        });
        await actionsRepository.markVisited(id);
        setActionMessage("Marked visited.");
      }

      if (actionId === "block") {
        const nextBlocked = !isBlocked;
        setActionState({
          ...previousState,
          blockedPlaceIds: toggleId(
            previousState.blockedPlaceIds,
            id,
            nextBlocked,
          ),
        });
        await actionsRepository.setBlocked(id, nextBlocked);
        setActionMessage(
          nextBlocked
            ? "This place will be hidden from local recommendations."
            : "This place can be recommended again.",
        );
      }

      refreshActionState();
    } catch {
      setActionState(previousState);
      setActionError("Action could not be saved. Try again.");
    } finally {
      setIsActionBusy(false);
    }
  }

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
          {actionButtons.map((action) => (
            <Button
              key={action.id}
              disabled={action.disabled}
              variant="secondary"
              accessibilityLabel={action.label}
              accessibilityHint={action.hint}
              onPress={() => {
                void runAction(action.id);
              }}
              style={styles.actionButton}
            >
              {action.label}
            </Button>
          ))}
        </View>
        {actionMessage === undefined ? null : (
          <ThemedText
            type="small"
            themeColor="textSecondary"
            accessibilityLiveRegion="polite"
          >
            {actionMessage}
          </ThemedText>
        )}
        {actionError === undefined ? null : (
          <ThemedText
            type="smallBold"
            themeColor="danger"
            accessibilityRole="alert"
          >
            {actionError}
          </ThemedText>
        )}
        <ThemedText type="small" themeColor="textSecondary">
          Report incorrect data is added in TASK-025.
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

function toggleId(ids: string[], placeId: string, shouldInclude: boolean) {
  const uniqueIds = new Set(ids);

  if (shouldInclude) {
    uniqueIds.add(placeId);
  } else {
    uniqueIds.delete(placeId);
  }

  return Array.from(uniqueIds).sort();
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
