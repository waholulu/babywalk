import { FamilyConstraints } from "@/domain/family/types";
import { PlaceCandidate } from "@/domain/place/types";
import {
  Confidence,
  ReasonCode,
  reasonCodes,
  RecommendationResult,
  RecommendationWarning,
  ScoreComponent,
  scoreComponents,
  WarningCode,
  warningCodes,
} from "@/domain/recommendation/types";
import {
  CandidateTravelEstimate,
  TravelEstimateMinutes,
} from "@/domain/recommendation/hard-filters";
import { WeatherSnapshot } from "@/domain/weather/types";

export type RecommendationScoringInput = {
  constraints: FamilyConstraints;
  candidates: PlaceCandidate[];
  travelEstimates?: CandidateTravelEstimate[];
  weather?: WeatherSnapshot;
  visitedPlaceIds?: string[];
  membershipPlaceIds?: string[];
};

const componentMaximums = {
  age_activity_fit: 25,
  schedule_fit: 20,
  travel_convenience: 15,
  weather_fit: 15,
  budget_fit: 10,
  amenities_confidence: 5,
  novelty: 5,
  family_preference: 5,
} satisfies Record<ScoreComponent, number>;

type CandidateScoreContext = {
  constraints: FamilyConstraints;
  candidate: PlaceCandidate;
  travelMinutes: TravelEstimateMinutes;
  weather?: WeatherSnapshot;
  visitedPlaceIds: Set<string>;
  membershipPlaceIds: Set<string>;
};

type ComponentScore = {
  value: number;
  reasonCodes?: ReasonCode[];
  warningCodes?: WarningCode[];
};

const warningMessages = {
  VERIFY_HOURS: "Verify hours or event timing before leaving.",
  VERIFY_PRICE: "Verify current price before leaving.",
  VERIFY_AMENITIES: "Verify amenities before leaving.",
  WEATHER_UNCERTAIN: "Weather fit is uncertain.",
  TRAVEL_TIME_ESTIMATE: "Travel time is an estimate.",
  LIMITED_SOURCE_FRESHNESS: "Source freshness is limited.",
  UNKNOWN_AGE_FIT: "Age fit is unknown.",
} satisfies Record<WarningCode, string>;

const confidenceRank = {
  high: 0,
  medium: 1,
  low: 2,
} satisfies Record<Confidence, number>;

export function scoreRecommendations(
  input: RecommendationScoringInput,
): RecommendationResult[] {
  const travelByCandidateId = new Map(
    input.travelEstimates?.map((estimate) => [
      estimate.candidateId,
      estimate.minutes,
    ]),
  );
  const visitedPlaceIds = new Set(input.visitedPlaceIds ?? []);
  const membershipPlaceIds = new Set(input.membershipPlaceIds ?? []);

  return input.candidates
    .map((candidate) =>
      scoreCandidate({
        constraints: input.constraints,
        candidate,
        travelMinutes: travelByCandidateId.get(candidate.id) ?? "unknown",
        weather: input.weather,
        visitedPlaceIds,
        membershipPlaceIds,
      }),
    )
    .sort(compareRecommendationResults(input.candidates));
}

function scoreCandidate(context: CandidateScoreContext): RecommendationResult {
  const scoredComponents = {
    age_activity_fit: scoreAgeActivityFit(context),
    schedule_fit: scoreScheduleFit(context),
    travel_convenience: scoreTravelConvenience(context),
    weather_fit: scoreWeatherFit(context),
    budget_fit: scoreBudgetFit(context),
    amenities_confidence: scoreAmenitiesConfidence(context),
    novelty: scoreNovelty(context),
    family_preference: scoreFamilyPreference(context),
  } satisfies Record<ScoreComponent, ComponentScore>;

  const scoreBreakdown = scoreComponents.reduce(
    (breakdown, component) => ({
      ...breakdown,
      [component]: clampScore(
        scoredComponents[component].value,
        componentMaximums[component],
      ),
    }),
    {} as Record<ScoreComponent, number>,
  );

  const totalScore = scoreComponents.reduce(
    (total, component) => total + scoreBreakdown[component],
    0,
  );
  const resultReasonCodes = orderReasonCodes(
    collectCodes(scoredComponents, "reasonCodes"),
  );
  const warnings = buildWarnings([
    ...collectCodes(scoredComponents, "warningCodes"),
    ...scoreSourceFreshnessWarnings(context),
  ]);

  return {
    candidateId: context.candidate.id,
    totalScore,
    scoreBreakdown,
    reasonCodes: resultReasonCodes,
    warnings,
    confidence: calculateConfidence(warnings),
  };
}

