import { SupabaseClient } from "@supabase/supabase-js";

import { PublicDatabase } from "@/lib/supabase";

import {
  validateWeatherRequest,
  validateWeatherSnapshot,
  WeatherRepository,
  WeatherRequest,
} from "./weather-repository";

export function createSupabaseWeatherRepository(
  client: SupabaseClient<PublicDatabase>,
): WeatherRepository {
  return {
    async getSnapshot(request: WeatherRequest) {
      const { data, error } = await client.functions.invoke("get-weather", {
        body: validateWeatherRequest(request),
      });

      if (error) {
        throw new Error(`Unable to load weather: ${error.message}`);
      }

      return validateWeatherSnapshot(data);
    },
  };
}
