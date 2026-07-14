create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  home_area_text text,
  home_lat_rounded numeric(8, 4),
  home_lng_rounded numeric(9, 4),
  default_drive_minutes integer not null default 25,
  default_budget_band text not null default 'under_30',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_home_area_text_length check (
    home_area_text is null or char_length(home_area_text) <= 120
  ),
  constraint profiles_home_lat_rounded_range check (
    home_lat_rounded is null or home_lat_rounded between -90 and 90
  ),
  constraint profiles_home_lng_rounded_range check (
    home_lng_rounded is null or home_lng_rounded between -180 and 180
  ),
  constraint profiles_default_drive_minutes_range check (
    default_drive_minutes between 5 and 90
  ),
  constraint profiles_default_budget_band_check check (
    default_budget_band in ('free', 'under_30', 'flexible')
  )
);

create table public.child_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  age_months integer not null,
  age_updated_at date not null default current_date,
  typical_nap_start time,
  typical_nap_end time,
  stroller_required boolean not null default false,
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint child_preferences_age_months_range check (
    age_months between 0 and 120
  ),
  constraint child_preferences_nap_order check (
    typical_nap_start is null
    or typical_nap_end is null
    or typical_nap_start < typical_nap_end
  ),
  constraint child_preferences_interests_count check (
    cardinality(interests) <= 20
  )
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_place_id text,
  name text not null,
  category text not null,
  description text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  address_text text,
  website_url text,
  phone text,
  indoor_outdoor text not null default 'unknown',
  min_age_months integer,
  max_age_months integer,
  price_band text not null default 'unknown',
  amenities jsonb not null default '{}'::jsonb,
  hours jsonb,
  verification_notes text,
  source_retrieved_at timestamptz,
  manually_reviewed_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint places_source_length check (char_length(source) between 1 and 80),
  constraint places_source_place_id_length check (
    source_place_id is null or char_length(source_place_id) <= 160
  ),
  constraint places_name_length check (char_length(name) between 1 and 160),
  constraint places_category_check check (
    category in (
      'library',
      'playground',
      'museum',
      'zoo',
      'farm',
      'park',
      'waterfront',
      'indoor_play',
      'community_center',
      'other'
    )
  ),
  constraint places_latitude_range check (
    latitude is null or latitude between -90 and 90
  ),
  constraint places_longitude_range check (
    longitude is null or longitude between -180 and 180
  ),
  constraint places_indoor_outdoor_check check (
    indoor_outdoor in ('indoor', 'outdoor', 'mixed', 'unknown')
  ),
  constraint places_age_range check (
    (min_age_months is null or min_age_months between 0 and 120)
    and (max_age_months is null or max_age_months between 0 and 120)
    and (
      min_age_months is null
      or max_age_months is null
      or min_age_months <= max_age_months
    )
  ),
  constraint places_price_band_check check (
    price_band in ('free', 'under_30', 'paid', 'unknown')
  ),
  constraint places_amenities_object check (jsonb_typeof(amenities) = 'object')
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.places(id) on delete set null,
  source text not null,
  source_event_id text,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  min_age_months integer,
  max_age_months integer,
  price_band text not null default 'unknown',
  registration_url text,
  status text not null default 'scheduled',
  source_retrieved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_source_length check (char_length(source) between 1 and 80),
  constraint events_source_event_id_length check (
    source_event_id is null or char_length(source_event_id) <= 160
  ),
  constraint events_title_length check (char_length(title) between 1 and 180),
  constraint events_time_order check (ends_at is null or starts_at < ends_at),
  constraint events_age_range check (
    (min_age_months is null or min_age_months between 0 and 120)
    and (max_age_months is null or max_age_months between 0 and 120)
    and (
      min_age_months is null
      or max_age_months is null
      or min_age_months <= max_age_months
    )
  ),
  constraint events_price_band_check check (
    price_band in ('free', 'under_30', 'paid', 'unknown')
  ),
  constraint events_status_check check (
    status in ('scheduled', 'cancelled', 'postponed', 'ended', 'unknown')
  )
);

create table public.saved_places (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  visited_on date not null,
  rating smallint,
  would_return boolean,
  created_at timestamptz not null default now(),
  constraint visits_rating_range check (rating is null or rating between 1 and 5)
);

create table public.place_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  feedback_type text not null,
  details text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint place_feedback_type_check check (
    feedback_type in (
      'incorrect_hours',
      'closed_permanently',
      'wrong_age_fit',
      'wrong_price',
      'wrong_amenity',
      'duplicate',
      'other'
    )
  ),
  constraint place_feedback_status_check check (
    status in ('new', 'reviewing', 'resolved', 'dismissed')
  ),
  constraint place_feedback_details_length check (
    details is null or char_length(details) <= 2000
  )
);

create table public.recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  candidate_id uuid not null,
  action text not null,
  reason_code text,
  created_at timestamptz not null default now(),
  constraint recommendation_feedback_action_check check (
    action in ('viewed', 'opened_detail', 'saved', 'dismissed', 'useful', 'not_useful')
  ),
  constraint recommendation_feedback_reason_code_length check (
    reason_code is null or char_length(reason_code) <= 80
  )
);

create unique index places_source_place_id_unique
  on public.places (source, source_place_id)
  where source_place_id is not null;

create unique index events_source_event_id_unique
  on public.events (source, source_event_id)
  where source_event_id is not null;

create index child_preferences_user_id_idx
  on public.child_preferences (user_id);

create index places_active_category_idx
  on public.places (is_active, category);

create index places_area_lookup_idx
  on public.places (source, is_active);

create index events_place_id_idx
  on public.events (place_id);

create index events_starts_at_status_idx
  on public.events (starts_at, status);

create index saved_places_place_id_idx
  on public.saved_places (place_id);

create index visits_user_id_visited_on_idx
  on public.visits (user_id, visited_on desc);

create index visits_place_id_idx
  on public.visits (place_id);

create index place_feedback_user_id_idx
  on public.place_feedback (user_id);

create index place_feedback_place_id_status_idx
  on public.place_feedback (place_id, status);

create index recommendation_feedback_user_id_idx
  on public.recommendation_feedback (user_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger child_preferences_set_updated_at
before update on public.child_preferences
for each row execute function public.set_updated_at();

create trigger places_set_updated_at
before update on public.places
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.child_preferences enable row level security;
alter table public.places enable row level security;
alter table public.events enable row level security;
alter table public.saved_places enable row level security;
alter table public.visits enable row level security;
alter table public.place_feedback enable row level security;
alter table public.recommendation_feedback enable row level security;
