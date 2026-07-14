import {
  FamilyConstraints,
  PlaceCandidate,
  scoreRecommendations,
  WeatherSnapshot,
} from "@/domain";
import { mockPlaceCandidates } from "@/data/fixtures";

const baseConstraints: FamilyConstraints = {
  childAgeMonths: 30,
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
  maxTravelMinutes: 25,
  budget: "under_30",
  indoorOutdoor: "either",
  energyLevel: "normal",
  interests: ["museum", "story"],
};

const rainyWeather: WeatherSnapshot = {
  observedAt: "2026-07-15T08:00:00-04:00",
  condition: "rain",
  temperatureF: 72,
  precipitationChancePercent: 80,
  outdoorFriendly: false,
  source: {
    label: "Test weather fixture",
    freshness: "recent",
  },
};

function fixture(id: string): PlaceCandidate {
  const candidate = mockPlaceCandidates.find((item) => item.id === id);

  if (candidate === undefined) {
    throw new Error(`Missing fixture candidate: ${id}`);
  }

  return candidate;
}

describe("scoreRecommendations", () => {
  it("returns complete deterministic score breakdowns for fixture candidates", () => {
    const results = scoreRecommendations({
      constraints: baseConstraints,
      weather: rainyWeather,
      candidates: [
        fixture("hoboken-story-room-fixture"),
        fixture("montclair-art-play-space-fixture"),
        fixture("jersey-city-riverside-playground-fixture"),
        fixture("fort-lee-nature-room-fixture"),
      ],
      travelEstimates: [
        { candidateId: "hoboken-story-room-fixture", minutes: 12 },
        { candidateId: "montclair-art-play-space-fixture", minutes: 24 },
        {
          candidateId: "jersey-city-riverside-playground-fixture",
          minutes: 10,
        },
        { candidateId: "fort-lee-nature-room-fixture", minutes: "unknown" },
      ],
      visitedPlaceIds: ["jersey-city-riverside-playground-fixture"],
      membershipPlaceIds: ["montclair-art-play-space-fixture"],
    });

    expect(results).toMatchSnapshot();
  });

  it("orders equal scores by candidate name before original input order", () => {
    const baseCandidate = fixture("paramus-weatherproof-walk-fixture");
    const alpha = { ...baseCandidate, id: "alpha", name: "Alpha Place" };
    const beta = { ...baseCandidate, id: "beta", name: "Beta Place" };

    const results = scoreRecommendations({
      constraints: { ...baseConstraints, interests: undefined },
      candidates: [beta, alpha],
      weather: rainyWeather,
    });

    expect(results.map((result) => result.candidateId)).toEqual([
      "alpha",
      "beta",
    ]);
  });
});
