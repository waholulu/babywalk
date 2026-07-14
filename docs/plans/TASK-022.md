# TASK-022 Execution Plan — Add Supabase Client and Repositories

## Objective

Add a typed Supabase client and place repository boundary so the app can switch between local fixture data and Supabase-backed place candidates without changing UI code.

## In scope

- Add the required Supabase JavaScript client dependency.
- Extend client-safe environment validation with a place data-source switch.
- Require Supabase URL and anon key only when the Supabase data source is selected.
- Add a `PlaceRepository` interface.
- Add fixture and Supabase implementations for listing candidate places.
- Map Supabase place rows into existing provider-neutral `PlaceCandidate` domain models.
- Update the local recommendation builder and results screen to consume a repository-selected candidate source.
- Add focused unit tests for environment parsing, repository selection, and Supabase row mapping.

## Out of scope

- Authentication UI, which is TASK-023.
- Save/visit/block actions, which are TASK-024.
- Real network-driven results UX polish, loading states, or cache libraries.
- Supabase generated database types.
- Edge Functions or external providers.

## Files expected to change

- `mobile/package.json`
- `mobile/package-lock.json`
- `mobile/.env.example`
- `mobile/src/lib/env.ts`
- `mobile/src/lib/supabase.ts`
- `mobile/src/data/repositories/*`
- `mobile/src/features/recommendations/local-recommendations.ts`
- `mobile/src/features/recommendations/recommendation-results-screen.tsx`
- `mobile/src/test/*`
- `docs/plans/TASK-022.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `TASKS.md` requires typed client initialization and a place repository with a switchable local fixture/database implementation.
- `ARCHITECTURE.md` requires repositories to hide persistence and UI code to avoid raw Supabase queries.
- `mobile/src/lib/env.ts` currently validates only `EXPO_PUBLIC_APP_ENV`.
- `mobile/src/features/recommendations/local-recommendations.ts` currently imports `mockPlaceCandidates` directly.
- `mobile/src/features/recommendations/recommendation-results-screen.tsx` directly calls `buildLocalRecommendations()`.

## Implementation steps

1. Install `@supabase/supabase-js`.
2. Extend environment parsing with `EXPO_PUBLIC_PLACE_DATA_SOURCE`, `EXPO_PUBLIC_SUPABASE_URL`, and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Add a typed Supabase client helper that returns a configuration error instead of logging secrets.
4. Add repository interfaces and fixture/Supabase place repositories.
5. Update recommendation building to accept repository-provided candidates while keeping fixture mode as the default.
6. Add tests for env validation and repository mapping/selection.
7. Run all available checks, review diff, update project state, commit, push, and verify CI.

## Test plan

### Automated

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

- Device/environment: Local Expo web or static inspection.
- Steps: Verify fixture mode remains the default data source and Supabase mode requires explicit safe public configuration.
- Expected result: UI can keep using fixtures without Supabase credentials, while Supabase mode has a repository path ready for TASK-023/TASK-024.

## Risks and rollback

- Risk: Supabase client dependency may require extra React Native polyfills later.
- Mitigation: Keep TASK-022 to simple public reads and verify Expo Doctor/type checks.
- Rollback: Revert the TASK-022 commit and reinstall dependencies from the previous lockfile.

## Security/privacy review

- New data collected: None.
- Secrets involved: No secret keys; only publishable Supabase URL and anon key are allowed in `EXPO_PUBLIC_` variables.
- RLS/auth impact: Supabase repository reads public active places through existing RLS policies.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/package.json`, `mobile/package-lock.json`, `mobile/.env.example`, `mobile/src/lib/env.ts`, `mobile/src/lib/supabase.ts`, `mobile/src/data/repositories/*`, `mobile/src/features/recommendations/local-recommendations.ts`, `mobile/src/features/recommendations/recommendation-results-screen.tsx`, `mobile/src/test/env.test.ts`, `mobile/src/test/place-repository.test.ts`, `mobile/src/test/score-inspector.test.ts`, `docs/plans/TASK-022.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npm install @supabase/supabase-js` — passed; npm reported 15 moderate audit findings in the dependency tree.
  - `npx prettier --write ... .env.example ...` — failed only because Prettier could not infer a parser for `.env.example`; code files in the same command were formatted before that error.
  - `npm run typecheck` — initially failed because env parsing needed explicit place-data-source narrowing and a score-inspector test fixture needed the new `placeDataSource`; passed after fixes.
  - `npm test -- --runInBand src/test/env.test.ts src/test/place-repository.test.ts src/test/recommendation-results.test.ts src/test/score-inspector.test.ts` — passed, 4 suites and 13 tests.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm test -- --runInBand` — passed, 12 test suites, 45 tests, and 2 snapshots.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Started Expo web with `EXPO_PUBLIC_APP_ENV=local` and `EXPO_PUBLIC_PLACE_DATA_SOURCE=fixtures`; `/results` served successfully on localhost. The first smoke command failed because the Windows `Start-Process` stdout/stderr redirection was invalid; the corrected command completed and the temporary Expo server was cleaned up.
- Remaining limitations: Supabase mode currently covers public place candidate reads only. Authenticated user repositories, save/visit/block mutations, realtime caching, and generated database types remain for later tasks.
- Acceptance criteria status: Complete. UI recommendation loading can switch between fixture and Supabase place repositories through the `PlaceRepository` interface and `EXPO_PUBLIC_PLACE_DATA_SOURCE`.
