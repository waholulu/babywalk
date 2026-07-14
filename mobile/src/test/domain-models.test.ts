import {
  confidenceLevels,
  reasonCodes,
  scoreComponents,
  warningCodes,
} from "@/domain";

const forbiddenProviderTerms = [
  "google",
  "mapbox",
  "openweather",
  "yelp",
  "foursquare",
  "supabase",
];

describe("domain model vocabularies", () => {
  it("includes the product-specified recommendation reason codes", () => {
    expect(reasonCodes).toEqual([
      "AGE_MATCH",
      "HOME_BEFORE_NAP",
      "UNDER_BUDGET",
      "WEATHER_MATCH",
      "SHORT_DRIVE",
      "MEMBERSHIP_VALUE",
      "NEW_TO_FAMILY",
    ]);
  });

  it("includes the transparent score components", () => {
    expect(scoreComponents).toEqual([
      "age_activity_fit",
      "schedule_fit",
      "travel_convenience",
      "weather_fit",
      "budget_fit",
      "amenities_confidence",
      "novelty",
      "family_preference",
    ]);
  });

  it("keeps recommendation vocabularies provider-neutral", () => {
    const serializedVocabulary = [
      ...confidenceLevels,
      ...reasonCodes,
      ...scoreComponents,
      ...warningCodes,
    ]
      .join(" ")
      .toLowerCase();

    for (const term of forbiddenProviderTerms) {
      expect(serializedVocabulary).not.toContain(term);
    }
  });
});
