# Expo Go Staging QA

## Target

- Task: TASK-041
- App environment: `staging`
- Data source: hosted Supabase staging
- Device: iPhone 16 Pro
- OS: iOS 26.5
- Expo Go network mode: To be recorded during test
- Tester: User-run physical-device pass
- Date: 2026-07-16

## Setup

Start Expo from `mobile/` with staging environment variables:

```powershell
$env:EXPO_PUBLIC_APP_ENV = 'staging'
$env:EXPO_PUBLIC_PLACE_DATA_SOURCE = 'supabase'
$env:EXPO_PUBLIC_SUPABASE_URL = 'https://pspaowtnajsdwcyzrafl.supabase.co'
$env:EXPO_PUBLIC_SUPABASE_PROJECT_REF = 'pspaowtnajsdwcyzrafl'
$env:EXPO_PUBLIC_SUPABASE_ANON_KEY = '<publishable key from local shell only>'
npx expo start
```

Do not commit the key. Use LAN first. If the phone cannot connect, switch Expo to Tunnel mode and record that.

## Result Log

| Flow | Expected result | Result | Notes |
|---|---|---|---|
| First launch | App opens in Expo Go without configuration error. | Not run |  |
| Staging banner | Banner visibly identifies staging mode. | Not run |  |
| Recommendations from staging | Results load from hosted Supabase and show staged pilot place data. | Not run |  |
| Place detail | A staged pilot place opens and shows source/freshness and verify-before-leaving copy. | Not run |  |
| Save action | Save succeeds for the signed-in staging test account or shows a clear auth-required state. | Not run |  |
| Mark visited action | Mark visited succeeds for the signed-in staging test account or shows a clear auth-required state. | Not run |  |
| Block action | Do not recommend action succeeds for the signed-in staging test account or shows a clear auth-required state. | Not run |  |
| Incorrect-data feedback | Feedback form submits a report to staging or shows a clear auth-required state. | Not run |  |
| Location denied fallback | Denying location still allows manual area planning. | Not run |  |
| Day plan | Day-plan screen opens from recommendations and renders timeline plus verification warnings. | Not run |  |

## Pass Criteria

TASK-041 passes only when every required flow is marked `Pass`, or a deliberate product decision records why a clear auth-required state is acceptable for the private Expo Go staging pass.

## Known Limits To Watch

- Expo Go does not test native app identifiers, signing, release channels, or store behavior.
- The pilot place set has source/freshness metadata but still needs day-of checks before a real family leaves.
- The current QA pass is iOS-only unless an Android Expo Go device is separately tested.
