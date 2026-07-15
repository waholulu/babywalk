# TASK-034 Execution Plan — Add Analytics Wrapper

## Objective

Add a small replaceable analytics wrapper that can emit sanitized development logs for minimal product events without recording precise location, child data, raw family profiles, or secrets.

## In scope

- Define a provider-neutral analytics event API under `mobile/src/lib`.
- Add sanitization that blocks sensitive property names and only allows primitive values.
- Use a local/staging console provider and a production noop default.
- Track minimal valid plan-submit and recommendation-loaded events.
- Add unit tests for sanitization, provider replacement, and default production behavior.

## Out of scope

- Third-party analytics SDKs.
- Persisted event queues.
- Supabase analytics tables.
- Crash/error monitoring.
- User identity stitching.

## Files expected to change

- `mobile/src/lib/analytics.ts`
- `mobile/src/features/plan-input/plan-input-form.tsx`
- `mobile/src/features/recommendations/recommendation-results-screen.tsx`
- `mobile/src/test/analytics.test.ts`
- `docs/plans/TASK-034.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- There is no analytics or logger wrapper yet under `mobile/src/lib`.
- `ARCHITECTURE.md` requires a small wrapper and prohibits logging tokens, precise home coordinates, child identifiers, raw family profiles, and provider responses.
- `PlanInputForm` validates local planning input and can track a coarse successful-submit event without logging area or exact child age.
- `RecommendationResultsScreen` loads recommendation results and can track counts/source labels after successful load.

## Implementation steps

1. Add provider-neutral analytics types, sanitization, default console/noop providers, and test helpers.
2. Track a sanitized `plan_submitted` event after valid form submission.
3. Track a sanitized `recommendations_loaded` event after recommendation results load.
4. Add unit tests for blocked sensitive fields, provider replacement, and production noop behavior.
5. Run checks, review the diff, then update task/state docs.

## Test plan

### Automated

- Command: `cd mobile; npm test -- --runInBand src/test/analytics.test.ts`
- Expected result: Analytics wrapper tests pass.
- Command: `cd mobile; npm run format:check`
- Expected result: Prettier check passes.
- Command: `cd mobile; npm run lint`
- Expected result: ESLint passes.
- Command: `cd mobile; npm run typecheck`
- Expected result: TypeScript passes.
- Command: `cd mobile; npm test -- --runInBand`
- Expected result: Full Jest suite passes.
- Command: `cd mobile; npx expo-doctor`
- Expected result: Expo Doctor passes.

### Manual

- Device/environment: Expo web smoke with local fixture env.
- Steps: Start Expo web and request `/` and `/results`.
- Expected result: Both routes return HTTP 200; local development can emit sanitized analytics logs when actions run.

## Risks and rollback

- Risk: Accidental sensitive metadata logging.
- Mitigation: Block sensitive property names, keep event properties coarse, and test that child age, precise location, area, and secret-like keys are dropped.
- Rollback: Remove the analytics module and the two tracking calls.

## Security/privacy review

- New data collected: No persisted data. Only local/staging development console events.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: Adds sanitized local/staging analytics logs; production default is noop.

## Completion evidence

- Files changed: `mobile/src/lib/analytics.ts`, `mobile/src/features/plan-input/plan-input-form.tsx`, `mobile/src/features/recommendations/recommendation-results-screen.tsx`, `mobile/src/test/analytics.test.ts`, `TASKS.md`, `PROJECT_STATE.md`, `docs/plans/TASK-034.md`.
- Commands run and results: `npm test -- --runInBand src/test/analytics.test.ts` passed; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed with 25 suites and 101 tests; `npx expo-doctor` passed 18/18 checks; a final `npm run typecheck` after Expo web passed.
- Manual test result: Expo web started with local fixture env and `/` plus `/results` returned HTTP 200 on port 60507.
- Remaining limitations: No third-party analytics SDK, persisted queue, identity stitching, Supabase analytics table, or production analytics sink yet.
- Acceptance criteria status: Met. Development analytics logs are sanitized and emitted through a replaceable provider, with production defaulting to noop.
