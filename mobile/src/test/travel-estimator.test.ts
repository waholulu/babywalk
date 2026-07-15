import {
  calculateStraightLineDistanceMiles,
  createSimpleTravelEstimator,
} from "@/domain";

describe("simple travel estimator", () => {
  it("calculates straight-line distance without maps or network calls", () => {
    const distance = calculateStraightLineDistanceMiles(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
    );

    expect(distance).toBeCloseTo(69.1, 1);
  });

  it("returns rounded travel estimates from coarse coordinates", () => {
    const estimator = createSimpleTravelEstimator({
      averageSpeedMph: 60,
      roadDistanceMultiplier: 1,
      baseMinutes: 0,
      minimumMinutes: 1,
      roundingMinutes: 5,
    });

    const estimates = estimator.estimateCandidates({
      origin: { latitude: 0, longitude: 0 },
      destinations: [
        {
          candidateId: "one-degree-east",
          coordinates: { latitude: 0, longitude: 1 },
        },
      ],
    });

    expect(estimates).toEqual([
      {
        candidateId: "one-degree-east",
        minutes: 70,
        distanceMiles: 69.1,
        source: "simple_estimate",
      },
    ]);
  });

  it("keeps unknown travel when the origin or destination is missing", () => {
    const estimator = createSimpleTravelEstimator();

    expect(
      estimator.estimateCandidates({
        destinations: [{ candidateId: "missing-origin" }],
      }),
    ).toEqual([
      {
        candidateId: "missing-origin",
        minutes: "unknown",
        source: "simple_estimate",
      },
    ]);

    expect(
      estimator.estimateCandidates({
        origin: { latitude: 40.72, longitude: -74.04 },
        destinations: [{ candidateId: "missing-destination" }],
      }),
    ).toEqual([
      {
        candidateId: "missing-destination",
        minutes: "unknown",
        source: "simple_estimate",
      },
    ]);
  });
});
