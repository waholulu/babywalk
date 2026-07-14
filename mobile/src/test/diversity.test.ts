import {
  PlaceCandidate,
  RecommendationResult,
  scoreComponents,
  selectDiverseRecommendations,
} from "@/domain";

const baseCandidate: PlaceCandidate = {
  id: "base",
  name: "Base Place",
  category: "museum",
  area: { label: "Jersey City, NJ", city: "Jersey City", region: "NJ" },
  ageRangeMonths: { minMonths: 12, maxMonths: 72 },
  typicalVisitMinutes: 60,
  price: { band: "free" },
  indoorOutdoor: "indoor",
  amenities: {
    strollerFriendly: true,
    bathroomAvailable: true,
    parkingAvailable: true,
  },
  source: {
    label: "Test fixture",
    freshness: "recent",
  },
};

function candidate(overrides: Partial<PlaceCandidate>): PlaceCandidate {
  return {
    ...baseCandidate,
    ...overrides,
    area: overrides.area ?? baseCandidate.area,
    ageRangeMonths: overrides.ageRangeMonths ?? baseCandidate.ageRangeMonths,
    price: overrides.price ?? baseCandidate.price,
    amenities: overrides.amenities ?? baseCandidate.amenities,
    source: overrides.source ?? baseCandidate.source,
  };
}

function result(candidateId: string, totalScore: number): RecommendationResult {
  return {
    candidateId,
    totalScore,
    scoreBreakdown: scoreComponents.reduce(
      (breakdown, component) => ({
        ...breakdown,
        [component]: 0,
      }),
      {} as RecommendationResult["scoreBreakdown"],
    ),
    reasonCodes: [],
    warnings: [],
    confidence: "high",
  };
}

describe("selectDiverseRecommendations", () => {
  it("promotes a comparable category alternative ahead of a near-duplicate", () => {
    const candidates = [
      candidate({ id: "museum-a", name: "Museum A", category: "museum" }),
      candidate({ id: "museum-b", name: "Museum B", category: "museum" }),
      candidate({
        id: "park-a",
        name: "Park A",
        category: "park",
        area: { label: "Jersey City, NJ", city: "Jersey City", region: "NJ" },
      }),
      candidate({
        id: "library-a",
        name: "Library A",
        category: "library",
        area: { label: "Hoboken, NJ", city: "Hoboken", region: "NJ" },
      }),
    ];

    const selected = selectDiverseRecommendations({
      candidates,
      results: [
        result("museum-a", 100),
        result("museum-b", 98),
        result("park-a", 94),
        result("library-a", 80),
      ],
    });

    expect(selected.map((item) => item.candidateId)).toEqual([
      "museum-a",
      "park-a",
      "museum-b",
    ]);
  });

  it("promotes a comparable location alternative ahead of same-area results", () => {
    const candidates = [
      candidate({ id: "museum-jc", name: "Museum JC", category: "museum" }),
      candidate({
        id: "library-jc",
        name: "Library JC",
        category: "library",
      }),
      candidate({
        id: "library-hoboken",
        name: "Library Hoboken",
        category: "library",
        area: { label: "Hoboken, NJ", city: "Hoboken", region: "NJ" },
      }),
    ];

    const selected = selectDiverseRecommendations({
      candidates,
      results: [
        result("museum-jc", 100),
        result("library-jc", 98),
        result("library-hoboken", 95),
      ],
    });

    expect(selected.map((item) => item.candidateId)).toEqual([
      "museum-jc",
      "library-hoboken",
      "library-jc",
    ]);
  });

  it("preserves score order when diverse alternatives are not comparable", () => {
    const candidates = [
      candidate({ id: "museum-a", name: "Museum A", category: "museum" }),
      candidate({ id: "museum-b", name: "Museum B", category: "museum" }),
      candidate({
        id: "park-a",
        name: "Park A",
        category: "park",
        area: { label: "Hoboken, NJ", city: "Hoboken", region: "NJ" },
      }),
    ];

    const selected = selectDiverseRecommendations({
      candidates,
      comparableScoreGap: 10,
      results: [
        result("museum-a", 100),
        result("museum-b", 98),
        result("park-a", 87),
      ],
    });

    expect(selected.map((item) => item.candidateId)).toEqual([
      "museum-a",
      "museum-b",
      "park-a",
    ]);
  });
});
