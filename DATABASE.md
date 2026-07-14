# Database and Data-Access Plan

## 1. Principles

- All schema changes are migrations committed to Git.
- Dashboard-only schema edits are prohibited.
- Row Level Security is enabled on every client-accessible table.
- The service role key is never shipped to the mobile app.
- Precise location and child information are minimized.
- Provider licensing and retention rules are reviewed before caching external fields.
- Seed data must be safe to publish and contain no personal data.

## 2. Proposed MVP tables

### `profiles`

One row per authenticated adult user.

Suggested fields:

- `user_id uuid primary key references auth.users`
- `home_area_text text null`
- `home_lat_rounded numeric null`
- `home_lng_rounded numeric null`
- `default_drive_minutes integer`
- `default_budget_band text`
- `created_at timestamptz`
- `updated_at timestamptz`

Coordinates, when stored, should be deliberately rounded/coarse. A precise home address is not needed.

### `child_preferences`

Do not store a child name in MVP.

Suggested fields:

- `id uuid primary key`
- `user_id uuid`
- `age_months integer`
- `age_updated_at date`
- `typical_nap_start time null`
- `typical_nap_end time null`
- `stroller_required boolean`
- `interests text[]`
- `created_at timestamptz`
- `updated_at timestamptz`

Validate age bounds in both application code and database constraints.

### `places`

Internal canonical place record.

Suggested fields:

- `id uuid primary key`
- `source text`
- `source_place_id text null`
- `name text`
- `category text`
- `description text null`
- `latitude numeric`
- `longitude numeric`
- `address_text text null`
- `website_url text null`
- `phone text null`
- `indoor_outdoor text`
- `min_age_months integer null`
- `max_age_months integer null`
- `price_band text`
- `amenities jsonb`
- `hours jsonb null`
- `verification_notes text null`
- `source_retrieved_at timestamptz null`
- `manually_reviewed_at timestamptz null`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

Use a unique constraint on `(source, source_place_id)` when the external ID exists.

### `events`

Events are separate from places because their time validity and recurrence differ.

Suggested fields:

- `id uuid primary key`
- `place_id uuid null`
- `source text`
- `source_event_id text null`
- `title text`
- `starts_at timestamptz`
- `ends_at timestamptz null`
- `min_age_months integer null`
- `max_age_months integer null`
- `price_band text`
- `registration_url text null`
- `status text`
- `source_retrieved_at timestamptz null`
- `created_at timestamptz`
- `updated_at timestamptz`

### `saved_places`

- `user_id uuid`
- `place_id uuid`
- `created_at timestamptz`
- primary key `(user_id, place_id)`

### `visits`

- `id uuid primary key`
- `user_id uuid`
- `place_id uuid`
- `visited_on date`
- `rating smallint null`
- `would_return boolean null`
- `created_at timestamptz`

### `place_feedback`

- `id uuid primary key`
- `user_id uuid`
- `place_id uuid`
- `feedback_type text`
- `details text null`
- `status text default 'new'`
- `created_at timestamptz`

Feedback types should be enumerated in application code and constrained in SQL, for example:

- incorrect hours;
- closed permanently;
- wrong age fit;
- wrong price;
- wrong amenity;
- duplicate;
- other.

### `recommendation_feedback`

Store the user’s reaction without storing a large raw prompt.

- `id uuid primary key`
- `user_id uuid null`
- `candidate_id uuid`
- `action text`
- `reason_code text null`
- `created_at timestamptz`

## 3. Access policy intent

### Public/anonymous reads

Curated active places and current events may be readable by anonymous users if the product supports guest mode. Expose only public columns through a view or restricted table policy.

### User-owned data

Profiles, child preferences, saved places, visits, and feedback are readable and writable only by the authenticated owner.

### Admin data

Moderation status, ingestion metadata, and internal notes should not be exposed through the mobile client. Use restricted views, Edge Functions, or admin roles.

## 4. RLS verification checklist

For every table:

- Is RLS enabled?
- Is anonymous access intentionally allowed or denied?
- Can User A read User B’s rows?
- Can User A insert a row with User B’s `user_id`?
- Can User A update ownership fields?
- Can a user delete only their own row?
- Does an admin/server path work without weakening client policies?
- Is there an index on columns used by policies, such as `user_id`?

Create automated tests for at least the cross-user cases before beta.

## 5. Migration workflow

1. Start local Supabase.
2. Create a named migration.
3. Edit SQL in the migration file.
4. Reset the local database from migrations and seed.
5. Run database tests and application tests.
6. Review generated diff.
7. Apply to staging.
8. Verify staging.
9. Back up/confirm rollback strategy.
10. Apply to production during a controlled release.

Never “fix production first and copy it back later.”

## 6. Data freshness

Every factual record shown to users should have a provenance and freshness strategy:

- curated records: `manually_reviewed_at`;
- provider records: `source_retrieved_at`;
- events: explicit start/end and status;
- hours: source and retrieval timestamp;
- user-submitted corrections: moderation state.

UI copy should say “Last checked…” where stale data could materially affect a trip.
