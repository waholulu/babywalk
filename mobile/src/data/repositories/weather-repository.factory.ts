import { ClientEnv } from "@/lib/env";
import { createSupabaseClient } from "@/lib/supabase";

import { WeatherRepository } from "./weather-repository";
import { createFixtureWeatherRepository } from "./weather-repository.fixture";
import { createSupabaseWeatherRepository } from "./weather-repository.supabase";

export function createWeatherRepository(env: ClientEnv): WeatherRepository {
  if (env.placeDataSource === "supabase" && env.supabase !== undefined) {
    return createSupabaseWeatherRepository(createSupabaseClient(env.supabase));
  }

  return createFixtureWeatherRepository();
}
