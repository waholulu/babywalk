import { Link } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  Button,
  Card,
  Chip,
  ErrorState,
  LoadingState,
  ScreenContainer,
} from "@/components/ui";
import { Radii, Spacing } from "@/constants/theme";
import {
  createLocalPlaceActionsRepository,
  createPlaceRepository,
  createWeatherRepository,
} from "@/data/repositories";
import { readClientEnv } from "@/lib/env";
import {
  buildRepositoryRecommendations,
  LocalRecommendationBuildResult,
  RecommendationCardModel,
} from "./local-recommendations";
import {
  buildScoreInspectorRows,
  shouldShowScoreInspector,
} from "./score-inspector";
import { buildPersonalizationFromPlaceActions } from "./personalization";

export function RecommendationResultsScreen() {
  const clientEnv = useMemo(() => readClientEnv(), []);
  const showInspector = shouldShowScoreInspector(clientEnv);
  const [recommendations, setRecommendations] =
    useState<LocalRecommendationBuildResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecommendations = useCallback(() => {
    if (!clientEnv.ok) {
      setRecommendations(null);
      setErrorMessage("Client configuration is invalid.");
      setIsLoading(false);
      return;
    }

    const repository = createPlaceRepository(clientEnv.value);
    const weatherRepository = createWeatherRepository(clientEnv.value);
    const actionsRepository = createLocalPlaceActionsRepository();
    const sourceLabel =
      clientEnv.value.placeDataSource === "supabase"
        ? "Supabase places"
        : "local fixtures";

    setIsLoading(true);
    setErrorMessage(null);

    void actionsRepository
      .getState()
      .then((actionState) =>
        buildRepositoryRecommendations(
          repository,
          sourceLabel,
          weatherRepository,
          buildPersonalizationFromPlaceActions(actionState),
        ),
      )
      .then((result) => {
        setRecommendations(result);
      })
      .catch(() => {
        setRecommendations(null);
        setErrorMessage(
          "Places could not be loaded. Check configuration and try again.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clientEnv]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return (
    <ScreenContainer>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold" themeColor="primary">
          Results
        </ThemedText>
        <ThemedText type="title">Three outing ideas</ThemedText>
        <ThemedText themeColor="textSecondary">
          {recommendations === null
            ? "Loading outing ideas"
            : `${recommendations.cards.length} shown from ${recommendations.candidateCount} ${recommendations.sourceLabel}`}
        </ThemedText>
      </ThemedView>

      {isLoading ? <LoadingState message="Loading outing ideas" /> : null}

      {!isLoading && errorMessage !== null ? (
        <ErrorState
          title="Places unavailable"
          message={errorMessage}
          actionLabel="Retry"
          onAction={loadRecommendations}
        />
      ) : null}

      {!isLoading && recommendations !== null ? (
        <>
          <View style={styles.list}>
            {recommendations.cards.map((card) => (
              <RecommendationCard
                key={card.candidate.id}
                card={card}
                showInspector={showInspector}
              />
            ))}
          </View>

          <ThemedView type="backgroundElement" style={styles.pipelineNote}>
            <ThemedText type="smallBold">
              Deterministic recommendation pipeline
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {recommendations.excludedCount} candidates excluded by hard
              filters.
            </ThemedText>
            {showInspector ? (
              <View style={styles.exclusionList}>
                {recommendations.excluded.map((exclusion) => (
                  <ThemedText
                    key={exclusion.candidateId}
                    type="code"
                    themeColor="textSecondary"
                  >
                    {exclusion.candidateId}: {exclusion.codes.join(", ")}
                  </ThemedText>
                ))}
              </View>
            ) : null}
          </ThemedView>
        </>
      ) : null}

      <Link href="/" asChild>
        <Button variant="ghost">Back to home</Button>
      </Link>
    </ScreenContainer>
  );
}

function RecommendationCard({
  card,
  showInspector,
}: {
  card: RecommendationCardModel;
  showInspector: boolean;
}) {
  const { candidate, result } = card;

  return (
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <ThemedText type="subtitle">{candidate.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {candidate.category.replaceAll("_", " ")} • {candidate.area.label}
          </ThemedText>
        </View>
        <ThemedView type="background" style={styles.scoreBadge}>
          <ThemedText type="smallBold">{result.totalScore}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            score
          </ThemedText>
        </ThemedView>
      </View>

      <View style={styles.factGrid}>
        <Fact label="Travel" value={card.travelLabel} />
        <Fact label="Price" value={card.priceLabel} />
        <Fact label="Mode" value={candidate.indoorOutdoor} />
        <Fact label="Age" value={card.ageFitLabel} />
      </View>

      <CodeRow label="Reasons" values={card.reasonCodes} />
      <WarningList warnings={card.warnings} />

      <ThemedText type="small" themeColor="textSecondary">
        Source: {candidate.source.label} • {candidate.source.freshness}
      </ThemedText>

      {showInspector ? <ScoreInspector card={card} /> : null}

      <Link
        href={{ pathname: "/places/[id]", params: { id: candidate.id } }}
        asChild
      >
        <Button variant="secondary">Open place</Button>
      </Link>
    </Card>
  );
}

function ScoreInspector({ card }: { card: RecommendationCardModel }) {
  return (
    <ThemedView type="background" style={styles.inspector}>
      <ThemedText type="smallBold">Score inspector</ThemedText>
      {buildScoreInspectorRows(card).map((row) => (
        <View key={row.label} style={styles.inspectorRow}>
          <ThemedText type="code" themeColor="textSecondary">
            {row.label}
          </ThemedText>
          <ThemedText type="code">{row.value}</ThemedText>
        </View>
      ))}
      <ThemedText type="code" themeColor="textSecondary">
        confidence: {card.result.confidence}
      </ThemedText>
    </ThemedView>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="background" style={styles.fact}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </ThemedView>
  );
}

function CodeRow({ label, values }: { label: string; values: string[] }) {
  return (
    <View style={styles.codeSection}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.chipRow}>
        {values.map((value) => (
          <Chip key={value} selected>
            {value}
          </Chip>
        ))}
      </View>
    </View>
  );
}

function WarningList({
  warnings,
}: {
  warnings: RecommendationCardModel["warnings"];
}) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <View style={styles.codeSection}>
      <ThemedText type="smallBold" themeColor="warning">
        Verify
      </ThemedText>
      {warnings.map((warning) => (
        <ThemedText key={warning.code} type="small" themeColor="warning">
          {warning.code}: {warning.message}
        </ThemedText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  list: {
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    minWidth: 220,
    gap: Spacing.one,
  },
  scoreBadge: {
    minWidth: 72,
    borderRadius: Radii.medium,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  factGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  fact: {
    flex: 1,
    minWidth: 132,
    borderRadius: Radii.medium,
    gap: Spacing.one,
    padding: Spacing.two,
  },
  codeSection: {
    gap: Spacing.two,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  pipelineNote: {
    borderRadius: Radii.medium,
    gap: Spacing.one,
    padding: Spacing.three,
  },
  exclusionList: {
    gap: Spacing.one,
  },
  inspector: {
    borderRadius: Radii.medium,
    gap: Spacing.one,
    padding: Spacing.two,
  },
  inspectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
});
