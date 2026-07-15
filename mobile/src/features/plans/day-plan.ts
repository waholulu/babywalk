import { buildSchedulePlan, RecommendationWarning } from "@/domain";
import {
  buildLocalRecommendations,
  defaultLocalRecommendationConstraints,
  defaultTravelEstimates,
  RecommendationCardModel,
} from "@/features/recommendations/local-recommendations";

export type DayPlanTimelineItem = {
  label: string;
  time: string;
  detail: string;
  placeId?: string;
};

export type DayPlanStopModel = {
  candidateId: string;
  placeName: string;
  categoryLabel: string;
  areaLabel: string;
  scoreLabel: string;
  travelLabel: string;
};

export type DayPlanBackupModel = {
  candidateId: string;
  placeName: string;
  reason: string;
};

export type DayPlanModel = {
  id: string;
  title: string;
  summary: string;
  timeline: DayPlanTimelineItem[];
  stops: DayPlanStopModel[];
  assumptions: string[];
  backup: DayPlanBackupModel | null;
  verificationWarnings: string[];
  sourceLabel: string;
};

export type DayPlanBuildResult =
  | { status: "ready"; plan: DayPlanModel }
  | { status: "unavailable"; message: string };

export function buildLocalDayPlan(planId: string): DayPlanBuildResult {
  const recommendations = buildLocalRecommendations();
  const planResult = buildSchedulePlan({
    constraints: defaultLocalRecommendationConstraints,
    candidates: recommendations.cards.map((card) => card.candidate),
    travelEstimates: defaultTravelEstimates,
    activityBufferMinutes: 10,
    maxStops: 2,
  });

  if (planResult.status === "no_plan") {
    return {
      status: "unavailable",
      message:
        "A feasible local plan could not be built from the current recommendations.",
    };
  }

  const plannedIds = new Set(
    planResult.plan.stops.map((stop) => stop.candidateId),
  );
  const backupCard =
    recommendations.cards.find((card) => !plannedIds.has(card.candidate.id)) ??
    null;

  return {
    status: "ready",
    plan: {
      id: planId,
      title: "Morning plan",
      summary: `${planResult.plan.stops.length} stops, home by ${formatTime(
        planResult.plan.returnAt,
      )}`,
      timeline: buildTimeline(planResult.plan),
      stops: planResult.plan.stops.map((stop) =>
        buildStopModel(
          stop.candidateId,
          recommendations.cards,
          stop.travelFromPreviousMinutes,
        ),
      ),
      assumptions: [
        `Start from ${getDefaultAreaLabel()}.`,
        `Use ${planResult.plan.bufferMinutes} minutes of buffer after each stop.`,
        `Return target is ${formatTime(planResult.plan.returnTargetAt)} so the plan does not push into nap or the available window.`,
        "Travel times are estimates from local fixture data, not live traffic.",
      ],
      backup: backupCard === null ? null : buildBackupModel(backupCard),
      verificationWarnings: buildVerificationWarnings(recommendations.cards),
      sourceLabel: recommendations.sourceLabel,
    },
  };
}

function getDefaultAreaLabel(): string {
  const { location } = defaultLocalRecommendationConstraints;

  if (location.kind === "current_location") {
    return "current location";
  }

  return location.area.label;
}

function buildTimeline(
  plan: Extract<
    ReturnType<typeof buildSchedulePlan>,
    { status: "planned" }
  >["plan"],
): DayPlanTimelineItem[] {
  const timeline: DayPlanTimelineItem[] = [
    {
      label: "Leave home",
      time: formatTime(plan.leaveAt),
      detail: "Start with enough room for the travel estimate.",
    },
  ];

  for (const stop of plan.stops) {
    timeline.push({
      label: `Arrive at ${stop.placeName}`,
      time: formatTime(stop.arriveAt),
      detail: `Travel estimate: ${stop.travelFromPreviousMinutes} minutes.`,
      placeId: stop.candidateId,
    });
    timeline.push({
      label: `Activity at ${stop.placeName}`,
      time: `${formatTime(stop.activityStartAt)}-${formatTime(
        stop.activityEndAt,
      )}`,
      detail: "Planned activity window based on fixture visit duration.",
      placeId: stop.candidateId,
    });
    timeline.push({
      label: `Leave ${stop.placeName}`,
      time: formatTime(stop.departAt),
      detail: "Includes the plan buffer before moving on.",
      placeId: stop.candidateId,
    });
  }

  timeline.push({
    label: "Back home",
    time: formatTime(plan.returnAt),
    detail: `Before the ${formatTime(plan.returnTargetAt)} return target.`,
  });

  return timeline;
}

function buildStopModel(
  candidateId: string,
  cards: RecommendationCardModel[],
  travelFromPreviousMinutes: number,
): DayPlanStopModel {
  const card = cards.find((item) => item.candidate.id === candidateId);

  if (card === undefined) {
    throw new Error(`Missing day-plan card for candidate: ${candidateId}`);
  }

  return {
    candidateId,
    placeName: card.candidate.name,
    categoryLabel: card.candidate.category.replaceAll("_", " "),
    areaLabel: card.candidate.area.label,
    scoreLabel: `${card.result.totalScore} score`,
    travelLabel: `${travelFromPreviousMinutes} min from previous step`,
  };
}

function buildBackupModel(card: RecommendationCardModel): DayPlanBackupModel {
  return {
    candidateId: card.candidate.id,
    placeName: card.candidate.name,
    reason:
      card.warnings.length > 0
        ? "Backup if timing, weather, or details need a change."
        : "Backup from the next strongest recommendation.",
  };
}

function buildVerificationWarnings(cards: RecommendationCardModel[]): string[] {
  const warnings = new Map<string, RecommendationWarning>();

  for (const card of cards) {
    for (const warning of card.warnings) {
      warnings.set(warning.code, warning);
    }
  }

  const messages = Array.from(warnings.values()).map(
    (warning) => warning.message,
  );

  return [
    ...messages,
    "Check official hours, weather, transit, and any fees before leaving.",
  ];
}

function formatTime(value: string): string {
  return timeFormatter.format(new Date(value));
}

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});
