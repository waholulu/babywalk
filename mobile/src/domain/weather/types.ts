import { SourceInfo, UnknownBoolean } from "@/domain/common";

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "rain"
  | "snow"
  | "storm"
  | "extreme_heat"
  | "extreme_cold"
  | "unknown";

export type WeatherSnapshot = {
  observedAt: string;
  condition: WeatherCondition;
  temperatureF?: number;
  precipitationChancePercent?: number;
  outdoorFriendly: UnknownBoolean;
  source: SourceInfo;
};
