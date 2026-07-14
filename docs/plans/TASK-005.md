# TASK-005 Execution Plan — Establish Physical-Device Expo Go Path

## Objective

Verify the current Expo app runs on at least one physical iOS or Android device using Expo Go, and document the lowest-friction Windows development workflow before adding native development-build complexity.

## In scope

- Start the project with `npx expo start`.
- Open the app on a physical iOS or Android device by scanning the Expo Go QR code.
- Verify that the initial screen loads.
- Verify Fast Refresh by changing visible text and observing the update on the device.
- Document whether LAN or Tunnel mode was used.
- Record the test device and operating system in `PROJECT_STATE.md`.
- If the scaffolded SDK is newer than the App Store Expo Go build available on a physical iOS device, align the project to the newest stable SDK supported by that device path.

## Out of scope

- Installing `expo-dev-client`.
- Adding EAS configuration.
- Apple Developer account setup.
- iOS device registration.
- Android APK generation.
- App feature implementation.
- Adopting a canary or prerelease SDK path that requires non-beginner tooling.

## Files expected to change

- `mobile/package.json` and `mobile/package-lock.json` only if an Expo Go compatibility downgrade is required.
- A minimal visible-text file only if needed for Fast Refresh verification, then restore or keep the smallest harmless text change if appropriate.
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-005.md`

## Existing behavior inspected

- TASK-005 previously required an EAS development build on a real device.
- The user clarified the preferred beginner workflow is Expo Go QR scanning from Windows.
- `PROJECT_STATE.md` currently says no iOS or Android physical-device path is configured.
- EAS development-build work is now deferred to TASK-027B.
- The scaffolded app currently uses Expo SDK 57, but the user's fully updated iPhone Expo Go app reports that SDK 57 requires a newer Expo Go version.
- Expo's SDK 57 changelog says the iOS App Store Expo Go release for SDK 57 is still waiting on approval, while the App Store page currently lists Expo Go 54.0.2.

## Implementation steps

1. If needed, downgrade the Expo project from SDK 57 to the newest SDK supported by the App Store Expo Go version available on the physical iPhone.
2. Run Expo's dependency alignment command and `expo-doctor`.
3. Run `npx expo start` from `mobile/`.
4. Choose LAN first if the phone and Windows machine are on the same network; use Tunnel if LAN cannot connect.
5. Have the user scan the QR code in Expo Go on a physical iOS or Android device.
6. Confirm the initial screen loads.
7. Change visible starter text temporarily and confirm Fast Refresh updates the device.
8. Stop the dev server.
9. Run local quality checks.
10. Update `PROJECT_STATE.md` with device model, OS, LAN/Tunnel mode, verification result, and next task.
11. Mark TASK-005 complete only after physical-device evidence is recorded.

## Test plan

### Automated

- Command: `cd mobile; npm run format:check`
- Expected result: Passes.

- Command: `cd mobile; npx expo-doctor`
- Expected result: Passes.

- Command: `cd mobile; npm run lint`
- Expected result: Passes.

- Command: `cd mobile; npm run typecheck`
- Expected result: Passes.

- Command: `cd mobile; npm test -- --runInBand`
- Expected result: Passes.

### Manual

- Device/environment: Physical iOS or Android device with Expo Go installed.
- Steps: Start Expo, scan QR code, confirm initial screen loads, edit visible text, confirm Fast Refresh, record LAN/Tunnel mode.
- Expected result: App loads and Fast Refresh works on the physical device.

## Risks and rollback

- Risk: LAN mode may fail because of network isolation, firewall, VPN, or different Wi-Fi networks.
- Mitigation: Retry with Tunnel mode and document which mode works.
- Rollback: Stop the dev server and revert any temporary visible-text edit.

## Security/privacy review

- New data collected: Device model, mobile OS version, and LAN/Tunnel mode for developer environment documentation.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

Fill after implementation:

- Files changed: `docs/plans/TASK-005.md`, `TASKS.md`, `PROJECT_STATE.md`, `mobile/package.json`, `mobile/package-lock.json`, and minimal SDK 54 compatibility edits in the generated starter.
- Commands run and results: `npm install expo@~54.0.0` succeeded; `npx expo install --fix` identified SDK 54 target versions but npm failed while the existing SDK 57 dependency tree was still present; after removing generated `mobile/node_modules` and `mobile/package-lock.json`, `npm install` succeeded; `npx expo-doctor` passed 18/18 checks; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed.
- Manual test result: `npx expo start --clear` ran in LAN mode; iPhone 16 Pro on iOS 26.5 opened the app through Expo Go QR code; initial screen loaded; Fast Refresh was verified by temporarily changing visible text from `get started` to `fast refresh check`, then restoring the text.
- Remaining limitations: SDK 57 was not usable with the App Store Expo Go available on the physical iPhone, so the beginner Expo Go path is pinned to SDK 54 for now. EAS development builds remain deferred to TASK-027B.
- Acceptance criteria status: Complete.
