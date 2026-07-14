import {
  createLocalPlaceActionsRepository,
  resetLocalPlaceActionsRepositoryForTests,
} from "@/data/repositories";
import { buildPlaceActionButtons } from "@/features/places/place-actions";

describe("local place actions repository", () => {
  beforeEach(() => {
    resetLocalPlaceActionsRepositoryForTests();
  });

  it("persists saved, visited, and blocked place actions locally", async () => {
    const repository = createLocalPlaceActionsRepository();

    await repository.setSaved("place-a", true);
    await repository.markVisited("place-b");
    await repository.setBlocked("place-c", true);

    await expect(repository.getState()).resolves.toEqual({
      savedPlaceIds: ["place-a"],
      visitedPlaceIds: ["place-b"],
      blockedPlaceIds: ["place-c"],
    });
  });

  it("can remove saved and blocked place actions", async () => {
    const repository = createLocalPlaceActionsRepository();

    await repository.setSaved("place-a", true);
    await repository.setBlocked("place-a", true);
    await repository.setSaved("place-a", false);
    await repository.setBlocked("place-a", false);

    await expect(repository.getState()).resolves.toEqual({
      savedPlaceIds: [],
      visitedPlaceIds: [],
      blockedPlaceIds: [],
    });
  });
});

describe("buildPlaceActionButtons", () => {
  it("formats action labels from current state", () => {
    expect(
      buildPlaceActionButtons(
        "place-a",
        {
          savedPlaceIds: ["place-a"],
          visitedPlaceIds: ["place-a"],
          blockedPlaceIds: ["place-a"],
        },
        false,
      ),
    ).toEqual([
      expect.objectContaining({ id: "save", label: "Saved", disabled: false }),
      expect.objectContaining({
        id: "visit",
        label: "Visited",
        disabled: true,
      }),
      expect.objectContaining({
        id: "block",
        label: "Recommend again",
        disabled: false,
      }),
      expect.objectContaining({
        id: "report",
        label: "Report incorrect data",
        disabled: false,
      }),
    ]);
  });

  it("disables mutable actions while an action is saving", () => {
    expect(
      buildPlaceActionButtons(
        "place-a",
        {
          savedPlaceIds: [],
          visitedPlaceIds: [],
          blockedPlaceIds: [],
        },
        true,
      ),
    ).toEqual([
      expect.objectContaining({ id: "save", disabled: true }),
      expect.objectContaining({ id: "visit", disabled: true }),
      expect.objectContaining({ id: "block", disabled: true }),
      expect.objectContaining({ id: "report", disabled: true }),
    ]);
  });
});
