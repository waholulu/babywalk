import { SupabaseClient } from "@supabase/supabase-js";

import {
  buildPlaceFeedbackInsertPayload,
  PlaceFeedbackInsertPayload,
} from "@/features/places/place-feedback";
import { PublicDatabase } from "@/lib/supabase";

import { PlaceFeedbackRepository } from "./place-feedback-repository";

type SupabaseError = { message: string };

export type PlaceFeedbackStore = {
  getSessionUserId: () => Promise<string | undefined>;
  resolveDatabasePlaceId: (placeId: string) => Promise<string | undefined>;
  insertFeedback: (payload: PlaceFeedbackInsertPayload) => Promise<
    | {
        ok: true;
        feedbackId: string;
      }
    | {
        ok: false;
      }
  >;
};

type PlaceLookupQuery = {
  select: (columns: string) => {
    eq: (
      column: "id" | "source_place_id",
      value: string,
    ) => {
      maybeSingle: () => Promise<{
        data: { id: string } | null;
        error: SupabaseError | null;
      }>;
    };
  };
};

type FeedbackInsertQuery = {
  insert: (payload: PlaceFeedbackInsertPayload) => {
    select: (columns: "id") => {
      single: () => Promise<{
        data: { id: string } | null;
        error: SupabaseError | null;
      }>;
    };
  };
};

export type PlaceFeedbackSupabaseClient = {
  auth: {
    getSession: () => Promise<{
      data: { session: { user: { id: string } } | null };
      error: SupabaseError | null;
    }>;
  };
  from: {
    (table: "places"): PlaceLookupQuery;
    (table: "place_feedback"): FeedbackInsertQuery;
  };
};

export function createSupabasePlaceFeedbackRepository(
  client: SupabaseClient<PublicDatabase>,
): PlaceFeedbackRepository {
  return createPlaceFeedbackRepositoryFromStore({
    getSessionUserId: () =>
      getSessionUserId(client as unknown as PlaceFeedbackSupabaseClient),
    resolveDatabasePlaceId: (placeId) =>
      resolveDatabasePlaceId(
        client as unknown as PlaceFeedbackSupabaseClient,
        placeId,
      ),
    insertFeedback: (payload) =>
      insertFeedback(client as unknown as PlaceFeedbackSupabaseClient, payload),
  });
}

export function createPlaceFeedbackRepositoryFromStore(
  store: PlaceFeedbackStore,
): PlaceFeedbackRepository {
  return {
    async submit(input) {
      const userId = await store.getSessionUserId();

      if (userId === undefined) {
        return { ok: false, reason: "auth_required" };
      }

      const databasePlaceId = await store.resolveDatabasePlaceId(input.placeId);

      if (databasePlaceId === undefined) {
        return { ok: false, reason: "place_not_found" };
      }

      const payload = buildPlaceFeedbackInsertPayload({
        userId,
        databasePlaceId,
        feedbackType: input.feedbackType,
        details: input.details,
      });
      const result = await store.insertFeedback(payload);

      if (!result.ok) {
        return { ok: false, reason: "submit_failed" };
      }

      return { ok: true, feedbackId: result.feedbackId };
    },
  };
}

async function getSessionUserId(
  client: PlaceFeedbackSupabaseClient,
): Promise<string | undefined> {
  const { data, error } = await client.auth.getSession();

  if (error !== null || data.session === null) {
    return undefined;
  }

  return data.session.user.id;
}

async function resolveDatabasePlaceId(
  client: PlaceFeedbackSupabaseClient,
  placeId: string,
): Promise<string | undefined> {
  const lookupColumn = isUuid(placeId) ? "id" : "source_place_id";
  const { data, error } = await client
    .from("places")
    .select("id")
    .eq(lookupColumn, placeId)
    .maybeSingle();

  if (error !== null || data === null) {
    return undefined;
  }

  return data.id;
}

async function insertFeedback(
  client: PlaceFeedbackSupabaseClient,
  payload: PlaceFeedbackInsertPayload,
) {
  const { data, error } = await client
    .from("place_feedback")
    .insert(payload)
    .select("id")
    .single();

  if (error !== null || data === null) {
    return { ok: false } as const;
  }

  return { ok: true, feedbackId: data.id } as const;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
