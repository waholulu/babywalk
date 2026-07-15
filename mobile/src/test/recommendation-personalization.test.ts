import { applyHardFilters, scoreRecommendations } from "@/domain";
import { mockPlaceCandidates } from "@/data/fixtures";
import {
  buildRecommendations,
  defaultLocalRecommendationConstraints,
} from "@/features/recommendations/local-recommendations";
import {
  applyPersonalizationToConstraints,
  buildPersonalizationFromPlaceActions,
} from "@/features/recommendations/personalization";

describe("recommendation personalization", () => {
  it("maps local place actions into bounded personalization inputs", () => {
    expect(
      buildPersonalizationFromPlaceActions({
        savedPlaceIds: ["liked", "liked"],
        visitedPlaceIds: ["visited"],
        blockedPlaceIds: ["blocked"],
      }),
    ).toEqual({
      likedPlaceIds: ["liked"],
      visitedPlaceIds: ["visited"],
      blockedPlaceIds: ["blocked"],
      dislikedPlaceIds: [],
      membershipPlaceIds: [],
    });
  });

  it("uses visits, likes, dislikes, and memberships only inside bounded score components", () => {
    const liked = fixture("hoboken-story-room-fixture");
    const disliked = fixture("jersey-city-riverside-playground-fixture");
    const membership = fixture("union-city-splash-pad-fixture");
    const results = scoreRecommendations({
      constraints: defaultLocalRecommendationConstraints,
      candidates: [liked, disliked, membership],
      travelEstimates: [
        { candidateId: liked.id, minutes: 10 },
        { candidateId: disliked.id, minutes: 10 },
        { candidateId: membership.id, minutes: 10 },
      ],
      visitedPlaceIds: [liked.id],
      likedPlaceIds: [liked.id],
      dislikedPlaceIds: [disliked.id],
      membershipPlaceIds: [membership.id],
    });

    const likedResult = findResult(results, liked.id);
    const dislikedResult = findResult(results, disliked.id);
    const membershipResult = findResult(results, membership.id);

    expect(likedResult.scoreBreakdown.novelty).toBe(0);
    expect(likedResult.scoreBreakdown.family_preference).toBe(5);
    expect(dislikedResult.scoreBreakdown.family_preference).toBe(0);
    expect(membershipResult.scoreBreakdown.family_preference).toBe(5);
  });

  it("keeps blocked places in hard filters instead of allowing personalization to rescue them", () => {
    const blockedId = "hoboken-story-room-fixture";
    const constraints = applyPersonalizationToConstraints(
      defaultLocalRecommendationConstraints,
      {
        visitedPlaceIds: [],
        likedPlaceIds: [blockedId],
        dislikedPlaceIds: [],
        membershipPlaceIds: [blockedId],
        blockedPlaceIds: [blockedId],
      },
    );
    const filtered = applyHardFilters({
      constraints,
      candidates: [fixture(blockedId)],
      travelEstimates: [{ candidateId: blockedId, minutes: 10 }],
    });

    expect(filtered).toEqual({
      included: [],
      excluded: [{ candidateId: blockedId, codes: ["BLOCKED_PLACE"] }],
    });
  });

  it("wires blocked local history into local recommendations", () => {
    const blockedId = "hoboken-story-room-fixture";
    const result = buildRecommendations(mockPlaceCandidates, "local fixtures", {
      personalization: {
        visitedPlaceIds: [],
        likedPlaceIds: [blockedId],
        dislikedPlaceIds: [],
        membershipPlaceIds: [blockedId],
        blockedPlaceIds: [blockedId],
      },
    });

    expect(result.cards.map((card) => card.candidate.id)).not.toContain(
      blockedId,
    );
    expect(result.excluded).toContainEqual({
      candidateId: blockedId,
      codes: ["BLOCKED_PLACE"],
    });
  });
});

function fixture(id: string) {
  const candidate = mockPlaceCandidates.find((item) => item.id === id);

  if (candidate === undefined) {
    throw new Error(`Missing fixture candidate: ${id}`);
  }

  return candidate;
}

function findResult(
  results: ReturnType<typeof scoreRecommendations>,
  candidateId: string,
) {
  const result = results.find((item) => item.candidateId === candidateId);

  if (result === undefined) {
    throw new Error(`Missing recommendation result: ${candidateId}`);
  }

  return result;
}