function scoreAgeActivityFit(context: CandidateScoreContext): ComponentScore {
  const { candidate, constraints } = context;

  if (candidate.ageRangeMonths === "unknown") {
    return {
      value: 10 + scoreEnergyFit(candidate, constraints),
      warningCodes: ["UNKNOWN_AGE_FIT"],
    };
  }

  const { minMonths, maxMonths } = candidate.ageRangeMonths;
  const belowRange =
    minMonths !== undefined && constraints.childAgeMonths < minMonths;
  const aboveRange =
    maxMonths !== undefined && constraints.childAgeMonths > maxMonths;

  if (belowRange || aboveRange) {
    return { value: 0 };
  }

  return {
    value: 20 + scoreEnergyFit(candidate, constraints),
    reasonCodes: ["AGE_MATCH"],
  };
}

function scoreEnergyFit(
  candidate: PlaceCandidate,
  constraints: FamilyConstraints,
): number {
  if (constraints.energyLevel === "normal") {
    return 5;
  }

  const easyCategories = new Set([
    "library",
    "park",
    "waterfront",
    "community_center",
    "other",
  ]);
  const adventureCategories = new Set([
    "playground",
    "zoo",
    "farm",
    "park",
    "waterfront",
    "indoor_play",
  ]);

  if (
    constraints.energyLevel === "easy" &&
    easyCategories.has(candidate.category)
  ) {
    return 5;
  }

  if (
    constraints.energyLevel === "adventure" &&
    adventureCategories.has(candidate.category)
  ) {
    return 5;
  }

  return 3;
}

function scoreScheduleFit(context: CandidateScoreContext): ComponentScore {
  const { candidate, constraints, travelMinutes } = context;

  if (candidate.typicalVisitMinutes === undefined) {
    return { value: 8, warningCodes: ["VERIFY_HOURS"] };
  }

  const travel = travelMinutes === "unknown" ? 0 : travelMinutes;
  const canReturn =
    toTime(constraints.availableWindow.startAt) +
      minutesToMilliseconds(travel * 2 + candidate.typicalVisitMinutes) <=
    getReturnDeadline(constraints);

  if (!canReturn) {
    return { value: 4 };
  }

  if (
    candidate.scheduleWindows === undefined ||
    candidate.scheduleWindows.length === 0
  ) {
    return {
      value: 16,
      reasonCodes: ["HOME_BEFORE_NAP"],
      warningCodes: ["VERIFY_HOURS"],
    };
  }

  const fitsKnownSchedule = candidate.scheduleWindows.some((window) => {
    const activityStart = Math.max(
      toTime(constraints.availableWindow.startAt) +
        minutesToMilliseconds(travel),
      toTime(window.startAt),
    );
    const activityEnd =
      activityStart + minutesToMilliseconds(candidate.typicalVisitMinutes ?? 0);

    return (
      activityEnd <= toTime(window.endAt) &&
      activityEnd <=
        getReturnDeadline(constraints) - minutesToMilliseconds(travel)
    );
  });

  return fitsKnownSchedule
    ? { value: 20, reasonCodes: ["HOME_BEFORE_NAP"] }
    : { value: 6, warningCodes: ["VERIFY_HOURS"] };
}

function scoreTravelConvenience(
  context: CandidateScoreContext,
): ComponentScore {
  const { constraints, travelMinutes } = context;

  if (travelMinutes === "unknown") {
    return { value: 7, warningCodes: ["TRAVEL_TIME_ESTIMATE"] };
  }

  if (travelMinutes <= constraints.maxTravelMinutes / 2) {
    return { value: 15, reasonCodes: ["SHORT_DRIVE"] };
  }

  if (travelMinutes <= constraints.maxTravelMinutes) {
    return { value: 11 };
  }

  return { value: 0 };
}

function scoreWeatherFit(context: CandidateScoreContext): ComponentScore {
  const { candidate, weather } = context;

  if (weather === undefined || weather.outdoorFriendly === "unknown") {
    return { value: 8, warningCodes: ["WEATHER_UNCERTAIN"] };
  }

  if (candidate.indoorOutdoor === "unknown") {
    return { value: 8, warningCodes: ["WEATHER_UNCERTAIN"] };
  }

  if (candidate.indoorOutdoor === "mixed") {
    return { value: 15, reasonCodes: ["WEATHER_MATCH"] };
  }

  if (weather.outdoorFriendly && candidate.indoorOutdoor === "outdoor") {
    return { value: 15, reasonCodes: ["WEATHER_MATCH"] };
  }

  if (!weather.outdoorFriendly && candidate.indoorOutdoor === "indoor") {
    return { value: 15, reasonCodes: ["WEATHER_MATCH"] };
  }

  return { value: candidate.indoorOutdoor === "indoor" ? 12 : 3 };
}

function scoreBudgetFit(context: CandidateScoreContext): ComponentScore {
  const { candidate, constraints } = context;

  if (candidate.price.band === "unknown") {
    return { value: 5, warningCodes: ["VERIFY_PRICE"] };
  }

  if (constraints.budget === "flexible") {
    return { value: 8 };
  }

  if (constraints.budget === "free") {
    return candidate.price.band === "free"
      ? { value: 10, reasonCodes: ["UNDER_BUDGET"] }
      : { value: 0 };
  }

  if (candidate.price.band === "free") {
    return { value: 10, reasonCodes: ["UNDER_BUDGET"] };
  }

  if (
    candidate.price.band === "under_30" &&
    (candidate.price.estimatedUsd === undefined ||
      candidate.price.estimatedUsd <= 30)
  ) {
    return { value: 10, reasonCodes: ["UNDER_BUDGET"] };
  }

  return { value: 0 };
}

