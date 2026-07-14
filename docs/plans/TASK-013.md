# TASK-013 Execution Plan — Implement Diversity Selection

## Objective

Add a pure diversity-selection step that keeps the final recommendation set from being near-duplicates when comparable alternatives exist.

## In scope

- Select a small result set from already-scored recommendations.
- Prefer category diversity when a comparable alternative exists.
- Prefer location/area diversity when a comparable alternative exists.
- Preserve score order when no comparable diverse alternative exists.
- Add unit tests for category and location diversity rules.

## Out of scope

- Changing hard filters or scoring.
- UI integration.
- Distance clustering or map-based proximity.
- Personalization/history beyond scored inputs.
- Multi-stop day planning.

## Files expected to change

- `mobile/src/domain/recommendation/diversity.ts`
- `mobile/src/domain/index.ts`
- `mobile/src/test/diversity.test.ts`
- `docs/plans/TASK-013.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` requires preventing the top three from being near-duplicates when comparable alternatives exist.
- `PROJECT_STATE.md` shows TASK-012 complete and TASK-013 next.
- `PRODUCT_SPEC.md` promises a small number of useful options, not a long duplicate list.
- `ARCHITECTURE.md` places the pipeline order as hard filters, scoring, diversity, then top-three selection.
- `mobile/src/domain/recommendation/scoring.ts` returns sorted `RecommendationResult` objects but does not diversify them.

## Implementation steps

1. Add a pure `selectDiverseRecommendations` function that accepts scored results and candidate metadata.
2. Use a small score-gap threshold so diversity only reorders comparable recommendations.
3. Prefer unused categories, then unused areas, while keeping deterministic tie-breaking from the scored order.
4. Export the function from the domain barrel.
5. Add unit tests for category diversity, location diversity, and non-comparable score preservation.
6. Run all available mobile checks.
7. Update project state, mark TASK-013 complete only after verification, review diff, commit, push, and verify CI.

## Test plan

### Automated

- Command: `npm run format:check`
- Expected result: Passes.
- Command: `npm run lint`
- Expected result: Passes.
- Command: `npm run typecheck`
- Expected result: Passes.
- Command: `npm test -- --runInBand`
- Expected result: Passes with diversity tests.
- Command: `npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Not required for this pure domain task.
- Steps: Review diversity tests and implementation.
- Expected result: Selection is deterministic and does not discard much stronger recommendations.

## Risks and rollback

- Risk: The first diversity heuristic may need tuning once real data exists.
- Mitigation: Keep the threshold explicit and tests narrow.
- Rollback: Revert the TASK-013 commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/domain/recommendation/diversity.ts`, `mobile/src/domain/index.ts`, `mobile/src/test/diversity.test.ts`, `docs/plans/TASK-013.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npm test -- --runInBand src/test/diversity.test.ts` — passed, 3 tests.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 7 test suites, 27 tests, and 1 snapshot.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Reviewed the selector and tests for category diversity, location diversity, comparable-score threshold behavior, and deterministic ordering.
- Remaining limitations: Diversity uses category and coarse area metadata only. Map-distance clustering and richer similarity rules remain deferred until real data/provider work.
- Acceptance criteria status: Complete. Unit tests verify category and location diversity rules.
