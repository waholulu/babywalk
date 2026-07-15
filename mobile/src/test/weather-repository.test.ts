import { mockPlaceCandidates } from "@/data/fixtures";
import {
  createFixtureWeatherRepository,
  createSupabaseWeatherRepository,
  createWeatherRepository,
  defaultLocalWeather,
  loadWeatherWithFallback,
  validateWeatherRequest,
  validateWeatherSnapshot,
  WeatherRepository,
} from "@/data/repositories";
import { buildRepositoryRecommendations } from "@/features/recommendations/local-recommendations";

describe("weather repositories", () => {
  it("validates coarse weather requests", () => {
    expect(
      validateWeatherRequest({
        latitude: 40.72,
        longitude: -74.04,
        areaLabel: " Jersey City, NJ ",
      }),
    ).toEqual({
      latitude: 40.72,
      longitude: -74.04,
      areaLabel: "Jersey City, NJ",
    });

    expect(() => validateWeatherRequest({ latitude: 91 })).toThrow(
      "Weather request coordinates are invalid.",
    );
    expect(() => validateWeatherRequest({})).toThrow(
      "Weather request needs coordinates or an area label.",
    );
  });

  it("maps unknown response values without inventing weather facts", () => {
    const snapshot = validateWeatherSnapshot({
      observedAt: "2026-07-15T08:00:00-04:00",
      condition: "windy",
      temperatureF: Number.NaN,
      precipitationChancePercent: 120,
      outdoorFriendly: "maybe",
      source: {
        label: "Mock provider",
        freshness: "unexpected",
      },
    });

    expect(snapshot).toEqual({
      observedAt: "2026-07-15T08:00:00-04:00",
      condition: "unknown",
      temperatureF: undefined,
      precipitationChancePercent: undefined,
      outdoorFriendly: "unknown",
      source: {
        label: "Mock provider",
        url: undefined,
        retrievedAt: undefined,
        freshness: "unknown",
      },
    });
  });

  it("uses fixture weather for local fixture mode", async () => {
    const repository = createWeatherRepository({
      appEnv: "local",
      placeDataSource: "fixtures",
    });

    await expect(
      repository.getSnapshot({ areaLabel: "Jersey City, NJ" }),
    ).resolves.toEqual(defaultLocalWeather);
  });

  it("maps Supabase Edge Function weather responses", async () => {
    const repository = createSupabaseWeatherRepository({
      functions: {
        invoke: async () => ({
          data: {
            observedAt: "2026-07-15T08:00:00-04:00",
            condition: "cloudy",
            temperatureF: 68,
            precipitationChancePercent: 30,
            outdoorFriendly: true,
            source: {
              label: "SproutScout weather mock",
              retrievedAt: "2026-07-15T08:00:00-04:00",
              freshness: "recent",
            },
          },
          error: null,
        }),
      },
    } as never);

    await expect(
      repository.getSnapshot({ areaLabel: "Jersey City, NJ" }),
    ).resolves.toEqual({
      observedAt: "2026-07-15T08:00:00-04:00",
      condition: "cloudy",
      temperatureF: 68,
      precipitationChancePercent: 30,
      outdoorFriendly: true,
      source: {
        label: "SproutScout weather mock",
        url: undefined,
        retrievedAt: "2026-07-15T08:00:00-04:00",
        freshness: "recent",
      },
    });
  });

  it("falls back to local weather when the adapter is unavailable", async () => {
    const failingRepository: WeatherRepository = {
      async getSnapshot() {
        throw new Error("Weather function unavailable.");
      },
    };

    await expect(
      loadWeatherWithFallback(
        failingRepository,
        { areaLabel: "Jersey City, NJ" },
        defaultLocalWeather,
      ),
    ).resolves.toEqual({
      ok: false,
      snapshot: defaultLocalWeather,
      errorMessage: "Weather function unavailable.",
    });

    await expect(
      buildRepositoryRecommendations(
        { listCandidates: async () => mockPlaceCandidates },
        "test places",
        failingRepository,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        weatherSourceLabel: defaultLocalWeather.source.label,
        cards: expect.any(Array),
      }),
    );
  });
});

describe("fixture weather repository", () => {
  it("returns the deterministic local mock", async () => {
    await expect(
      createFixtureWeatherRepository().getSnapshot({
        areaLabel: "Jersey City, NJ",
      }),
    ).resolves.toEqual(defaultLocalWeather);
  });
});
