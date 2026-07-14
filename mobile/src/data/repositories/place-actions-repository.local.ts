import {
  createInitialPlaceActionState,
  PlaceActionState,
  PlaceActionsRepository,
} from "./place-actions-repository";

const storageKey = "sproutscout.placeActions.v1";
let memoryState = createInitialPlaceActionState();

export function createLocalPlaceActionsRepository(): PlaceActionsRepository {
  return {
    async getState() {
      return readState();
    },
    async setSaved(placeId, saved) {
      await writeState((state) => ({
        ...state,
        savedPlaceIds: toggleId(state.savedPlaceIds, placeId, saved),
      }));
    },
    async markVisited(placeId) {
      await writeState((state) => ({
        ...state,
        visitedPlaceIds: toggleId(state.visitedPlaceIds, placeId, true),
      }));
    },
    async setBlocked(placeId, blocked) {
      await writeState((state) => ({
        ...state,
        blockedPlaceIds: toggleId(state.blockedPlaceIds, placeId, blocked),
      }));
    },
  };
}

export function resetLocalPlaceActionsRepositoryForTests() {
  memoryState = createInitialPlaceActionState();
  getLocalStorage()?.removeItem(storageKey);
}

function readState(): PlaceActionState {
  const localStorage = getLocalStorage();
  const storedValue = localStorage?.getItem(storageKey);

  if (storedValue === undefined || storedValue === null) {
    return cloneState(memoryState);
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<PlaceActionState>;
    memoryState = normalizeState(parsed);
  } catch {
    memoryState = createInitialPlaceActionState();
  }

  return cloneState(memoryState);
}

async function writeState(
  update: (state: PlaceActionState) => PlaceActionState,
) {
  const nextState = normalizeState(update(readState()));
  memoryState = nextState;
  getLocalStorage()?.setItem(storageKey, JSON.stringify(nextState));
}

function toggleId(ids: string[], placeId: string, shouldInclude: boolean) {
  const uniqueIds = new Set(ids);

  if (shouldInclude) {
    uniqueIds.add(placeId);
  } else {
    uniqueIds.delete(placeId);
  }

  return Array.from(uniqueIds).sort();
}

function normalizeState(value: Partial<PlaceActionState>): PlaceActionState {
  return {
    savedPlaceIds: normalizeIds(value.savedPlaceIds),
    visitedPlaceIds: normalizeIds(value.visitedPlaceIds),
    blockedPlaceIds: normalizeIds(value.blockedPlaceIds),
  };
}

function normalizeIds(value: unknown): string[] {
  return Array.isArray(value)
    ? Array.from(
        new Set(
          value.filter((item): item is string => typeof item === "string"),
        ),
      ).sort()
    : [];
}

function cloneState(state: PlaceActionState): PlaceActionState {
  return {
    savedPlaceIds: [...state.savedPlaceIds],
    visitedPlaceIds: [...state.visitedPlaceIds],
    blockedPlaceIds: [...state.blockedPlaceIds],
  };
}

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
