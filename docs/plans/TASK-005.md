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

## Out of scope

- Installing `expo-dev-client`.
- Adding EAS configuration.
- Apple Developer account setup.
- iOS device registration.
- Android APK generation.
- App feature implementation.

## Files expected to change

- A minimal visible-text file only if needed for Fast Refresh verification, then restore or keep the smallest harmless text change if appropriate.
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-005.md`

## Existing behavior inspected

- TASK-005 previously required an EAS development build on a real device.
- The user clarified the preferred beginner workflow is Expo Go QR scanning from Windows.
- `PROJECT_STATE.md` currently says no iOS or Android physical-device path is configured.
- EAS development-build work is now deferred to TASK-027B.

## Implementation steps

1. Run `npx expo start` from `mobile/`.
2. Choose LAN first if the phone and Windows machine are on the same network; use Tunnel if LAN cannot connect.
3. Have the user scan the QR code in Expo Go on a physical iOS or Android device.
4. Confirm the initial screen loads.
5. Change visible starter text temporarily and confirm Fast Refresh updates the device.
6. Stop the dev server.
7. Run local quality checks.
8. Update `PROJECT_STATE.md` with device model, OS, LAN/Tunnel mode, verification result, and next task.
9. Mark TASK-005 complete only after physical-device evidence is recorded.

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

- Files changed:
- Commands run and results:
- Manual test result:
- Remaining limitations:
- Acceptance criteria status:
