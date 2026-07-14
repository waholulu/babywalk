import { PlaceActionState } from "@/data/repositories";

export type PlaceActionButtonModel = {
  id: "save" | "visit" | "block" | "report";
  label: string;
  hint: string;
  disabled: boolean;
};

export function buildPlaceActionButtons(
  placeId: string,
  state: PlaceActionState,
  isBusy: boolean,
): PlaceActionButtonModel[] {
  const isSaved = state.savedPlaceIds.includes(placeId);
  const isVisited = state.visitedPlaceIds.includes(placeId);
  const isBlocked = state.blockedPlaceIds.includes(placeId);

  return [
    {
      id: "save",
      label: isSaved ? "Saved" : "Save",
      hint: isSaved
        ? "Remove this place from saved places."
        : "Save this place.",
      disabled: isBusy,
    },
    {
      id: "visit",
      label: isVisited ? "Visited" : "Mark visited",
      hint: isVisited
        ? "This place is already marked visited."
        : "Add this place to recent visits.",
      disabled: isBusy || isVisited,
    },
    {
      id: "block",
      label: isBlocked ? "Recommend again" : "Do not recommend",
      hint: isBlocked
        ? "Allow this place in future recommendations."
        : "Hide this place from future local recommendations.",
      disabled: isBusy,
    },
    {
      id: "report",
      label: "Report incorrect data",
      hint: "Open a short form to report outdated or incorrect place data.",
      disabled: isBusy,
    },
  ];
}
