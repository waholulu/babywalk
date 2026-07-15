import {
  SourceInfo,
  UnknownBoolean,
  WeatherCondition,
  WeatherSnapshot,
} from "@/domain";

export type WeatherRequest = {
  latitude?: number;
  longitude?: number;
  areaLabel?: string;
};

export type WeatherRepository = {
  getSnapshot(request: WeatherRequest): Promise<WeatherSnapshot>;
};

export type WeatherLoadResult =
  | { ok: true; snapshot: WeatherSnapshot }
  | { ok: false; snapshot: WeatherSnapshot; errorMessage: string };

const weatherConditions: readonly WeatherCondition[] = [
  "clear",
  "cloudy",
  "rain",
  "snow",
  "storm",
  "extreme_heat",
  "extreme_cold",
  "unknown",
];

const freshnessValues: readonly SourceInfo["freshness"][] = [
  "verified",
  "recent",
  "stale",
  "unknown",
];

export async function loadWeatherWithFallback(
  repository: WeatherRepository,
  request: WeatherRequest,
  fallback: WeatherSnapshot,
): Promise<WeatherLoadResult> {
  try {
    return {
      ok: true,
      snapshot: validateWeatherSnapshot(await repository.getSnapshot(request)),
    };
  } catch (error) {
    return {
      ok: false,
      snapshot: fallback,
      errorMessage:
        error instanceof Error ? error.message : "Weather unavailable.",
    };
  }
}

export function validateWeatherSnapshot(value: unknown): WeatherSnapshot {
  if (!isRecord(value)) {
    throw new Error("Weather response must be an object.");
  }

  const observedAt = toNonEmptyString(value.observedAt);
  const condition = toWeatherCondition(value.condition);
  const temperatureF = toOptionalFiniteNumber(value.temperatureF);
  const precipitationChancePercent = toOptionalPercent(
    value.precipitationChancePercent,
  );
  const outdoorFriendly = toUnknownBoolean(value.outdoorFriendly);
  const source = toSourceInfo(value.source);

  if (observedAt === undefined) {
    throw new Error("Weather response is missing observedAt.");
  }

  return {
    observedAt,
    condition,
    temperatureF,
    precipitationChancePercent,
    outdoorFriendly,
    source,
  };
}

export function validateWeatherRequest(
  request: WeatherRequest,
): WeatherRequest {
  const latitude = toOptionalFiniteNumber(request.latitude);
  const longitude = toOptionalFiniteNumber(request.longitude);
  const areaLabel = toNonEmptyString(request.areaLabel);

  if (
    (latitude === undefined) !== (longitude === undefined) ||
    (latitude !== undefined && !isValidLatitude(latitude)) ||
    (longitude !== undefined && !isValidLongitude(longitude))
  ) {
    throw new Error("Weather request coordinates are invalid.");
  }

  if (latitude === undefined && areaLabel === undefined) {
    throw new Error("Weather request needs coordinates or an area label.");
  }

  return { latitude, longitude, areaLabel };
}

function toSourceInfo(value: unknown): SourceInfo {
  if (!isRecord(value)) {
    throw new Error("Weather response source must be an object.");
  }

  const label = toNonEmptyString(value.label);
  const url = toNonEmptyString(value.url);
  const retrievedAt = toNonEmptyString(value.retrievedAt);
  const freshness = toFreshness(value.freshness);

  if (label === undefined) {
    throw new Error("Weather response source is missing label.");
  }

  return { label, url, retrievedAt, freshness };
}

function toWeatherCondition(value: unknown): WeatherCondition {
  return weatherConditions.includes(value as WeatherCondition)
    ? (value as WeatherCondition)
    : "unknown";
}

function toUnknownBoolean(value: unknown): UnknownBoolean {
  return value === true || value === false ? value : "unknown";
}

function toFreshness(value: unknown): SourceInfo["freshness"] {
  return freshnessValues.includes(value as SourceInfo["freshness"])
    ? (value as SourceInfo["freshness"])
    : "unknown";
}

function toOptionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function toOptionalPercent(value: unknown): number | undefined {
  const parsed = toOptionalFiniteNumber(value);

  if (parsed === undefined) {
    return undefined;
  }

  return parsed >= 0 && parsed <= 100 ? parsed : undefined;
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
