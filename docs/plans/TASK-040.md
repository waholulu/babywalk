# TASK-040 Execution Plan — Import Curated Places Into Local And Staging Supabase

## Objective

Load the TASK-039 curated pilot place set into local Supabase and hosted staging through versioned import scripts, while keeping secrets out of Git and proving the app can read the staging set with the publishable key path.

## In scope

- Convert `docs/data/pilot_places.csv` into deterministic SQL for `public.places`.
- Keep the import versioned and repeatable for local reset and staging.
- Preserve source, source URL, manual review date, age bands, price band, indoor/outdoor mode, and verification notes.
- Add automated checks that confirm the curated pilot set exists after import.
- Apply the import to hosted staging if the current CLI session has the required non-committed credentials.
- Update `PROJECT_STATE.md` and `TASKS.md` only after verification.

## Out of scope

- Adding new database columns or weakening RLS.
- Importing events, hours, exact live availability, or amenities that were not reviewed.
- Creating production Supabase resources.
- EAS builds or Expo Go QA flows.

## Files expected to change

- `docs/plans/TASK-040.md`
- `scripts/build-pilot-place-seed.mjs`
- `supabase/seeds/pilot_places_20260716.sql`
- `supabase/config.toml`
- `supabase/tests/pilot_place_checks.sql`
- `PROJECT_STATE.md`
- `TASKS.md`

## Existing behavior inspected

- `supabase/config.toml` runs only `./seed.sql` during `npx supabase db reset`.
- `supabase/seed.sql` currently contains fixture-only place and event rows.
- The `places` table already supports `source`, `source_place_id`, `description`, `website_url`, age bounds, price band, `verification_notes`, and `manually_reviewed_at`.
- `docs/data/pilot_places.csv` contains 69 validated pilot place rows.

## Implementation steps

1. Add a generator that reads `pilot_places.csv` and writes a deterministic seed SQL file for source `sproutscout_pilot_20260716`.
2. Include the generated seed from `supabase/config.toml` so local reset loads fixtures plus curated pilot places.
3. Add SQL checks for local/staging row counts, source metadata, freshness metadata, and absence of unresolved null source IDs.
4. Run local Supabase reset and SQL checks.
5. Apply the same SQL to linked staging and verify counts/read access if credentials are available.

## Test plan

### Automated

- Command: `node scripts/validate-pilot-places.mjs`
- Expected result: CSV still passes curation quality gates.

- Command: `node scripts/build-pilot-place-seed.mjs --check`
- Expected result: generated SQL is current.

- Command: `npx supabase db reset`
- Expected result: local reset applies migrations and seeds without error.

- Command: local SQL check through `psql`
- Expected result: pilot place count and metadata assertions pass.

- Command: staging SQL import and check through Supabase CLI
- Expected result: staging contains the pilot set and public reads can see active rows.

### Manual

- Device/environment: Windows shell with Docker Desktop and linked Supabase staging.
- Steps: Review generated SQL for public place data only and confirm no secrets are present.
- Expected result: No database password, access token, secret key, or service-role key is committed.

## Risks and rollback

- Risk: Hosted staging credentials are unavailable.
- Mitigation: Complete local repeatable import and stop with a clear blocker before marking TASK-040 complete.
- Rollback: Re-run an import that deletes `source = 'sproutscout_pilot_20260716'`, or reset local/staging from migrations plus seed.

## Security/privacy review

- New data collected: Public place records only.
- Secrets involved: None in source files. CLI credentials must remain local.
- RLS/auth impact: No policy changes expected.
- Logging impact: None.

## Completion evidence

Fill after implementation:

- Files changed: `docs/plans/TASK-040.md`, `scripts/build-pilot-place-seed.mjs`, `supabase/seeds/pilot_places_20260716.sql`, `supabase/config.toml`, `supabase/tests/pilot_place_checks.sql`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results: `node scripts/validate-pilot-places.mjs` passed; `node scripts/build-pilot-place-seed.mjs --check` passed; `node --check scripts/build-pilot-place-seed.mjs` passed; `npx supabase db reset` passed and loaded both seed files; local `seed_checks.sql`, `pilot_place_checks.sql`, and `rls_policy_checks.sql` passed; `npx supabase db query --linked --file supabase/seeds/pilot_places_20260716.sql` passed; linked staging `pilot_place_checks.sql` passed; staging REST read with a publishable key returned 69 active pilot rows; `npx supabase db lint` passed; `git diff --check` passed with only Windows LF/CRLF warnings; mobile `format:check`, `lint`, `typecheck`, `test -- --runInBand`, and `expo-doctor` all passed.
- Manual test result: Reviewed generated SQL for public place data only. No database password, access token, secret key, service-role key, user profile, child data, or home address was committed.
- Remaining limitations: Source URLs and venue details still need normal operational freshness review before inviting testers. TASK-041 must verify the app experience on iPhone 16 Pro through Expo Go connected to hosted staging.
- Acceptance criteria status: Complete. Local reset and hosted staging both contain the curated pilot set with source/freshness metadata, no secrets are committed, and staging can be read through a publishable key.
