# Project State

**Working name:** SproutScout  
**Current phase:** Phase 2 — Backend foundation
**Last completed task:** TASK-024A — Create minimal hosted Supabase staging target
**Next task:** BLOCKER — Provide confirmed staging auth session for TASK-025
**Last updated:** 2026-07-14

## Current facts

- The MVP product scope and architecture are documented.
- The pilot geography is North Jersey + NYC.
- `mobile/` contains an Expo SDK 54 + React Native + TypeScript starter with Expo Router.
- No external API is required for the first local recommendation slice.
- The working name has not received trademark or domain clearance.
- Node major is pinned to 22 in `.nvmrc`.
- The Expo starter currently uses `mobile/src/app` as the Expo Router root.
- `mobile/` has passing local quality commands for format, lint, type checking, and Jest tests.
- GitHub Actions CI is active for pushes to `main` and pull requests.
- TASK-005 verified Expo Go as the initial physical-device path for the Windows beginner workflow; EAS development builds are deferred until a required native dependency is unsupported by Expo Go or native release testing begins.
- The app was aligned to Expo SDK 54 because the user's fully updated iPhone Expo Go app could not run the scaffolded SDK 57 project while the SDK 57 iOS App Store Expo Go release was still unavailable.
- TASK-006 replaced the generated starter tabs with a simple Expo Router route skeleton for home, onboarding, results, place detail, day plan, saved, and settings.
- TASK-007 added shared theme tokens and UI primitives for screen containers, buttons, chips, cards, loading, empty, and error states.
- TASK-008 added dependency-free client environment validation for `EXPO_PUBLIC_APP_ENV`, a safe configuration error screen, and `mobile/.env.example`.
- TASK-009 added provider-neutral domain models for family constraints, place candidates, weather snapshots, recommendation results, reason codes, warnings, score components, and confidence.
- TASK-010 added 18 local fixture place candidates and scenario coverage metadata for future filter/scoring tests.
- TASK-011 added a pure hard-filtering layer for recommendation candidates, including age, schedule, travel, budget, indoor/outdoor, blocked-place, and return-time exclusions.
- TASK-012 added a pure transparent 100-point scoring layer with component breakdowns, reason codes, warnings, confidence, deterministic sorting, and fixture snapshot coverage.
- TASK-013 added a pure diversity-selection step that prevents comparable top results from being near-duplicates by category or coarse area.
- TASK-014 replaced the home placeholder with a local mobile-first plan input form, validation helpers, accessibility labels/states, keyboard-friendly scrolling, reset behavior, and default values.
- TASK-015 connected local fixtures to the deterministic recommendation pipeline and replaced the results placeholder with three explainable recommendation cards.
- TASK-016 replaced the place detail placeholder with a structured fixture detail screen that labels unknown values and emits verify-before-leaving notes.
- TASK-017 added a development-only score inspector for score components and hard-filter exclusions, gated off for production environments.
- TASK-018 initialized local Supabase, documented local commands, and verified the local stack can start, report status, and reset.
- TASK-019 added the initial Supabase schema migration for profiles, child preferences, places, events, saved places, visits, place feedback, and recommendation feedback with constraints, timestamps, indexes, and RLS enabled.
- TASK-020 added reviewed RLS policies and automated SQL policy tests for public curated reads, anonymous recommendation feedback, authenticated owner-only data access, and cross-user isolation.
- TASK-021 added deterministic local seed data for 18 fixture places and 3 fixture events with provenance/freshness metadata plus automated seed checks.
- TASK-022 added `@supabase/supabase-js`, client-safe Supabase configuration validation, a typed public places client, fixture and Supabase place repository implementations, and repository-selected recommendation loading.
- TASK-023 added optional guest-preserving email magic-link auth plumbing, a Settings account panel, and protected-cache clearing on sign-out.
- TASK-024 added working Save, Mark visited, and Do not recommend actions on place detail with a local repository, optimistic UI state, error rollback, and tests.
- TASK-024A linked the local Supabase CLI to hosted staging project `babywalk` (`pspaowtnajsdwcyzrafl`), applied existing migrations, added hosted URL/project-ref validation, added visible local/staging environment banners, and documented staging Expo configuration without committing secrets.
- TASK-025 implementation work added a structured incorrect-data feedback form, validation, and Supabase repository, but final staging acceptance is blocked by staging Auth email confirmation.

## Environment inventory

| Item | Version/status | Notes |
|---|---|---|
| Operating system | Microsoft Windows NT 10.0.26200.0 | `scripts/doctor.ps1` ran under Windows PowerShell 5.1.26100.8655; interactive shell also reported PowerShell 7.5.8. |
| Git | 2.41.0.windows.3 | Git command is installed. `D:\github\babywalk` is initialized as a Git repository on branch `main`. |
| Node | v22.22.2 | Installed. Project pins Node major 22 in `.nvmrc`. |
| npm | 10.9.7 | Installed. `npx` also reports 10.9.7. |
| Docker | 29.6.1 | Docker Desktop is installed and the daemon runs. The existing shell did not have Docker's bin directory on PATH, so TASK-018 used `C:\Program Files\Docker\Docker\resources\bin` as a temporary PATH prefix. |
| iOS test path | Verified | iPhone 16 Pro on iOS 26.5 opened the app through Expo Go QR code in LAN mode, loaded the initial screen, and received a Fast Refresh text update. |
| Android test path | Not configured | `adb` and Android emulator commands are missing. Preferred initial path: physical Android device with Expo Go QR scan. |
| Expo account | Not required for TASK-005 | EAS CLI/account setup is deferred until TASK-027B or native release testing. |
| Supabase local stack | Verified | `npx supabase` CLI 2.109.1 is available. Local Supabase start/status/reset were verified for project id `babywalk`. |
| GitHub repository | Connected | Remote `origin` points to `https://github.com/waholulu/babywalk.git`; default branch is `main`. |

