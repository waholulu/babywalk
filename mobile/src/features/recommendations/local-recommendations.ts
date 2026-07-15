import {
  applyHardFilters,
  Coordinates,
  FamilyConstraints,
  HardFilterExclusion,
  PlaceCandidate,
  RecommendationResult,
  RecommendationWarning,
  ReasonCode,
  createSimpleTravelEstimator,
  scoreRecommendations,
  selectDiverseRecommendations,
  WeatherSnapshot,
} from "@/domain";
import {
  CandidateTravelEstimate,
  TravelEstimateMinutes,
} from "@/domain/travel/types";
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

const fixtureAreaCoordinates: Record<string, Coordinates> = {
  "Jersey City, NJ": { latitude: 40.7178, longitude: -74.0431 },
  "Hoboken, NJ": { latitude: 40.744, longitude: -74.0324 },
  "Montclair, NJ": { latitude: 40.8259, longitude: -74.209 },
  "Bronx, NY": { latitude: 40.8448, longitude: -73.8648 },
  "Bergen County, NJ": { latitude: 40.9263, longitude: -74.077 },
  "North Jersey, NJ": { latitude: 40.793, longitude: -74.065 },
  "Brooklyn, NY": { latitude: 40.6782, longitude: -73.9442 },
  "Queens, NY": { latitude: 40.7282, longitude: -73.7949 },
  "Newark, NJ": { latitude: 40.7357, longitude: -74.1724 },
  "Fort Lee, NJ": { latitude: 40.8509, longitude: -73.9701 },
  "Upper West Side, NY": { latitude: 40.787, longitude: -73.9754 },
  "Maplewood, NJ": { latitude: 40.7312, longitude: -74.2735 },
  "Edgewater, NJ": { latitude: 40.827, longitude: -73.9757 },
  "Union City, NJ": { latitude: 40.7795, longitude: -74.0238 },
  "Paramus, NJ": { latitude: 40.9445, longitude: -74.0754 },
  "Morristown, NJ": { latitude: 40.797, longitude: -74.4815 },
  "Manhattan, NY": { latitude: 40.724, longitude: -74 },
};

const simpleTravelEstimator = createSimpleTravelEstimator({
  averageSpeedMph: 30,
  roadDistanceMultiplier: 2,
});

export const defaultTravelEstimates: CandidateTravelEstimate[] =
  estimateLocalTravel(mockPlaceCandidates);

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
  const travelEstimates = estimateLocalTravel(candidates);
  const filtered = applyHardFilters({
    constraints: defaultLocalRecommendationConstraints,
    candidates,
    travelEstimates,
  });
  const scoredResults = scoreRecommendations({
    constraints: defaultLocalRecommendationConstraints,
    candidates: filtered.included,
    travelEstimates,
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
      buildCardModel(result, filtered.included, travelEstimates),
    ),
  };
}

function buildCardModel(
  result: RecommendationResult,
  candidates: PlaceCandidate[],
  travelEstimates: CandidateTravelEstimate[],
): RecommendationCardModel {
  const candidate = findCandidate(result.candidateId, candidates);
  const travelMinutes = findTravelEstimate(candidate.id, travelEstimates);

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

function findTravelEstimate(
  candidateId: string,
  travelEstimates: CandidateTravelEstimate[],
): TravelEstimateMinutes {
  return (
    travelEstimates.find((estimate) => estimate.candidateId === candidateId)
      ?.minutes ?? "unknown"
  );
}

function estimateLocalTravel(
  candidates: PlaceCandidate[],
): CandidateTravelEstimate[] {
  return simpleTravelEstimator.estimateCandidates({
    origin: getFixtureAreaCoordinates(
      defaultLocalRecommendationConstraints.location.kind === "manual_area" ||
        defaultLocalRecommendationConstraints.location.kind === "saved_area"
        ? defaultLocalRecommendationConstraints.location.area.label
        : undefined,
    ),
    destinations: candidates.map((candidate) => ({
      candidateId: candidate.id,
      coordinates:
        candidate.coordinates ??
        getFixtureAreaCoordinates(candidate.area.label),
    })),
  });
}

function getFixtureAreaCoordinates(label: string | undefined) {
  return label === undefined ? undefined : fixtureAreaCoordinates[label];
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
