import {
  mockCandidateScenarioCoverage,
  mockPlaceCandidates,
} from "@/data/fixtures";

describe("mock candidate dataset", () => {
  it("contains 15 to 20 unique fixtures", () => {
    const ids = mockPlaceCandidates.map((candidate) => candidate.id);

    expect(mockPlaceCandidates.length).toBeGreaterThanOrEqual(15);
    expect(mockPlaceCandidates.length).toBeLessThanOrEqual(20);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers all canonical fixture scenarios with existing IDs", () => {
    const ids = new Set(mockPlaceCandidates.map((candidate) => candidate.id));

    for (const coveredIds of Object.values(mockCandidateScenarioCoverage)) {
      expect(coveredIds.length).toBeGreaterThan(0);
      for (const id of coveredIds) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });

  it("includes varied categories, price bands, and indoor/outdoor modes", () => {
    const categories = new Set(
      mockPlaceCandidates.map((candidate) => candidate.category),
    );
    const priceBands = new Set(
      mockPlaceCandidates.map((candidate) => candidate.price.band),
    );
    const indoorOutdoorModes = new Set(
      mockPlaceCandidates.map((candidate) => candidate.indoorOutdoor),
    );

    expect(categories.size).toBeGreaterThanOrEqual(8);
    expect(priceBands).toEqual(
      new Set(["free", "under_30", "paid", "unknown"]),
    );
    expect(indoorOutdoorModes).toEqual(
      new Set(["indoor", "outdoor", "mixed", "unknown"]),
    );
  });

  it("includes known and unknown values for future boundary tests", () => {
    expect(
      mockPlaceCandidates.some(
        (candidate) => candidate.ageRangeMonths === "unknown",
      ),
    ).toBe(true);
    expect(
      mockPlaceCandidates.some((candidate) =>
        Object.values(candidate.amenities).includes("unknown"),
      ),
    ).toBe(true);
    expect(
      mockPlaceCandidates.some(
        (candidate) => candidate.scheduleWindows !== undefined,
      ),
    ).toBe(true);
  });
});