## Open decisions

1. Whether iPhone 16 Pro on iOS 26.5 remains the primary development device.
2. Whether guest mode remains fully local or uses anonymous authentication.
3. Which external place and weather providers will be used after the local slice.
4. Final product name after professional clearance.
5. Whether the first pilot is iOS-first or simultaneous iOS/Android.

## Known risks

- External place data costs and licensing can change.
- Local event data is fragmented.
- Family recommendations can lose trust quickly when hours or amenities are wrong.
- Coding agents may overbuild unless tasks remain atomic.
- App-store and privacy disclosures must match actual data behavior.
- TASK-025 app-side implementation exists, but final completion still needs authenticated staging verification.
- Staging Auth currently has email signups disabled, so TASK-025 cannot yet verify an authenticated `place_feedback` insert with the publishable key.

## Task completion log

```text
2026-07-15 — BLOCKER — Provide confirmed staging auth session for TASK-025
Summary:
Retried the TASK-025 staging verification after the user adjusted Auth settings. The previous `Email not confirmed` blocker changed to `Email signups are disabled`, so the publishable-key mobile path still cannot create/sign in a synthetic staging user and insert through RLS.
Commands/tests:
Staging publishable-key script with a synthetic Gmail-shaped address — failed at signup with `Email signups are disabled`.
Manual verification:
No secrets were written to tracked files. The app-side TASK-025 implementation remains committed and CI-passing, but final acceptance still requires a confirmed/authenticated staging session.
Known limitations:
TASK-025 remains unchecked until staging Auth allows the intended test path or a confirmed test account/session is available.
Next task:
BLOCKER — Provide confirmed staging auth session for TASK-025.
```

```text
2026-07-14 — TASK-025 BLOCKED
Summary:
Implemented the app-side incorrect-data feedback path, including structured feedback type choices, optional detail trimming/capping, payload shaping that omits internal moderation fields, a Supabase feedback repository, and a place-detail report form. Automated checks pass. Final TASK-025 acceptance is blocked because hosted staging Auth requires email confirmation for the synthetic password user, so the publishable-key verification cannot obtain an authenticated session to insert through RLS.
Commands/tests:
`npx supabase db query --linked --file supabase\seed.sql` — passed and loaded existing development seed fixtures into hosted staging so `place_feedback.place_id` can reference a staging place.
`npx supabase db query --linked "select id, source_place_id from public.places where source_place_id = 'hoboken-story-room-fixture' limit 1;"` — passed and confirmed staging place UUID `71000000-0000-0000-0000-000000000001`.
Staging publishable-key script with `sproutscout-task025-...@example.com` — failed because Supabase rejected the example.com address as invalid.
Staging publishable-key script with a synthetic Gmail-shaped address — failed at password sign-in with `Email not confirmed`.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 16 suites and 67 tests.
`npx expo-doctor` — passed, 18/18 checks.
`npx supabase db lint --linked` — passed with no schema errors.
Manual verification:
Reviewed the app payload shaping and repository tests to confirm mobile code sends only `user_id`, `place_id`, `feedback_type`, and `details`; it does not expose or write `status`. Could not complete the required authenticated staging insert because no confirmed staging session was available.
Known limitations:
TASK-025 remains unchecked. The report UI requires a completed Supabase auth session; current auth callback/session persistence remains deferred, and staging Auth email confirmation blocks synthetic password-session verification.
Next task:
BLOCKER — Provide confirmed staging auth session for TASK-025.
```

```text
2026-07-14 — TASK-024A
Summary:
Established the minimal hosted Supabase staging path using the user's new `babywalk` project, ref `pspaowtnajsdwcyzrafl`, in region `ca-central-1`. Linked the local Supabase CLI to that hosted project and applied the two existing migrations. Added `EXPO_PUBLIC_SUPABASE_PROJECT_REF` validation so hosted Supabase URLs must match their explicit project ref, preventing staging from silently pointing at another hosted project. Added a visible non-production environment banner that shows `STAGING` or `LOCAL`, plus `mobile/.env.staging.example` with public staging URL/ref placeholders and an empty publishable-key slot.
Commands/tests:
`npx supabase projects list` — passed and showed `babywalk` as `ACTIVE_HEALTHY`.
`npx supabase link --project-ref pspaowtnajsdwcyzrafl` — passed.
`npx supabase db push --linked --dry-run` — passed and listed the two pending migrations.
`npx supabase db push --linked` — applied both migrations; the CLI emitted a post-apply pg-delta cache warning, so migration state was verified separately.
`npx supabase migration list --linked` — passed and confirmed local/remote migration versions `20260714191031` and `20260714191641` match.
`npx supabase db lint --linked` — passed with no schema errors.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 15 suites and 61 tests.
`npx expo-doctor` — passed, 18/18 checks.
`git diff --check` — passed; only Windows line-ending normalization warnings were reported.
Manual verification:
Used the staging publishable key from the local shell only, without writing it to tracked files. A Supabase JS query against hosted staging `places` returned `staging_places_count=0`, confirming the app can connect to the migrated staging database. Started Expo web in staging Supabase mode and verified `/settings` returned HTTP 200. Banner label tests confirm staging renders `STAGING` and production renders no banner.
Known limitations:
Hosted staging has schema/RLS migrations but no seed data. The staging publishable key remains local-only and must be copied into an ignored local env file or shell when running Expo; no EAS environment variables or installable staging builds exist yet. TASK-025 still needs to implement and verify incorrect-data feedback against staging.
Next task:
TASK-025 — Implement incorrect-data feedback.
```

