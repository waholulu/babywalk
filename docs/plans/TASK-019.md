# TASK-019 Execution Plan — Create Initial Schema Migration

## Objective

Add the first committed Supabase SQL migration for the reviewed MVP schema subset, including constraints, timestamps, indexes, and safe RLS defaults.

## In scope

- Create a versioned migration under `supabase/migrations/`.
- Add MVP tables from `DATABASE.md`: profiles, child preferences, places, events, saved places, visits, place feedback, and recommendation feedback.
- Add data minimization constraints for child age and coarse home/location fields.
- Add check constraints for bounded enum-like fields.
- Add created/updated timestamps and an updated-at trigger.
- Add indexes for foreign keys, lookup fields, and policy-heavy user columns.
- Enable RLS on client-accessible tables without adding policies yet.
- Verify the migration applies from an empty local database and can reset cleanly.

## Out of scope

- RLS policies and cross-user tests, which are TASK-020.
- Seed data, which is TASK-021.
- Supabase client/repositories, which are TASK-022.
- External provider schema beyond nullable provenance fields.

## Files expected to change

- `supabase/migrations/*_initial_schema.sql`
- `docs/plans/TASK-019.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` requires the initial schema migration to apply from an empty database and roll forward cleanly.
- `DATABASE.md` defines proposed MVP tables and access-policy intent.
- `ARCHITECTURE.md` requires migrations committed to Git and Supabase/Postgres as the backend.
- Local Supabase was initialized in TASK-018 and `npx supabase db reset` passes.

## Implementation steps

1. Create a named migration with the Supabase CLI.
2. Implement tables, constraints, trigger, indexes, and RLS enablement.
3. Reset the local database from migrations.
4. Run Supabase migration/status checks plus existing mobile quality checks.
5. Update project state, mark TASK-019 complete only after verification, review diff, commit, push, and verify CI.

## Test plan

### Automated

- Command: `npx supabase db reset`
- Expected result: Applies migration from an empty local database and completes.
- Command: `npx supabase migration list`
- Expected result: Shows the initial schema migration applied locally.
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

- Device/environment: Local Supabase via Docker Desktop.
- Steps: Review migration SQL for sensitive fields, RLS enablement, and constraints.
- Expected result: No child names, exact birth dates, medical fields, precise home address, or secrets are added.

## Risks and rollback

- Risk: The schema may need adjustment when repositories are implemented.
- Mitigation: Keep the initial migration close to `DATABASE.md` and defer policies/seed/repositories.
- Rollback: Revert the TASK-019 commit before shared environments exist.

## Security/privacy review

- New data collected: Defines future tables but does not collect data yet.
- Secrets involved: None.
- RLS/auth impact: RLS is enabled; policies are intentionally deferred to TASK-020.
- Logging impact: None.

## Completion evidence

- Files changed: `supabase/migrations/20260714191031_initial_schema.sql`, `docs/plans/TASK-019.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npx supabase migration new initial_schema` — passed and created the migration file.
  - `npx supabase db reset` — passed and applied `20260714191031_initial_schema.sql` from an empty local database.
  - `npx supabase db lint` — passed with no schema errors.
  - `npx supabase migration list` — failed because the local project is not linked to a remote Supabase project.
  - `npx supabase migration list --local` — passed and listed `20260714191031`.
  - `docker exec supabase_db_babywalk psql ...` — passed and confirmed 8 public tables with RLS enabled.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 11 test suites, 39 tests, and 2 snapshots.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Reviewed the migration for sensitive fields. It avoids child names, exact birth dates, medical fields, precise home addresses, and secrets.
- Remaining limitations: RLS policies and cross-user policy tests are not implemented yet; they are TASK-020.
- Acceptance criteria status: Complete. The migration applies from an empty local database and rolls forward cleanly through local reset.
