import { Link } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button, Card, ErrorState, ScreenContainer } from "@/components/ui";
import { Radii, Spacing } from "@/constants/theme";
import {
  createInitialPlaceActionState,
  createLocalPlaceActionsRepository,
  createSupabasePlaceFeedbackRepository,
  PlaceActionState,
} from "@/data/repositories";
import { createSupabaseClient } from "@/lib/supabase";
import { readClientEnv } from "@/lib/env";
import { useTheme } from "@/hooks/use-theme";
import { buildPlaceActionButtons } from "./place-actions";
import { getPlaceDetailModel, PlaceDetailFact } from "./place-detail";
import {
  normalizeFeedbackDetails,
  placeFeedbackOptions,
  PlaceFeedbackType,
} from "./place-feedback";

type PlaceDetailScreenProps = {
  id: string;
};

export function PlaceDetailScreen({ id }: PlaceDetailScreenProps) {
  const theme = useTheme();
  const detail = getPlaceDetailModel(id);
  const actionsRepository = useMemo(
    () => createLocalPlaceActionsRepository(),
    [],
  );
  const feedbackRepository = useMemo(() => {
    const env = readClientEnv();

    if (!env.ok || env.value.supabase === undefined) {
      return undefined;
    }

    return createSupabasePlaceFeedbackRepository(
      createSupabaseClient(env.value.supabase),
    );
  }, []);
  const [actionState, setActionState] = useState<PlaceActionState>(
    createInitialPlaceActionState(),
  );
  const [actionMessage, setActionMessage] = useState<string | undefined>(
    undefined,
  );
  const [actionError, setActionError] = useState<string | undefined>(undefined);
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [isReportFormVisible, setIsReportFormVisible] = useState(false);
  const [feedbackType, setFeedbackType] =
    useState<PlaceFeedbackType>("incorrect_hours");
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | undefined>(
    undefined,
  );
  const [feedbackError, setFeedbackError] = useState<string | undefined>(
    undefined,
  );
  const [isFeedbackBusy, setIsFeedbackBusy] = useState(false);

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
      setIsReportFormVisible((visible) => !visible);
      setFeedbackMessage(undefined);
      setFeedbackError(undefined);
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

  async function submitFeedback() {
    setFeedbackError(undefined);
    setFeedbackMessage(undefined);

    if (feedbackRepository === undefined) {
      setFeedbackError(
        "Feedback needs staging Supabase configuration and sign-in.",
      );
      return;
    }

    setIsFeedbackBusy(true);

    try {
      const result = await feedbackRepository.submit({
        placeId: id,
        feedbackType,
        details: feedbackDetails,
      });

      if (result.ok) {
        setFeedbackDetails("");
        setFeedbackMessage("Thanks. Your report was sent for review.");
        return;
      }

      if (result.reason === "auth_required") {
        setFeedbackError("Sign in from Settings before sending feedback.");
      } else if (result.reason === "place_not_found") {
        setFeedbackError("This place is not available in the database yet.");
      } else {
        setFeedbackError("Feedback could not be sent. Try again.");
      }
    } catch {
      setFeedbackError("Feedback could not be sent. Try again.");
    } finally {
      setIsFeedbackBusy(false);
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
        {isReportFormVisible ? (
          <View style={styles.feedbackForm}>
            <ThemedText type="small" themeColor="textSecondary">
              Choose what looks wrong. Do not include private family details.
            </ThemedText>
            <View style={styles.feedbackOptions}>
              {placeFeedbackOptions.map((option) => (
                <Button
                  key={option.type}
                  variant={
                    option.type === feedbackType ? "primary" : "secondary"
                  }
                  disabled={isFeedbackBusy}
                  onPress={() => {
                    setFeedbackType(option.type);
                  }}
                  style={styles.feedbackOptionButton}
                >
                  {option.label}
                </Button>
              ))}
            </View>
            <TextInput
              accessibilityLabel="Feedback details"
              editable={!isFeedbackBusy}
              maxLength={2000}
              multiline
              onChangeText={setFeedbackDetails}
              placeholder="Optional details"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.feedbackInput,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.background,
                },
              ]}
              value={feedbackDetails}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {normalizeFeedbackDetails(feedbackDetails)?.length ?? 0}/2000
            </ThemedText>
            <Button
              disabled={isFeedbackBusy}
              onPress={() => {
                void submitFeedback();
              }}
            >
              {isFeedbackBusy ? "Sending..." : "Send report"}
            </Button>
          </View>
        ) : null}
        {feedbackMessage === undefined ? null : (
          <ThemedText
            type="small"
            themeColor="textSecondary"
            accessibilityLiveRegion="polite"
          >
            {feedbackMessage}
          </ThemedText>
        )}
        {feedbackError === undefined ? null : (
          <ThemedText
            type="smallBold"
            themeColor="danger"
            accessibilityRole="alert"
          >
            {feedbackError}
          </ThemedText>
        )}
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
  feedbackForm: {
    gap: Spacing.two,
  },
  feedbackOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  feedbackOptionButton: {
    flexGrow: 1,
    minWidth: 180,
  },
  feedbackInput: {
    minHeight: 96,
    borderRadius: Radii.medium,
    borderWidth: 1,
    padding: Spacing.two,
    textAlignVertical: "top",
  },
  navigation: {
    gap: Spacing.two,
  },
});