```text
2026-07-14 — BLOCKER — Authenticate Supabase CLI for TASK-024A
Summary:
The user completed Supabase cloud login for the local CLI. `npx supabase projects list` now succeeds from the repository and lists hosted Supabase projects, so TASK-024A can proceed to selecting or creating a separate staging target.
Commands/tests:
`npx supabase projects list` — passed; project refs and metadata were returned. No access token, database password, secret key, or service-role key was written to tracked files.
Manual verification:
Confirmed `git status --short` was clean before updating blocker state.
Known limitations:
TASK-024A still needs a staging target choice and migration/application verification.
Next task:
TASK-024A — Create minimal hosted Supabase staging target.
```

```text
2026-07-14 — TASK-024A BLOCKED
Summary:
Attempted to begin `TASK-024A — Create minimal hosted Supabase staging target`, but the Supabase CLI has no cloud access token/session in this environment. A hosted staging project cannot be listed, created, linked, or migrated until the CLI is authenticated with the user's Supabase account and the intended staging organization/region/project naming is known.
Commands/tests:
`npx supabase --version` — passed, 2.109.1.
`npx supabase projects list` — failed with `LegacyPlatformAuthRequiredError`; the CLI requested `supabase login` or a local `SUPABASE_ACCESS_TOKEN`.
Manual verification:
Reviewed `TASKS.md`, `PROJECT_STATE.md`, and the blocker plan to confirm no secrets were written to tracked files.
Known limitations:
No hosted Supabase project was created, linked, or migrated. No Expo staging configuration was changed.
Next task:
BLOCKER — Authenticate Supabase CLI for TASK-024A.
```

```text
2026-07-14 — TASK-024A SCOPE ADDED
Summary:
Converted the previous TASK-025 staging blocker into a numbered prerequisite task: `TASK-024A — Create minimal hosted Supabase staging target`. The new task asks for a separate hosted Supabase staging project, existing migrations applied there, local Expo connection through publishable client configuration, visible staging identification, and explicit secret-safety/prod-safety acceptance criteria. Renamed the later release task to `TASK-038 — Complete staging release environment` and kept EAS preview builds, staging app identifiers, EAS environment variables, installable staging builds, Sentry, release channel, and staging-build production-write safeguards there.
Commands/tests:
`git diff --check` — passed; only line-ending normalization warnings were reported for existing Windows checkout behavior.
Manual verification:
Reviewed `TASKS.md`, `PROJECT_STATE.md`, and `docs/plans/TASK-024A.md` to confirm this change only updates task sequencing and documentation; no application feature or secret was changed.
Known limitations:
No hosted Supabase project was created by this documentation update. TASK-024A still needs to be executed before TASK-025 can be implemented and verified.
Next task:
TASK-024A — Create minimal hosted Supabase staging target.
```

```text
2026-07-14 — TASK-025 BLOCKED
Summary:
Started TASK-025 by creating `docs/plans/TASK-025.md` and inspecting the existing feedback schema, RLS policies, place-detail UI, and project state. The task acceptance requires a report to reach the staging database, but no staging Supabase project/configuration exists yet; staging setup is currently scheduled later as TASK-038. Per task rules, this creates a blocking prerequisite instead of improvising against a fake target.
Commands/tests:
`rg -n "place_feedback|feedback|incorrect" supabase\migrations mobile\src TASKS.md DATABASE.md PRODUCT_SPEC.md` — inspected feedback schema, RLS policies, product requirements, and current UI references.
Manual verification:
Confirmed `place_feedback` exists locally and authenticated owner-only insert policy exists, but no staging database target is documented or configured.
Known limitations:
No application feature was implemented for TASK-025 because the stated acceptance cannot be truthfully verified without staging. A blocker task was added to provide a staging Supabase target and authenticated test path.
Next task:
BLOCKER — Provide staging Supabase target for TASK-025.
```

```text
2026-07-14 — TASK-024
Summary:
Replaced the disabled Save, Visited, and Do not recommend placeholders on place detail with working local actions. Added a `PlaceActionsRepository` boundary, a dependency-free local repository using `localStorage` when available and memory fallback otherwise, pure button-label helpers, optimistic UI updates, error rollback, and action status messages. Report incorrect data remains disabled for TASK-025.
Commands/tests:
`npx prettier --write src/data/repositories/place-actions-repository.ts src/data/repositories/place-actions-repository.local.ts src/data/repositories/index.ts src/features/places/place-actions.ts src/features/places/place-detail.ts src/features/places/place-detail-screen.tsx src/test/place-actions.test.ts` — passed.
`npm run typecheck` — initially failed because `mobile/src/features/places/index.ts` still exported the removed `PlaceDetailAction` type; passed after removing the stale export.
`npm test -- --runInBand src/test/place-actions.test.ts src/test/place-detail.test.ts` — passed, 2 suites and 7 tests.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 14 test suites, 56 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Started Expo web with `EXPO_PUBLIC_APP_ENV=local` and `EXPO_PUBLIC_PLACE_DATA_SOURCE=fixtures`; `/places/hoboken-story-room-fixture` returned HTTP 200. The temporary Expo server was stopped afterward.
Known limitations:
Native Expo Go persistence uses the in-memory fallback until a reviewed native storage dependency or Supabase-backed action repository is added. Supabase writes for saved/visited data and a database-backed blocked-place model remain future work. Incorrect-data reporting remains TASK-025.
Next task:
TASK-025 — Implement incorrect-data feedback.
```

