# TASK-027 Execution Plan — Add Distance/Travel Abstraction

## Objective

Add a pure distance/travel estimation boundary that can provide deterministic travel estimates now and be replaced by a routing provider later without changing recommendation filtering or scoring.

## In scope

- Define provider-neutral travel request/result types and a travel estimator interface.
- Add a simple deterministic estimate based on coarse coordinates.
- Use the estimator for local recommendation travel estimates.
- Add unit tests that require no maps, network, provider keys, or native APIs.

## Out of scope

- Maps UI.
- Routing-provider integration.
- Traffic-aware estimates.
- Persisting precise user location or home address.
- Edge Functions or Supabase schema changes.

## Files expected to change

- `mobile/src/domain/travel/*`
- `mobile/src/domain/index.ts`
- `mobile/src/features/recommendations/local-recommendations.ts`
- `mobile/src/test/travel-estimator.test.ts`
- `mobile/src/test/recommendation-results.test.ts` or snapshot if output intentionally changes
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` and `PROJECT_STATE.md` identify TASK-027 as the next task.
- `PRODUCT_SPEC.md` and `ARCHITECTURE.md` require provider adapters later, pure recommendation logic, and no API calls inside scoring.
- `mobile/src/domain/recommendation/hard-filters.ts` already accepts `CandidateTravelEstimate[]`.
- `mobile/src/domain/recommendation/scoring.ts` already consumes `CandidateTravelEstimate[]`.
- `mobile/src/features/recommendations/local-recommendations.ts` currently uses a hardcoded `defaultTravelEstimates` array.
- `mobile/src/domain/place/types.ts` supports optional coordinates, but current fixtures mostly rely on coarse areas.

## Implementation steps

1. Add travel domain types and a deterministic simple estimator.
2. Replace the hardcoded local estimate array with estimates produced by the simple estimator from coarse fixture-area coordinates.
3. Add tests for distance math, rounding, unknown destination handling, and no-network behavior.
4. Run quality checks and update task/project docs after verification.

## Test plan

### Automated

- Command: `npm test -- --runInBand src/test/travel-estimator.test.ts src/test/recommendation-results.test.ts`
- Expected result: New travel estimator tests and affected recommendation snapshot pass.
- Command: `npm run format:check`
- Expected result: Pass.
- Command: `npm run lint`
- Expected result: Pass.
- Command: `npm run typecheck`
- Expected result: Pass.
- Command: `npm test -- --runInBand`
- Expected result: Full Jest suite passes.
- Command: `npx expo-doctor`
- Expected result: Pass.

### Manual

- Device/environment: Local Expo web smoke.
- Steps: Start Expo web with local environment and request `/results`.
- Expected result: The results screen returns HTTP 200.

## Risks and rollback

- Risk: Replacing fixed estimates may unintentionally change canonical recommendation ordering.
- Mitigation: Keep fixture coordinate inputs explicit and verify the recommendation snapshot.
- Rollback: Restore the previous `defaultTravelEstimates` array and remove the new travel domain module.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/domain/travel/*`, `mobile/src/domain/index.ts`, `mobile/src/domain/recommendation/hard-filters.ts`, `mobile/src/domain/recommendation/scoring.ts`, `mobile/src/features/recommendations/local-recommendations.ts`, `mobile/src/test/travel-estimator.test.ts`, `mobile/src/test/recommendation-results.test.ts` snapshot, `mobile/src/test/score-inspector.test.ts`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results: `npm test -- --runInBand src/test/travel-estimator.test.ts src/test/recommendation-results.test.ts` passed; `npm test -- --runInBand src/test/recommendation-results.test.ts -u` passed and updated the snapshot; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed with 18 suites and 73 tests; `npx expo-doctor` passed 18/18 checks.
- Manual test result: Expo web smoke with local fixture env returned `task027_results_http=200` for `/results`. The first Windows smoke command using `Start-Process npx` failed because `npx` is not a Win32 executable; retrying with `npx.cmd`/job-based launch passed.
- Remaining limitations: No maps UI, routing provider, traffic awareness, Edge Function, or persisted precise location was added. Fixture travel remains a coarse deterministic estimate.
- Acceptance criteria status: Met. Domain tests require no maps, network, native location APIs, provider keys, or external services.
