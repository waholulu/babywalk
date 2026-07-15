import {
  createSupabasePlaceProviderRepository,
  validatePlaceProviderRequest,
  validatePlaceProviderResponse,
} from "@/data/repositories";

describe("place provider repository", () => {
  it("validates coarse provider requests and enforces cost limits", () => {
    expect(
      validatePlaceProviderRequest({
        areaLabel: " Jersey City, NJ ",
        limit: 99,
      }),
    ).toEqual({
      areaLabel: "Jersey City, NJ",
      latitude: undefined,
      longitude: undefined,
      limit: 10,
    });

    expect(() => validatePlaceProviderRequest({ latitude: 40 })).toThrow(
      "Place provider request coordinates are invalid.",
    );
    expect(() => validatePlaceProviderRequest({})).toThrow(
      "Place provider request needs coordinates or an area label.",
    );
  });

  it("normalizes function responses into internal place candidates only", () => {
    const [candidate] = validatePlaceProviderResponse({
      candidates: [
        {
          id: "mock:library",
          name: "Mock Library",
          category: "library",
          area: { label: "Hoboken, NJ" },
          coordinates: { latitude: 40.744, longitude: -74.0324 },
          ageRangeMonths: { minMonths: 6, maxMonths: 48 },
          price: { band: "free" },
          indoorOutdoor: "indoor",
          amenities: {
            strollerFriendly: true,
            bathroomAvailable: true,
            parkingAvailable: "unknown",
          },
          source: {
            label: "sproutscout_mock_place_provider",
            url: "https://example.invalid/mock",
            retrievedAt: "2026-07-15T08:00:00.000Z",
            freshness: "recent",
          },
          providerRaw: { shouldNotLeak: true },
        },
      ],
    });

    expect(candidate).toEqual({
      id: "mock:library",
      name: "Mock Library",
      category: "library",
      area: { label: "Hoboken, NJ" },
      coordinates: { latitude: 40.744, longitude: -74.0324 },
      ageRangeMonths: { minMonths: 6, maxMonths: 48 },
      price: { band: "free", estimatedUsd: undefined },
      indoorOutdoor: "indoor",
      amenities: {
        strollerFriendly: true,
        bathroomAvailable: true,
        parkingAvailable: "unknown",
      },
      source: {
        label: "sproutscout_mock_place_provider",
        url: "https://example.invalid/mock",
        retrievedAt: "2026-07-15T08:00:00.000Z",
        freshness: "recent",
      },
    });
    expect(candidate).not.toHaveProperty("providerRaw");
  });

  it("preserves unknowns for unsupported provider values", () => {
    const [candidate] = validatePlaceProviderResponse({
      candidates: [
        {
          id: "mock:unknowns",
          name: "Mock Unknowns",
          category: "unexpected",
          area: { label: "Area" },
          ageRangeMonths: {},
          price: { band: "expensive" },
          indoorOutdoor: "maybe",
          amenities: {},
          source: { label: "mock", freshness: "future" },
        },
      ],
    });

    expect(candidate).toEqual(
      expect.objectContaining({
        category: "other",
        coordinates: undefined,
        ageRangeMonths: "unknown",
        price: { band: "unknown", estimatedUsd: undefined },
        indoorOutdoor: "unknown",
        amenities: {
          strollerFriendly: "unknown",
          bathroomAvailable: "unknown",
          parkingAvailable: "unknown",
        },
        source: expect.objectContaining({ freshness: "unknown" }),
      }),
    );
  });

  it("loads candidates through the Supabase Edge Function boundary", async () => {
    const invokedBodies: unknown[] = [];
    const repository = createSupabasePlaceProviderRepository(
      {
        functions: {
          invoke: async (_name: string, options: { body: unknown }) => {
            invokedBodies.push(options.body);
            return {
              data: {
                candidates: [
                  {
                    id: "mock:library",
                    name: "Mock Library",
                    category: "library",
                    area: { label: "Hoboken, NJ" },
                    price: { band: "free" },
                    indoorOutdoor: "indoor",
                    amenities: {},
                    source: { label: "mock", freshness: "recent" },
                  },
                ],
              },
              error: null,
            };
          },
        },
      } as never,
      { areaLabel: "Jersey City, NJ", limit: 25 },
    );

    await expect(repository.listCandidates()).resolves.toEqual([
      expect.objectContaining({
        id: "mock:library",
        source: expect.objectContaining({ label: "mock" }),
      }),
    ]);
    expect(invokedBodies).toEqual([
      {
        areaLabel: "Jersey City, NJ",
        latitude: undefined,
        longitude: undefined,
        limit: 10,
      },
    ]);
  });

  it("bounds provider errors before they reach callers", async () => {
    const repository = createSupabasePlaceProviderRepository(
      {
        functions: {
          invoke: async () => ({
            data: null,
            error: { message: "provider timeout" },
          }),
        },
      } as never,
      { areaLabel: "Jersey City, NJ" },
    );

    await expect(repository.listCandidates()).rejects.toThrow(
      "Unable to load provider places: provider timeout",
    );
  });
});
