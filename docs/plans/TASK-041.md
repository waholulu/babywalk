# TASK-041 Execution Plan — Expo Go Staging QA Pass

## Objective

Verify the core app flows on the user's iPhone 16 Pro with Expo Go connected to hosted Supabase staging.

## In scope

- Start the Expo app in staging mode with hosted Supabase.
- Verify first launch and visible staging banner.
- Verify recommendations load from staging Supabase data.
- Verify place detail, save, mark visited, block, incorrect-data feedback, location-denied fallback, and day-plan flows.
- Record the test device, OS, network mode, commands, results, and limitations.

## Out of scope

- EAS builds, app-store builds, native release channels, or TestFlight.
- Fixing unrelated UI polish unless a blocking QA defect appears.
- Adding production monitoring or support/privacy docs.

## Files expected to change

- `docs/plans/TASK-041.md`
- `docs/testing/EXPO_GO_STAGING_QA.md`
- `PROJECT_STATE.md`
- `TASKS.md`

## Existing behavior inspected

- TASK-040 imported 69 curated pilot places into hosted staging and proved publishable-key reads.
- `mobile/.env.staging.example` documents the staging project ref and URL but intentionally leaves the client key blank.
- The user has previously verified iPhone 16 Pro on iOS 26.5 with Expo Go in LAN mode.

## Implementation steps

1. Create a QA checklist/result log for the staging Expo Go pass.
2. Start Expo with `EXPO_PUBLIC_APP_ENV=staging`, `EXPO_PUBLIC_PLACE_DATA_SOURCE=supabase`, staging URL, staging project ref, and a non-committed publishable key.
3. User scans the QR code in Expo Go and runs the checklist on iPhone 16 Pro.
4. Record actual results and only then mark TASK-041 complete.

## Test plan

### Automated

- Command: staging publishable REST read for pilot rows.
- Expected result: 69 active pilot rows can be read.

- Command: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`, `npx expo-doctor`.
- Expected result: all pass if any docs/state changes are committed.

### Manual

- Device/environment: iPhone 16 Pro on iOS 26.5 with Expo Go.
- Steps: Follow `docs/testing/EXPO_GO_STAGING_QA.md`.
- Expected result: All required TASK-041 flows pass or a blocking issue is recorded.

## Risks and rollback

- Risk: The phone cannot connect to the local Expo server.
- Mitigation: Try LAN first and Tunnel if needed.
- Rollback: No app data/schema rollback needed unless QA exposes a data bug from TASK-040.

## Security/privacy review

- New data collected: QA may create authenticated saved/visited/blocked/feedback rows for the staging test account only.
- Secrets involved: A publishable key is used locally but not committed.
- RLS/auth impact: Verify user-owned writes still work without service-role access.
- Logging impact: Existing sanitized development logs only.

## Completion evidence

Fill after implementation:

- Files changed:
- Commands run and results:
- Manual test result:
- Remaining limitations:
- Acceptance criteria status:
