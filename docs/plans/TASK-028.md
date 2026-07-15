# TASK-028 Execution Plan — Add Weather Edge Function Adapter

## Objective

Add the first weather adapter boundary with validated request/output shapes, a local mock response, bounded error handling, and mobile fallback behavior when weather is unavailable.

## In scope

- Add a Supabase Edge Function named `get-weather` that accepts a coarse weather request and returns the internal `WeatherSnapshot` shape.
- Use a local mock provider inside the function; do not call an external weather API or introduce provider secrets.
- Add mobile-side weather repository types and fallback behavior for unavailable weather.
- Add tests for request validation, response mapping, and outage fallback without maps or network.

## Out of scope

- External weather provider signup or API calls.
- Secret management for weather providers.
- Production weather accuracy.
- EAS/native configuration.
- UI redesign beyond preserving existing recommendation behavior.

## Files expected to change

- `supabase/functions/get-weather/index.ts`
- `mobile/src/data/repositories/weather-repository*`
- `mobile/src/features/recommendations/local-recommendations.ts`
- `mobile/src/test/weather-repository.test.ts`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` marks TASK-028 as the next actionable provider task; TASK-027B is intentionally deferred until Expo Go no longer supports a required native dependency or native release testing begins.
- `mobile/src/domain/weather/types.ts` already defines the internal `WeatherSnapshot` shape.
- `mobile/src/features/recommendations/local-recommendations.ts` currently uses a fixed `defaultLocalWeather` fixture.
- `mobile/src/lib/supabase.ts` already creates a typed Supabase client.
- `supabase/config.toml` has Edge Runtime enabled with Deno major 2.
- Standalone `deno` is not installed in this Windows shell, so automated tests should stay in the existing Jest toolchain.

## Implementation steps

1. Add mobile weather repository interfaces, a fixture repository, a Supabase Edge Function repository, and a safe fallback helper.
2. Add the `get-weather` Edge Function with strict method/request validation, mock weather output, and bounded JSON errors.
3. Wire local recommendations to load weather through the repository path while falling back to local fixture weather when the adapter fails.
4. Add focused Jest tests for validation/mapping/fallback.
5. Run checks and update task/project docs after verification.

## Test plan

### Automated

- Command: `npm test -- --runInBand src/test/weather-repository.test.ts src/test/recommendation-results.test.ts`
- Expected result: Weather repository/fallback tests and existing recommendation result snapshot pass.
- Command: `npm run format:check`
- Expected result: Pass.
- Command: `npm run lint`
- Expected result: Pass.
- Command: `npm run typecheck`
- Expected result: Pass.
- Command: `npm test -- --runInBand`
- Expected result: Full Jest suite passes.
- Command: `npx expo-doctor`
- Expected result: Pass.

### Manual

- Device/environment: Local Expo web smoke.
- Steps: Start Expo web with local fixture env and request `/results`.
- Expected result: The results screen returns HTTP 200.

## Risks and rollback

- Risk: Supabase Edge Function syntax cannot be executed locally without Deno/runtime availability.
- Mitigation: Keep the function dependency-free and validate the mobile adapter/fallback with Jest; attempt Supabase CLI serving if available.
- Rollback: Remove `supabase/functions/get-weather` and restore direct use of `defaultLocalWeather`.

## Security/privacy review

- New data collected: Coarse latitude/longitude or coarse area label may be sent to the weather function when explicitly configured later; no child data is sent.
- Secrets involved: None in this task.
- RLS/auth impact: None.
- Logging impact: Function errors must not log raw family profiles or precise home addresses.

## Completion evidence

- Files changed: `supabase/functions/get-weather/index.ts`, `mobile/src/data/repositories/weather-repository*.ts`, `mobile/src/data/repositories/index.ts`, `mobile/src/features/recommendations/local-recommendations.ts`, `mobile/src/features/recommendations/recommendation-results-screen.tsx`, `mobile/src/features/recommendations/index.ts`, `mobile/src/test/weather-repository.test.ts`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results: `npm test -- --runInBand src/test/weather-repository.test.ts src/test/recommendation-results.test.ts` passed; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed with 19 suites and 79 tests; `npx expo-doctor` passed 18/18 checks; `npx supabase functions serve get-weather --no-verify-jwt` plus HTTP POST smoke passed with `task028_function_http=200 condition=rain source=SproutScout weather mock`.
- Manual test result: Expo web smoke with local fixture env returned `task028_results_http=200` for `/results`. Re-running `npm run typecheck` after Expo regenerated router types passed.
- Remaining limitations: Weather remains a local mock. No external weather provider, provider secret, deployment, caching, production accuracy, or weather-specific UI copy was added.
- Acceptance criteria status: Met. Input/output validation, timeout/error mapping, local mock, and outage fallback are covered without requiring maps, network provider calls, or secrets.
