# TASK-029 Execution Plan — Add Place-Provider Edge Function Adapter

## Objective

Add a server-side place-provider adapter boundary that normalizes provider-shaped place records into SproutScout internal candidate schemas before mobile receives them.

## In scope

- Add a Supabase Edge Function named `get-candidates`.
- Use a local mock provider inside the function; do not call a real provider or add secrets.
- Validate place-provider request shape and enforce a small request limit.
- Normalize mock provider records to internal `PlaceCandidate`-shaped output inside the Edge Function.
- Add mobile-side adapter validation so provider errors are bounded and raw provider objects do not leak into app code.

## Out of scope

- Real external provider integration.
- Provider account signup, API keys, billing, or deployment secrets.
- Deduping provider results with curated database places; that is TASK-030.
- Making provider data the default app source.
- Storing provider results in Postgres.

## Files expected to change

- `supabase/functions/get-candidates/index.ts`
- `mobile/src/data/repositories/place-provider-repository.supabase.ts`
- `mobile/src/data/repositories/index.ts`
- `mobile/src/test/place-provider-repository.test.ts`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` marks TASK-029 as next.
- `ARCHITECTURE.md` expects provider adapters to run server-side and never leak provider response JSON directly into scoring/UI.
- `PRODUCT_SPEC.md` forbids invented place facts and says external data must preserve provenance/freshness.
- `mobile/src/domain/place/types.ts` already defines provider-neutral `PlaceCandidate`.
- `mobile/src/data/repositories/place-repository.supabase.ts` maps database rows to `PlaceCandidate`.
- `supabase/functions/get-weather/index.ts` provides the current dependency-free Edge Function style to mirror.

## Implementation steps

1. Add `get-candidates` Edge Function with request validation, mock raw provider records, normalization, limit enforcement, and bounded JSON errors.
2. Add mobile Supabase place-provider repository and response validation.
3. Add focused tests for request shaping, response normalization, provider error bounding, and no raw provider field leakage.
4. Smoke the Edge Function locally with `npx supabase functions serve`.
5. Run checks and update task/project docs after verification.

## Test plan

### Automated

- Command: `npm test -- --runInBand src/test/place-provider-repository.test.ts`
- Expected result: New adapter tests pass.
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

- Device/environment: Local Supabase Edge runtime.
- Steps: Serve `get-candidates` locally and POST a coarse area request.
- Expected result: HTTP 200 returns internal candidate fields only.

## Risks and rollback

- Risk: Adding provider-shaped mocks creates accidental confidence in real place facts.
- Mitigation: Keep mock names clearly labeled as fixtures and freshness unknown/recent; do not wire provider output into default UI.
- Rollback: Remove `get-candidates` and the mobile provider repository files.

## Security/privacy review

- New data collected: Coarse area or coordinates in provider request; no child data.
- Secrets involved: None in this task. Future provider keys must stay in Edge Function secrets, never `EXPO_PUBLIC_*`.
- RLS/auth impact: None.
- Logging impact: Function logs bounded error codes/messages only, not raw family profiles or provider payloads.

## Completion evidence

- Files changed: `supabase/functions/get-candidates/index.ts`, `mobile/src/data/repositories/place-provider-repository.supabase.ts`, `mobile/src/data/repositories/index.ts`, `mobile/src/test/place-provider-repository.test.ts`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results: `npm test -- --runInBand src/test/place-provider-repository.test.ts` passed with 1 suite and 5 tests; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed with 20 suites and 84 tests; `npx expo-doctor` passed 18/18 checks; `npx supabase functions serve get-candidates --no-verify-jwt` plus HTTP POST smoke passed with `task029_function_http=200 candidates=2 first=sproutscout_mock_place_provider:mock-library-morning rawProviderFieldPresent=False`.
- Manual test result: Local Edge Function smoke confirmed mobile-facing output contains internal candidate fields and the checked raw provider field is absent.
- Remaining limitations: Mock provider only. No real provider API, provider secret, deployment, persistence, or curated/provider merge was added.
- Acceptance criteria status: Met. Secret-bearing provider integration remains server-side by design, request fields are minimal and limited, normalization happens before mobile consumption, and provider errors are bounded.
