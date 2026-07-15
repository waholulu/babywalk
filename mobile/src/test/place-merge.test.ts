import { PlaceCandidate, mergeCandidateSources } from "@/domain";

const baseCandidate: PlaceCandidate = {
  id: "curated-story-room",
  name: "Story Room",
  category: "library",
  area: { label: "Hoboken, NJ" },
  coordinates: { latitude: 40.744, longitude: -74.0324 },
  ageRangeMonths: { minMonths: 6, maxMonths: 48 },
  typicalVisitMinutes: 60,
  price: { band: "free" },
  indoorOutdoor: "indoor",
  amenities: {
    strollerFriendly: true,
    bathroomAvailable: true,
    parkingAvailable: "unknown",
  },
  source: {
    label: "curated_seed",
    retrievedAt: "2026-07-15T08:00:00.000Z",
    freshness: "verified",
  },
};

describe("mergeCandidateSources", () => {
  it("keeps curated candidates before provider candidates", () => {
    const result = mergeCandidateSources({
      curatedCandidates: [candidate({ id: "curated-a", name: "A" })],
      providerCandidates: [candidate({ id: "provider-b", name: "B" })],
    });

    expect(result.candidates.map((item) => item.id)).toEqual([
      "curated-a",
      "provider-b",
    ]);
    expect(result.provenanceByCandidateId["provider-b"]).toEqual({
      candidateId: "provider-b",
      primarySource: "provider",
      sourceLabels: ["curated_seed"],
      duplicateCandidateIds: [],
    });
  });

  it("prefers curated records when provider candidates duplicate by name and area", () => {
    const result = mergeCandidateSources({
      curatedCandidates: [baseCandidate],
      providerCandidates: [
        candidate({
          id: "provider-story-room",
          name: "Story Room",
          area: { label: "Hoboken, NJ" },
          source: { label: "provider_mock", freshness: "recent" },
        }),
      ],
    });

    expect(result.candidates).toEqual([baseCandidate]);
    expect(result.duplicates).toEqual([
      {
        keptCandidateId: "curated-story-room",
        duplicateCandidateId: "provider-story-room",
        keptSource: "curated",
        duplicateSource: "provider",
        reason: "same_name_area",
      },
    ]);
    expect(result.provenanceByCandidateId["curated-story-room"]).toEqual({
      candidateId: "curated-story-room",
      primarySource: "curated",
      sourceLabels: ["curated_seed", "provider_mock"],
      duplicateCandidateIds: ["provider-story-room"],
    });
  });

  it("detects same-name duplicates when coordinates are close", () => {
    const result = mergeCandidateSources({
      curatedCandidates: [baseCandidate],
      providerCandidates: [
        candidate({
          id: "provider-near-story-room",
          name: "Story Room",
          area: { label: "Waterfront, NJ" },
          coordinates: { latitude: 40.7441, longitude: -74.0325 },
        }),
      ],
    });

    expect(result.candidates.map((item) => item.id)).toEqual([
      "curated-story-room",
    ]);
    expect(result.duplicates).toEqual([
      expect.objectContaining({
        duplicateCandidateId: "provider-near-story-room",
        reason: "same_name_near_coordinates",
      }),
    ]);
  });

  it("does not merge same-name candidates in different areas without coordinates", () => {
    const result = mergeCandidateSources({
      curatedCandidates: [
        candidate({
          id: "curated-story-room",
          coordinates: undefined,
        }),
      ],
      providerCandidates: [
        candidate({
          id: "provider-story-room",
          area: { label: "Brooklyn, NY" },
          coordinates: undefined,
        }),
      ],
    });

    expect(result.candidates.map((item) => item.id)).toEqual([
      "curated-story-room",
      "provider-story-room",
    ]);
    expect(result.duplicates).toEqual([]);
  });
});

function candidate(overrides: Partial<PlaceCandidate>): PlaceCandidate {
  return {
    ...baseCandidate,
    ...overrides,
    area: overrides.area ?? baseCandidate.area,
    coordinates:
      "coordinates" in overrides
        ? overrides.coordinates
        : baseCandidate.coordinates,
    price: overrides.price ?? baseCandidate.price,
    amenities: overrides.amenities ?? baseCandidate.amenities,
    source: {
      ...baseCandidate.source,
      ...overrides.source,
    },
  };
}
