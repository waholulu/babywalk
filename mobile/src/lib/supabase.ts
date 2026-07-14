import { createClient } from "@supabase/supabase-js";

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export type SupabasePlaceRow = {
  id: string;
  source: string;
  source_place_id: string | null;
  name: string;
  category: string;
  latitude: number | string | null;
  longitude: number | string | null;
  address_text: string | null;
  website_url: string | null;
  indoor_outdoor: string;
  min_age_months: number | null;
  max_age_months: number | null;
  price_band: string;
  amenities: Record<string, unknown>;
  source_retrieved_at: string | null;
  manually_reviewed_at: string | null;
  is_active: boolean;
};

export type PublicDatabase = {
  public: {
    Tables: {
      places: {
        Row: SupabasePlaceRow;
        Insert: never;
        Update: never;
      };
      place_feedback: {
        Row: {
          id: string;
          user_id: string;
          place_id: string;
          feedback_type: string;
          details: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          place_id: string;
          feedback_type: string;
          details?: string | null;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export function createSupabaseClient(config: SupabaseConfig) {
  return createClient<PublicDatabase>(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
