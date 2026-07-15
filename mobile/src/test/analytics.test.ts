import {
  AnalyticsEvent,
  resetAnalyticsProviderForTests,
  sanitizeAnalyticsProperties,
  setAnalyticsProviderForTests,
  trackAnalyticsEvent,
} from "@/lib/analytics";

const localEnv = {
  ok: true,
  value: { appEnv: "local", placeDataSource: "fixtures" },
} as const;

const productionEnv = {
  ok: true,
  value: { appEnv: "production", placeDataSource: "fixtures" },
} as const;

describe("analytics wrapper", () => {
  afterEach(() => {
    resetAnalyticsProviderForTests();
  });

  it("drops sensitive property names and keeps primitive safe values", () => {
    expect(
      sanitizeAnalyticsProperties({
        childAgeMonths: 24,
        preciseLatitude: 40.7,
        homeAreaLabel: "Jersey City, NJ",
        supabaseAnonKey: "secret",
        budget: "under_30",
        has_nap: true,
        result_count: 3,
        empty: undefined,
      }),
    ).toEqual({
      budget: "under_30",
      has_nap: true,
      result_count: 3,
    });
  });

  it("uses a replaceable provider for sanitized local events", () => {
    const events: AnalyticsEvent[] = [];
    setAnalyticsProviderForTests({
      track(event) {
        events.push(event);
      },
    });

    trackAnalyticsEvent(
      "plan_submitted",
      {
        budget: "free",
        areaLabel: "Hoboken, NJ",
      },
      localEnv,
    );

    expect(events).toEqual([
      {
        name: "plan_submitted",
        appEnv: "local",
        properties: { budget: "free" },
      },
    ]);
  });

  it("does not emit through the default production path", () => {
    const events: AnalyticsEvent[] = [];
    setAnalyticsProviderForTests({
      track(event) {
        events.push(event);
      },
    });

    trackAnalyticsEvent(
      "recommendations_loaded",
      { result_count: 3 },
      productionEnv,
    );

    expect(events).toEqual([]);
  });
});
