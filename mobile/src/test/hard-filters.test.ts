import { applyHardFilters, FamilyConstraints, PlaceCandidate } from "@/domain";

const baseConstraints: FamilyConstraints = {
  childAgeMonths: 24,
  availableWindow: {
    startAt: "2026-07-15T09:00:00-04:00",
    endAt: "2026-07-15T12:00:00-04:00",
  },
  napWindow: {
    startAt: "2026-07-15T12:00:00-04:00",
    endAt: "2026-07-15T13:30:00-04:00",
  },
  location: {
    kind: "manual_area",
    area: { label: "Jersey City", city: "Jersey City", region: "NJ" },
  },
  maxTravelMinutes: 20,
  budget: "under_30",
  indoorOutdoor: "either",
  energyLevel: "normal",
};

const baseCandidate: PlaceCandidate = {
  id: "candidate-1",
  name: "Test Candidate",
  category: "library",
  area: { label: "Jersey City", city: "Jersey City", region: "NJ" },
  ageRangeMonths: { minMonths: 12, maxMonths: 36 },
  typicalVisitMinutes: 60,
  price: { band: "free" },
  indoorOutdoor: "indoor",
  amenities: {
    strollerFriendly: true,
    bathroomAvailable: true,
    parkingAvailable: "unknown",
  },
  source: {
    label: "Test fixture",
    freshness: "unknown",
  },
};

function candidate(overrides: Partial<PlaceCandidate>): PlaceCandidate {
  return {
    ...baseCandidate,
    ...overrides,
    price: overrides.price ?? baseCandidate.price,
    amenities: overrides.amenities ?? baseCandidate.amenities,
    source: overrides.source ?? baseCandidate.source,
  };
}

function constraints(overrides: Partial<FamilyConstraints>): FamilyConstraints {
  return {
    ...baseConstraints,
    ...overrides,
  };
}

