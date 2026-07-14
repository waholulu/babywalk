# TASK-021 Execution Plan — Add Seed Import

## Objective

Make `npx supabase db reset` create a small usable local place/event dataset with explicit provenance and freshness fields, without adding personal data or external-provider dependencies.

## In scope

- Replace the placeholder `supabase/seed.sql` with deterministic local seed data.
- Seed active pilot-style place records that mirror the existing mobile fixture coverage.
- Seed a few scheduled events tied to seeded places.
- Include provenance/freshness fields such as `source`, `source_place_id`, `manually_reviewed_at`, and `verification_notes`.
- Add a lightweight SQL seed check that verifies reset-created data is present and has provenance.

## Out of scope

- Real 50–100 place curation, which is TASK-039.
- External provider imports or scraping.
- Mobile repository/client wiring, which is TASK-022.
- Production data loading.
- User-owned seed records.

## Files expected to change

- `supabase/seed.sql`
- `supabase/tests/seed_checks.sql`
- `docs/plans/TASK-021.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `TASKS.md` requires a seed import whose reset output creates usable data with provenance/freshness fields.
- `DATABASE.md` requires seed data to be safe to publish and contain no personal data.
- `supabase/seed.sql` is currently intentionally empty.
- `mobile/src/data/fixtures/place-candidates.ts` contains safe local fixture concepts that already cover MVP recommendation scenarios without real-place claims.

## Implementation steps

1. Populate `supabase/seed.sql` with fixed UUID seed places and events.
2. Add `supabase/tests/seed_checks.sql` to assert counts, active place visibility, provenance, and freshness metadata.
3. Reset the local database and run RLS and seed SQL checks.
4. Run existing database lint and mobile quality checks.
5. Review diff, update completion docs, mark TASK-021 complete, commit, push, and verify CI.

## Test plan

### Automated

- Command: `npx supabase db reset`
- Expected result: Applies migrations and seed data from an empty local database.
- Command: `Get-Content -Raw supabase/tests/seed_checks.sql | docker exec -i supabase_db_babywalk psql -v ON_ERROR_STOP=1 -U postgres -d postgres`
- Expected result: Seed assertions pass.
- Command: `Get-Content -Raw supabase/tests/rls_policy_checks.sql | docker exec -i supabase_db_babywalk psql -v ON_ERROR_STOP=1 -U postgres -d postgres`
- Expected result: Existing RLS assertions still pass with seed data present.
- Command: `npx supabase db lint`
- Expected result: Passes with no schema errors.
- Command: `npm run format:check`
- Expected result: Passes.
- Command: `npm run lint`
- Expected result: Passes.
- Command: `npm run typecheck`
- Expected result: Passes.
- Command: `npm test -- --runInBand`
- Expected result: Passes.
- Command: `npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Local Supabase through Docker Desktop.
- Steps: Review seed records for personal data, unsupported real-world factual claims, and provenance/freshness metadata.
- Expected result: Seed data is safe to publish, fictional/local-development scoped, and clearly marked for verification before pilot use.

## Risks and rollback

- Risk: Seed data may be mistaken for real curated pilot facts.
- Mitigation: Use fixture names/source IDs and explicit verification notes stating records are local development seed fixtures.
- Rollback: Revert the TASK-021 commit and rerun `npx supabase db reset`.

## Security/privacy review

- New data collected: None; seed data is public fixture data only.
- Secrets involved: None.
- RLS/auth impact: Public seed places/events are intended to be readable through existing public policies.
- Logging impact: None.

## Completion evidence

- Files changed: `supabase/seed.sql`, `supabase/tests/seed_checks.sql`, `supabase/tests/rls_policy_checks.sql`, `docs/plans/TASK-021.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npx supabase db reset` — passed and applied migrations plus `supabase/seed.sql` from an empty local database.
  - `Get-Content -Raw supabase\tests\seed_checks.sql | docker exec -i supabase_db_babywalk psql -v ON_ERROR_STOP=1 -U postgres -d postgres` — passed; SQL assertions confirmed 18 seed places, 3 seed events, active curated place records, provenance/freshness metadata, and no obvious sensitive placeholder data.
  - `Get-Content -Raw supabase\tests\rls_policy_checks.sql | docker exec -i supabase_db_babywalk psql -v ON_ERROR_STOP=1 -U postgres -d postgres` — initially failed because seed data increased public active-place counts; after scoping the assertions to `source = 'rls_test'`, passed.
  - `npx supabase db lint` — passed with no schema errors.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 11 test suites, 39 tests, and 2 snapshots.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Reviewed seed data for personal data, unsupported real-world factual claims, and provenance/freshness metadata. The seed uses fixture names and area-level labels only; no secrets, child names, exact birthdays, medical details, or precise home addresses were added.
- Remaining limitations: Seed records are development fixtures, not the final 50–100 professionally curated pilot places. Real curation remains TASK-039.
- Acceptance criteria status: Complete. Reset creates usable seed place/event data with provenance and freshness fields.
