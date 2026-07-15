type ProviderPlaceRecord = {
  providerName: string;
  providerId: string;
  displayName: string;
  kind: string;
  areaLabel: string;
  latitude?: number;
  longitude?: number;
  minAgeMonths?: number;
  maxAgeMonths?: number;
  priceTier?: "free" | "low" | "paid";
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
  strollerFriendly?: boolean;
  bathroomAvailable?: boolean;
  websiteUrl?: string;
};

type CandidateRequest = {
  areaLabel?: string;
  latitude?: number;
  longitude?: number;
  limit: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const maxCandidateLimit = 10;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return jsonResponse({}, 200);
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const body = await request.json();
    const candidateRequest = validateCandidateRequest(body);
    const providerRecords = await getMockProviderPlaces(candidateRequest);
    const candidates = providerRecords
      .slice(0, candidateRequest.limit)
      .map(mapProviderRecordToCandidate);

    return jsonResponse({ candidates }, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Place provider unavailable.";
    const isBadRequest = message.startsWith("Candidate request");

    console.warn("place_provider_failed", { reason: message });

    return jsonResponse({ error: message }, isBadRequest ? 400 : 503);
  }
});

async function getMockProviderPlaces(
  _request: CandidateRequest,
): Promise<ProviderPlaceRecord[]> {
  return [
    {
      providerName: "sproutscout_mock_place_provider",
      providerId: "mock-library-morning",
      displayName: "Mock Provider Library Morning",
      kind: "library",
      areaLabel: "Hoboken, NJ",
      latitude: 40.744,
      longitude: -74.0324,
      minAgeMonths: 6,
      maxAgeMonths: 48,
      priceTier: "free",
      indoorOutdoor: "indoor",
      strollerFriendly: true,
      bathroomAvailable: true,
      websiteUrl: "https://example.invalid/mock-library-morning",
    },
    {
      providerName: "sproutscout_mock_place_provider",
      providerId: "mock-riverside-play",
      displayName: "Mock Provider Riverside Play",
      kind: "playground",
      areaLabel: "Jersey City, NJ",
      latitude: 40.7178,
      longitude: -74.0431,
      minAgeMonths: 12,
      maxAgeMonths: 96,
      priceTier: "free",
      indoorOutdoor: "outdoor",
      strollerFriendly: true,
      bathroomAvailable: undefined,
    },
  ];
}

function validateCandidateRequest(value: unknown): CandidateRequest {
  if (!isRecord(value)) {
    throw new Error("Candidate request must be an object.");
  }

  const latitude = toOptionalFiniteNumber(value.latitude);
  const longitude = toOptionalFiniteNumber(value.longitude);
  const areaLabel = toNonEmptyString(value.areaLabel);
  const requestedLimit = toOptionalInteger(value.limit) ?? 5;

  if (
    (latitude === undefined) !== (longitude === undefined) ||
    (latitude !== undefined && (latitude < -90 || latitude > 90)) ||
    (longitude !== undefined && (longitude < -180 || longitude > 180))
  ) {
    throw new Error("Candidate request coordinates are invalid.");
  }

  if (latitude === undefined && areaLabel === undefined) {
    throw new Error("Candidate request needs coordinates or an area label.");
  }

  return {
    latitude,
    longitude,
    areaLabel,
    limit: Math.min(Math.max(requestedLimit, 1), maxCandidateLimit),
  };
}

function mapProviderRecordToCandidate(record: ProviderPlaceRecord) {
  return {
    id: `${record.providerName}:${record.providerId}`,
    name: record.displayName,
    category: toCategory(record.kind),
    area: { label: record.areaLabel },
    coordinates:
      record.latitude === undefined || record.longitude === undefined
        ? undefined
        : { latitude: record.latitude, longitude: record.longitude },
    ageRangeMonths:
      record.minAgeMonths === undefined && record.maxAgeMonths === undefined
        ? "unknown"
        : {
            minMonths: record.minAgeMonths,
            maxMonths: record.maxAgeMonths,
          },
    price: { band: toPriceBand(record.priceTier) },
    indoorOutdoor: record.indoorOutdoor ?? "unknown",
    amenities: {
      strollerFriendly: record.strollerFriendly ?? "unknown",
      bathroomAvailable: record.bathroomAvailable ?? "unknown",
      parkingAvailable: "unknown",
    },
    source: {
      label: record.providerName,
      url: record.websiteUrl,
      retrievedAt: new Date().toISOString(),
      freshness: "recent",
    },
  };
}

function toCategory(value: string) {
  const knownCategories = new Set([
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
  ]);

  return knownCategories.has(value) ? value : "other";
}

function toPriceBand(value: ProviderPlaceRecord["priceTier"]) {
  if (value === "free") {
    return "free";
  }

  if (value === "low") {
    return "under_30";
  }

  if (value === "paid") {
    return "paid";
  }

  return "unknown";
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
