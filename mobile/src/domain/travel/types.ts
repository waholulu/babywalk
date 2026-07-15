import { Coordinates } from "@/domain/common";

export type TravelEstimateMinutes = number | "unknown";

export type TravelEstimateSource = "simple_estimate" | "provider";

export type CandidateTravelDestination = {
  candidateId: string;
  coordinates?: Coordinates;
};

export type CandidateTravelEstimate = {
  candidateId: string;
  minutes: TravelEstimateMinutes;
  distanceMiles?: number;
  source?: TravelEstimateSource;
};

export type CandidateTravelEstimateInput = {
  origin?: Coordinates;
  destinations: CandidateTravelDestination[];
};

export type TravelEstimator = {
  estimateCandidates(
    input: CandidateTravelEstimateInput,
  ): CandidateTravelEstimate[];
};
