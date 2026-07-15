import { buildSchedulePlan, FamilyConstraints, PlaceCandidate } from "@/domain";
import { CandidateTravelEstimate } from "@/domain/travel/types";

const constraints: FamilyConstraints = {
  childAgeMonths: 24,
  availableWindow: {
    startAt: "2026-07-15T13:00:00.000Z",
    endAt: "2026-07-15T17:00:00.000Z",
  },
  location: {
    kind: "manual_area",
    area: { label: "Jersey City, NJ" },
  },
  maxTravelMinutes: 30,
  budget: "under_30",
  indoorOutdoor: "either",
  energyLevel: "normal",
};

describe("buildSchedulePlan", () => {
  it("builds a two-stop plan without overlaps", () => {
    const result = buildSchedulePlan({
      constraints,
      candidates: [
        candidate({ id: "story", name: "Story", typicalVisitMinutes: 45 }),
        candidate({ id: "park", name: "Park", typicalVisitMinutes: 30 }),
      ],
      travelEstimates: [travel("story", 15), travel("park", 10)],
      activityBufferMinutes: 10,
    });

    expect(result).toEqual({
      status: "planned",
      plan: {
        leaveAt: "2026-07-15T13:00:00.000Z",
        returnAt: "2026-07-15T15:15:00.000Z",
        returnTargetAt: "2026-07-15T17:00:00.000Z",
        bufferMinutes: 10,
        stops: [
          {
            candidateId: "story",
            placeName: "Story",
            travelFromPreviousMinutes: 15,
            arriveAt: "2026-07-15T13:15:00.000Z",
            activityStartAt: "2026-07-15T13:15:00.000Z",
            activityEndAt: "2026-07-15T14:00:00.000Z",
            departAt: "2026-07-15T14:10:00.000Z",
          },
          {
            candidateId: "park",
            placeName: "Park",
            travelFromPreviousMinutes: 15,
            arriveAt: "2026-07-15T14:25:00.000Z",
            activityStartAt: "2026-07-15T14:25:00.000Z",
            activityEndAt: "2026-07-15T14:55:00.000Z",
            departAt: "2026-07-15T15:05:00.000Z",
          },
        ],
      },
    });

    if (result.status === "planned") {
      expect(Date.parse(result.plan.stops[0].departAt)).toBeLessThanOrEqual(
        Date.parse(result.plan.stops[1].arriveAt),
      );
    }
  });

  it("respects candidate schedule windows by delaying activity start", () => {
    const result = buildSchedulePlan({
      constraints,
      candidates: [
        candidate({
          id: "scheduled",
          typicalVisitMinutes: 30,
          scheduleWindows: [
            {
              startAt: "2026-07-15T14:00:00.000Z",
              endAt: "2026-07-15T15:00:00.000Z",
            },
          ],
        }),
      ],
      travelEstimates: [travel("scheduled", 15)],
    });

    expect(result).toEqual({
      status: "planned",
      plan: expect.objectContaining({
        stops: [
          expect.objectContaining({
            arriveAt: "2026-07-15T13:15:00.000Z",
            activityStartAt: "2026-07-15T14:00:00.000Z",
            activityEndAt: "2026-07-15T14:30:00.000Z",
          }),
        ],
      }),
    });
  });

  it("uses nap start as the return target", () => {
    const result = buildSchedulePlan({
      constraints: {
        ...constraints,
        napWindow: {
          startAt: "2026-07-15T15:00:00.000Z",
          endAt: "2026-07-15T16:00:00.000Z",
        },
      },
      candidates: [candidate({ id: "short", typicalVisitMinutes: 45 })],
      travelEstimates: [travel("short", 15)],
    });

    expect(result).toEqual({
      status: "planned",
      plan: expect.objectContaining({
        returnAt: "2026-07-15T14:25:00.000Z",
        returnTargetAt: "2026-07-15T15:00:00.000Z",
      }),
    });
  });

  it("returns no_plan when known candidates cannot fit", () => {
    const result = buildSchedulePlan({
      constraints: {
        ...constraints,
        availableWindow: {
          startAt: "2026-07-15T13:00:00.000Z",
          endAt: "2026-07-15T14:00:00.000Z",
        },
      },
      candidates: [candidate({ id: "long", typicalVisitMinutes: 60 })],
      travelEstimates: [travel("long", 30)],
    });

    expect(result).toEqual({
      status: "no_plan",
      reason: "NO_FEASIBLE_PLAN",
    });
  });

  it("returns no_plan when travel or visit duration is unknown", () => {
    expect(
      buildSchedulePlan({
        constraints,
        candidates: [candidate({ id: "unknown-travel" })],
        travelEstimates: [
          { candidateId: "unknown-travel", minutes: "unknown" },
        ],
      }),
    ).toEqual({
      status: "no_plan",
      reason: "NO_KNOWN_TRAVEL_OR_DURATION",
    });
  });
});

function candidate(overrides: Partial<PlaceCandidate>): PlaceCandidate {
  return {
    id: "story",
    name: "Story",
    category: "library",
    area: { label: "Hoboken, NJ" },
    ageRangeMonths: { minMonths: 6, maxMonths: 48 },
    typicalVisitMinutes: 45,
    price: { band: "free" },
    indoorOutdoor: "indoor",
    amenities: {
      strollerFriendly: true,
      bathroomAvailable: true,
      parkingAvailable: "unknown",
    },
    source: {
      label: "test",
      freshness: "verified",
    },
    ...overrides,
  };
}

function travel(
  candidateId: string,
  minutes: CandidateTravelEstimate["minutes"],
): CandidateTravelEstimate {
  return { candidateId, minutes };
}