function scoreAmenitiesConfidence(
  context: CandidateScoreContext,
): ComponentScore {
  const { amenities } = context.candidate;
  const values = [
    amenities.strollerFriendly,
    amenities.bathroomAvailable,
    amenities.parkingAvailable,
  ];
  const rawScore = values.reduce((total, value) => {
    if (value === true) {
      return total + 1;
    }

    if (value === "unknown") {
      return total + 0.5;
    }

    return total;
  }, 0);
  const hasUnknown = values.some((value) => value === "unknown");

  return {
    value: Math.round(
      (rawScore / values.length) * componentMaximums.amenities_confidence,
    ),
    warningCodes: hasUnknown ? ["VERIFY_AMENITIES"] : undefined,
  };
}

function scoreNovelty(context: CandidateScoreContext): ComponentScore {
  if (context.visitedPlaceIds.has(context.candidate.id)) {
    return { value: 0 };
  }

  return { value: 5, reasonCodes: ["NEW_TO_FAMILY"] };
}

function scoreFamilyPreference(context: CandidateScoreContext): ComponentScore {
  if (context.membershipPlaceIds.has(context.candidate.id)) {
    return { value: 5, reasonCodes: ["MEMBERSHIP_VALUE"] };
  }

  const interests = context.constraints.interests ?? [];

  if (interests.length === 0) {
    return { value: 3 };
  }

  const normalizedCategory = context.candidate.category.replaceAll("_", " ");
  const normalizedName = context.candidate.name.toLocaleLowerCase();
  const hasInterestMatch = interests.some((interest) => {
    const normalizedInterest = interest.toLocaleLowerCase();

    return (
      normalizedCategory.includes(normalizedInterest) ||
      normalizedName.includes(normalizedInterest)
    );
  });

  return { value: hasInterestMatch ? 5 : 1 };
}

function scoreSourceFreshnessWarnings(
  context: CandidateScoreContext,
): WarningCode[] {
  return context.candidate.source.freshness === "stale" ||
    context.candidate.source.freshness === "unknown"
    ? ["LIMITED_SOURCE_FRESHNESS"]
    : [];
}

function collectCodes<Key extends "reasonCodes" | "warningCodes">(
  scoredComponents: Record<ScoreComponent, ComponentScore>,
  key: Key,
): NonNullable<ComponentScore[Key]> {
  return scoreComponents.flatMap(
    (component) => scoredComponents[component][key] ?? [],
  ) as NonNullable<ComponentScore[Key]>;
}

function orderReasonCodes(codes: ReasonCode[]): ReasonCode[] {
  return reasonCodes.filter((code) => codes.includes(code));
}

function buildWarnings(codes: WarningCode[]): RecommendationWarning[] {
  return warningCodes
    .filter((code) => codes.includes(code))
    .map((code) => ({
      code,
      message: warningMessages[code],
    }));
}

function calculateConfidence(warnings: RecommendationWarning[]): Confidence {
  if (warnings.length === 0) {
    return "high";
  }

  if (warnings.length <= 3) {
    return "medium";
  }

  return "low";
}

function compareRecommendationResults(candidates: PlaceCandidate[]) {
  const candidateById = new Map(
    candidates.map((candidate, index) => [candidate.id, { candidate, index }]),
  );

  return (
    first: RecommendationResult,
    second: RecommendationResult,
  ): number => {
    if (first.totalScore !== second.totalScore) {
      return second.totalScore - first.totalScore;
    }

    if (first.confidence !== second.confidence) {
      return (
        confidenceRank[first.confidence] - confidenceRank[second.confidence]
      );
    }

    if (first.warnings.length !== second.warnings.length) {
      return first.warnings.length - second.warnings.length;
    }

    const firstCandidate = candidateById.get(first.candidateId);
    const secondCandidate = candidateById.get(second.candidateId);
    const nameComparison =
      firstCandidate?.candidate.name.localeCompare(
        secondCandidate?.candidate.name ?? "",
      ) ?? 0;

    if (nameComparison !== 0) {
      return nameComparison;
    }

    return (firstCandidate?.index ?? 0) - (secondCandidate?.index ?? 0);
  };
}

function clampScore(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function getReturnDeadline(constraints: FamilyConstraints): number {
  const availableEnd = toTime(constraints.availableWindow.endAt);

  if (constraints.napWindow === undefined) {
    return availableEnd;
  }

  return Math.min(availableEnd, toTime(constraints.napWindow.startAt));
}

function minutesToMilliseconds(minutes: number): number {
  return minutes * 60 * 1000;
}

function toTime(value: string): number {
  return new Date(value).getTime();
}
