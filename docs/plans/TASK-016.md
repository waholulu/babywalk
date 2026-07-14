# TASK-016 Execution Plan — Build Place Detail Screen

## Objective

Replace the place-detail placeholder with a structured local fixture detail screen that shows sourced facts, freshness, and verify-before-leaving notes without presenting unknown data as confident facts.

## In scope

- Lookup place fixtures by route ID.
- Render category, coarse area, age fit, visit duration, price band, indoor/outdoor mode, schedule windows, amenities, source, and freshness.
- Render unknown values as unknown/verify notes, not as affirmative claims.
- Render placeholder actions for save, visited, block, and report incorrect data.
- Render a bounded not-found state for unknown route IDs.
- Add unit tests for detail model formatting, especially unknown values.

## Out of scope

- Real provider detail data.
- Official website/call links, because fixtures do not contain those URLs.
- Save/visited/block/report persistence.
- Map rendering.
- Navigation from results beyond existing links.

## Files expected to change

- `mobile/src/features/places/place-detail.ts`
- `mobile/src/features/places/place-detail-screen.tsx`
- `mobile/src/features/places/index.ts`
- `mobile/src/app/places/[id].tsx`
- `mobile/src/test/place-detail.test.ts`
- `docs/plans/TASK-016.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` requires a place detail screen and acceptance that unknown data is not displayed as a confident fact.
- `PROJECT_STATE.md` shows TASK-015 complete and TASK-016 next.
- `PRODUCT_SPEC.md` requires structured facts, source attribution, verify-before-leaving notes, and no unsupported safety/crowd/cleanliness/open claims.
- `mobile/src/app/places/[id].tsx` currently renders a placeholder.
- `mobile/src/data/fixtures/place-candidates.ts` provides structured local fixture data with several unknown fields.

## Implementation steps

1. Add a pure detail model builder for fixture candidates.
2. Format known values and collect verify notes for unknown schedule, price, age fit, amenities, freshness, and missing official contact data.
3. Add a detail screen component that renders structured sections and placeholder action buttons.
4. Replace the place detail route placeholder.
5. Add unit tests proving unknown values become verify notes/unknown labels.
6. Run all available mobile checks and a web route check.
7. Update project state, mark TASK-016 complete only after verification, review diff, commit, push, and verify CI.

## Test plan

### Automated

- Command: `npm run format:check`
- Expected result: Passes.
- Command: `npm run lint`
- Expected result: Passes.
- Command: `npm run typecheck`
- Expected result: Passes.
- Command: `npm test -- --runInBand`
- Expected result: Passes with place detail tests.
- Command: `npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Expo web local route check.
- Steps: Start Expo web and verify `/places/hoboken-story-room-fixture` and an unknown place route return HTTP 200.
- Expected result: Both routes render without server errors.

## Risks and rollback

- Risk: Fixture-only detail can look more complete than the data really is.
- Mitigation: Prominent verify notes and unknown labels; no unsupported claims.
- Rollback: Revert the TASK-016 commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/features/places/place-detail.ts`, `mobile/src/features/places/place-detail-screen.tsx`, `mobile/src/features/places/index.ts`, `mobile/src/app/places/[id].tsx`, `mobile/src/test/place-detail.test.ts`, `docs/plans/TASK-016.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npm test -- --runInBand src/test/place-detail.test.ts` — passed, 3 tests.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 10 test suites, 36 tests, and 2 snapshots.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Started Expo web on port 8086 with `EXPO_PUBLIC_APP_ENV=local`; `/places/hoboken-story-room-fixture` and `/places/missing-place` both returned HTTP 200. The server was stopped afterward.
- Remaining limitations: Detail data is fixture-only. Official website/call links, maps, save/visited/block/report persistence, and real provider details remain later tasks.
- Acceptance criteria status: Complete. Unknown values render as unknown facts and verify notes, not confident facts.
