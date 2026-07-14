export type PlaceActionState = {
  savedPlaceIds: string[];
  visitedPlaceIds: string[];
  blockedPlaceIds: string[];
};

export type PlaceActionsRepository = {
  getState: () => Promise<PlaceActionState>;
  setSaved: (placeId: string, saved: boolean) => Promise<void>;
  markVisited: (placeId: string) => Promise<void>;
  setBlocked: (placeId: string, blocked: boolean) => Promise<void>;
};

export function createInitialPlaceActionState(): PlaceActionState {
  return {
    savedPlaceIds: [],
    visitedPlaceIds: [],
    blockedPlaceIds: [],
  };
}
