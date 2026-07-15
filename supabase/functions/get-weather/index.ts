type WeatherRequest = {
  latitude?: number;
  longitude?: number;
  areaLabel?: string;
};

type WeatherSnapshot = {
  observedAt: string;
  condition:
    | "clear"
    | "cloudy"
    | "rain"
    | "snow"
    | "storm"
    | "extreme_heat"
    | "extreme_cold"
    | "unknown";
  temperatureF?: number;
  precipitationChancePercent?: number;
  outdoorFriendly: true | false | "unknown";
  source: {
    label: string;
    retrievedAt?: string;
    freshness: "verified" | "recent" | "stale" | "unknown";
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const timeoutMs = 750;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return jsonResponse({}, 200);
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const body = await request.json();
    const weatherRequest = validateWeatherRequest(body);
    const snapshot = await withTimeout(
      getMockWeatherSnapshot(weatherRequest),
      timeoutMs,
    );

    return jsonResponse(snapshot, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Weather unavailable.";
    const status = message.includes("request") ? 400 : 503;

    return jsonResponse({ error: message }, status);
  }
});

async function getMockWeatherSnapshot(
  _request: WeatherRequest,
): Promise<WeatherSnapshot> {
  return {
    observedAt: new Date().toISOString(),
    condition: "rain",
    temperatureF: 72,
    precipitationChancePercent: 70,
    outdoorFriendly: false,
    source: {
      label: "SproutScout weather mock",
      retrievedAt: new Date().toISOString(),
      freshness: "recent",
    },
  };
}

function validateWeatherRequest(value: unknown): WeatherRequest {
  if (!isRecord(value)) {
    throw new Error("Weather request must be an object.");
  }

  const latitude = toOptionalFiniteNumber(value.latitude);
  const longitude = toOptionalFiniteNumber(value.longitude);
  const areaLabel = toNonEmptyString(value.areaLabel);

  if (
    (latitude === undefined) !== (longitude === undefined) ||
    (latitude !== undefined && (latitude < -90 || latitude > 90)) ||
    (longitude !== undefined && (longitude < -180 || longitude > 180))
  ) {
    throw new Error("Weather request coordinates are invalid.");
  }

  if (latitude === undefined && areaLabel === undefined) {
    throw new Error("Weather request needs coordinates or an area label.");
  }

  return { latitude, longitude, areaLabel };
}

async function withTimeout<T>(promise: Promise<T>, milliseconds: number) {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Weather request timed out."));
    }, milliseconds);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
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

function toNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
