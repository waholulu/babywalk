# TASK-015 Execution Plan — Build Recommendation Results

## Objective

Connect local fixture candidates to the deterministic recommendation pipeline and render three explainable recommendation cards on the results screen.

## In scope

- A local recommendation builder using mock candidates, default constraints, deterministic travel estimates, and a local weather snapshot.
- Pipeline order: hard filters, scoring, diversity selection, top three.
- Result card UI with place name, category, coarse area, travel estimate, price band, indoor/outdoor status, age fit, top reason codes, warnings, confidence, score, and source/freshness.
- Unit tests for canonical local scenario outputs, including expected reason codes and warnings.
- Replace the results placeholder screen.

## Out of scope

- Passing live form input from the home screen.
- Fetching real weather, travel, or place data.
- Place detail implementation beyond links to existing placeholder routes.
- Day-plan generation.
- Saved/history persistence.

## Files expected to change

- `mobile/src/features/recommendations/local-recommendations.ts`
- `mobile/src/features/recommendations/recommendation-results-screen.tsx`
- `mobile/src/features/recommendations/index.ts`
- `mobile/src/app/results.tsx`
- `mobile/src/test/recommendation-results.test.ts`
- `docs/plans/TASK-015.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` requires local fixtures connected to domain logic and three rendered cards with canonical reason codes and warnings.
- `PROJECT_STATE.md` shows TASK-014 complete and TASK-015 next.
- `mobile/src/app/results.tsx` currently renders a placeholder and loading state.
- Existing domain pipeline functions are `applyHardFilters`, `scoreRecommendations`, and `selectDiverseRecommendations`.
- `mobile/src/data/fixtures/place-candidates.ts` provides the local candidate dataset.

## Implementation steps

1. Add a local recommendation builder that creates default constraints and deterministic estimates.
2. Apply hard filters, scoring, and diversity selection to produce three card models.
3. Add result card UI under `features/recommendations`.
4. Replace the results route placeholder with the result screen.
5. Add tests that assert the canonical local scenario returns the expected candidate IDs, reason codes, warnings, and exclusion count.
6. Run all available mobile checks and a web route check.
7. Update project state, mark TASK-015 complete only after verification, review diff, commit, push, and verify CI.

## Test plan

### Automated

- Command: `npm run format:check`
- Expected result: Passes.
- Command: `npm run lint`
- Expected result: Passes.
- Command: `npm run typecheck`
- Expected result: Passes.
- Command: `npm test -- --runInBand`
- Expected result: Passes with recommendation result tests.
- Command: `npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Expo web local route check.
- Steps: Start Expo web and verify `/results` returns HTTP 200.
- Expected result: Results route renders without server errors.

## Risks and rollback

- Risk: The default local scenario may need tuning as the form begins passing real input.
- Mitigation: Keep scenario data explicit and tested.
- Rollback: Revert the TASK-015 commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/features/recommendations/local-recommendations.ts`, `mobile/src/features/recommendations/recommendation-results-screen.tsx`, `mobile/src/features/recommendations/index.ts`, `mobile/src/app/results.tsx`, `mobile/src/test/recommendation-results.test.ts`, `mobile/src/test/__snapshots__/recommendation-results.test.ts.snap`, `docs/plans/TASK-015.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npm test -- --runInBand src/test/recommendation-results.test.ts -u` — passed and wrote the canonical results snapshot.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 9 test suites, 33 tests, and 2 snapshots.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Started Expo web on port 8085 with `EXPO_PUBLIC_APP_ENV=local`; `http://localhost:8085/results` returned HTTP 200. The server was stopped afterward.
- Remaining limitations: Results use a fixed local scenario and do not yet consume live home form input, persist preferences, fetch provider data, or implement place detail content.
- Acceptance criteria status: Complete. Local fixtures are connected to hard filters, scoring, and diversity; the results route renders three cards; snapshot tests verify expected candidate IDs, reason codes, and warnings.
