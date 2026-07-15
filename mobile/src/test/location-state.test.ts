import {
  buildCoarseCurrentLocationLabel,
  buildLocationStatusMessage,
  roundCoordinate,
} from "@/features/location";

describe("location state helpers", () => {
  it("rounds coordinates to coarse precision", () => {
    expect(roundCoordinate(40.742913)).toBe(40.74);
    expect(roundCoordinate(-74.03119)).toBe(-74.03);
  });

  it("builds a coarse current-location area label", () => {
    expect(
      buildCoarseCurrentLocationLabel({
        latitudeRounded: 40.74,
        longitudeRounded: -74.03,
      }),
    ).toBe("Near current location (40.74, -74.03)");
  });

  it("keeps manual fallback clear for denied, restricted, and unavailable states", () => {
    expect(buildLocationStatusMessage("denied")).toContain(
      "Enter a city, neighborhood, or ZIP area",
    );
    expect(buildLocationStatusMessage("restricted")).toContain(
      "Manual area entry still works",
    );
    expect(buildLocationStatusMessage("unavailable")).toContain(
      "Manual area entry still works",
    );
  });
});
