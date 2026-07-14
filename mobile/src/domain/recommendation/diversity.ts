import { PlaceCandidate } from "@/domain/place/types";
import { RecommendationResult } from "@/domain/recommendation/types";

export type DiversitySelectionInput = {
  results: RecommendationResult[];
  candidates: PlaceCandidate[];
  limit?: number;
  comparableScoreGap?: number;
};

type SelectionItem = {
  result: RecommendationResult;
  candidate?: PlaceCandidate;
  originalIndex: number;
};

const defaultLimit = 3;
const defaultComparableScoreGap = 10;

export function selectDiverseRecommendations(
  input: DiversitySelectionInput,
): RecommendationResult[] {
  const limit = input.limit ?? defaultLimit;
  const comparableScoreGap =
    input.comparableScoreGap ?? defaultComparableScoreGap;
  const candidateById = new Map(
    input.candidates.map((candidate) => [candidate.id, candidate]),
  );
  const remaining = input.results.map((result, originalIndex) => ({
    result,
    candidate: candidateById.get(result.candidateId),
    originalIndex,
  }));
  const selected: SelectionItem[] = [];

  while (selected.length < limit && remaining.length > 0) {
    const bestRemaining = remaining[0];
    const comparableItems = remaining.filter(
      (item) =>
        bestRemaining.result.totalScore - item.result.totalScore <=
        comparableScoreGap,
    );
    const nextItem = chooseMostDiverseComparable(comparableItems, selected);

    selected.push(nextItem);
    remaining.splice(
      remaining.findIndex(
        (item) => item.result.candidateId === nextItem.result.candidateId,
      ),
      1,
    );
  }

  return selected.map((item) => item.result);
}

function chooseMostDiverseComparable(
  comparableItems: SelectionItem[],
  selected: SelectionItem[],
): SelectionItem {
  return comparableItems.reduce((best, item) => {
    const itemScore = calculateDiversityScore(item, selected);
    const bestScore = calculateDiversityScore(best, selected);

    if (itemScore !== bestScore) {
      return itemScore > bestScore ? item : best;
    }

    return item.originalIndex < best.originalIndex ? item : best;
  }, comparableItems[0]);
}

function calculateDiversityScore(
  item: SelectionItem,
  selected: SelectionItem[],
): number {
  if (item.candidate === undefined || selected.length === 0) {
    return selected.length === 0 ? 3 : 0;
  }

  const usedCategories = new Set(
    selected
      .map((selectedItem) => selectedItem.candidate?.category)
      .filter((category) => category !== undefined),
  );
  const usedAreas = new Set(
    selected
      .map((selectedItem) =>
        selectedItem.candidate === undefined
          ? undefined
          : getAreaKey(selectedItem.candidate),
      )
      .filter((areaKey) => areaKey !== undefined),
  );

  const categoryScore = usedCategories.has(item.candidate.category) ? 0 : 2;
  const areaScore = usedAreas.has(getAreaKey(item.candidate)) ? 0 : 1;

  return categoryScore + areaScore;
}

function getAreaKey(candidate: PlaceCandidate): string {
  const city = candidate.area.city?.toLocaleLowerCase();
  const region = candidate.area.region?.toLocaleLowerCase() ?? "";

  if (city !== undefined) {
    return `${city}|${region}`;
  }

  return `${candidate.area.label.toLocaleLowerCase()}|${region}`;
}
