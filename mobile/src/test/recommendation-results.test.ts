import { buildLocalRecommendations } from "@/features/recommendations/local-recommendations";

describe("buildLocalRecommendations", () => {
  it("builds three canonical local recommendation cards", () => {
    const result = buildLocalRecommendations();

    expect({
      candidateCount: result.candidateCount,
      excludedCount: result.excludedCount,
      cards: result.cards.map((card) => ({
        id: card.candidate.id,
        name: card.candidate.name,
        totalScore: card.result.totalScore,
        confidence: card.result.confidence,
        reasons: card.result.reasonCodes,
        warnings: card.result.warnings.map((warning) => warning.code),
        displayedReasons: card.reasonCodes,
        displayedWarnings: card.warnings.map((warning) => warning.code),
      })),
    }).toMatchSnapshot();
  });
});
