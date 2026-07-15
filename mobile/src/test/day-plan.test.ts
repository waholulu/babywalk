import { buildLocalDayPlan } from "@/features/plans/day-plan";

describe("buildLocalDayPlan", () => {
  it("builds a local day-plan model with timeline, assumptions, backup, and warnings", () => {
    const result = buildLocalDayPlan("local-morning");

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      return;
    }

    expect(result.plan).toEqual(
      expect.objectContaining({
        id: "local-morning",
        title: "Morning plan",
        sourceLabel: "local fixtures",
        backup: expect.objectContaining({
          placeName: "Union City Splash Pad Fixture",
        }),
      }),
    );
    expect(result.plan.stops.map((stop) => stop.placeName)).toEqual([
      "Hoboken Story Room Fixture",
      "Jersey City Riverside Playground Fixture",
    ]);
    expect(result.plan.timeline.map((item) => item.label)).toEqual([
      "Leave home",
      "Arrive at Hoboken Story Room Fixture",
      "Activity at Hoboken Story Room Fixture",
      "Leave Hoboken Story Room Fixture",
      "Arrive at Jersey City Riverside Playground Fixture",
      "Activity at Jersey City Riverside Playground Fixture",
      "Leave Jersey City Riverside Playground Fixture",
      "Back home",
    ]);
    expect(result.plan.assumptions).toEqual(
      expect.arrayContaining([
        "Travel times are estimates from local fixture data, not live traffic.",
      ]),
    );
    expect(result.plan.verificationWarnings).toContain(
      "Check official hours, weather, transit, and any fees before leaving.",
    );
  });
});
