import { FamilyConstraints } from "@/domain/family/types";
import { PlaceCandidate } from "@/domain/place/types";
import {
  CandidateTravelEstimate,
  TravelEstimateMinutes,
} from "@/domain/travel/types";

export type SchedulePlannerInput = {
  constraints: FamilyConstraints;
  candidates: PlaceCandidate[];
  travelEstimates: CandidateTravelEstimate[];
  maxStops?: 1 | 2;
  activityBufferMinutes?: number;
};

export type ScheduledStop = {
  candidateId: string;
  placeName: string;
  travelFromPreviousMinutes: number;
  arriveAt: string;
  activityStartAt: string;
  activityEndAt: string;
  departAt: string;
};

export type SchedulePlan = {
  leaveAt: string;
  returnAt: string;
  returnTargetAt: string;
  bufferMinutes: number;
  stops: ScheduledStop[];
};

export type NoSchedulePlanReason =
  "NO_CANDIDATES" | "NO_KNOWN_TRAVEL_OR_DURATION" | "NO_FEASIBLE_PLAN";

export type SchedulePlanResult =
  | { status: "planned"; plan: SchedulePlan }
  | { status: "no_plan"; reason: NoSchedulePlanReason };

type StopBuildInput = {
  candidate: PlaceCandidate;
  earliestDeparture: number;
  travelFromPreviousMinutes: number;
  returnTravelMinutes: number;
  returnTarget: number;
  bufferMinutes: number;
};

const defaultBufferMinutes = 10;
const millisecondsPerMinute = 60 * 1000;

export function buildSchedulePlan(
  input: SchedulePlannerInput,
): SchedulePlanResult {
  if (input.candidates.length === 0) {
    return { status: "no_plan", reason: "NO_CANDIDATES" };
  }

  const maxStops = input.maxStops ?? 2;
  const bufferMinutes = input.activityBufferMinutes ?? defaultBufferMinutes;
  const travelByCandidateId = new Map(
    input.travelEstimates.map((estimate) => [
      estimate.candidateId,
      estimate.minutes,
    ]),
  );
  const candidatesWithKnownTiming = input.candidates.filter(
    (candidate) =>
      candidate.typicalVisitMinutes !== undefined &&
      getKnownTravelMinutes(travelByCandidateId.get(candidate.id)) !==
        undefined,
  );

  if (candidatesWithKnownTiming.length === 0) {
    return { status: "no_plan", reason: "NO_KNOWN_TRAVEL_OR_DURATION" };
  }

  const leaveAt = toTime(input.constraints.availableWindow.startAt);
  const returnTarget = getReturnTarget(input.constraints);
  const oneStopPlans: SchedulePlan[] = [];

  for (const firstCandidate of candidatesWithKnownTiming) {
    const firstTravel = getKnownTravelMinutes(
      travelByCandidateId.get(firstCandidate.id),
    );

    if (firstTravel === undefined) {
      continue;
    }

    const firstStop = buildStop({
      candidate: firstCandidate,
      earliestDeparture: leaveAt,
      travelFromPreviousMinutes: firstTravel,
      returnTravelMinutes: firstTravel,
      returnTarget,
      bufferMinutes,
    });

    if (firstStop === undefined) {
      continue;
    }

    const oneStopPlan = buildPlan({
      leaveAt,
      returnTarget,
      returnAt: toTime(firstStop.departAt) + minutesToMilliseconds(firstTravel),
      bufferMinutes,
      stops: [firstStop],
    });
    oneStopPlans.push(oneStopPlan);

    if (maxStops === 1) {
      return { status: "planned", plan: oneStopPlan };
    }

    for (const secondCandidate of candidatesWithKnownTiming) {
      if (secondCandidate.id === firstCandidate.id) {
        continue;
      }

      const secondTravel = getKnownTravelMinutes(
        travelByCandidateId.get(secondCandidate.id),
      );

      if (secondTravel === undefined) {
        continue;
      }

      const secondStop = buildStop({
        candidate: secondCandidate,
        earliestDeparture: toTime(firstStop.departAt),
        travelFromPreviousMinutes: Math.max(firstTravel, secondTravel),
        returnTravelMinutes: secondTravel,
        returnTarget,
        bufferMinutes,
      });

      if (secondStop !== undefined) {
        return {
          status: "planned",
          plan: buildPlan({
            leaveAt,
            returnTarget,
            returnAt:
              toTime(secondStop.departAt) + minutesToMilliseconds(secondTravel),
            bufferMinutes,
            stops: [firstStop, secondStop],
          }),
        };
      }
    }
  }

  if (oneStopPlans.length > 0) {
    return { status: "planned", plan: oneStopPlans[0] };
  }

  return { status: "no_plan", reason: "NO_FEASIBLE_PLAN" };
}