```text
2026-07-14 — TASK-023
Summary:
Added optional authentication plumbing while preserving guest mode. Supabase URL/anon-key can now be configured as an optional pair even when place data uses fixtures. Added an auth service boundary for guest mode and Supabase email magic-link requests, a protected in-memory cache that is cleared on sign-out, and a Settings account panel that shows guest status, optional email sign-in, and sign-out.
Commands/tests:
`npx prettier --write src/lib/env.ts src/features/auth src/app/settings.tsx src/test/env.test.ts src/test/auth-service.test.ts` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand src/test/auth-service.test.ts src/test/env.test.ts` — passed, 2 suites and 13 tests.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm test -- --runInBand` — passed, 13 test suites, 52 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Started Expo web with `EXPO_PUBLIC_APP_ENV=local` and `EXPO_PUBLIC_PLACE_DATA_SOURCE=fixtures`; `/settings` returned HTTP 200 without Supabase credentials, confirming guest mode remains available. The temporary Expo server was stopped afterward.
Known limitations:
Magic-link callback/deep-link session completion, persisted session storage, profile creation, and authenticated user data repositories are deferred. Save/visit/block actions remain TASK-024.
Next task:
TASK-024 — Implement save/visit/block actions.
```

```text
2026-07-14 — TASK-022
Summary:
Added `@supabase/supabase-js`, extended client environment validation with `EXPO_PUBLIC_PLACE_DATA_SOURCE`, optional Supabase URL/anon-key validation, and added a typed public Supabase client helper. Added a `PlaceRepository` boundary with fixture and Supabase implementations. The recommendation results screen now loads candidates through the selected repository, keeping fixtures as the default zero-config source and allowing Supabase-backed public place reads when explicitly configured.
Commands/tests:
`npm install @supabase/supabase-js` — passed; npm reported 15 moderate audit findings in the dependency tree.
`npx prettier --write ... .env.example ...` — failed only because Prettier could not infer a parser for `.env.example`; code files in the same command were formatted before that error.
`npm run typecheck` — initially failed because env parsing needed explicit place-data-source narrowing and a score-inspector test fixture needed the new `placeDataSource`; passed after fixes.
`npm test -- --runInBand src/test/env.test.ts src/test/place-repository.test.ts src/test/recommendation-results.test.ts src/test/score-inspector.test.ts` — passed, 4 suites and 13 tests.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm test -- --runInBand` — passed, 12 test suites, 45 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Started Expo web with `EXPO_PUBLIC_APP_ENV=local` and `EXPO_PUBLIC_PLACE_DATA_SOURCE=fixtures`; `/results` served successfully on localhost. The first smoke command failed because the Windows `Start-Process` stdout/stderr redirection was invalid; the corrected command completed and the temporary Expo server was cleaned up.
Known limitations:
Supabase mode currently covers public place candidate reads only. Authenticated user repositories, save/visit/block mutations, realtime caching, and generated database types remain for later tasks.
Next task:
TASK-023 — Add optional authentication.
```

```text
2026-07-14 — TASK-021
Summary:
Replaced the empty `supabase/seed.sql` with deterministic local seed data for 18 active place fixtures and 3 scheduled event fixtures. Seed records use fixed UUIDs, `sproutscout_seed_v1` provenance, source IDs, freshness/review timestamps, amenity metadata, and verification notes that clearly mark them as local development fixtures to verify before pilot use. Added `supabase/tests/seed_checks.sql` and made the existing RLS policy test seed-aware by counting only its own `rls_test` records.
Commands/tests:
`npx supabase db reset` — passed and applied migrations plus `supabase/seed.sql` from an empty local database.
`Get-Content -Raw supabase\tests\seed_checks.sql | docker exec -i supabase_db_babywalk psql -v ON_ERROR_STOP=1 -U postgres -d postgres` — passed; SQL assertions confirmed 18 seed places, 3 seed events, active curated place records, provenance/freshness metadata, and no obvious sensitive placeholder data.
`Get-Content -Raw supabase\tests\rls_policy_checks.sql | docker exec -i supabase_db_babywalk psql -v ON_ERROR_STOP=1 -U postgres -d postgres` — initially failed because seed data increased public active-place counts; after scoping the assertions to `source = 'rls_test'`, passed.
`npx supabase db lint` — passed with no schema errors.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 11 test suites, 39 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Reviewed seed data for personal data, unsupported real-world factual claims, and provenance/freshness metadata. The seed uses fixture names and area-level labels only; no secrets, child names, exact birthdays, medical details, or precise home addresses were added.
Known limitations:
Seed records are development fixtures, not the final 50–100 professionally curated pilot places. Real curation remains TASK-039.
Next task:
TASK-022 — Add Supabase client and repositories.
```

```text
2026-07-14 — TASK-020
Summary:
Added `20260714191641_rls_policies.sql` with minimal grants and Row Level Security policies. Anonymous and authenticated clients can read only active places and scheduled events. Authenticated users can access only their own profiles, child preferences, saved places, visits, place feedback, and recommendation feedback. Anonymous recommendation feedback inserts are allowed only with a null `user_id`. Place feedback is insert/read-only for mobile users so moderation status is not client-writable.
Commands/tests:
`npx supabase migration new rls_policies` — passed and created the migration file.
`npx supabase db reset` — passed and applied both migrations from an empty local database.
`Get-Content -Raw supabase\tests\rls_policy_checks.sql | docker exec -i supabase_db_babywalk psql -v ON_ERROR_STOP=1 -U postgres -d postgres` — passed; SQL assertions covered anonymous public reads, anonymous recommendation feedback limits, User A/User B read isolation, blocked cross-user writes, blocked cross-user deletes, and blocked place-feedback moderation updates.
`npx supabase db lint` — passed with no schema errors.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 11 test suites, 39 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Reviewed the migration for least-privilege behavior and sensitive data exposure. No secrets, child names, exact birth dates, medical details, precise home addresses, broad cross-user policies, or client-writable moderation status were introduced.
Known limitations:
Public place/event reads currently expose table columns allowed by the schema. If beta requirements need narrower public projection, add restricted public views or Edge Functions before exposing curated records broadly.
Next task:
TASK-021 — Add seed import.
```

```text
2026-07-14 — TASK-001
Summary:
Verified local developer prerequisites and reviewed the safe root .gitignore. Required commands Git, Node, npm, and npx are installed. Docker, adb, eas, and a Git worktree are not currently available/configured.
Commands/tests:
`powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\doctor.ps1` — passed required checks; reported Docker, adb, and eas as optional missing.
`git --version` — git version 2.41.0.windows.3.
`node --version` — v22.22.2.
`npm --version` — 10.9.7.
`npx --version` — 10.9.7.
`docker --version` and `docker info` — failed; Docker command is not installed.
`adb version` — failed; adb is not installed.
`eas --version` — failed; eas is not installed.
`git rev-parse --is-inside-work-tree` — failed; this folder is not a Git worktree.
Manual verification:
Reviewed `.gitignore`; it already ignores secrets, local env files, Node dependencies, Expo/React Native output, Supabase temp files, coverage/artifacts, editor files, OS files, and temporary agent files.
Known limitations:
Docker must be installed before local Supabase work unless a reviewed temporary cloud-backend exception is created. A physical iOS/Android device or Android emulator path still needs to be confirmed. Expo/EAS, Supabase account, and GitHub repository setup are not verified.
Next task:
TASK-002 — Scaffold Expo app.
```

```text
2026-07-14 — TASK-002
Summary:
Scaffolded `mobile/` with the Expo SDK 57 TypeScript starter and Expo Router, installed dependencies with `package-lock.json`, pinned Node major 22, removed the generated nested `mobile/.git`, and made two minimal starter compatibility fixes so lint and TypeScript pass.
Commands/tests:
`npx create-expo-app@latest mobile --template default@sdk-57 --yes` — succeeded and installed dependencies; npm reported 11 moderate audit findings in generated dependencies.
`npx expo-doctor` — passed 20/20 checks.
`npm run lint` — initially auto-installed ESLint packages and failed on generated `use-color-scheme.web.ts`; passed after replacing the hydration effect with `useSyncExternalStore`.
`npx tsc --noEmit` — initially failed on generated CSS imports; passed after adding CSS module declarations.
`npm audit --audit-level=moderate` — failed with 11 moderate `uuid` advisories through Expo's generated dependency chain; npm's force fix would install a breaking Expo downgrade, so no dependency change was made.
`npm run web -- --non-interactive --port 8083` — Metro started and reached `Waiting on http://localhost:8083`; the process was then stopped. Expo warned that `--non-interactive` is unsupported and recommends `CI=1`.
Manual verification:
Inspected generated `mobile/package.json`, `mobile/app.json`, `mobile/src/app/_layout.tsx`, `mobile/src/app/index.tsx`, `mobile/tsconfig.json`, and confirmed `package-lock.json` exists. Confirmed `mobile/.git` was removed so `mobile/` is not an accidental nested repository.
Known limitations:
Root `D:\github\babywalk` is still not a Git worktree, so changes could not be committed and `git diff` is unavailable. No iOS/Android device or emulator launch was performed. The starter still contains generic Expo app name/content; product route/content customization belongs to later tasks.
Next task:
TASK-003 — Configure quality commands.
```

```text
2026-07-14 — TASK-003
Summary:
Added local quality commands in `mobile/` for `format:check`, `lint`, `typecheck`, and `test`; configured Jest with `jest-expo`; added Prettier checking; and added a first pure TypeScript smoke test.
Commands/tests:
`npm install --save-dev jest jest-expo @types/jest prettier` — succeeded; npm reported the existing 11 moderate audit findings.
`npm install --save-dev @types/jest@29.5.14` — aligned Jest types with Expo SDK 57 after Expo Doctor reported the initially installed 30.0.0 version mismatch.
`npx prettier --write .` — formatted generated starter files and new config/test files once.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 1 test.
`npx expo-doctor` — passed 20/20 checks.
`npm audit --audit-level=moderate` — failed with 11 moderate `uuid` advisories through Expo's generated dependency chain; npm's force fix would install a breaking Expo package change, so no dependency change was made.
Manual verification:
Inspected `mobile/package.json`, `mobile/jest.config.js`, `mobile/.prettierignore`, `mobile/tsconfig.json`, and the smoke test placement under `mobile/src/test`.
Known limitations:
Root `D:\github\babywalk` is still not a Git worktree, so changes could not be committed and normal `git diff` remains unavailable. Audit advisories remain in transitive Expo tooling dependencies.
Next task:
TASK-004 — Activate CI.
```

```text
2026-07-14 — TASK-004
Summary:
Activated GitHub Actions CI for mobile quality checks on pushes to `main` and pull requests. Initialized the root Git repository, connected it to `https://github.com/waholulu/babywalk.git`, pushed `main`, opened test PR #1, and verified both CI contexts.
Commands/tests:
`git init -b main` — initialized the root repository.
`git remote add origin https://github.com/waholulu/babywalk.git` — connected the GitHub remote.
`npm run format:check` — passed locally.
`npm run lint` — passed locally.
`npm run typecheck` — passed locally.
`npm test -- --runInBand` — passed locally.
`git commit -m "Initialize SproutScout Expo scaffold"` — created initial commit `e35abd3`.
`git push -u origin main` — pushed `main`.
`gh run watch 29348932412 --repo waholulu/babywalk --exit-status` — push CI passed on `main`.
`gh pr create ...` — opened PR #1, `Validate CI workflow`.
`gh run watch 29349028561 --repo waholulu/babywalk --exit-status` — pull request CI passed.
Manual verification:
Reviewed `.github/workflows/ci.yml`; it runs `npm ci`, `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm test -- --runInBand` from `mobile/`.
Known limitations:
GitHub Actions reported a warning that `actions/checkout@v4` and `actions/setup-node@v4` target Node.js 20 and are being forced to run on Node.js 24 by GitHub-hosted runners. This does not fail CI.
Next task:
TASK-005 — Establish physical-device Expo Go path.
```

```text
2026-07-14 — TASK-005
Summary:
Established the Windows beginner physical-device path using Expo Go. The original SDK 57 scaffold could not open on the user's fully updated iPhone Expo Go app because SDK 57 support was not yet available through the iOS App Store path, so the project was aligned to Expo SDK 54 and the generated starter was minimally adjusted for SDK 54-compatible APIs.
Commands/tests:
`npm install expo@~54.0.0` — succeeded and moved the project toward SDK 54.
`npx expo install --fix` — failed after identifying SDK 54-compatible target versions because the existing SDK 57 dependency tree created an npm peer-resolution conflict.
Removed generated `mobile/node_modules` and `mobile/package-lock.json`, then ran `npm install` — succeeded and regenerated the lockfile for SDK 54.
`npx expo-doctor` — passed 18/18 checks.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 1 test.
Manual verification:
Started the app with `npx expo start --clear` from `mobile/` and used LAN mode. The app opened from the Expo Go QR code on an iPhone 16 Pro running iOS 26.5. The initial screen loaded. Fast Refresh was verified by temporarily changing visible text from `get started` to `fast refresh check`, observing the phone update, and restoring the original text.
Known limitations:
Expo SDK 57 was deferred because the iOS App Store Expo Go app available on the user's device could not run it yet. EAS development builds, expo-dev-client, Apple signing, iOS device registration, and Android APK generation remain deferred to TASK-027B or native release testing.
Next task:
TASK-006 — Create route skeleton.
```

```text
2026-07-14 — TASK-006
Summary:
Created the first SproutScout route skeleton with placeholder screens for home, onboarding, results, place detail, day plan, saved, and settings. Replaced the generated starter tab/explore route with a simple Expo Router Slot layout and a shared placeholder screen component under `src/features/navigation`.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed after refreshing Expo Router generated route types.
`npm test -- --runInBand` — passed, 1 test.
`npx expo-doctor` — passed 18/18 checks.
Manual verification:
Started Expo web on port 8083 and verified HTTP 200 for `/`, `/onboarding`, `/results`, `/places/demo-place`, `/plan/demo-plan`, `/saved`, and `/settings`.
Known limitations:
All TASK-006 screens are placeholders only. Real onboarding inputs, recommendation results, place details, day-plan behavior, saved data, settings behavior, and polished UI primitives remain for later tasks.
Next task:
TASK-007 — Create theme and UI primitives.
```

```text
2026-07-14 — TASK-007
Summary:
Added shared theme tokens for color, spacing, typography, radii, and card shadows. Added reusable UI primitives for screen containers, buttons, chips, cards, loading states, empty states, and error states. Updated the placeholder route skeleton to use the new primitives as a lightweight preview without adding dependencies.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 1 test.
`npx expo-doctor` — passed 18/18 checks.
Manual verification:
Started Expo web on port 8083 and verified HTTP 200 for `/`, `/onboarding`, `/results`, `/places/demo-place`, `/plan/demo-plan`, `/saved`, and `/settings`.
Known limitations:
The primitives are intentionally simple. Final visual polish, icons, richer form controls, and feature-specific interaction states remain for later tasks.
Next task:
TASK-008 — Add environment validation.
```

```text
2026-07-14 — TASK-008
Summary:
Added dependency-free client environment validation for `EXPO_PUBLIC_APP_ENV` with allowed values `local`, `staging`, and `production`. Added `mobile/.env.example`, pure parser tests, and a configuration error screen that names missing or invalid variables without rendering raw values.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 4 tests.
`npx expo-doctor` — passed 18/18 checks.
Manual verification:
With `EXPO_PUBLIC_APP_ENV=local`, Expo web returned HTTP 200 for `/`, `/onboarding`, `/results`, `/places/demo-place`, `/plan/demo-plan`, `/saved`, and `/settings`. Without `EXPO_PUBLIC_APP_ENV`, Expo web returned HTTP 200 for `/` and rendered `Configuration needed`, `EXPO_PUBLIC_APP_ENV`, and `missing` without exposing raw values.
Known limitations:
Only `EXPO_PUBLIC_APP_ENV` is required now because Supabase and external providers are not configured yet. Supabase URL/anon-key and provider adapter validation are deferred to their own implementation tasks.
Next task:
TASK-009 — Define domain models.
```

```text
2026-07-14 — TASK-009
Summary:
Added provider-neutral domain models under `mobile/src/domain/` for shared primitives, family constraints, place candidates, weather snapshots, recommendation results, reason codes, warning codes, score components, and confidence levels. Added vocabulary tests for reason codes, score components, and provider-neutral naming.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 7 tests.
`npx expo-doctor` — passed 18/18 checks.
`rg -n "google|mapbox|openweather|yelp|foursquare|supabase|provider|api" mobile\src\domain` — found no matches.
Manual verification:
Reviewed domain files for provider-specific names and sensitive family fields. The models avoid child names, exact birth dates, medical details, and precise home addresses.
Known limitations:
Types only. Mock data, hard filters, scoring, diversity selection, and UI wiring remain for later tasks.
Next task:
TASK-010 — Create mock candidate dataset.
```

```text
2026-07-14 — TASK-010
Summary:
Added 18 local fixture place candidates under `mobile/src/data/fixtures/` using the provider-neutral `PlaceCandidate` type. The dataset covers varied North Jersey + NYC-style categories, areas, age ranges, price bands, indoor/outdoor modes, schedule windows, amenities, and explicit unknown values. Added scenario coverage metadata and dataset tests.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 11 tests.
`npx expo-doctor` — passed 18/18 checks.
`rg -n "description|google|mapbox|openweather|yelp|foursquare|provider|api|copyright" mobile\src\data\fixtures` — found no matches.
Manual verification:
Reviewed fixture records for obvious real-place factual claims, copied descriptions, sensitive family data, and provider-specific fields. Fixtures are explicitly labeled as local fixture data and contain no descriptions.
Known limitations:
Fixture data is not real curated data. It is only for local deterministic development and tests.
Next task:
TASK-011 — Implement hard filters.
```

```text
2026-07-14 — TASK-011
Summary:
Implemented pure hard filters for recommendation candidates under `mobile/src/domain/recommendation/`. The filter returns included candidates plus excluded candidate IDs with hard-filter codes for age range, schedule conflict, travel too far, over budget, indoor/outdoor mismatch, blocked place, and impossible return time. Unknown or missing values are preserved as non-excluding unless another known value proves incompatibility.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 5 test suites and 22 tests.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Reviewed the implementation and unit tests for inclusive boundaries, unknown age, unknown price, unknown indoor/outdoor mode, unknown travel, missing schedule, missing visit duration, blocked places, and multi-code exclusions. No physical-device test was required because this task only changes pure domain logic.
Known limitations:
Schedule and return-time filtering are intentionally simple single-stop checks. Rich one- or two-stop planning remains for TASK-031.
Next task:
TASK-012 — Implement scoring.
```

```text
2026-07-14 — TASK-012
Summary:
Implemented pure recommendation scoring under `mobile/src/domain/recommendation/scoring.ts`. The scorer produces a 100-point component breakdown for age/activity fit, schedule fit, travel convenience, weather fit, budget fit, amenities confidence, novelty, and family preference. It also attaches deterministic reason codes, uncertainty warnings, confidence, and stable tie-breaking.
Commands/tests:
`npm test -- --runInBand src/test/scoring.test.ts -u` — passed and wrote/updated the scoring snapshot.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 6 test suites, 24 tests, and 1 snapshot.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Reviewed the fixture snapshot for complete score breakdowns, reason codes, warnings, confidence, and deterministic order. No device test was required because this task only changes pure domain logic.
Known limitations:
Scoring heuristics are intentionally early and local. Provider-backed travel/weather data, richer family history, and score tuning remain for later tasks.
Next task:
TASK-013 — Implement diversity selection.
```

```text
2026-07-14 — TASK-013
Summary:
Implemented pure diversity selection under `mobile/src/domain/recommendation/diversity.ts`. The selector takes already-scored recommendations and candidate metadata, then chooses a small result set while promoting comparable alternatives from unused categories and coarse areas. It preserves score order when diverse alternatives are not within the comparable-score threshold.
Commands/tests:
`npm test -- --runInBand src/test/diversity.test.ts` — passed, 3 tests.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 7 test suites, 27 tests, and 1 snapshot.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Reviewed the selector and tests for category diversity, location diversity, comparable-score threshold behavior, and deterministic ordering. No device test was required because this task only changes pure domain logic.
Known limitations:
Diversity uses category and coarse area metadata only. Map-distance clustering and richer similarity rules remain deferred until real data/provider work.
Next task:
TASK-014 — Build plan input form.
```

```text
2026-07-14 — TASK-014
Summary:
Replaced the home placeholder with a mobile-first local `PlanInputForm`. The form captures child age, coarse area, available window, nap start, max travel, budget, indoor/outdoor preference, energy level, stroller and bathroom requirements, and interests. Added pure validation helpers with tests, accessible labels/states, keyboard-friendly screen scrolling, reset behavior, and a local validated summary.
Commands/tests:
`npm test -- --runInBand src/test/plan-input.test.ts` — passed, 5 tests.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 8 test suites, 32 tests, and 1 snapshot.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Started Expo web on port 8084 with `EXPO_PUBLIC_APP_ENV=local`; `http://localhost:8084/` returned HTTP 200. The server was stopped afterward. The cleanup command matched and killed its own PowerShell process after printing the 200 result, so the shell command exit code was non-zero despite the successful HTTP response.
Known limitations:
Form submission only validates and shows a local ready summary. It does not yet generate recommendations, persist defaults, request location permission, or navigate to results.
Next task:
TASK-015 — Build recommendation results.
```

```text
2026-07-14 — TASK-015
Summary:
Added a local recommendation builder that applies hard filters, scoring, and diversity selection to mock place candidates with deterministic travel estimates and a local weather snapshot. Replaced the results placeholder with three recommendation cards showing place facts, travel estimate, price band, indoor/outdoor status, age fit, score, reason codes, warnings, confidence, source, and freshness. Added snapshot coverage for the canonical local scenario.
Commands/tests:
`npm test -- --runInBand src/test/recommendation-results.test.ts -u` — passed and wrote the canonical results snapshot.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 9 test suites, 33 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Started Expo web on port 8085 with `EXPO_PUBLIC_APP_ENV=local`; `http://localhost:8085/results` returned HTTP 200. The server was stopped afterward.
Known limitations:
Results use a fixed local scenario and do not yet consume live home form input, persist preferences, fetch provider data, or implement place detail content.
Next task:
TASK-016 — Build place detail screen.
```

```text
2026-07-14 — TASK-016
Summary:
Built a fixture-backed place detail screen. The detail model renders structured facts, schedule, amenities, source, freshness, verify-before-leaving notes, and placeholder actions for save, visited, block, and report incorrect data. Unknown age, price, schedule, amenities, and freshness are labeled as unknown and surfaced in verification notes instead of being shown as confident facts.
Commands/tests:
`npm test -- --runInBand src/test/place-detail.test.ts` — passed, 3 tests.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 10 test suites, 36 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Started Expo web on port 8086 with `EXPO_PUBLIC_APP_ENV=local`; `/places/hoboken-story-room-fixture` and `/places/missing-place` both returned HTTP 200. The server was stopped afterward.
Known limitations:
Detail data is fixture-only. Official website/call links, maps, save/visited/block/report persistence, and real provider details remain later tasks.
Next task:
TASK-017 — Add development score inspector.
```

```text
2026-07-14 — TASK-017
Summary:
Added a development-only score inspector to the recommendation results screen. Local and staging environments show score component rows for each recommendation and hard-filter exclusion IDs/codes; production and invalid env states do not render the inspector. The local recommendation builder now preserves exclusion details for this debug surface.
Commands/tests:
`npm test -- --runInBand src/test/score-inspector.test.ts` — passed, 3 tests.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 11 test suites, 39 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Started Expo web on port 8087 with `EXPO_PUBLIC_APP_ENV=local`; `/results` returned HTTP 200. The server was stopped afterward.
Known limitations:
The inspector is only on the results screen and is not user-toggleable; this is intentional for the first debug surface.
Next task:
TASK-018 — Initialize local Supabase.
```

```text
2026-07-14 — TASK-018 BLOCKED
Summary:
Attempted to begin local Supabase initialization, but the required Docker prerequisite is missing. No Supabase config was created because TASK-018 acceptance requires a local database to start and reset reproducibly.
Commands/tests:
`docker --version` — failed; `docker` is not recognized.
`docker info` — failed; `docker` is not recognized.
`supabase --version` — failed; `supabase` is not recognized.
`npx supabase --version` — passed, 2.109.1.
Manual verification:
Not run; Docker Desktop is unavailable.
Known limitations:
TASK-018 remains unstarted. Install and start Docker Desktop, then rerun `docker --version` and `docker info` before initializing Supabase.
Next task:
BLOCKER — Install Docker Desktop for TASK-018.
```

```text
2026-07-14 — TASK-018
Summary:
Initialized local Supabase under `supabase/` with CLI-generated config, a local README, and an intentionally empty seed file until TASK-021 adds curated seed data. Docker Desktop was installed and started; Docker works when its bin directory is added to the current shell PATH. Local Supabase start, status, and database reset were verified. Supabase command output included local default keys/secrets; those values were not copied into project docs.
Commands/tests:
`docker --version` — initially failed in the existing shell because Docker was not on PATH after installation.
`docker info` — initially failed in the existing shell because Docker was not on PATH after installation.
`C:\Program Files\Docker\Docker\resources\bin\docker.exe --version` — passed, Docker version 29.6.1.
`C:\Program Files\Docker\Docker\resources\bin\docker.exe info --format '{{.ServerVersion}}'` — passed, server version 29.6.1.
`supabase --version` — failed; the Supabase CLI is not globally installed.
`npx supabase --version` — passed, 2.109.1.
`npx supabase init` — passed and created local Supabase config.
`npx supabase start` — passed and started the local stack.
`npx supabase status` — passed.
`npx supabase db reset` — passed. After adding `supabase/seed.sql`, reset completed without the missing-seed warning.
Manual verification:
Docker Desktop was started locally. No mobile/device manual test was required for this backend initialization task.
Known limitations:
The current shell still needs a temporary PATH prefix for Docker until a new terminal picks up Docker's installed PATH. No schema migrations, RLS policies, or seed data exist yet.
Next task:
TASK-019 — Create initial schema migration.
```

```text
2026-07-14 — TASK-019
Summary:
Added the first committed Supabase migration, `20260714191031_initial_schema.sql`. The migration creates the reviewed MVP schema subset: profiles, child_preferences, places, events, saved_places, visits, place_feedback, and recommendation_feedback. It adds data bounds, enum-like check constraints, timestamps, updated_at triggers, lookup/policy indexes, unique source ID indexes, and enables RLS on all eight public tables.
Commands/tests:
`npx supabase migration new initial_schema` — passed and created the migration file.
`npx supabase db reset` — passed and applied the migration from an empty local database.
`npx supabase db lint` — passed with no schema errors.
`npx supabase migration list` — failed because the local project is not linked to a remote Supabase project.
`npx supabase migration list --local` — passed and listed `20260714191031`.
`docker exec supabase_db_babywalk psql -U postgres -d postgres -c "select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' order by relname;"` — passed and confirmed all 8 public tables have RLS enabled.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 11 test suites, 39 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Reviewed migration fields for privacy. It avoids child names, exact birth dates, medical fields, precise home addresses, and secrets.
Known limitations:
RLS policies and cross-user policy tests are intentionally deferred to TASK-020.
Next task:
TASK-020 — Add RLS policies and tests.
```

```text
2026-07-14 — TASK-005 SCOPE UPDATED
Summary:
Changed TASK-005 from EAS development-build setup to the lower-friction Expo Go physical-device workflow for Windows development. Deferred expo-dev-client, EAS Build, Apple signing, Android APK generation, and paid Apple Developer enrollment to a later EAS development-build migration task.
Commands/tests:
Documentation/task update only; no app commands required.
Manual verification:
Reviewed TASKS.md and PROJECT_STATE.md to ensure TASK-005 now requires Expo Go QR launch, Fast Refresh verification, LAN/Tunnel documentation, and physical device/OS recording.
Known limitations:
TASK-005 still requires user-side physical device verification. EAS development-build setup is deferred to TASK-027B.
Next task:
TASK-005 — Establish physical-device Expo Go path.
```
