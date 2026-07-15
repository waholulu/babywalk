import { SupabaseClient } from "@supabase/supabase-js";

import {
  PlaceCandidate,
  PlaceCategory,
  PriceBand,
  UnknownBoolean,
} from "@/domain";
import { PublicDatabase } from "@/lib/supabase";

import { PlaceRepository } from "./place-repository";

export type PlaceProviderRequest = {
  areaLabel?: string;
  latitude?: number;
  longitude?: number;
  limit?: number;
};

const categories: readonly PlaceCategory[] = [
  "library",
  "playground",
  "museum",
  "zoo",
  "farm",
  "park",
  "waterfront",
  "indoor_play",
  "community_center",
  "other",
];

const priceBands: readonly PriceBand[] = [
  "free",
  "under_30",
  "paid",
  "unknown",
];

const indoorOutdoorValues = ["indoor", "outdoor", "mixed", "unknown"] as const;

export function createSupabasePlaceProviderRepository(
  client: SupabaseClient<PublicDatabase>,
  request: PlaceProviderRequest,
): PlaceRepository {
  return {
    async listCandidates() {
      const { data, error } = await client.functions.invoke("get-candidates", {
        body: validatePlaceProviderRequest(request),
      });

      if (error) {
        throw new Error(`Unable to load provider places: ${error.message}`);
      }

      return validatePlaceProviderResponse(data);
    },
  };
}

export function validatePlaceProviderRequest(
  request: PlaceProviderRequest,
): PlaceProviderRequest {
  const latitude = toOptionalFiniteNumber(request.latitude);
  const longitude = toOptionalFiniteNumber(request.longitude);
  const areaLabel = toNonEmptyString(request.areaLabel);
  const limit = toOptionalInteger(request.limit);

  if (
    (latitude === undefined) !== (longitude === undefined) ||
    (latitude !== undefined && !isValidLatitude(latitude)) ||
    (longitude !== undefined && !isValidLongitude(longitude))
  ) {
    throw new Error("Place provider request coordinates are invalid.");
  }

  if (latitude === undefined && areaLabel === undefined) {
    throw new Error(
      "Place provider request needs coordinates or an area label.",
    );
  }

  return {
    latitude,
    longitude,
    areaLabel,
    limit: limit === undefined ? undefined : Math.min(Math.max(limit, 1), 10),
  };
}

export function validatePlaceProviderResponse(
  value: unknown,
): PlaceCandidate[] {
  if (!isRecord(value) || !Array.isArray(value.candidates)) {
    throw new Error("Place provider response must include candidates.");
  }

  return value.candidates.map(validatePlaceCandidate);
}

function validatePlaceCandidate(value: unknown): PlaceCandidate {
  if (!isRecord(value)) {
    throw new Error("Place provider candidate must be an object.");
  }

  const id = toNonEmptyString(value.id);
  const name = toNonEmptyString(value.name);
  const area = isRecord(value.area)
    ? toNonEmptyString(value.area.label)
    : undefined;
  const source = validateSource(value.source);

  if (id === undefined || name === undefined || area === undefined) {
    throw new Error("Place provider candidate is missing required fields.");
  }

  return {
    id,
    name,
    category: toCategory(value.category),
    area: { label: area },
    coordinates: validateCoordinates(value.coordinates),
    ageRangeMonths: validateAgeRange(value.ageRangeMonths),
    price: validatePrice(value.price),
    indoorOutdoor: toIndoorOutdoor(value.indoorOutdoor),
    amenities: validateAmenities(value.amenities),
    source,
  };
}

function validateSource(value: unknown): PlaceCandidate["source"] {
  if (!isRecord(value)) {
    throw new Error("Place provider candidate source must be an object.");
  }

  const label = toNonEmptyString(value.label);

  if (label === undefined) {
    throw new Error("Place provider candidate source is missing label.");
  }

  return {
    label,
    url: toNonEmptyString(value.url),
    retrievedAt: toNonEmptyString(value.retrievedAt),
    freshness: toFreshness(value.freshness),
  };
}

function validateCoordinates(value: unknown): PlaceCandidate["coordinates"] {
  if (!isRecord(value)) {
    return undefined;
  }

  const latitude = toOptionalFiniteNumber(value.latitude);
  const longitude = toOptionalFiniteNumber(value.longitude);

  return latitude === undefined || longitude === undefined
    ? undefined
    : { latitude, longitude };
}

function validateAgeRange(value: unknown): PlaceCandidate["ageRangeMonths"] {
  if (value === "unknown" || !isRecord(value)) {
    return "unknown";
  }

  const minMonths = toOptionalInteger(value.minMonths);
  const maxMonths = toOptionalInteger(value.maxMonths);

  return minMonths === undefined && maxMonths === undefined
    ? "unknown"
    : { minMonths, maxMonths };
}

function validatePrice(value: unknown): PlaceCandidate["price"] {
  if (!isRecord(value)) {
    return { band: "unknown" };
  }

  return {
    band: toPriceBand(value.band),
    estimatedUsd: toOptionalFiniteNumber(value.estimatedUsd),
  };
}

function validateAmenities(value: unknown): PlaceCandidate["amenities"] {
  if (!isRecord(value)) {
    return {
      strollerFriendly: "unknown",
      bathroomAvailable: "unknown",
      parkingAvailable: "unknown",
    };
  }

  return {
    strollerFriendly: toUnknownBoolean(value.strollerFriendly),
    bathroomAvailable: toUnknownBoolean(value.bathroomAvailable),
    parkingAvailable: toUnknownBoolean(value.parkingAvailable),
  };
}

function toCategory(value: unknown): PlaceCategory {
  return categories.includes(value as PlaceCategory)
    ? (value as PlaceCategory)
    : "other";
}

function toPriceBand(value: unknown): PriceBand {
  return priceBands.includes(value as PriceBand)
    ? (value as PriceBand)
    : "unknown";
}

function toIndoorOutdoor(value: unknown): PlaceCandidate["indoorOutdoor"] {
  return indoorOutdoorValues.includes(value as PlaceCandidate["indoorOutdoor"])
    ? (value as PlaceCandidate["indoorOutdoor"])
    : "unknown";
}

function toUnknownBoolean(value: unknown): UnknownBoolean {
  return value === true || value === false ? value : "unknown";
}

function toFreshness(value: unknown): PlaceCandidate["source"]["freshness"] {
  const freshnessValues: readonly PlaceCandidate["source"]["freshness"][] = [
    "verified",
    "recent",
    "stale",
    "unknown",
  ];

  return freshnessValues.includes(
    value as PlaceCandidate["source"]["freshness"],
  )
    ? (value as PlaceCandidate["source"]["freshness"])
    : "unknown";
}

function toOptionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function toOptionalInteger(value: unknown): number | undefined {
  return Number.isInteger(value) ? (value as number) : undefined;
}

function toNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function isValidLatitude(value: number): boolean {
  return value >= -90 && value <= 90;
}

function isValidLongitude(value: number): boolean {
  return value >= -180 && value <= 180;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
