# TASK-006 Execution Plan — Create Route Skeleton

## Objective

Create the first SproutScout route skeleton so the app has reachable placeholder screens for onboarding, home, results, place detail, day plan, saved, and settings.

## In scope

- Replace the generated Expo starter home/explore content with beginner-friendly SproutScout placeholder routes.
- Keep route files thin by delegating shared placeholder layout to a feature component.
- Add links from the home screen to every required route, including sample dynamic place and plan routes.
- Keep the implementation deterministic and dependency-free.

## Out of scope

- Building real onboarding inputs.
- Implementing recommendation logic, place data, day-plan logic, persistence, auth, maps, or Supabase.
- Creating the polished theme/UI primitive system planned for TASK-007.
- Adding native configuration or new production dependencies.

## Files expected to change

- `mobile/src/app/_layout.tsx`
- `mobile/src/app/index.tsx`
- `mobile/src/app/onboarding.tsx`
- `mobile/src/app/results.tsx`
- `mobile/src/app/places/[id].tsx`
- `mobile/src/app/plan/[id].tsx`
- `mobile/src/app/saved.tsx`
- `mobile/src/app/settings.tsx`
- `mobile/src/features/navigation/placeholder-screen.tsx`
- Generated starter tab/explore files may be removed or simplified if no longer used.
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-006.md`

## Existing behavior inspected

- `mobile/src/app` currently contains only `_layout.tsx`, `index.tsx`, and `explore.tsx`.
- `_layout.tsx` renders a generated tab navigator through `AppTabs`.
- `mobile/src/components/app-tabs.tsx` defines starter Home and Explore tabs.
- `PROJECT_STATE.md` says the next task is TASK-006.
- `TASKS.md` acceptance requires onboarding, home, results, place detail, day plan, saved, and settings routes to be reachable without console errors.

## Implementation steps

1. Switch the root layout to a simple Expo Router `Slot`.
2. Add a reusable placeholder screen component for route title, short status text, and navigation links.
3. Replace the generated home screen with a SproutScout home placeholder that links to all required route skeletons.
4. Add thin route files for onboarding, results, place detail, day plan, saved, and settings.
5. Remove generated starter routes/components that are no longer part of the route skeleton.
6. Run local checks and a route smoke check through Expo/web if practical.
7. Update `PROJECT_STATE.md`, mark TASK-006 complete in `TASKS.md`, review the diff, commit, push, and verify CI.

## Test plan

### Automated

- Command: `cd mobile; npm run format:check`
- Expected result: Passes.

- Command: `cd mobile; npm run lint`
- Expected result: Passes.

- Command: `cd mobile; npm run typecheck`
- Expected result: Passes.

- Command: `cd mobile; npm test -- --runInBand`
- Expected result: Passes.

### Manual

- Device/environment: Local Expo web or Expo Go.
- Steps: Start the app and navigate from Home to onboarding, results, sample place detail, sample day plan, saved, and settings.
- Expected result: Every route renders placeholder content without console errors.

## Risks and rollback

- Risk: Dynamic routes may be unreachable if links point to the wrong path.
- Mitigation: Use static sample links `/places/demo-place` and `/plan/demo-plan`, then verify via local launch.
- Rollback: Revert the route skeleton commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

Fill after implementation:

- Files changed: `mobile/src/app/_layout.tsx`, `mobile/src/app/index.tsx`, `mobile/src/app/onboarding.tsx`, `mobile/src/app/results.tsx`, `mobile/src/app/places/[id].tsx`, `mobile/src/app/plan/[id].tsx`, `mobile/src/app/saved.tsx`, `mobile/src/app/settings.tsx`, `mobile/src/features/navigation/placeholder-screen.tsx`, `PROJECT_STATE.md`, `TASKS.md`, and this plan. Removed the generated starter `explore` route and tab navigator files.
- Commands run and results: `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed after refreshing Expo Router generated route types; `npm test -- --runInBand` passed; `npx expo-doctor` passed 18/18 checks.
- Manual test result: Started Expo web on port 8083 and verified HTTP 200 for `/`, `/onboarding`, `/results`, `/places/demo-place`, `/plan/demo-plan`, `/saved`, and `/settings`.
- Remaining limitations: Screens are placeholders only. No onboarding form, recommendation logic, saved-data persistence, place facts, or day-plan behavior was implemented.
- Acceptance criteria status: Complete.
