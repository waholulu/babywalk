# TASK-031 Execution Plan — Implement Schedule Planner

## Objective

Add a pure schedule planner that can produce a simple one- or two-stop day plan with travel/activity buffers and an explicit no-plan result when timing cannot work.

## In scope

- Define planner input/output types under `mobile/src/domain/scheduling`.
- Build one- or two-stop plans from ordered candidates and known travel estimates.
- Respect available window, nap/return target, candidate schedule windows, visit duration, travel time, and buffers.
- Return an explicit `no_plan` result with a reason code when no feasible plan exists.
- Add unit tests for no overlaps, return target, scheduled windows, and impossible plans.

## Out of scope

- Day-plan UI.
- Navigation from results into day plan.
- Map/routing provider travel between stops.
- Persisting plans.
- Optimizing across every possible permutation beyond the first deterministic feasible plan.

## Files expected to change

- `mobile/src/domain/scheduling/planner.ts`
- `mobile/src/domain/scheduling/index.ts`
- `mobile/src/domain/index.ts`
- `mobile/src/test/schedule-planner.test.ts`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `FamilyConstraints` already includes available window and optional nap window.
- `PlaceCandidate` already includes `typicalVisitMinutes` and optional `scheduleWindows`.
- Hard filters and scoring already consume `CandidateTravelEstimate[]`.
- No scheduling domain module exists yet.

## Implementation steps

1. Add scheduling planner types and a deterministic planner function.
2. Use known candidate travel estimates; skip unknown travel or missing visit duration for concrete plans.
3. Respect schedule windows by delaying activity start when needed and rejecting overlapping/impossible stops.
4. Add focused Jest coverage.
5. Run checks and update task/project docs after verification.

## Test plan

### Automated

- Command: `npm test -- --runInBand src/test/schedule-planner.test.ts`
- Expected result: Planner tests pass.
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

- Device/environment: Not required.
- Steps: Review diff and test output.
- Expected result: Planner is pure domain logic with no runtime/device behavior.

## Risks and rollback

- Risk: A simple deterministic planner may be mistaken for a route optimizer.
- Mitigation: Keep names and output explicit: estimated travel, buffers, and no guarantee of real-world timing.
- Rollback: Remove the scheduling module and tests.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/domain/scheduling/planner.ts`, `mobile/src/domain/scheduling/index.ts`, `mobile/src/domain/index.ts`, `mobile/src/test/schedule-planner.test.ts`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results: `npm test -- --runInBand src/test/schedule-planner.test.ts` passed with 1 suite and 5 tests; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed with 22 suites and 93 tests; `npx expo-doctor` passed 18/18 checks.
- Manual test result: Reviewed the diff and test output. No device or Edge Function manual test was required because this is pure domain logic.
- Remaining limitations: Not wired into UI yet; uses known candidate travel estimates and a conservative between-stop approximation rather than route-provider travel.
- Acceptance criteria status: Met. Tests cover no overlaps, one/two-stop planning, schedule windows, nap return targets, and explicit no-plan results.
