# TASK-033 Execution Plan — Add Personalization From History

## Objective

Use local family history as bounded recommendation inputs: recent visits reduce novelty, saved places act as the first local liked signal, blocked places remain hard exclusions, and membership or like/dislike preferences can adjust only the family-preference score component.

## In scope

- Add a small personalization model for recommendation history.
- Feed local save/visit/block state into the recommendation builder.
- Extend scoring to support liked and disliked place IDs inside the existing 5-point family-preference component.
- Keep blocked places in hard filters so personalization cannot override incompatibilities.
- Add focused unit tests for bounded personalization behavior and local history wiring.

## Out of scope

- New like/dislike UI.
- Supabase-backed history repositories.
- Personalized onboarding or preference editing.
- Analytics.
- External provider changes.

## Files expected to change

- `mobile/src/domain/recommendation/scoring.ts`
- `mobile/src/features/recommendations/personalization.ts`
- `mobile/src/features/recommendations/local-recommendations.ts`
- `mobile/src/features/recommendations/recommendation-results-screen.tsx`
- `mobile/src/features/recommendations/index.ts`
- `mobile/src/test/scoring.test.ts`
- `mobile/src/test/recommendation-personalization.test.ts`
- `docs/plans/TASK-033.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `scoreRecommendations` already accepts visited and membership place IDs, but not liked/disliked IDs.
- `applyHardFilters` already excludes `constraints.blockedPlaceIds`, so blocked places can stay outside scoring.
- `createLocalPlaceActionsRepository` stores saved, visited, and blocked place IDs locally.
- `buildRepositoryRecommendations` currently scores without reading local place-action history.

## Implementation steps

1. Define a small recommendation personalization type and mapper from local place action state.
2. Thread personalization into hard filtering and scoring in the local recommendation builder.
3. Extend family-preference scoring with liked/disliked IDs while keeping the component capped at 5 points.
4. Update the results screen to load local place-action history before building recommendations.
5. Add tests for visited, liked, blocked, membership, dislike, and hard-filter precedence.
6. Run checks, review the diff, then update task/state docs.

## Test plan

### Automated

- Command: `cd mobile; npm test -- --runInBand src/test/recommendation-personalization.test.ts src/test/scoring.test.ts src/test/recommendation-results.test.ts`
- Expected result: Personalization and affected recommendation tests pass.
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
- Steps: Start Expo web and request `/results`.
- Expected result: Route returns HTTP 200.

## Risks and rollback

- Risk: Personalization could hide too many options or override safety filters.
- Mitigation: Keep blocks in hard filters and cap like/dislike/membership effects inside the 5-point family-preference component.
- Rollback: Revert the personalization model, scoring changes, and results-screen wiring for this task.

## Security/privacy review

- New data collected: None. Existing local saved/visited/blocked IDs are reused on device.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/domain/recommendation/scoring.ts`, `mobile/src/features/recommendations/personalization.ts`, `mobile/src/features/recommendations/local-recommendations.ts`, `mobile/src/features/recommendations/recommendation-results-screen.tsx`, `mobile/src/features/recommendations/index.ts`, `mobile/src/test/recommendation-personalization.test.ts`, `TASKS.md`, `PROJECT_STATE.md`, `docs/plans/TASK-033.md`.
- Commands run and results: `npm test -- --runInBand src/test/recommendation-personalization.test.ts src/test/scoring.test.ts src/test/recommendation-results.test.ts` passed; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed with 24 suites and 98 tests; `npx expo-doctor` passed 18/18 checks; a final `npm run typecheck` after Expo web passed.
- Manual test result: Expo web started with local fixture env and `/results` returned HTTP 200 on port 57216.
- Remaining limitations: No separate like/dislike UI or Supabase-backed history repository yet. Saved places are treated as the first local liked signal.
- Acceptance criteria status: Met. Visits, likes, blocks, and membership preferences are bounded inputs, and blocked personalization remains a hard-filter exclusion.
