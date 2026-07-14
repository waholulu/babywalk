# TASK-023 Execution Plan — Add Optional Authentication

## Objective

Add a low-friction optional parent sign-in path while keeping guest planning usable without Supabase auth configuration, and prove sign-out clears protected in-memory cache without touching guest form input.

## In scope

- Add an auth service boundary for guest mode and Supabase email magic-link requests.
- Allow Supabase public URL/anon-key configuration to power auth even when place data still uses fixtures.
- Add a Settings auth panel with guest status, email sign-in request, and sign-out action.
- Add a small protected cache abstraction and clear it on sign-out.
- Add focused tests for auth configuration, sign-in validation, sign-out cache clearing, and guest-safe behavior.

## Out of scope

- Deep-link callback handling and verified magic-link session completion.
- Social login providers.
- Anonymous Supabase auth.
- Persisted session storage, profile creation, and protected user repositories.
- Save/visit/block mutations, which are TASK-024.

## Files expected to change

- `mobile/src/lib/env.ts`
- `mobile/src/lib/supabase.ts`
- `mobile/src/features/auth/*`
- `mobile/src/app/settings.tsx`
- `mobile/src/test/*`
- `docs/plans/TASK-023.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `TASKS.md` requires a low-friction parent sign-in path while preserving guest flow, and sign-out must clear protected cache.
- `ARCHITECTURE.md` says auth failure should not destroy local unsaved input.
- `mobile/src/app/settings.tsx` is currently a placeholder.
- `mobile/src/features/plan-input/plan-input-form.tsx` keeps guest inputs in local component state; TASK-023 should not move or clear that state.
- `mobile/src/lib/env.ts` currently requires Supabase config only when the place data source is `supabase`.

## Implementation steps

1. Extend env parsing so Supabase URL/anon-key can be optional but validated as a pair for auth.
2. Add auth service and protected cache modules.
3. Replace the settings placeholder with an optional auth panel.
4. Add tests for env parsing and auth service behavior.
5. Run checks, review diff, update state, commit, push, and verify CI.

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

- Device/environment: Local Expo web with fixture mode.
- Steps: Open settings and verify guest mode still renders without Supabase config.
- Expected result: User can remain guest; auth UI does not block local planning.

## Risks and rollback

- Risk: Magic-link completion needs deep-link handling later.
- Mitigation: Clearly keep this task to request/sign-out boundary and defer callback handling.
- Rollback: Revert the TASK-023 commit.

## Security/privacy review

- New data collected: Optional parent email address only when the user requests a sign-in link.
- Secrets involved: No service-role secrets; only publishable Supabase URL/anon key.
- RLS/auth impact: Adds client auth calls but no new policies.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/lib/env.ts`, `mobile/src/features/auth/auth-service.ts`, `mobile/src/features/auth/protected-cache.ts`, `mobile/src/features/auth/index.ts`, `mobile/src/app/settings.tsx`, `mobile/src/test/auth-service.test.ts`, `mobile/src/test/env.test.ts`, `docs/plans/TASK-023.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npx prettier --write src/lib/env.ts src/features/auth src/app/settings.tsx src/test/env.test.ts src/test/auth-service.test.ts` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand src/test/auth-service.test.ts src/test/env.test.ts` — passed, 2 suites and 13 tests.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm test -- --runInBand` — passed, 13 test suites, 52 tests, and 2 snapshots.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Started Expo web with `EXPO_PUBLIC_APP_ENV=local` and `EXPO_PUBLIC_PLACE_DATA_SOURCE=fixtures`; `/settings` returned HTTP 200 without Supabase credentials, confirming guest mode remains available. The temporary Expo server was stopped afterward.
- Remaining limitations: Magic-link callback/deep-link session completion, persisted session storage, profile creation, and authenticated user data repositories are deferred. Save/visit/block actions remain TASK-024.
- Acceptance criteria status: Complete. Optional auth UI exists, guest flow remains usable, and tests prove sign-out clears protected cache without changing guest form state.
