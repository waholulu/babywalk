# TASK-036 Execution Plan — Add Critical E2E Smoke Tests

## Objective

Add a small critical-flow smoke-test path that covers first launch, recommendations, place detail, and location-denied fallback on the currently available iPhone 16 Pro + Expo Go manual target, without adding native build complexity before Expo Go stops being sufficient.

## In scope

- Inspect current test/device automation options.
- Prefer the lowest-friction beginner path already available on Windows.
- Add executable smoke coverage where the current workspace can run it.
- Document the iPhone 16 Pro + Expo Go physical-device manual E2E target.

## Out of scope

- EAS development builds.
- Paid device farms.
- Native release builds.
- Installing a third-party mobile automation stack without a confirmed device/emulator target.

## Files expected to change

- `docs/testing/CRITICAL_E2E_SMOKE.md`
- `docs/plans/TASK-036.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- TASK-005 verified iPhone 16 Pro on iOS 26.5 through Expo Go in LAN mode.
- `PROJECT_STATE.md` says Android emulator/adb is not configured.
- `ARCHITECTURE.md` names Maestro as the intended E2E tool after the MVP flow is stable.
- The current repo has Jest smoke tests only; no Maestro, Detox, Appium, or Playwright project exists.
- CI currently runs mobile format, lint, typecheck, and Jest only.
- The user accepted the current iPhone 16 Pro + Expo Go path as enough for TASK-036.

## Implementation steps

1. Record the current physical-device target and the unavailable automation target checks.
2. Add a manual smoke checklist for first launch, recommendations, place detail, and location-denied fallback.
3. Run existing automated checks and route smoke coverage that can run from the workspace.
4. Document that automated mobile E2E remains deferred until Android emulator/adb or another runnable target exists.

## Test plan

### Automated

- Command: `cd mobile; npm test -- --runInBand src/test/location-state.test.ts src/test/recommendation-results.test.ts src/test/place-detail.test.ts`
- Expected result: Existing unit coverage for location fallback copy, recommendations, and place detail models passes.
- Command: Expo web route smoke for `/`, `/results`, and `/places/hoboken-story-room-fixture`.
- Expected result: All routes return HTTP 200.

### Manual

- Device/environment: iPhone 16 Pro, iOS 26.5, Expo Go LAN mode.
- Steps: Follow `docs/testing/CRITICAL_E2E_SMOKE.md`.
- Expected result: All critical flows complete without app crashes.

## Risks and rollback

- Risk: Manual smoke tests can drift or be skipped.
- Mitigation: Keep the target, steps, and expected results explicit; defer automated mobile E2E to the first runnable target.
- Rollback: Remove the checklist and revert TASK-036 task wording.

## Security/privacy review

- New data collected: None expected.
- Secrets involved: None expected.
- RLS/auth impact: None expected.
- Logging impact: None expected.

## Completion evidence

- Files changed: `TASKS.md`, `docs/plans/TASK-036.md`, `docs/testing/CRITICAL_E2E_SMOKE.md`, `PROJECT_STATE.md`.
- Commands run and results: `npm test -- --runInBand src/test/location-state.test.ts src/test/recommendation-results.test.ts src/test/place-detail.test.ts` passed with 3 suites and 7 tests; Expo web smoke with local fixture env passed for `/`, `/results`, and `/places/hoboken-story-room-fixture` on port 54263; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed with 26 suites and 106 tests; `npx expo-doctor` passed 18/18 checks.
- Manual test result: Manual physical-device checklist is documented for iPhone 16 Pro on iOS 26.5 using Expo Go LAN mode. A fresh physical-device run was not performed by Codex because the device is user-controlled.
- Remaining limitations: This is a documented manual smoke path, not automated mobile E2E. Android emulator/adb, Maestro, Detox, and Appium remain unavailable in the current Windows environment.
- Acceptance criteria status: Met after user accepted the current iPhone 16 Pro + Expo Go path as sufficient for TASK-036.
