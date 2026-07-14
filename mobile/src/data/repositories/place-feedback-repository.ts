import { PlaceFeedbackType } from "@/features/places/place-feedback";

export type SubmitPlaceFeedbackInput = {
  placeId: string;
  feedbackType: PlaceFeedbackType;
  details: string;
};

export type SubmitPlaceFeedbackResult =
  | { ok: true; feedbackId: string }
  | {
      ok: false;
      reason: "auth_required" | "place_not_found" | "submit_failed";
    };

export type PlaceFeedbackRepository = {
  submit: (
    input: SubmitPlaceFeedbackInput,
  ) => Promise<SubmitPlaceFeedbackResult>;
};
