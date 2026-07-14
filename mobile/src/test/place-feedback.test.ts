import { createPlaceFeedbackRepositoryFromStore } from "@/data/repositories/place-feedback-repository.supabase";
import {
  buildPlaceFeedbackInsertPayload,
  normalizeFeedbackDetails,
  placeFeedbackOptions,
} from "@/features/places/place-feedback";

describe("place feedback model", () => {
  it("matches the structured feedback choices supported by the database", () => {
    expect(placeFeedbackOptions.map((option) => option.type)).toEqual([
      "incorrect_hours",
      "closed_permanently",
      "wrong_age_fit",
      "wrong_price",
      "wrong_amenity",
      "duplicate",
      "other",
    ]);
  });

  it("normalizes optional details", () => {
    expect(normalizeFeedbackDetails("  The hours changed.  ")).toBe(
      "The hours changed.",
    );
    expect(normalizeFeedbackDetails("   ")).toBeUndefined();
    expect(normalizeFeedbackDetails("a".repeat(2005))).toHaveLength(2000);
  });

  it("builds an insert payload without moderation fields", () => {
    const payload = buildPlaceFeedbackInsertPayload({
      userId: "user-1",
      databasePlaceId: "place-1",
      feedbackType: "wrong_price",
      details: "  Costs more now.  ",
    });

    expect(payload).toEqual({
      user_id: "user-1",
      place_id: "place-1",
      feedback_type: "wrong_price",
      details: "Costs more now.",
    });
    expect(payload).not.toHaveProperty("status");
  });
});

describe("Supabase place feedback repository", () => {
  it("requires an authenticated session", async () => {
    const repository = createPlaceFeedbackRepositoryFromStore(
      new FakeFeedbackStore({ userId: undefined }),
    );

    await expect(
      repository.submit({
        placeId: "hoboken-story-room-fixture",
        feedbackType: "incorrect_hours",
        details: "",
      }),
    ).resolves.toEqual({ ok: false, reason: "auth_required" });
  });

  it("returns place_not_found when the visible place id is not in Supabase", async () => {
    const repository = createPlaceFeedbackRepositoryFromStore(
      new FakeFeedbackStore({
        databasePlaceId: undefined,
        userId: "user-1",
      }),
    );

    await expect(
      repository.submit({
        placeId: "missing-place",
        feedbackType: "incorrect_hours",
        details: "",
      }),
    ).resolves.toEqual({ ok: false, reason: "place_not_found" });
  });

  it("submits only allowed feedback fields", async () => {
    const store = new FakeFeedbackStore({
      databasePlaceId: "71000000-0000-0000-0000-000000000001",
      feedbackId: "feedback-1",
      userId: "user-1",
    });
    const repository = createPlaceFeedbackRepositoryFromStore(store);

    await expect(
      repository.submit({
        placeId: "hoboken-story-room-fixture",
        feedbackType: "wrong_amenity",
        details: "  Bathroom info is wrong.  ",
      }),
    ).resolves.toEqual({ ok: true, feedbackId: "feedback-1" });

    expect(store.resolvedPlaceId).toBe("hoboken-story-room-fixture");
    expect(store.insertedPayload).toEqual({
      user_id: "user-1",
      place_id: "71000000-0000-0000-0000-000000000001",
      feedback_type: "wrong_amenity",
      details: "Bathroom info is wrong.",
    });
    expect(store.insertedPayload).not.toHaveProperty("status");
  });
});

type FakeFeedbackStoreOptions = {
  databasePlaceId?: string;
  feedbackId?: string;
  userId?: string;
};

class FakeFeedbackStore {
  insertedPayload: unknown;
  resolvedPlaceId: string | undefined;

  constructor(private readonly options: FakeFeedbackStoreOptions) {}

  async getSessionUserId() {
    return this.options.userId;
  }

  async resolveDatabasePlaceId(placeId: string) {
    this.resolvedPlaceId = placeId;

    return this.options.databasePlaceId;
  }

  async insertFeedback(payload: unknown) {
    this.insertedPayload = payload;

    return {
      ok: true as const,
      feedbackId: this.options.feedbackId ?? "feedback-id",
    };
  }
}
