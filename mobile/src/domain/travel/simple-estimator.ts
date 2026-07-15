import { Coordinates } from "@/domain/common";

import {
  CandidateTravelEstimate,
  CandidateTravelEstimateInput,
  TravelEstimator,
} from "./types";

export type SimpleTravelEstimatorOptions = {
  averageSpeedMph?: number;
  roadDistanceMultiplier?: number;
  baseMinutes?: number;
  minimumMinutes?: number;
  roundingMinutes?: number;
};

const earthRadiusMiles = 3958.8;

const defaultOptions = {
  averageSpeedMph: 45,
  roadDistanceMultiplier: 1.35,
  baseMinutes: 6,
  minimumMinutes: 6,
  roundingMinutes: 1,
} satisfies Required<SimpleTravelEstimatorOptions>;

export function createSimpleTravelEstimator(
  options: SimpleTravelEstimatorOptions = {},
): TravelEstimator {
  const resolvedOptions = { ...defaultOptions, ...options };

  return {
    estimateCandidates(
      input: CandidateTravelEstimateInput,
    ): CandidateTravelEstimate[] {
      return input.destinations.map((destination) => {
        if (
          input.origin === undefined ||
          destination.coordinates === undefined
        ) {
          return {
            candidateId: destination.candidateId,
            minutes: "unknown",
            source: "simple_estimate",
          };
        }

        const distanceMiles =
          calculateStraightLineDistanceMiles(
            input.origin,
            destination.coordinates,
          ) * resolvedOptions.roadDistanceMultiplier;
        const rawMinutes =
          (distanceMiles / resolvedOptions.averageSpeedMph) * 60 +
          resolvedOptions.baseMinutes;
        const roundedMinutes = roundToNearest(
          Math.max(resolvedOptions.minimumMinutes, rawMinutes),
          resolvedOptions.roundingMinutes,
        );

        return {
          candidateId: destination.candidateId,
          minutes: roundedMinutes,
          distanceMiles: roundToNearest(distanceMiles, 0.1),
          source: "simple_estimate",
        };
      });
    },
  };
}

export function calculateStraightLineDistanceMiles(
  origin: Coordinates,
  destination: Coordinates,
): number {
  const originLatitudeRadians = degreesToRadians(origin.latitude);
  const destinationLatitudeRadians = degreesToRadians(destination.latitude);
  const latitudeDeltaRadians = degreesToRadians(
    destination.latitude - origin.latitude,
  );
  const longitudeDeltaRadians = degreesToRadians(
    destination.longitude - origin.longitude,
  );

  const haversine =
    Math.sin(latitudeDeltaRadians / 2) ** 2 +
    Math.cos(originLatitudeRadians) *
      Math.cos(destinationLatitudeRadians) *
      Math.sin(longitudeDeltaRadians / 2) ** 2;
  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadiusMiles * angularDistance;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function roundToNearest(value: number, increment: number): number {
  return Number((Math.round(value / increment) * increment).toFixed(6));
}
