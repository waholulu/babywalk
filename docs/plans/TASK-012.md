# TASK-012 Execution Plan — Implement Scoring

## Objective

Add a pure, transparent 100-point scoring function for recommendation candidates. It will return complete score breakdowns, deterministic reason codes, warnings for uncertain data, confidence, and stable ordering.

## In scope

- Score all existing `ScoreComponent` values with the product-spec maximums.
- Generate deterministic `RecommendationResult` objects for candidates that have already passed hard filters.
- Add reason codes for age match, return-before-nap fit, budget fit, weather fit, short travel, membership value, and novelty when supported by inputs.
- Add warnings for unknown or uncertain hours, price, amenities, weather, travel, source freshness, and age fit.
- Add confidence derived from warning/unknown coverage.
- Add deterministic tie-breaking.
- Add fixture/snapshot tests with complete score breakdowns.

## Out of scope

- Hard-filter behavior changes.
- Diversity selection.
- UI integration.
- Real weather, routing, history, membership, or provider adapters.
- LLM-generated explanations.

## Files expected to change

- `mobile/src/domain/recommendation/scoring.ts`
- `mobile/src/domain/index.ts`
- `mobile/src/test/scoring.test.ts`
- `docs/plans/TASK-012.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `PRODUCT_SPEC.md` defines the 100-point scoring model: 25 age/activity, 20 schedule, 15 travel, 15 weather, 10 budget, 5 amenities, 5 novelty, 5 family preference.
- `ARCHITECTURE.md` requires pure recommendation domain logic with serializable score breakdowns.
- `mobile/src/domain/recommendation/types.ts` already defines `ScoreComponent`, `RecommendationResult`, reason codes, warnings, and confidence levels.
- `mobile/src/domain/recommendation/hard-filters.ts` now handles exclusion rules before scoring.
- `mobile/src/data/fixtures/place-candidates.ts` has varied fixture candidates for scoring snapshots.

## Implementation steps

1. Add scoring input types and a pure `scoreRecommendations` function.
2. Implement component scoring with explicit max values and clamped integer totals.
3. Attach deterministic reason codes and warnings from known/unknown candidate, weather, travel, freshness, and preference inputs.
4. Sort by total score descending, then stable tie-breakers.
5. Export scoring from the domain barrel.
6. Add focused fixture tests and inline snapshots showing full breakdowns.
7. Run all available mobile checks.
8. Update project state, mark TASK-012 complete only after verification, review diff, commit, push, and verify CI.

## Test plan

### Automated

- Command: `npm run format:check`
- Expected result: Passes.
- Command: `npm run lint`
- Expected result: Passes.
- Command: `npm run typecheck`
- Expected result: Passes.
- Command: `npm test -- --runInBand`
- Expected result: Passes with scoring tests and snapshots.
- Command: `npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Not required for this pure domain task.
- Steps: Review scorer outputs and snapshots.
- Expected result: Scores are explainable, deterministic, and do not imply unsupported facts.

## Risks and rollback

- Risk: Early scoring heuristics may need tuning after UI and user testing.
- Mitigation: Keep component scores explicit and covered by snapshots so changes are intentional.
- Rollback: Revert the TASK-012 commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/domain/recommendation/scoring.ts`, `mobile/src/domain/index.ts`, `mobile/src/test/scoring.test.ts`, `mobile/src/test/__snapshots__/scoring.test.ts.snap`, `docs/plans/TASK-012.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npm test -- --runInBand src/test/scoring.test.ts -u` — passed and wrote/updated the scoring snapshot.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 6 test suites, 24 tests, and 1 snapshot.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Reviewed the fixture snapshot and scorer implementation for complete score breakdowns, deterministic ordering, reason codes, warnings, and confidence.
- Remaining limitations: Scoring heuristics are intentionally early and local. Real provider travel, richer weather windows, family history, and tuning are deferred to later tasks.
- Acceptance criteria status: Complete. Transparent component scores, reason codes, warnings, confidence, deterministic tie-breaking, and fixture snapshot coverage are implemented.
