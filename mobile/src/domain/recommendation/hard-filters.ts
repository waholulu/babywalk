import { FamilyConstraints } from "@/domain/family/types";
import { PlaceCandidate } from "@/domain/place/types";

export const hardFilterCodes = [
  "AGE_OUT_OF_RANGE",
  "SCHEDULE_CONFLICT",
  "TRAVEL_TOO_FAR",
  "OVER_BUDGET",
  "INDOOR_OUTDOOR_MISMATCH",
  "BLOCKED_PLACE",
  "RETURN_TIME_IMPOSSIBLE",
] as const;

export type HardFilterCode = (typeof hardFilterCodes)[number];

export type TravelEstimateMinutes = number | "unknown";

export type CandidateTravelEstimate = {
  candidateId: string;
  minutes: TravelEstimateMinutes;
};

export type HardFilterInput = {
  constraints: FamilyConstraints;
  candidates: PlaceCandidate[];
  travelEstimates?: CandidateTravelEstimate[];
};

export type HardFilterExclusion = {
  candidateId: string;
  codes: HardFilterCode[];
};

export type HardFilterResult = {
  included: PlaceCandidate[];
  excluded: HardFilterExclusion[];
};

type Rule = {
  code: HardFilterCode;
  excludes: (
    candidate: PlaceCandidate,
    constraints: FamilyConstraints,
    travelMinutes: TravelEstimateMinutes,
  ) => boolean;
};

const millisecondsPerMinute = 60 * 1000;

const rules: Rule[] = [
  {
    code: "AGE_OUT_OF_RANGE",
    excludes: (candidate, constraints) =>
      isAgeOutOfRange(candidate, constraints),
  },
  {
    code: "SCHEDULE_CONFLICT",
    excludes: (candidate, constraints, travelMinutes) =>
      hasScheduleConflict(candidate, constraints, travelMinutes),
  },
  {
    code: "TRAVEL_TOO_FAR",
    excludes: (_candidate, constraints, travelMinutes) =>
      travelMinutes !== "unknown" &&
      travelMinutes > constraints.maxTravelMinutes,
  },
  {
    code: "OVER_BUDGET",
    excludes: (candidate, constraints) => isOverBudget(candidate, constraints),
  },
  {
    code: "INDOOR_OUTDOOR_MISMATCH",
    excludes: (candidate, constraints) =>
      isIndoorOutdoorMismatch(candidate, constraints),
  },
  {
    code: "BLOCKED_PLACE",
    excludes: (candidate, constraints) =>
      constraints.blockedPlaceIds?.includes(candidate.id) ?? false,
  },
  {
    code: "RETURN_TIME_IMPOSSIBLE",
    excludes: (candidate, constraints, travelMinutes) =>
      cannotReturnOnTime(candidate, constraints, travelMinutes),
  },
];

export function applyHardFilters(input: HardFilterInput): HardFilterResult {
  const travelByCandidateId = new Map(
    input.travelEstimates?.map((estimate) => [
      estimate.candidateId,
      estimate.minutes,
    ]),
  );

  const included: PlaceCandidate[] = [];
  const excluded: HardFilterExclusion[] = [];

  for (const candidate of input.candidates) {
    const travelMinutes = travelByCandidateId.get(candidate.id) ?? "unknown";
    const codes = rules
      .filter((rule) =>
        rule.excludes(candidate, input.constraints, travelMinutes),
      )
      .map((rule) => rule.code);

    if (codes.length === 0) {
      included.push(candidate);
    } else {
      excluded.push({ candidateId: candidate.id, codes });
    }
  }

  return { included, excluded };
}

function isAgeOutOfRange(
  candidate: PlaceCandidate,
  constraints: FamilyConstraints,
): boolean {
  if (candidate.ageRangeMonths === "unknown") {
    return false;
  }

  const { minMonths, maxMonths } = candidate.ageRangeMonths;

  if (minMonths !== undefined && constraints.childAgeMonths < minMonths) {
    return true;
  }

  if (maxMonths !== undefined && constraints.childAgeMonths > maxMonths) {
    return true;
  }

  return false;
}

function isOverBudget(
  candidate: PlaceCandidate,
  constraints: FamilyConstraints,
): boolean {
  if (constraints.budget === "flexible" || candidate.price.band === "unknown") {
    return false;
  }

  if (constraints.budget === "free") {
    return candidate.price.band !== "free";
  }

  if (candidate.price.band === "paid") {
    return true;
  }

  return (
    candidate.price.band === "under_30" &&
    candidate.price.estimatedUsd !== undefined &&
    candidate.price.estimatedUsd > 30
  );
}

function isIndoorOutdoorMismatch(
  candidate: PlaceCandidate,
  constraints: FamilyConstraints,
): boolean {
  if (
    constraints.indoorOutdoor === "either" ||
    candidate.indoorOutdoor === "mixed" ||
    candidate.indoorOutdoor === "unknown"
  ) {
    return false;
  }

  return candidate.indoorOutdoor !== constraints.indoorOutdoor;
}

function cannotReturnOnTime(
  candidate: PlaceCandidate,
  constraints: FamilyConstraints,
  travelMinutes: TravelEstimateMinutes,
): boolean {
  if (
    candidate.typicalVisitMinutes === undefined ||
    travelMinutes === "unknown"
  ) {
    return false;
  }

  const availableStart = toTime(constraints.availableWindow.startAt);
  const returnBy = getReturnDeadline(constraints);
  const tripEnd =
    availableStart +
    minutesToMilliseconds(travelMinutes * 2 + candidate.typicalVisitMinutes);

  return tripEnd > returnBy;
}

function hasScheduleConflict(
  candidate: PlaceCandidate,
  constraints: FamilyConstraints,
  travelMinutes: TravelEstimateMinutes,
): boolean {
  if (
    candidate.typicalVisitMinutes === undefined ||
    candidate.scheduleWindows === undefined ||
    candidate.scheduleWindows.length === 0
  ) {
    return false;
  }

  const outboundTravel = travelMinutes === "unknown" ? 0 : travelMinutes;
  const returnTravel = travelMinutes === "unknown" ? 0 : travelMinutes;
  const availableStart =
    toTime(constraints.availableWindow.startAt) +
    minutesToMilliseconds(outboundTravel);
  const latestActivityEnd =
    getReturnDeadline(constraints) - minutesToMilliseconds(returnTravel);
  const visitDuration = minutesToMilliseconds(candidate.typicalVisitMinutes);

  return !candidate.scheduleWindows.some((scheduleWindow) => {
    const activityStart = Math.max(
      availableStart,
      toTime(scheduleWindow.startAt),
    );
    const activityEnd = activityStart + visitDuration;

    return (
      activityEnd <= toTime(scheduleWindow.endAt) &&
      activityEnd <= latestActivityEnd
    );
  });
}

function getReturnDeadline(constraints: FamilyConstraints): number {
  const availableEnd = toTime(constraints.availableWindow.endAt);

  if (constraints.napWindow === undefined) {
    return availableEnd;
  }

  return Math.min(availableEnd, toTime(constraints.napWindow.startAt));
}

function minutesToMilliseconds(minutes: number): number {
  return minutes * millisecondsPerMinute;
}

function toTime(value: string): number {
  return new Date(value).getTime();
}
