import { PlaceActionState } from "@/data/repositories";
import { FamilyConstraints } from "@/domain";

export type RecommendationPersonalization = {
  visitedPlaceIds: string[];
  likedPlaceIds: string[];
  dislikedPlaceIds: string[];
  membershipPlaceIds: string[];
  blockedPlaceIds: string[];
};

export function createEmptyRecommendationPersonalization(): RecommendationPersonalization {
  return {
    visitedPlaceIds: [],
    likedPlaceIds: [],
    dislikedPlaceIds: [],
    membershipPlaceIds: [],
    blockedPlaceIds: [],
  };
}

export function buildPersonalizationFromPlaceActions(
  state: PlaceActionState,
): RecommendationPersonalization {
  return {
    ...createEmptyRecommendationPersonalization(),
    visitedPlaceIds: normalizeIds(state.visitedPlaceIds),
    likedPlaceIds: normalizeIds(state.savedPlaceIds),
    blockedPlaceIds: normalizeIds(state.blockedPlaceIds),
  };
}

export function applyPersonalizationToConstraints(
  constraints: FamilyConstraints,
  personalization: RecommendationPersonalization,
): FamilyConstraints {
  return {
    ...constraints,
    blockedPlaceIds: normalizeIds([
      ...(constraints.blockedPlaceIds ?? []),
      ...personalization.blockedPlaceIds,
    ]),
  };
}

function normalizeIds(ids: readonly string[]): string[] {
  return Array.from(new Set(ids)).sort();
}
