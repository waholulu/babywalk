export type IsoDateTime = string;

export type UnknownBoolean = true | false | "unknown";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CoarseArea = {
  label: string;
  city?: string;
  region?: string;
  postalCodePrefix?: string;
};

export type TimeWindow = {
  startAt: IsoDateTime;
  endAt: IsoDateTime;
};

export type AgeRangeMonths = {
  minMonths?: number;
  maxMonths?: number;
};

export type PriceBand = "free" | "under_30" | "paid" | "unknown";

export type MoneyEstimate = {
  band: PriceBand;
  estimatedUsd?: number;
};

export type DataFreshness = "verified" | "recent" | "stale" | "unknown";

export type SourceInfo = {
  label: string;
  url?: string;
  retrievedAt?: IsoDateTime;
  freshness: DataFreshness;
};
