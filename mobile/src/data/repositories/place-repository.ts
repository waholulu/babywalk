import { PlaceCandidate } from "@/domain";
import { ClientEnv } from "@/lib/env";
import { createSupabaseClient } from "@/lib/supabase";

import { createFixturePlaceRepository } from "./place-repository.fixture";
import { createSupabasePlaceRepository } from "./place-repository.supabase";

export type PlaceRepository = {
  listCandidates: () => Promise<PlaceCandidate[]>;
};

export function createPlaceRepository(env: ClientEnv): PlaceRepository {
  if (env.placeDataSource === "supabase") {
    if (env.supabase === undefined) {
      throw new Error("Supabase configuration is required for Supabase data.");
    }

    return createSupabasePlaceRepository(createSupabaseClient(env.supabase));
  }

  return createFixturePlaceRepository();
}
