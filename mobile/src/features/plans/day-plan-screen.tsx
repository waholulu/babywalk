import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  Button,
  Card,
  Chip,
  ErrorState,
  ScreenContainer,
} from "@/components/ui";
import { Radii, Spacing } from "@/constants/theme";
import { buildLocalDayPlan, DayPlanModel } from "./day-plan";

type DayPlanScreenProps = {
  id: string;
};

export function DayPlanScreen({ id }: DayPlanScreenProps) {
  const result = buildLocalDayPlan(id);

  if (result.status === "unavailable") {
    return (
      <ScreenContainer>
        <ErrorState
          title="Plan unavailable"
          message={result.message}
          actionLabel="Modify constraints"
        />
        <Link href="/results" asChild>
          <Button variant="secondary">Back to results</Button>
        </Link>
        <Link href="/" asChild>
          <Button variant="ghost">Modify constraints</Button>
        </Link>
      </ScreenContainer>
    );
  }

  return <ReadyDayPlan plan={result.plan} />;
}

function ReadyDayPlan({ plan }: { plan: DayPlanModel }) {
  return (
    <ScreenContainer>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold" themeColor="primary">
          Day plan
        </ThemedText>
        <ThemedText type="title">{plan.title}</ThemedText>
        <ThemedText themeColor="textSecondary">{plan.summary}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Plan id: {plan.id} • Source: {plan.sourceLabel}
        </ThemedText>
      </ThemedView>

      <View style={styles.actionRow}>
        <Link href="/results" asChild>
          <Button variant="secondary" style={styles.actionButton}>
            Back to results
          </Button>
        </Link>
        <Link href="/" asChild>
          <Button variant="ghost" style={styles.actionButton}>
            Modify constraints
          </Button>
        </Link>
      </View>

      <View style={styles.timeline}>
        {plan.timeline.map((item, index) => (
          <TimelineItem
            key={`${item.label}-${item.time}`}
            item={item}
            isLast={index === plan.timeline.length - 1}
          />
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Stops</ThemedText>
        {plan.stops.map((stop) => (
          <Card key={stop.candidateId}>
            <View style={styles.cardHeader}>
              <View style={styles.titleBlock}>
                <ThemedText type="bodyBold">{stop.placeName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {stop.categoryLabel} • {stop.areaLabel}
                </ThemedText>
              </View>
              <Chip selected>{stop.scoreLabel}</Chip>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {stop.travelLabel}
            </ThemedText>
          </Card>
        ))}
      </View>

      <InfoSection title="Assumptions" items={plan.assumptions} />

      {plan.backup === null ? null : (
        <Card>
          <ThemedText type="smallBold">Backup</ThemedText>
          <ThemedText type="bodyBold">{plan.backup.placeName}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {plan.backup.reason}
          </ThemedText>
        </Card>
      )}

      <InfoSection
        title="Verify before leaving"
        items={plan.verificationWarnings}
        warning
      />
    </ScreenContainer>
  );
}

function TimelineItem({
  item,
  isLast,
}: {
  item: DayPlanModel["timeline"][number];
  isLast: boolean;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.markerColumn}>
        <ThemedView type="primary" style={styles.marker} />
        {isLast ? null : <ThemedView type="border" style={styles.markerLine} />}
      </View>
      <ThemedView type="backgroundElement" style={styles.timelineContent}>
        <ThemedText type="smallBold" themeColor="primary">
          {item.time}
        </ThemedText>
        <ThemedText type="bodyBold">{item.label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {item.detail}
        </ThemedText>
      </ThemedView>
    </View>
  );
}

function InfoSection({
  title,
  items,
  warning = false,
}: {
  title: string;
  items: string[];
  warning?: boolean;
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.infoSection}>
      <ThemedText type="smallBold" themeColor={warning ? "warning" : "text"}>
        {title}
      </ThemedText>
      {items.map((item) => (
        <ThemedText
          key={item}
          type="small"
          themeColor={warning ? "warning" : "textSecondary"}
        >
          {item}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    minWidth: 180,
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  markerColumn: {
    alignItems: "center",
    width: 20,
  },
  marker: {
    borderRadius: Radii.round,
    height: 14,
    marginTop: Spacing.three,
    width: 14,
  },
  markerLine: {
    flex: 1,
    minHeight: Spacing.four,
    width: 2,
  },
  timelineContent: {
    flex: 1,
    borderRadius: Radii.medium,
    gap: Spacing.one,
    marginBottom: Spacing.two,
    padding: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    minWidth: 200,
    gap: Spacing.one,
  },
  infoSection: {
    borderRadius: Radii.medium,
    gap: Spacing.two,
    padding: Spacing.three,
  },
});
