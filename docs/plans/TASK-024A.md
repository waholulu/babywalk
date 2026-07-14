# TASK-024A Execution Plan — Create Minimal Hosted Supabase Staging Target

## Objective

Use the user's new hosted Supabase project `babywalk` as the minimal staging backend, apply the existing migrations, and make the Expo app visibly and safely identifiable as staging when pointed at that backend.

## In scope

- Link the local Supabase CLI to hosted project `babywalk`.
- Apply existing committed migrations to hosted staging.
- Add client-side configuration validation so hosted Supabase URLs must match an explicit project ref.
- Add a visible non-production environment banner for staging/local builds.
- Add a staging environment example file with no secret values.
- Verify the Expo app can start in staging Supabase mode with a publishable key supplied from the local shell only.

## Out of scope

- Creating another Supabase project; the user already created `babywalk`.
- Committing access tokens, database passwords, service-role keys, secret keys, or real local `.env` files.
- Applying seed data unless required for connection verification.
- EAS builds, app identifiers, Sentry, release channels, or installable staging builds.
- Implementing incorrect-data feedback.

## Files expected to change

- `mobile/.env.staging.example`
- `mobile/src/lib/env.ts`
- `mobile/src/app/_layout.tsx`
- `mobile/src/components/environment-banner.tsx`
- `mobile/src/test/env.test.ts`
- `TASKS.md`
- `PROJECT_STATE.md`
- `docs/plans/TASK-024A.md`

## Existing behavior inspected

- `npx supabase projects list` shows hosted project `babywalk` with ref `pspaowtnajsdwcyzrafl`, region `ca-central-1`, and status `ACTIVE_HEALTHY`.
- `npx supabase link --project-ref pspaowtnajsdwcyzrafl` succeeds.
- `npx supabase db push --linked --dry-run` reports two pending migrations: `20260714191031_initial_schema.sql` and `20260714191641_rls_policies.sql`.
- `npx supabase db push --linked` applies both migrations; the CLI reports a pg-delta cache warning after applying them.
- `npx supabase migration list --linked` confirms both local migrations exist on the remote project.
- `mobile/src/lib/env.ts` already supports `EXPO_PUBLIC_APP_ENV=staging` and `EXPO_PUBLIC_PLACE_DATA_SOURCE=supabase`, but it does not bind hosted URLs to an explicit project ref.
- `mobile/src/app/_layout.tsx` can wrap all routes with a visible environment banner after configuration validation.

## Implementation steps

1. Add `EXPO_PUBLIC_SUPABASE_PROJECT_REF` parsing and hosted URL/ref validation.
2. Add tests for staging Supabase config, URL/ref mismatch, and local Supabase compatibility.
3. Add a visible environment banner for local/staging only.
4. Add `mobile/.env.staging.example` with public placeholders and the staging project ref/URL.
5. Verify remote migrations, mobile checks, and a staging-mode Expo web smoke test using a publishable key from the local shell only.
6. Update `TASKS.md` and `PROJECT_STATE.md` after verification.

## Test plan

### Automated

- Command: `npx supabase migration list --linked`
- Expected result: Both committed migrations appear locally and remotely.
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
- Command: `git diff --check`
- Expected result: Passes.

### Manual

- Device/environment: Expo web in staging Supabase mode.
- Steps: Start Expo with `EXPO_PUBLIC_APP_ENV=staging`, `EXPO_PUBLIC_PLACE_DATA_SOURCE=supabase`, staging URL, staging project ref, and a publishable key from the local shell; request `/settings` or `/results`.
- Expected result: The app serves successfully and shows a visible staging banner without committing secrets.

## Risks and rollback

- Risk: A hosted project could be linked incorrectly.
- Mitigation: Record the staging project ref and validate hosted Supabase URL/ref pairs in client env parsing.
- Rollback: Unlink locally or relink to the intended project; revert this commit if the banner/config validation causes app regression.

## Security/privacy review

- New data collected: None.
- Secrets involved: A publishable client key is used only in the local shell for verification. No access token, database password, secret key, or service-role key is committed.
- RLS/auth impact: Existing RLS migrations are applied to hosted staging; no policies are weakened.
- Logging impact: No new logging.

## Completion evidence

- Files changed: `mobile/.env.example`, `mobile/.env.staging.example`, `mobile/src/lib/env.ts`, `mobile/src/app/_layout.tsx`, `mobile/src/components/environment-banner.tsx`, `mobile/src/components/environment-banner-label.ts`, `mobile/src/test/env.test.ts`, `mobile/src/test/environment-banner.test.ts`, `TASKS.md`, `PROJECT_STATE.md`, `docs/plans/TASK-024A.md`.
- Commands run and results:
  - `npx supabase projects list` — passed and showed hosted project `babywalk` as `ACTIVE_HEALTHY`.
  - `npx supabase link --project-ref pspaowtnajsdwcyzrafl` — passed.
  - `npx supabase db push --linked --dry-run` — passed and listed `20260714191031_initial_schema.sql` and `20260714191641_rls_policies.sql`.
  - `npx supabase db push --linked` — applied both migrations; a post-apply pg-delta cache warning was verified by a separate migration list.
  - `npx supabase migration list --linked` — passed and confirmed local/remote migration versions match.
  - `npx supabase db lint --linked` — passed with no schema errors.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 15 suites and 61 tests.
  - `npx expo-doctor` — passed, 18/18 checks.
  - `git diff --check` — passed; only Windows line-ending normalization warnings were reported.
- Manual test result: Used the staging publishable key from the local shell only. A Supabase JS query against hosted staging `places` returned `staging_places_count=0`, proving client connection to the migrated staging database. Expo web started in staging Supabase mode and `/settings` returned HTTP 200.
- Remaining limitations: Hosted staging has no seed data yet. The staging publishable key is not committed and must be supplied through an ignored local env file or shell. EAS staging release configuration remains TASK-038.
- Acceptance criteria status: Complete.