function buildStop(input: StopBuildInput): ScheduledStop | undefined {
  if (input.candidate.typicalVisitMinutes === undefined) {
    return undefined;
  }

  const arriveAt =
    input.earliestDeparture +
    minutesToMilliseconds(input.travelFromPreviousMinutes);
  const activityStart = findActivityStart(input.candidate, arriveAt);

  if (activityStart === undefined) {
    return undefined;
  }

  const activityEnd =
    activityStart + minutesToMilliseconds(input.candidate.typicalVisitMinutes);
  const departAt = activityEnd + minutesToMilliseconds(input.bufferMinutes);
  const returnAt = departAt + minutesToMilliseconds(input.returnTravelMinutes);

  if (returnAt > input.returnTarget) {
    return undefined;
  }

  return {
    candidateId: input.candidate.id,
    placeName: input.candidate.name,
    travelFromPreviousMinutes: input.travelFromPreviousMinutes,
    arriveAt: toIsoString(arriveAt),
    activityStartAt: toIsoString(activityStart),
    activityEndAt: toIsoString(activityEnd),
    departAt: toIsoString(departAt),
  };
}

function findActivityStart(
  candidate: PlaceCandidate,
  arriveAt: number,
): number | undefined {
  if (
    candidate.scheduleWindows === undefined ||
    candidate.scheduleWindows.length === 0
  ) {
    return arriveAt;
  }

  if (candidate.typicalVisitMinutes === undefined) {
    return undefined;
  }

  const visitDuration = minutesToMilliseconds(candidate.typicalVisitMinutes);

  for (const scheduleWindow of candidate.scheduleWindows) {
    const startAt = Math.max(arriveAt, toTime(scheduleWindow.startAt));
    const endAt = startAt + visitDuration;

    if (endAt <= toTime(scheduleWindow.endAt)) {
      return startAt;
    }
  }

  return undefined;
}

function buildPlan(input: {
  leaveAt: number;
  returnAt: number;
  returnTarget: number;
  bufferMinutes: number;
  stops: ScheduledStop[];
}): SchedulePlan {
  return {
    leaveAt: toIsoString(input.leaveAt),
    returnAt: toIsoString(input.returnAt),
    returnTargetAt: toIsoString(input.returnTarget),
    bufferMinutes: input.bufferMinutes,
    stops: input.stops,
  };
}

function getReturnTarget(constraints: FamilyConstraints): number {
  const availableEnd = toTime(constraints.availableWindow.endAt);

  if (constraints.napWindow === undefined) {
    return availableEnd;
  }

  return Math.min(availableEnd, toTime(constraints.napWindow.startAt));
}

function getKnownTravelMinutes(
  value: TravelEstimateMinutes | undefined,
): number | undefined {
  return value === undefined || value === "unknown" ? undefined : value;
}

function minutesToMilliseconds(minutes: number): number {
  return minutes * millisecondsPerMinute;
}

function toTime(value: string): number {
  return new Date(value).getTime();
}

function toIsoString(value: number): string {
  return new Date(value).toISOString();
}
