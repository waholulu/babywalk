import {
  applyHardFilters,
  CandidateTravelEstimate,
  FamilyConstraints,
  HardFilterExclusion,
  PlaceCandidate,
  RecommendationResult,
  RecommendationWarning,
  ReasonCode,
  scoreRecommendations,
  selectDiverseRecommendations,
  TravelEstimateMinutes,
  WeatherSnapshot,
} from "@/domain";
import { mockPlaceCandidates } from "@/data/fixtures";
import { PlaceRepository } from "@/data/repositories";

export type RecommendationCardModel = {
  candidate: PlaceCandidate;
  result: RecommendationResult;
  travelMinutes: TravelEstimateMinutes;
  travelLabel: string;
  ageFitLabel: string;
  priceLabel: string;
  reasonCodes: ReasonCode[];
  warnings: RecommendationWarning[];
};

export type LocalRecommendationBuildResult = {
  cards: RecommendationCardModel[];
  excluded: HardFilterExclusion[];
  excludedCount: number;
  candidateCount: number;
  sourceLabel: string;
};

export const defaultLocalRecommendationConstraints: FamilyConstraints = {
  childAgeMonths: 24,
  availableWindow: {
    startAt: "2026-07-15T09:00:00-04:00",
    endAt: "2026-07-15T12:30:00-04:00",
  },
  napWindow: {
    startAt: "2026-07-15T14:00:00-04:00",
    endAt: "2026-07-15T15:30:00-04:00",
  },
  location: {
    kind: "manual_area",
    area: { label: "Jersey City, NJ", city: "Jersey City", region: "NJ" },
  },
  maxTravelMinutes: 25,
  budget: "under_30",
  indoorOutdoor: "either",
  energyLevel: "normal",
  strollerRequired: true,
  bathroomRequired: true,
  interests: ["story", "museum", "playground"],
};

export const defaultLocalWeather: WeatherSnapshot = {
  observedAt: "2026-07-15T08:00:00-04:00",
  condition: "rain",
  temperatureF: 72,
  precipitationChancePercent: 70,
  outdoorFriendly: false,
  source: {
    label: "SproutScout local weather fixture",
    retrievedAt: "2026-07-15T08:00:00-04:00",
    freshness: "recent",
  },
};

export const defaultTravelEstimates: CandidateTravelEstimate[] = [
  { candidateId: "hoboken-story-room-fixture", minutes: 12 },
  { candidateId: "jersey-city-riverside-playground-fixture", minutes: 10 },
  { candidateId: "montclair-art-play-space-fixture", minutes: 24 },
  { candidateId: "bronx-animal-loop-fixture", minutes: 55 },
  { candidateId: "bergen-farm-yard-fixture", minutes: 34 },
  { candidateId: "meadow-park-short-loop-fixture", minutes: 18 },
  { candidateId: "brooklyn-waterfront-stroll-fixture", minutes: 48 },
  { candidateId: "queens-indoor-play-lab-fixture", minutes: 46 },
  { candidateId: "newark-community-gym-fixture", minutes: 22 },
  { candidateId: "fort-lee-nature-room-fixture", minutes: 20 },
  { candidateId: "upper-west-toddler-museum-fixture", minutes: 52 },
  { candidateId: "maplewood-puppet-morning-fixture", minutes: 31 },
  { candidateId: "edgewater-ferry-watch-fixture", minutes: 18 },
  { candidateId: "union-city-splash-pad-fixture", minutes: 12 },
  { candidateId: "paramus-weatherproof-walk-fixture", minutes: 25 },
  { candidateId: "prospect-toddler-loop-fixture", minutes: 50 },
  { candidateId: "morristown-train-room-fixture", minutes: 44 },
  { candidateId: "soho-family-gallery-fixture", minutes: 42 },
];

export function buildLocalRecommendations(): LocalRecommendationBuildResult {
  return buildRecommendations(mockPlaceCandidates, "local fixtures");
}

export async function buildRepositoryRecommendations(
  repository: PlaceRepository,
  sourceLabel: string,
): Promise<LocalRecommendationBuildResult> {
  const candidates = await repository.listCandidates();
  return buildRecommendations(candidates, sourceLabel);
}

export function buildRecommendations(
  candidates: PlaceCandidate[],
  sourceLabel: string,
): LocalRecommendationBuildResult {
  const filtered = applyHardFilters({
    constraints: defaultLocalRecommendationConstraints,
    candidates,
    travelEstimates: defaultTravelEstimates,
  });
  const scoredResults = scoreRecommendations({
    constraints: defaultLocalRecommendationConstraints,
    candidates: filtered.included,
    travelEstimates: defaultTravelEstimates,
    weather: defaultLocalWeather,
  });
  const selectedResults = selectDiverseRecommendations({
    results: scoredResults,
    candidates: filtered.included,
    limit: 3,
  });

  return {
    candidateCount: candidates.length,
    excluded: filtered.excluded,
    excludedCount: filtered.excluded.length,
    sourceLabel,
    cards: selectedResults.map((result) =>
      buildCardModel(result, filtered.included),
    ),
  };
}

function buildCardModel(
  result: RecommendationResult,
  candidates: PlaceCandidate[],
): RecommendationCardModel {
  const candidate = findCandidate(result.candidateId, candidates);
  const travelMinutes = findTravelEstimate(candidate.id);

  return {
    candidate,
    result,
    travelMinutes,
    travelLabel:
      travelMinutes === "unknown"
        ? "Travel estimate unknown"
        : `${travelMinutes} min`,
    ageFitLabel: formatAgeFit(candidate),
    priceLabel: formatPrice(candidate),
    reasonCodes: result.reasonCodes.slice(0, 2),
    warnings: result.warnings.slice(0, 2),
  };
}

function findCandidate(
  candidateId: string,
  candidates: PlaceCandidate[],
): PlaceCandidate {
  const candidate = candidates.find((item) => item.id === candidateId);

  if (candidate === undefined) {
    throw new Error(`Missing candidate for recommendation: ${candidateId}`);
  }

  return candidate;
}

function findTravelEstimate(candidateId: string): TravelEstimateMinutes {
  return (
    defaultTravelEstimates.find(
      (estimate) => estimate.candidateId === candidateId,
    )?.minutes ?? "unknown"
  );
}

function formatAgeFit(candidate: PlaceCandidate): string {
  if (candidate.ageRangeMonths === "unknown") {
    return "Age fit unknown";
  }

  const { minMonths, maxMonths } = candidate.ageRangeMonths;

  if (minMonths !== undefined && maxMonths !== undefined) {
    return `${minMonths}-${maxMonths} months`;
  }

  if (minMonths !== undefined) {
    return `${minMonths}+ months`;
  }

  if (maxMonths !== undefined) {
    return `Up to ${maxMonths} months`;
  }

  return "All ages";
}

function formatPrice(candidate: PlaceCandidate): string {
  if (candidate.price.band === "free") {
    return "Free";
  }

  if (candidate.price.band === "under_30") {
    return candidate.price.estimatedUsd === undefined
      ? "Under $30"
      : `About $${candidate.price.estimatedUsd}`;
  }

  if (candidate.price.band === "paid") {
    return candidate.price.estimatedUsd === undefined
      ? "Paid"
      : `About $${candidate.price.estimatedUsd}`;
  }

  return "Price unknown";
}
