export const placeFeedbackTypes = [
  "incorrect_hours",
  "closed_permanently",
  "wrong_age_fit",
  "wrong_price",
  "wrong_amenity",
  "duplicate",
  "other",
] as const;

export type PlaceFeedbackType = (typeof placeFeedbackTypes)[number];

export type PlaceFeedbackOption = {
  type: PlaceFeedbackType;
  label: string;
};

export type PlaceFeedbackDraft = {
  placeId: string;
  feedbackType: PlaceFeedbackType;
  details: string;
};

export type PlaceFeedbackInsertPayload = {
  user_id: string;
  place_id: string;
  feedback_type: PlaceFeedbackType;
  details?: string | null;
};

export const placeFeedbackOptions: PlaceFeedbackOption[] = [
  { type: "incorrect_hours", label: "Hours look wrong" },
  { type: "closed_permanently", label: "Closed permanently" },
  { type: "wrong_age_fit", label: "Age fit looks wrong" },
  { type: "wrong_price", label: "Price looks wrong" },
  { type: "wrong_amenity", label: "Amenity looks wrong" },
  { type: "duplicate", label: "Duplicate place" },
  { type: "other", label: "Something else" },
];

export function isPlaceFeedbackType(value: string): value is PlaceFeedbackType {
  return placeFeedbackTypes.includes(value as PlaceFeedbackType);
}

export function normalizeFeedbackDetails(value: string): string | undefined {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed.slice(0, 2000);
}

export function buildPlaceFeedbackInsertPayload(input: {
  userId: string;
  databasePlaceId: string;
  feedbackType: PlaceFeedbackType;
  details: string;
}): PlaceFeedbackInsertPayload {
  return {
    user_id: input.userId,
    place_id: input.databasePlaceId,
    feedback_type: input.feedbackType,
    details: normalizeFeedbackDetails(input.details) ?? null,
  };
}
