# TASK-024 Execution Plan — Implement Save, Visit, and Block Actions

## Objective

Turn the place-detail Save, Visited, and Do not recommend placeholders into working actions with safe local persistence, optimistic UI, and error recovery.

## In scope

- Add a small place-action repository interface.
- Implement a local persisted repository for saved, visited, and blocked place IDs.
- Wire place detail action buttons to repository state.
- Add loading, success, and error states with rollback/retry behavior.
- Keep report-incorrect-data as a TASK-025 placeholder.
- Add tests for repository behavior and place-detail action model/state transitions.

## Out of scope

- Supabase writes for saved/visited data.
- A new database table for blocked places.
- Authentication-required user history sync.
- Saved/history screens beyond reflecting actions on place detail.
- Incorrect-data feedback, which is TASK-025.

## Files expected to change

- `mobile/src/data/repositories/place-actions-repository*`
- `mobile/src/features/places/place-actions*`
- `mobile/src/features/places/place-detail.ts`
- `mobile/src/features/places/place-detail-screen.tsx`
- `mobile/src/test/*`
- `docs/plans/TASK-024.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `TASKS.md` requires save/visit/block actions with persistence and error recovery.
- `DATABASE.md` contains `saved_places` and `visits` but no blocked-place table.
- `mobile/src/features/places/place-detail-screen.tsx` currently renders disabled placeholders for Save, Visited, Do not recommend, and Report incorrect data.
- `mobile/src/features/places/place-detail.ts` builds placeholder action metadata only.

## Implementation steps

1. Add a dependency-free local repository using `globalThis.localStorage` when available and an in-memory fallback otherwise.
2. Add action-state helpers for toggling save, marking visited, and blocking/unblocking.
3. Update place detail UI buttons to call actions, show state labels, and recover on errors.
4. Add tests for local persistence, optimistic rollback, and button model labels.
5. Run all checks, review diff, update state, commit, push, and verify CI.

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

- Device/environment: Local Expo web with fixture data.
- Steps: Open a place detail page and press Save, Visited, and Do not recommend.
- Expected result: Labels/status update without leaving the page; report feedback remains deferred.

## Risks and rollback

- Risk: Native Expo Go environments without `localStorage` only get in-memory persistence until a reviewed storage dependency or Supabase-backed repository is added.
- Mitigation: Document this limitation and keep the repository boundary ready for native persistent storage or Supabase-backed actions later.
- Rollback: Revert the TASK-024 commit.

## Security/privacy review

- New data collected: Local saved/visited/blocked place IDs only.
- Secrets involved: None.
- RLS/auth impact: No database writes in this task.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/data/repositories/place-actions-repository.ts`, `mobile/src/data/repositories/place-actions-repository.local.ts`, `mobile/src/data/repositories/index.ts`, `mobile/src/features/places/place-actions.ts`, `mobile/src/features/places/place-detail.ts`, `mobile/src/features/places/place-detail-screen.tsx`, `mobile/src/features/places/index.ts`, `mobile/src/test/place-actions.test.ts`, `docs/plans/TASK-024.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npx prettier --write src/data/repositories/place-actions-repository.ts src/data/repositories/place-actions-repository.local.ts src/data/repositories/index.ts src/features/places/place-actions.ts src/features/places/place-detail.ts src/features/places/place-detail-screen.tsx src/test/place-actions.test.ts` — passed.
  - `npm run typecheck` — initially failed because `mobile/src/features/places/index.ts` still exported the removed `PlaceDetailAction` type; passed after removing the stale export.
  - `npm test -- --runInBand src/test/place-actions.test.ts src/test/place-detail.test.ts` — passed, 2 suites and 7 tests.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 14 test suites, 56 tests, and 2 snapshots.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Started Expo web with `EXPO_PUBLIC_APP_ENV=local` and `EXPO_PUBLIC_PLACE_DATA_SOURCE=fixtures`; `/places/hoboken-story-room-fixture` returned HTTP 200. The temporary Expo server was stopped afterward.
- Remaining limitations: Native Expo Go persistence uses the in-memory fallback until a reviewed native storage dependency or Supabase-backed action repository is added. Supabase writes for saved/visited data and a database-backed blocked-place model remain future work. Incorrect-data reporting remains TASK-025.
- Acceptance criteria status: Complete. Save, visit, and block actions work through a repository boundary, update optimistically with rollback, and persist where `localStorage` is available.
