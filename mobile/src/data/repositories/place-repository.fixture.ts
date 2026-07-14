import { mockPlaceCandidates } from "@/data/fixtures";

import type { PlaceRepository } from "./place-repository";

export function createFixturePlaceRepository(): PlaceRepository {
  return {
    async listCandidates() {
      return mockPlaceCandidates;
    },
  };
}
