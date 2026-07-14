# TASK-020 Execution Plan — Add RLS Policies and Tests

## Objective

Add reviewed Supabase Row Level Security policies for curated public reads and authenticated user-owned data, then prove cross-user isolation with automated SQL policy tests.

## In scope

- Add a versioned migration for grants and RLS policies.
- Allow anonymous and authenticated reads of active curated places.
- Allow anonymous and authenticated reads of scheduled events.
- Allow authenticated users to read and write only their own profile, child preferences, saved places, visits, and recommendation feedback.
- Allow authenticated users to submit and read only their own place feedback.
- Allow anonymous recommendation feedback inserts only when `user_id` is null.
- Add automated SQL tests that simulate anonymous, User A, and User B access.

## Out of scope

- Seed/import data, which is TASK-021.
- Supabase client and repositories, which are TASK-022.
- Authentication UI, which is TASK-023.
- Admin moderation views or Edge Functions.
- Column-restricted public views; this task uses table policies for the current MVP schema.

## Files expected to change

- `supabase/migrations/*_rls_policies.sql`
- `supabase/tests/rls_policy_checks.sql`
- `docs/plans/TASK-020.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `TASKS.md` requires public curated reads, user-owned writes, and automated cross-user isolation tests.
- `DATABASE.md` says active places/current events may be publicly readable for guest mode, user-owned data must be isolated, and moderation/internal fields should not be exposed to the mobile client.
- `supabase/migrations/20260714191031_initial_schema.sql` already creates the MVP tables, constraints, indexes, and enables RLS on all eight public tables.
- `PROJECT_STATE.md` records local Supabase as verified and RLS policies/tests as the next backend task.

## Implementation steps

1. Create a new Supabase migration named `rls_policies`.
2. Add minimal grants and RLS policies for public curated reads and authenticated owner access.
3. Add `supabase/tests/rls_policy_checks.sql` with fixed test users/data and assertions for anonymous access, own-row access, cross-user reads, blocked cross-user writes, and anonymous recommendation feedback.
4. Reset the local database, run the policy test script, run database linting, and run existing mobile quality checks.
5. Review the diff, update completion docs, mark TASK-020 complete, commit, push, and verify CI.

## Test plan

### Automated

- Command: `npx supabase db reset`
- Expected result: Applies all migrations from an empty local database.
- Command: `Get-Content -Raw supabase/tests/rls_policy_checks.sql | docker exec -i supabase_db_babywalk psql -v ON_ERROR_STOP=1 -U postgres -d postgres`
- Expected result: SQL policy tests pass without assertion failures.
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
- Steps: Review the migration for least-privilege policies and sensitive-data exposure.
- Expected result: No child names, exact birth dates, medical details, precise home addresses, secrets, or broad cross-user policies are introduced.

## Risks and rollback

- Risk: Table policies may need narrower public column exposure later.
- Mitigation: Keep public reads limited to active places and scheduled events; add views/admin paths in later tasks if needed.
- Rollback: Revert this task commit before any shared Supabase environment applies the migration.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: Adds client access policies and automated isolation tests.
- Logging impact: None.

## Completion evidence

- Files changed: `supabase/migrations/20260714191641_rls_policies.sql`, `supabase/tests/rls_policy_checks.sql`, `docs/plans/TASK-020.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npx supabase migration new rls_policies` — passed and created the migration file.
  - `npx supabase db reset` — passed and applied both migrations from an empty local database.
  - `Get-Content -Raw supabase\tests\rls_policy_checks.sql | docker exec -i supabase_db_babywalk psql -v ON_ERROR_STOP=1 -U postgres -d postgres` — passed; SQL assertions covered anonymous public reads, anonymous recommendation feedback limits, User A/User B read isolation, blocked cross-user writes, blocked cross-user deletes, and blocked place-feedback moderation updates.
  - `npx supabase db lint` — passed with no schema errors.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 11 test suites, 39 tests, and 2 snapshots.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Reviewed the migration for least-privilege behavior and sensitive data exposure. No secrets, child names, exact birth dates, medical details, precise home addresses, broad cross-user policies, or client-writable moderation status were introduced.
- Remaining limitations: Public place/event reads currently expose table columns allowed by the schema. If beta requirements need narrower public projection, add restricted public views or Edge Functions before exposing curated records broadly.
- Acceptance criteria status: Complete. Automated SQL policy tests prove cross-user isolation.
