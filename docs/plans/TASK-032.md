# TASK-032 Execution Plan — Build Day-Plan UI

## Objective

Replace the day-plan placeholder with a mobile-first screen that renders a deterministic one- or two-stop plan, including timeline, assumptions, backup, and verification warnings. The user can return to results and modify constraints from the screen.

## In scope

- Add a small plans feature under `mobile/src/features/plans`.
- Build a display model from existing local recommendations and the pure schedule planner.
- Render timeline, assumptions, backup idea, verification warnings, and navigation actions.
- Add focused unit tests for the day-plan display model.

## Out of scope

- Persisted plans.
- Live form-to-plan state.
- Supabase day-plan orchestration.
- Personalization from history.
- Native build or EAS changes.

## Files expected to change

- `mobile/src/app/plan/[id].tsx`
- `mobile/src/features/plans/day-plan.ts`
- `mobile/src/features/plans/day-plan-screen.tsx`
- `mobile/src/features/plans/index.ts`
- `mobile/src/test/day-plan.test.ts`
- `docs/plans/TASK-032.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `mobile/src/app/plan/[id].tsx` is currently a placeholder route.
- `mobile/src/features/recommendations/local-recommendations.ts` already builds deterministic local recommendation cards and exposes default constraints/travel estimates.
- `mobile/src/domain/scheduling/planner.ts` already builds one- or two-stop plans with leave, arrive, activity, depart, and return timestamps.
- `mobile/src/features/recommendations/recommendation-results-screen.tsx` shows existing mobile UI patterns for cards, facts, warnings, and navigation.

## Implementation steps

1. Create a pure day-plan display model that builds from `buildLocalRecommendations`, `buildSchedulePlan`, and existing candidate data.
2. Add a mobile-first day-plan screen that renders the model with timeline rows, assumptions, backup, warnings, and actions.
3. Replace the placeholder route with the new feature screen.
4. Add unit tests for planned and missing-plan model behavior.
5. Run checks, review the diff, then update task/state docs.

## Test plan

### Automated

- Command: `cd mobile; npm test -- --runInBand src/test/day-plan.test.ts`
- Expected result: New day-plan model tests pass.
- Command: `cd mobile; npm run format:check`
- Expected result: Prettier check passes.
- Command: `cd mobile; npm run lint`
- Expected result: ESLint passes.
- Command: `cd mobile; npm run typecheck`
- Expected result: TypeScript passes.
- Command: `cd mobile; npm test -- --runInBand`
- Expected result: Full Jest suite passes.
- Command: `cd mobile; npx expo-doctor`
- Expected result: Expo Doctor passes.

### Manual

- Device/environment: Expo web smoke with local fixture env.
- Steps: Start Expo web and request `/plan/local-morning`.
- Expected result: Route returns HTTP 200.

## Risks and rollback

- Risk: The static local model may imply timing guarantees.
- Mitigation: Show assumptions and verification warnings explicitly.
- Rollback: Revert the route and plans feature files for this task.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/app/plan/[id].tsx`, `mobile/src/features/plans/day-plan.ts`, `mobile/src/features/plans/day-plan-screen.tsx`, `mobile/src/features/plans/index.ts`, `mobile/src/test/day-plan.test.ts`, `TASKS.md`, `PROJECT_STATE.md`, `docs/plans/TASK-032.md`.
- Commands run and results: `npm test -- --runInBand src/test/day-plan.test.ts` passed; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed with 23 suites and 94 tests; `npx expo-doctor` passed 18/18 checks.
- Manual test result: Expo web started with local fixture env and `/plan/local-morning` returned HTTP 200 on port 65318.
- Remaining limitations: The day plan uses the fixed local recommendation scenario and deterministic fixture travel estimates. Live constraints, persistence, provider-backed route timing, and personalization are deferred.
- Acceptance criteria status: Met. The screen renders timeline, assumptions, backup, verification warnings, and links back to results and constraint editing.
