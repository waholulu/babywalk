# TASK-017 Execution Plan — Add Development Score Inspector

## Objective

Add a development-only score inspector to the recommendation results screen so local/staging builds can inspect score components and hard-filter exclusions, while production builds render none of that debug surface.

## In scope

- Show score component breakdowns for rendered recommendation cards in non-production environments.
- Show hard-filter exclusion IDs and codes in non-production environments.
- Add pure environment gating helpers.
- Add tests proving the inspector is hidden in production and visible in local/staging.

## Out of scope

- A standalone debug route.
- Editing scores from the UI.
- Persisting debug settings.
- Showing the inspector on place detail or other screens.

## Files expected to change

- `mobile/src/features/recommendations/local-recommendations.ts`
- `mobile/src/features/recommendations/score-inspector.ts`
- `mobile/src/features/recommendations/recommendation-results-screen.tsx`
- `mobile/src/test/score-inspector.test.ts`
- `docs/plans/TASK-017.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` requires a development-only score inspector absent from production builds.
- `PROJECT_STATE.md` shows TASK-016 complete and TASK-017 next.
- `ARCHITECTURE.md` allows a developer debug screen/panel to display score breakdowns in non-production builds.
- `mobile/src/lib/env.ts` parses `EXPO_PUBLIC_APP_ENV` with `local`, `staging`, and `production`.
- `mobile/src/features/recommendations/recommendation-results-screen.tsx` renders cards but not score components or exclusion codes.

## Implementation steps

1. Preserve hard-filter exclusions in the local recommendation build result.
2. Add pure score-inspector helpers for environment gating and score-breakdown row formatting.
3. Render inspector panels only when `EXPO_PUBLIC_APP_ENV` is not `production`.
4. Add tests for local/staging/production gating and score row formatting.
5. Run all available mobile checks and a web route check.
6. Update project state, mark TASK-017 complete only after verification, review diff, commit, push, and verify CI.

## Test plan

### Automated

- Command: `npm run format:check`
- Expected result: Passes.
- Command: `npm run lint`
- Expected result: Passes.
- Command: `npm run typecheck`
- Expected result: Passes.
- Command: `npm test -- --runInBand`
- Expected result: Passes with score inspector tests.
- Command: `npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Expo web local route check.
- Steps: Start Expo web with `EXPO_PUBLIC_APP_ENV=local` and verify `/results` returns HTTP 200.
- Expected result: Results route renders without server errors.

## Risks and rollback

- Risk: Debug details could accidentally appear in production.
- Mitigation: Centralize the env gate and test production behavior.
- Rollback: Revert the TASK-017 commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/features/recommendations/local-recommendations.ts`, `mobile/src/features/recommendations/score-inspector.ts`, `mobile/src/features/recommendations/recommendation-results-screen.tsx`, `mobile/src/test/score-inspector.test.ts`, `docs/plans/TASK-017.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npm test -- --runInBand src/test/score-inspector.test.ts` — passed, 3 tests.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 11 test suites, 39 tests, and 2 snapshots.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Started Expo web on port 8087 with `EXPO_PUBLIC_APP_ENV=local`; `/results` returned HTTP 200. The server was stopped afterward.
- Remaining limitations: The inspector is only on the results screen and is not user-toggleable; this is intentional for the first debug surface.
- Acceptance criteria status: Complete. Unit tests prove the inspector is hidden for production and invalid env states, and visible for local/staging.
