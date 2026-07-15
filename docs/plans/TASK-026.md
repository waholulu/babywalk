# TASK-026 Execution Plan — Implement Location Permission and Fallback

## Objective

Let a parent choose between using current location and entering a manual city/neighborhood/ZIP-area fallback, with clear handling for denied, restricted, or unavailable GPS.

## In scope

- Install Expo's supported location module for foreground permission and current-position requests.
- Add a small location permission service boundary so UI code does not call native APIs directly.
- Add pure copy/state helpers for denied, restricted, unavailable, granted, and manual fallback states.
- Update the home plan form to request current location only after the user taps a button.
- Preserve manual area entry as the fallback and avoid storing or displaying precise coordinates.
- Add tests for state/copy behavior and area-label normalization.

## Out of scope

- Background location.
- Reverse geocoding or provider-backed address lookup.
- Persisting a precise home address or exact coordinates.
- Maps, routing, travel-time provider integration, or recommendation pipeline changes.
- Native development builds; `expo-location` is supported by Expo Go.

## Files expected to change

- `mobile/package.json`
- `mobile/package-lock.json`
- `mobile/app.json`
- `mobile/src/features/location/location-service.ts`
- `mobile/src/features/location/location-service.expo.ts`
- `mobile/src/features/location/location-state.ts`
- `mobile/src/features/plan-input/plan-input-form.tsx`
- `mobile/src/test/location-state.test.ts`
- `docs/plans/TASK-026.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `TASKS.md` says TASK-026 must request permission only when needed and support manual city/ZIP-area entry.
- `PRODUCT_SPEC.md` requires current location or saved/manual area, and explicitly says not to request precise home address.
- `ARCHITECTURE.md` says current coordinates should be obtained only after user action, manual city/ZIP-area fallback must work, and stored location should be coarse.
- `mobile/src/features/plan-input/plan-input-form.tsx` already has an Area text input but no permission request.
- `mobile/src/features/plan-input/plan-input-validation.ts` already validates manual area text.
- `mobile/package.json` does not yet include `expo-location`.

## Implementation steps

1. Install `expo-location` with Expo's version-aware installer.
2. Add a location service interface and Expo implementation for foreground permission/current-position requests.
3. Add pure helpers for user-visible location status copy and coarse area labels.
4. Wire the plan input form to request location only from a button, update the area field to a coarse "near current location" label, and keep manual entry editable.
5. Add tests for denied/restricted/unavailable/manual fallback behavior.
6. Run all available checks and update state after verification.

## Test plan

### Automated

- Command: `npm run format:check`
- Expected result: Passes.
- Command: `npm run lint`
- Expected result: Passes.
- Command: `npm run typecheck`
- Expected result: Passes.
- Command: `npm test -- --runInBand`
- Expected result: Passes.
- Command: `npx expo-doctor`
- Expected result: Passes.
- Command: `git diff --check`
- Expected result: Passes.

### Manual

- Device/environment: Expo web smoke plus physical-device note.
- Steps: Start the app locally and verify the home screen still loads. On a physical iOS/Android device, tap "Use current location" and verify granted/denied flows when available.
- Expected result: Manual area remains usable when permission is denied, restricted, unavailable, or not yet requested.

## Risks and rollback

- Risk: Native permission copy can be confusing or overstate precision.
- Mitigation: Use explicit copy saying the current MVP stores only a coarse planning area label and keeps manual entry available.
- Risk: `expo-location` changes Expo Doctor expectations.
- Mitigation: Use `npx expo install expo-location` and run Expo Doctor.
- Rollback: Revert the TASK-026 commit and uninstall `expo-location`.

## Security/privacy review

- New data collected: Optional foreground current coordinates during the user-initiated request only.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: No coordinates or raw location responses are logged.

## Completion evidence

- Files changed: `mobile/package.json`, `mobile/package-lock.json`, `mobile/app.json`, `mobile/src/features/location/location-service.ts`, `mobile/src/features/location/location-service.expo.ts`, `mobile/src/features/location/location-state.ts`, `mobile/src/features/location/index.ts`, `mobile/src/features/plan-input/plan-input-form.tsx`, `mobile/src/test/location-state.test.ts`, `TASKS.md`, `PROJECT_STATE.md`, `docs/plans/TASK-026.md`.
- Commands run and results:
  - `npx expo install expo-location` — passed; npm still reports 15 moderate audit findings.
  - `npm test -- --runInBand src/test/location-state.test.ts src/test/plan-input.test.ts` — passed, 2 suites and 8 tests.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 17 suites and 70 tests.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Started Expo web with local fixture env; `/` returned HTTP 200 (`task026_home_http=200`).
- Remaining limitations: Physical-device permission grant/deny behavior still needs a quick Expo Go tap test on iOS/Android. No reverse geocoding, maps, routing, provider-backed travel time, or saved area persistence was added.
- Acceptance criteria status: Complete for implementation and automated fallback behavior; manual native permission dialog smoke remains recommended.
