# Critical E2E Smoke Checklist

## Target

- Device: iPhone 16 Pro
- OS: iOS 26.5
- Runtime: Expo Go
- Connection mode: LAN
- Start command: `cd mobile && npx expo start`
- Environment: `EXPO_PUBLIC_APP_ENV=local`, `EXPO_PUBLIC_PLACE_DATA_SOURCE=fixtures`

Automated mobile E2E remains deferred until Android emulator/adb, Maestro, or another runnable target is configured. This checklist is the accepted TASK-036 path for the current Windows + Expo Go workflow.

## Before Running

1. Confirm the working tree is on the intended commit.
2. Start the Expo dev server from `mobile/`.
3. Scan the Expo Go QR code from the iPhone.
4. If Expo asks for LAN/Tunnel, use LAN unless local network discovery fails.

## Smoke Cases

### 1. First Launch

Steps:

1. Open the app from Expo Go.
2. Wait for the splash overlay to clear.
3. Confirm the `Plan today` screen appears.

Expected:

- The screen loads without a red error overlay.
- The non-production environment banner is visible.
- The form shows child age, area, time window, budget, indoor/outdoor, energy, stroller, bathroom, interests, and action buttons.

### 2. Recommendation Results

Steps:

1. Navigate to `/results` from the Expo developer menu URL entry, a deep link, or a temporary route link if available.
2. Wait for results to finish loading.

Expected:

- `Three outing ideas` appears.
- Three recommendation cards render from local fixtures.
- Each card shows travel, price, mode, age fit, reasons, warnings when present, source/freshness, and an `Open place` action.
- No raw provider payload, precise home location, child name, or exact birth date appears.

### 3. Place Detail

Steps:

1. Open the first recommendation's place detail.
2. Review facts, verification notes, and actions.

Expected:

- The place detail screen loads without crashing.
- Unknown facts are labeled as unknown rather than guessed.
- Verify-before-leaving notes are visible when data is uncertain.
- Save, Mark visited, Do not recommend, and Report incorrect data controls are present.

### 4. Location-Denied Fallback

Steps:

1. Return to the `Plan today` screen.
2. Tap `Use current location`.
3. Deny the iOS foreground location permission prompt.
4. Confirm manual area entry remains editable.

Expected:

- The app does not crash.
- The status text says location permission was denied.
- The user can still type a city, neighborhood, or ZIP area.
- No precise location or home address is stored or displayed.

## Result Log

Record each run in `PROJECT_STATE.md` or the relevant task notes with:

- Date and commit.
- Device and OS.
- Expo Go version if visible.
- LAN or Tunnel mode.
- Pass/fail for each smoke case.
- Any exact failure text or screenshot reference.
