import { ClientEnvResult } from "@/lib/env";
import { RecommendationCardModel } from "./local-recommendations";

export type ScoreInspectorRow = {
  label: string;
  value: number;
};

export function shouldShowScoreInspector(env: ClientEnvResult): boolean {
  return env.ok && env.value.appEnv !== "production";
}

export function buildScoreInspectorRows(
  card: RecommendationCardModel,
): ScoreInspectorRow[] {
  return Object.entries(card.result.scoreBreakdown).map(([label, value]) => ({
    label,
    value,
  }));
}
