# TASK-008 Execution Plan — Add Environment Validation

## Objective

Add early validation for client-safe environment variables so invalid development configuration shows a clear error without printing secrets.

## In scope

- Add a committed environment example for non-secret client configuration.
- Validate `EXPO_PUBLIC_APP_ENV` as `local`, `staging`, or `production`.
- Keep validation dependency-free and unit-tested.
- Show a clear in-app configuration error when required public config is missing or invalid.
- Avoid logging or rendering raw environment values.

## Out of scope

- Supabase URL or anon key validation before Supabase client setup.
- Server-side secrets, provider API keys, staging/prod deployment configuration, or EAS env management.
- Adding Zod or another validation dependency.
- Implementing application features.

## Files expected to change

- `mobile/.env.example`
- `.gitignore` only if needed to allow the example file.
- `mobile/src/lib/env.ts`
- `mobile/src/test/env.test.ts`
- `mobile/src/components/config-error-screen.tsx`
- `mobile/src/app/_layout.tsx`
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-008.md`

## Existing behavior inspected

- No client environment validation currently exists.
- The app can render without any environment variables.
- No Supabase client is configured yet, and `PROJECT_STATE.md` says no external API is required for the first local recommendation slice.
- `.gitignore` ignores real `.env` files and allows `.env.example` at the repository root; mobile-specific example handling needs verification.

## Implementation steps

1. Add `mobile/.env.example` with `EXPO_PUBLIC_APP_ENV=local`.
2. Add a pure environment parser for `EXPO_PUBLIC_APP_ENV`.
3. Add unit tests for valid, missing, invalid, and non-leaking error behavior.
4. Add a configuration error screen that names the missing/invalid variable but not its value.
5. Gate the root layout with the parser.
6. Run local checks, including route smoke with `EXPO_PUBLIC_APP_ENV=local`.
7. Update `PROJECT_STATE.md`, mark TASK-008 complete in `TASKS.md`, review diff, commit, push, and verify CI.

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

- Command: `cd mobile; npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Expo web route smoke with `EXPO_PUBLIC_APP_ENV=local`.
- Steps: Start Expo web and request the existing skeleton routes.
- Expected result: Routes render normally.

- Device/environment: Expo web without `EXPO_PUBLIC_APP_ENV`.
- Steps: Start Expo web and request `/`.
- Expected result: The app renders a configuration error that names `EXPO_PUBLIC_APP_ENV` without printing any secret or raw invalid value.

## Risks and rollback

- Risk: Requiring config too early can slow beginner setup.
- Mitigation: Require only one non-secret value and provide `mobile/.env.example`.
- Rollback: Revert the TASK-008 commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None. Only `EXPO_PUBLIC_APP_ENV` is validated.
- RLS/auth impact: None.
- Logging impact: No raw env values are logged or displayed.

## Completion evidence

Fill after implementation:

- Files changed: `mobile/.env.example`, `mobile/src/lib/env.ts`, `mobile/src/test/env.test.ts`, `mobile/src/components/config-error-screen.tsx`, `mobile/src/app/_layout.tsx`, `PROJECT_STATE.md`, `TASKS.md`, and this plan.
- Commands run and results: `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed; `npx expo-doctor` passed 18/18 checks.
- Manual test result: With `EXPO_PUBLIC_APP_ENV=local`, Expo web returned HTTP 200 for `/`, `/onboarding`, `/results`, `/places/demo-place`, `/plan/demo-plan`, `/saved`, and `/settings`. Without `EXPO_PUBLIC_APP_ENV`, Expo web returned HTTP 200 for `/` and rendered `Configuration needed`, `EXPO_PUBLIC_APP_ENV`, and `missing` without exposing raw values.
- Remaining limitations: Only `EXPO_PUBLIC_APP_ENV` is required for now. Supabase and provider environment variables are deferred until their client/adapters exist.
- Acceptance criteria status: Complete.
