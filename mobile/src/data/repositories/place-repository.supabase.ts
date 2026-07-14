import { SupabaseClient } from "@supabase/supabase-js";

import {
  DataFreshness,
  PlaceCandidate,
  PlaceCategory,
  PriceBand,
  UnknownBoolean,
} from "@/domain";
import { PublicDatabase, SupabasePlaceRow } from "@/lib/supabase";

import type { PlaceRepository } from "./place-repository";

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

export function createSupabasePlaceRepository(
  client: SupabaseClient<PublicDatabase>,
): PlaceRepository {
  return {
    async listCandidates() {
      const { data, error } = await client
        .from("places")
        .select(
          [
            "id",
            "source",
            "source_place_id",
            "name",
            "category",
            "latitude",
            "longitude",
            "address_text",
            "website_url",
            "indoor_outdoor",
            "min_age_months",
            "max_age_months",
            "price_band",
            "amenities",
            "source_retrieved_at",
            "manually_reviewed_at",
            "is_active",
          ].join(","),
        )
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        throw new Error(`Unable to load places: ${error.message}`);
      }

      return (data ?? []).map(mapSupabasePlaceRowToCandidate);
    },
  };
}

export function mapSupabasePlaceRowToCandidate(
  row: SupabasePlaceRow,
): PlaceCandidate {
  const latitude = toFiniteNumber(row.latitude);
  const longitude = toFiniteNumber(row.longitude);
  const minMonths = toNullableInteger(row.min_age_months);
  const maxMonths = toNullableInteger(row.max_age_months);

  return {
    id: row.source_place_id ?? row.id,
    name: row.name,
    category: toCategory(row.category),
    area: { label: row.address_text?.trim() || "Area unknown" },
    coordinates:
      latitude === undefined || longitude === undefined
        ? undefined
        : { latitude, longitude },
    ageRangeMonths:
      minMonths === undefined && maxMonths === undefined
        ? "unknown"
        : { minMonths, maxMonths },
    price: { band: toPriceBand(row.price_band) },
    indoorOutdoor: toIndoorOutdoor(row.indoor_outdoor),
    amenities: {
      strollerFriendly: toUnknownBoolean(row.amenities.strollerFriendly),
      bathroomAvailable: toUnknownBoolean(row.amenities.bathroomAvailable),
      parkingAvailable: toUnknownBoolean(row.amenities.parkingAvailable),
    },
    source: {
      label: row.source,
      url: row.website_url ?? undefined,
      retrievedAt:
        row.source_retrieved_at ?? row.manually_reviewed_at ?? undefined,
      freshness: toFreshness(row),
    },
  };
}

function toCategory(value: string): PlaceCategory {
  return categories.includes(value as PlaceCategory)
    ? (value as PlaceCategory)
    : "other";
}

function toPriceBand(value: string): PriceBand {
  return priceBands.includes(value as PriceBand)
    ? (value as PriceBand)
    : "unknown";
}

function toIndoorOutdoor(value: string): PlaceCandidate["indoorOutdoor"] {
  return indoorOutdoorValues.includes(value as PlaceCandidate["indoorOutdoor"])
    ? (value as PlaceCandidate["indoorOutdoor"])
    : "unknown";
}

function toUnknownBoolean(value: unknown): UnknownBoolean {
  return typeof value === "boolean" ? value : "unknown";
}

function toFiniteNumber(value: number | string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toNullableInteger(value: number | null): number | undefined {
  return value === null ? undefined : value;
}

function toFreshness(row: SupabasePlaceRow): DataFreshness {
  if (row.manually_reviewed_at !== null) {
    return "verified";
  }

  if (row.source_retrieved_at !== null) {
    return "recent";
  }

  return "unknown";
}
