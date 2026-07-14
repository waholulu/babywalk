import { getPlaceDetailModel } from "@/features/places/place-detail";

describe("getPlaceDetailModel", () => {
  it("formats known fixture facts for a place detail screen", () => {
    const detail = getPlaceDetailModel("hoboken-story-room-fixture");

    expect(detail?.facts).toEqual(
      expect.arrayContaining([
        { label: "Category", value: "library", confidence: "known" },
        { label: "Area", value: "Hoboken, NJ", confidence: "known" },
        { label: "Age fit", value: "6-48 months", confidence: "known" },
        { label: "Typical visit", value: "60 minutes", confidence: "known" },
        { label: "Price", value: "Free", confidence: "known" },
      ]),
    );
    expect(detail?.scheduleFacts).toEqual([
      { label: "Schedule 1", value: "9:30 AM-11:00 AM", confidence: "known" },
    ]);
  });

  it("keeps unknown data as unknown facts and verify notes", () => {
    const detail = getPlaceDetailModel("fort-lee-nature-room-fixture");

    expect(detail).not.toBeNull();
    expect(detail?.facts).toEqual(
      expect.arrayContaining([
        { label: "Age fit", value: "Unknown", confidence: "unknown" },
        { label: "Price", value: "Unknown", confidence: "unknown" },
        { label: "Freshness", value: "Unknown", confidence: "unknown" },
      ]),
    );
    expect(detail?.amenityFacts).toEqual([
      {
        label: "Stroller friendly",
        value: "Unknown",
        confidence: "unknown",
      },
      {
        label: "Bathroom available",
        value: "Unknown",
        confidence: "unknown",
      },
      {
        label: "Parking available",
        value: "Unknown",
        confidence: "unknown",
      },
    ]);
    expect(detail?.verifyNotes).toEqual(
      expect.arrayContaining([
        "Schedule is unknown in the local fixture data.",
        "Age fit is unknown in the local fixture data.",
        "Price is unknown in the local fixture data.",
        "Source freshness is limited.",
      ]),
    );
  });

  it("returns null for an unknown route id", () => {
    expect(getPlaceDetailModel("missing-place")).toBeNull();
  });
});
