import { buildLocalRecommendations } from "@/features/recommendations/local-recommendations";
import {
  buildScoreInspectorRows,
  shouldShowScoreInspector,
} from "@/features/recommendations/score-inspector";
import { ClientEnvResult } from "@/lib/env";

function envResult(
  appEnv: "local" | "staging" | "production",
): ClientEnvResult {
  return { ok: true, value: { appEnv, placeDataSource: "fixtures" } };
}

describe("shouldShowScoreInspector", () => {
  it("shows the inspector only in local development", () => {
    expect(shouldShowScoreInspector(envResult("local"))).toBe(true);
    expect(shouldShowScoreInspector(envResult("staging"))).toBe(false);
  });

  it("hides the inspector in production or invalid env states", () => {
    expect(shouldShowScoreInspector(envResult("production"))).toBe(false);
    expect(
      shouldShowScoreInspector({
        ok: false,
        issues: [{ name: "EXPO_PUBLIC_APP_ENV", reason: "missing" }],
      }),
    ).toBe(false);
  });
});

describe("buildScoreInspectorRows", () => {
  it("returns complete score component rows for a recommendation card", () => {
    const [firstCard] = buildLocalRecommendations().cards;

    expect(buildScoreInspectorRows(firstCard)).toEqual([
      { label: "age_activity_fit", value: 25 },
      { label: "schedule_fit", value: 20 },
      { label: "travel_convenience", value: 11 },
      { label: "weather_fit", value: 15 },
      { label: "budget_fit", value: 10 },
      { label: "amenities_confidence", value: 4 },
      { label: "novelty", value: 5 },
      { label: "family_preference", value: 5 },
    ]);
  });
});