describe("applyHardFilters", () => {
  it("keeps candidates when age is on inclusive boundaries or unknown", () => {
    const result = applyHardFilters({
      constraints: baseConstraints,
      candidates: [
        candidate({
          id: "boundary",
          ageRangeMonths: { minMonths: 24, maxMonths: 24 },
        }),
        candidate({ id: "unknown-age", ageRangeMonths: "unknown" }),
      ],
    });

    expect(result.included.map((item) => item.id)).toEqual([
      "boundary",
      "unknown-age",
    ]);
    expect(result.excluded).toEqual([]);
  });

  it("excludes candidates below or above a known age range", () => {
    const result = applyHardFilters({
      constraints: baseConstraints,
      candidates: [
        candidate({ id: "too-young", ageRangeMonths: { minMonths: 25 } }),
        candidate({ id: "too-old", ageRangeMonths: { maxMonths: 23 } }),
      ],
    });

    expect(result.excluded).toEqual([
      { candidateId: "too-young", codes: ["AGE_OUT_OF_RANGE"] },
      { candidateId: "too-old", codes: ["AGE_OUT_OF_RANGE"] },
    ]);
  });

  it("excludes known travel times over the limit but keeps boundary and unknown travel", () => {
    const result = applyHardFilters({
      constraints: baseConstraints,
      candidates: [
        candidate({ id: "at-limit" }),
        candidate({ id: "too-far" }),
        candidate({ id: "unknown-travel" }),
      ],
      travelEstimates: [
        { candidateId: "at-limit", minutes: 20 },
        { candidateId: "too-far", minutes: 21 },
        { candidateId: "unknown-travel", minutes: "unknown" },
      ],
    });

    expect(result.included.map((item) => item.id)).toEqual([
      "at-limit",
      "unknown-travel",
    ]);
    expect(result.excluded).toEqual([
      { candidateId: "too-far", codes: ["TRAVEL_TOO_FAR"] },
    ]);
  });

  it("applies budget filters while preserving unknown prices", () => {
    const result = applyHardFilters({
      constraints: constraints({ budget: "under_30" }),
      candidates: [
        candidate({
          id: "thirty",
          price: { band: "under_30", estimatedUsd: 30 },
        }),
        candidate({
          id: "over-thirty",
          price: { band: "under_30", estimatedUsd: 31 },
        }),
        candidate({ id: "paid", price: { band: "paid", estimatedUsd: 45 } }),
        candidate({ id: "unknown-price", price: { band: "unknown" } }),
      ],
    });

    expect(result.included.map((item) => item.id)).toEqual([
      "thirty",
      "unknown-price",
    ]);
    expect(result.excluded).toEqual([
      { candidateId: "over-thirty", codes: ["OVER_BUDGET"] },
      { candidateId: "paid", codes: ["OVER_BUDGET"] },
    ]);
  });

  it("requires free places only for a free budget unless price is unknown", () => {
    const result = applyHardFilters({
      constraints: constraints({ budget: "free" }),
      candidates: [
        candidate({ id: "free", price: { band: "free" } }),
        candidate({
          id: "under-30",
          price: { band: "under_30", estimatedUsd: 12 },
        }),
        candidate({ id: "unknown-price", price: { band: "unknown" } }),
      ],
    });

    expect(result.included.map((item) => item.id)).toEqual([
      "free",
      "unknown-price",
    ]);
    expect(result.excluded).toEqual([
      { candidateId: "under-30", codes: ["OVER_BUDGET"] },
    ]);
  });

  it("excludes indoor/outdoor mismatches but keeps mixed and unknown modes", () => {
    const result = applyHardFilters({
      constraints: constraints({ indoorOutdoor: "indoor" }),
      candidates: [
        candidate({ id: "indoor", indoorOutdoor: "indoor" }),
        candidate({ id: "outdoor", indoorOutdoor: "outdoor" }),
        candidate({ id: "mixed", indoorOutdoor: "mixed" }),
        candidate({ id: "unknown-mode", indoorOutdoor: "unknown" }),
      ],
    });

    expect(result.included.map((item) => item.id)).toEqual([
      "indoor",
      "mixed",
      "unknown-mode",
    ]);
    expect(result.excluded).toEqual([
      { candidateId: "outdoor", codes: ["INDOOR_OUTDOOR_MISMATCH"] },
    ]);
  });

  it("excludes blocked places", () => {
    const result = applyHardFilters({
      constraints: constraints({ blockedPlaceIds: ["blocked"] }),
      candidates: [candidate({ id: "blocked" }), candidate({ id: "open" })],
    });

    expect(result.included.map((item) => item.id)).toEqual(["open"]);
    expect(result.excluded).toEqual([
      { candidateId: "blocked", codes: ["BLOCKED_PLACE"] },
    ]);
  });

  it("excludes scheduled places without enough known open time", () => {
    const result = applyHardFilters({
      constraints: baseConstraints,
      candidates: [
        candidate({
          id: "fits",
          scheduleWindows: [
            {
              startAt: "2026-07-15T09:30:00-04:00",
              endAt: "2026-07-15T10:45:00-04:00",
            },
          ],
        }),
        candidate({
          id: "too-short",
          scheduleWindows: [
            {
              startAt: "2026-07-15T09:30:00-04:00",
              endAt: "2026-07-15T10:00:00-04:00",
            },
          ],
        }),
        candidate({ id: "unknown-schedule", scheduleWindows: undefined }),
      ],
    });

    expect(result.included.map((item) => item.id)).toEqual([
      "fits",
      "unknown-schedule",
    ]);
    expect(result.excluded).toEqual([
      { candidateId: "too-short", codes: ["SCHEDULE_CONFLICT"] },
    ]);
  });

  it("uses travel time when checking scheduled activity fit", () => {
    const result = applyHardFilters({
      constraints: baseConstraints,
      candidates: [
        candidate({
          id: "travel-still-fits",
          scheduleWindows: [
            {
              startAt: "2026-07-15T09:00:00-04:00",
              endAt: "2026-07-15T10:15:00-04:00",
            },
          ],
        }),
        candidate({
          id: "travel-breaks-fit",
          scheduleWindows: [
            {
              startAt: "2026-07-15T09:00:00-04:00",
              endAt: "2026-07-15T10:14:00-04:00",
            },
          ],
        }),
      ],
      travelEstimates: [
        { candidateId: "travel-still-fits", minutes: 15 },
        { candidateId: "travel-breaks-fit", minutes: 15 },
      ],
    });

    expect(result.included.map((item) => item.id)).toEqual([
      "travel-still-fits",
    ]);
    expect(result.excluded).toEqual([
      { candidateId: "travel-breaks-fit", codes: ["SCHEDULE_CONFLICT"] },
    ]);
  });

  it("excludes candidates that cannot return before the deadline", () => {
    const result = applyHardFilters({
      constraints: constraints({
        availableWindow: {
          startAt: "2026-07-15T09:00:00-04:00",
          endAt: "2026-07-15T11:00:00-04:00",
        },
        napWindow: undefined,
      }),
      candidates: [
        candidate({ id: "returns-at-boundary", typicalVisitMinutes: 80 }),
        candidate({ id: "returns-too-late", typicalVisitMinutes: 81 }),
        candidate({ id: "unknown-visit", typicalVisitMinutes: undefined }),
        candidate({ id: "unknown-travel", typicalVisitMinutes: 81 }),
      ],
      travelEstimates: [
        { candidateId: "returns-at-boundary", minutes: 20 },
        { candidateId: "returns-too-late", minutes: 20 },
        { candidateId: "unknown-visit", minutes: 20 },
        { candidateId: "unknown-travel", minutes: "unknown" },
      ],
    });

    expect(result.included.map((item) => item.id)).toEqual([
      "returns-at-boundary",
      "unknown-visit",
      "unknown-travel",
    ]);
    expect(result.excluded).toEqual([
      { candidateId: "returns-too-late", codes: ["RETURN_TIME_IMPOSSIBLE"] },
    ]);
  });

  it("returns every hard-filter code that applies to a candidate", () => {
    const result = applyHardFilters({
      constraints: constraints({
        childAgeMonths: 6,
        budget: "free",
        indoorOutdoor: "outdoor",
        blockedPlaceIds: ["bad-fit"],
      }),
      candidates: [
        candidate({
          id: "bad-fit",
          ageRangeMonths: { minMonths: 12 },
          price: { band: "paid", estimatedUsd: 50 },
          indoorOutdoor: "indoor",
        }),
      ],
      travelEstimates: [{ candidateId: "bad-fit", minutes: 45 }],
    });

    expect(result.excluded).toEqual([
      {
        candidateId: "bad-fit",
        codes: [
          "AGE_OUT_OF_RANGE",
          "TRAVEL_TOO_FAR",
          "OVER_BUDGET",
          "INDOOR_OUTDOOR_MISMATCH",
          "BLOCKED_PLACE",
        ],
      },
    ]);
  });
});
