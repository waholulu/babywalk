# TASK-011 Execution Plan — Implement Hard Filters

## Objective

Add a pure, deterministic hard-filtering layer for local recommendation candidates. It will exclude clearly incompatible places before scoring and preserve unknown values as non-excluding data.

## In scope

- Age range filtering with inclusive boundaries.
- Schedule-window filtering.
- Travel-time filtering.
- Budget filtering.
- Indoor/outdoor preference filtering.
- Blocked-place filtering.
- Return-time filtering against the available window and nap window.
- Unit tests for boundaries and unknown values.

## Out of scope

- Scoring, ranking, reason-code generation, and diversity selection.
- UI wiring.
- Location APIs, routing providers, weather logic, or network calls.
- Changing mock fixture data unless needed for tests.

## Files expected to change

- `mobile/src/domain/recommendation/hard-filters.ts`
- `mobile/src/domain/index.ts`
- `mobile/src/test/hard-filters.test.ts`
- `PROJECT_STATE.md`
- `TASKS.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `PROJECT_STATE.md` shows TASK-010 complete and TASK-011 next.
- `TASKS.md` acceptance requires pure age, schedule, travel, budget, indoor/outdoor, blocked-place, and return-time filters with unit tests for boundaries and unknown values.
- `mobile/src/domain/family/types.ts` defines `FamilyConstraints`, including age, schedule, max travel, budget, indoor/outdoor preference, and blocked IDs.
- `mobile/src/domain/place/types.ts` defines `PlaceCandidate`, including age range, typical visit minutes, price, indoor/outdoor mode, schedule windows, and unknown-capable fields.
- `mobile/src/domain/recommendation/types.ts` currently contains scoring/result vocabulary only.

## Implementation steps

1. Add hard-filter types and a pure `applyHardFilters` function under the recommendation domain.
2. Keep unknown and missing values non-excluding unless another known value proves incompatibility.
3. Add focused Jest tests for each filter and edge boundary.
4. Export the new function/types from the domain barrel.
5. Run all available mobile checks.
6. Update project state, mark TASK-011 complete only after verification, review diff, commit, push, and verify CI.

## Test plan

### Automated

- Command: `npm run format:check`
- Expected result: Passes.
- Command: `npm run lint`
- Expected result: Passes.
- Command: `npm run typecheck`
- Expected result: Passes.
- Command: `npm test -- --runInBand`
- Expected result: Passes with hard-filter tests.
- Command: `npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Not required for this pure domain task.
- Steps: Review test cases and final diff.
- Expected result: Filters are deterministic, dependency-free, and do not collect or log user data.

## Risks and rollback

- Risk: Schedule/return-time semantics could become too rigid for future day planning.
- Mitigation: Keep the implementation small, documented by tests, and independent of UI.
- Rollback: Revert the TASK-011 commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/domain/recommendation/hard-filters.ts`, `mobile/src/domain/index.ts`, `mobile/src/test/hard-filters.test.ts`, `docs/plans/TASK-011.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 5 test suites and 22 tests.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Reviewed the hard-filter implementation and tests; no device test required for this pure domain task.
- Remaining limitations: Schedule and return-time rules are intentionally simple and single-stop; multi-stop day planning belongs to TASK-031.
- Acceptance criteria status: Complete. Pure age, schedule, travel, budget, indoor/outdoor, blocked-place, and return-time filters are implemented with boundary and unknown-value unit tests.
