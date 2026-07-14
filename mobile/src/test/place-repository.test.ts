import { createPlaceRepository } from "@/data/repositories";
import { mapSupabasePlaceRowToCandidate } from "@/data/repositories/place-repository.supabase";
import { SupabasePlaceRow } from "@/lib/supabase";

describe("place repositories", () => {
  it("uses local fixture candidates by default", async () => {
    const repository = createPlaceRepository({
      appEnv: "local",
      placeDataSource: "fixtures",
    });

    await expect(repository.listCandidates()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "hoboken-story-room-fixture" }),
      ]),
    );
  });

  it("maps Supabase place rows into provider-neutral candidates", () => {
    const candidate = mapSupabasePlaceRowToCandidate(makePlaceRow());

    expect(candidate).toEqual({
      id: "seed-story-room",
      name: "Seed Story Room",
      category: "library",
      area: { label: "Hoboken, NJ" },
      coordinates: { latitude: 40.74, longitude: -74.03 },
      ageRangeMonths: { minMonths: 6, maxMonths: 48 },
      price: { band: "free" },
      indoorOutdoor: "indoor",
      amenities: {
        strollerFriendly: true,
        bathroomAvailable: true,
        parkingAvailable: "unknown",
      },
      source: {
        label: "sproutscout_seed_v1",
        retrievedAt: "2026-07-14T04:00:00+00:00",
        freshness: "verified",
      },
    });
  });

  it("preserves unknowns when optional Supabase fields are absent or invalid", () => {
    const candidate = mapSupabasePlaceRowToCandidate({
      ...makePlaceRow(),
      source_place_id: null,
      category: "unexpected",
      latitude: null,
      longitude: null,
      address_text: null,
      indoor_outdoor: "unexpected",
      min_age_months: null,
      max_age_months: null,
      price_band: "unexpected",
      amenities: {},
      source_retrieved_at: null,
      manually_reviewed_at: null,
    });

    expect(candidate).toEqual(
      expect.objectContaining({
        id: "71000000-0000-0000-0000-000000000001",
        category: "other",
        area: { label: "Area unknown" },
        coordinates: undefined,
        ageRangeMonths: "unknown",
        price: { band: "unknown" },
        indoorOutdoor: "unknown",
        amenities: {
          strollerFriendly: "unknown",
          bathroomAvailable: "unknown",
          parkingAvailable: "unknown",
        },
        source: expect.objectContaining({
          freshness: "unknown",
          retrievedAt: undefined,
        }),
      }),
    );
  });
});

function makePlaceRow(): SupabasePlaceRow {
  return {
    id: "71000000-0000-0000-0000-000000000001",
    source: "sproutscout_seed_v1",
    source_place_id: "seed-story-room",
    name: "Seed Story Room",
    category: "library",
    latitude: "40.740000",
    longitude: "-74.030000",
    address_text: "Hoboken, NJ",
    website_url: null,
    indoor_outdoor: "indoor",
    min_age_months: 6,
    max_age_months: 48,
    price_band: "free",
    amenities: {
      strollerFriendly: true,
      bathroomAvailable: true,
      parkingAvailable: "unknown",
    },
    source_retrieved_at: null,
    manually_reviewed_at: "2026-07-14T04:00:00+00:00",
    is_active: true,
  };
}
