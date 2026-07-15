import { WeatherSnapshot } from "@/domain";

import { WeatherRepository, WeatherRequest } from "./weather-repository";

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

export function createFixtureWeatherRepository(): WeatherRepository {
  return {
    async getSnapshot(_request: WeatherRequest) {
      return defaultLocalWeather;
    },
  };
}
