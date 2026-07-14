export const scoreComponents = [
  "age_activity_fit",
  "schedule_fit",
  "travel_convenience",
  "weather_fit",
  "budget_fit",
  "amenities_confidence",
  "novelty",
  "family_preference",
] as const;

export type ScoreComponent = (typeof scoreComponents)[number];

export const reasonCodes = [
  "AGE_MATCH",
  "HOME_BEFORE_NAP",
  "UNDER_BUDGET",
  "WEATHER_MATCH",
  "SHORT_DRIVE",
  "MEMBERSHIP_VALUE",
  "NEW_TO_FAMILY",
] as const;

export type ReasonCode = (typeof reasonCodes)[number];

export const warningCodes = [
  "VERIFY_HOURS",
  "VERIFY_PRICE",
  "VERIFY_AMENITIES",
  "WEATHER_UNCERTAIN",
  "TRAVEL_TIME_ESTIMATE",
  "LIMITED_SOURCE_FRESHNESS",
  "UNKNOWN_AGE_FIT",
] as const;

export type WarningCode = (typeof warningCodes)[number];

export const confidenceLevels = ["high", "medium", "low"] as const;

export type Confidence = (typeof confidenceLevels)[number];

export type RecommendationWarning = {
  code: WarningCode;
  message: string;
};

export type RecommendationResult = {
  candidateId: string;
  totalScore: number;
  scoreBreakdown: Record<ScoreComponent, number>;
  reasonCodes: ReasonCode[];
  warnings: RecommendationWarning[];
  confidence: Confidence;
};
