# TASK-036 Execution Plan — Add Critical E2E Smoke Tests

## Objective

Add a small critical-flow smoke-test path that covers first launch, recommendations, place detail, and location-denied fallback on a documented target, without adding native build complexity before Expo Go stops being sufficient.

## In scope

- Inspect current test/device automation options.
- Prefer the lowest-friction beginner path already available on Windows.
- Add executable smoke coverage where the current workspace can run it.
- Document the physical-device/manual E2E target if full device automation is unavailable.

## Out of scope

- EAS development builds.
- Paid device farms.
- Native release builds.
- Installing a third-party mobile automation stack without a confirmed device/emulator target.

## Files expected to change

- To be determined after confirming whether an executable device/emulator target is available.

## Existing behavior inspected

- TASK-005 verified iPhone 16 Pro on iOS 26.5 through Expo Go in LAN mode.
- `PROJECT_STATE.md` says Android emulator/adb is not configured.
- `ARCHITECTURE.md` names Maestro as the intended E2E tool after the MVP flow is stable.
- The current repo has Jest smoke tests only; no Maestro, Detox, Appium, or Playwright project exists.
- CI currently runs mobile format, lint, typecheck, and Jest only.

## Implementation steps

1. Confirm whether an executable local device/emulator target is available.
2. If available, add a minimal E2E smoke command and critical-flow specs for first launch, recommendation, place detail, and location-denied fallback.
3. If unavailable, document the blocker and the smallest next step needed to make TASK-036 runnable.

## Test plan

### Automated

- Command: To be determined.
- Expected result: Critical smoke command runs on the documented target, if available.

### Manual

- Device/environment: iPhone 16 Pro, iOS 26.5, Expo Go LAN mode unless a better target is configured.
- Steps: Verify first launch, recommendation results, place detail, and denied-location fallback.
- Expected result: All critical flows complete without app crashes.

## Risks and rollback

- Risk: Adding an E2E framework without a runnable target creates brittle unused setup.
- Mitigation: Stop before adding framework dependencies if the target is unavailable.
- Rollback: Remove any smoke scripts/specs added for this task.

## Security/privacy review

- New data collected: None expected.
- Secrets involved: None expected.
- RLS/auth impact: None expected.
- Logging impact: None expected.

## Completion evidence

Fill after implementation or blocker confirmation:

- Files changed: `docs/plans/TASK-036.md`, `PROJECT_STATE.md`.
- Commands run and results: Checked local automation commands; `adb`, `emulator`, `maestro`, `detox`, and `appium` were not found. Checked `ANDROID_HOME`, `ANDROID_SDK_ROOT`, and `JAVA_HOME`; none were configured. Checked default Android SDK and Maestro folders; neither was present.
- Manual test result: Not run during this task. The previously verified physical path is iPhone 16 Pro on iOS 26.5 with Expo Go LAN mode, but that path is manual from Windows.
- Remaining limitations: No runnable device/emulator automation target is configured. Windows cannot run an iOS simulator, and the current iPhone Expo Go path cannot be driven by the repo's test tooling.
- Acceptance criteria status: Blocked. TASK-036 requires tests to run on a documented device/emulator target, but no such automation target is available in this environment.
