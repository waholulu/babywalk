# TASK-005 Execution Plan — Configure Development Build

## Objective

Configure an Expo development build path with `expo-dev-client`, EAS configuration, application identifiers/placeholders, and written build steps, then verify the development build on at least one real device.

## In scope

- Add `expo-dev-client`.
- Add EAS configuration.
- Add placeholder bundle/application identifiers appropriate for development builds.
- Document build and install steps.
- Verify on a real iOS or Android device before marking complete.

## Out of scope

- App Store or Play Store submission.
- Production EAS profiles.
- Native feature implementation.
- Proceeding without a real device verification path.

## Files expected to change

- `mobile/package.json`
- `mobile/package-lock.json`
- `mobile/app.json`
- `mobile/eas.json`
- Development-build documentation file, if needed.
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-005.md`

## Existing behavior inspected

- Read `PROJECT_STATE.md` and selected `TASK-005` in `TASKS.md`.
- Confirmed TASK-005 acceptance requires: "A development build runs on at least one real device."
- Checked for local `eas`; command is not installed.
- Checked for local `adb`; command is not installed.
- Current `PROJECT_STATE.md` says iOS test path and Android test path are not configured, and Expo account/EAS setup is not verified.

## Implementation steps

1. Block until a real-device test path is available and EAS account/CLI setup is confirmed.
2. Install `expo-dev-client` with the Expo-compatible installer.
3. Add `eas.json` and development identifiers/placeholders.
4. Document exact local/EAS commands for the selected platform.
5. Build, install, and launch the development build on the selected real device.
6. Run local quality checks and update project state only after verification.

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

- Device/environment: At least one real iOS or Android device.
- Steps: Build and install the development build, launch it, and confirm the app opens.
- Expected result: Development build runs on the real device.

## Risks and rollback

- Risk: Adding native/development-build configuration without a device can leave unverified native state.
- Mitigation: Stop before implementation until the device and EAS path are available.
- Rollback: Remove dev-client/EAS config changes if verification fails.

## Security/privacy review

- New data collected: None yet.
- Secrets involved: None yet; EAS credentials must not be committed.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `docs/plans/TASK-005.md`.
- Commands run and results: `Get-Command eas` returned no command; `Get-Command adb` returned no command.
- Manual test result: Blocked; no real device or emulator path is configured, and no EAS CLI/account setup is verified.
- Remaining limitations: Cannot satisfy TASK-005 acceptance until a real-device development-build path exists.
- Acceptance criteria status: Blocked, not complete.
