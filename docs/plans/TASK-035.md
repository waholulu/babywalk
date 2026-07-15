# TASK-035 Execution Plan — Add Crash Reporting Abstraction

## Objective

Add a provider-neutral crash/error reporting wrapper with privacy filters so the app can report sanitized development errors now and later swap in Sentry during the staging release environment task.

## In scope

- Revise TASK-035 to be a crash reporting abstraction, not Sentry setup.
- Add `captureException`, `captureMessage`, and scoped context helpers.
- Sanitize context keys and free-text messages before reporting.
- Default local/staging to development console logs and production to noop.
- Add focused tests proving provider replacement and privacy filtering.
- Use the wrapper in one existing recoverable error path.

## Out of scope

- Sentry installation.
- DSN/auth-token configuration.
- Source map upload.
- Release naming.
- Deliberate staging test error verification.
- EAS staging or production builds.

## Files expected to change

- `TASKS.md`
- `mobile/src/lib/error-reporting.ts`
- `mobile/src/features/recommendations/recommendation-results-screen.tsx`
- `mobile/src/test/error-reporting.test.ts`
- `docs/plans/TASK-035.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- TASK-035 originally required staging/production monitoring, source maps, release naming, and visible deliberate staging errors.
- TASK-038 already owns staging release environment, Sentry, EAS profile/build, release channel, and production-write safeguards.
- `mobile/src/lib/analytics.ts` provides a similar replaceable wrapper pattern with local/staging console output and production noop.
- `RecommendationResultsScreen` has a recoverable load failure path that can report a sanitized exception without changing UI behavior.

## Implementation steps

1. Update TASK-035 wording to reflect the abstraction and move concrete Sentry/source-map verification to TASK-038.
2. Add the error reporting wrapper and privacy filters under `mobile/src/lib`.
3. Add tests for sensitive key removal, message redaction, provider replacement, context scoping, and production noop.
4. Wire one recoverable error path through `captureException`.
5. Run checks, review the diff, then update task/state docs.

## Test plan

### Automated

- Command: `cd mobile; npm test -- --runInBand src/test/error-reporting.test.ts`
- Expected result: Error reporting wrapper tests pass.
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
- Steps: Start Expo web and request `/results`.
- Expected result: Route returns HTTP 200.

## Risks and rollback

- Risk: Error reporting could leak sensitive payloads.
- Mitigation: Drop sensitive keys, redact common secret/location patterns from messages, and test the filters.
- Rollback: Remove the wrapper and the single `captureException` call.

## Security/privacy review

- New data collected: None persisted. Local/staging development console error reports only.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: Adds sanitized local/staging error logs; production default is noop.

## Completion evidence

- Files changed: `TASKS.md`, `mobile/src/lib/error-reporting.ts`, `mobile/src/features/recommendations/recommendation-results-screen.tsx`, `mobile/src/test/error-reporting.test.ts`, `docs/plans/TASK-035.md`, `PROJECT_STATE.md`.
- Commands run and results: `npm test -- --runInBand src/test/error-reporting.test.ts` passed; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` initially failed on corrupt generated `.expo/types/router.d.ts`, then passed after deleting that generated file; `npm test -- --runInBand` passed with 26 suites and 106 tests; `npx expo-doctor` passed 18/18 checks; final `npm run typecheck` after Expo web passed.
- Manual test result: Expo web started with local fixture env and `/results` returned HTTP 200 on port 50690.
- Remaining limitations: Sentry SDK/configuration, DSN/auth-token handling, source maps, release naming, production monitoring, and deliberate staging test-error verification are deferred to TASK-038.
- Acceptance criteria status: Met for the narrowed task. Sanitized local/staging error reports are covered by tests and the provider can be replaced.
