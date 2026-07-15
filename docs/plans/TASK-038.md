# TASK-038 Execution Plan — Complete Staging Release Environment

## Objective

Create and verify a staging release environment that can produce an installable staging build, point only at staging services, and report sanitized staging errors to a staging monitoring project.

## In scope

- Inspect the current Expo, EAS, Supabase staging, and error-reporting setup.
- Add only safe, non-secret configuration files if prerequisites are available.
- Verify staging cannot silently point to production.
- Verify an installable staging build on a real device if EAS credentials and device/build prerequisites are available.
- Verify a deliberate staging test error reaches the staging monitoring project if a monitoring provider, DSN, and upload credentials are available.
- Record any missing external prerequisites as a blocker instead of faking release readiness.

## Out of scope

- Production app identifiers.
- Store submission.
- Paid Apple Developer enrollment.
- Android Play Console setup.
- Committing secrets, service-role keys, database passwords, Sentry auth tokens, or EAS tokens.
- Adding unrelated app features.

## Files expected to change

- `docs/plans/TASK-038.md`
- Possibly `mobile/app.json` or `mobile/app.config.ts`
- Possibly `mobile/eas.json`
- Possibly `mobile/.env.staging.example`
- Possibly `mobile/src/lib/error-reporting.ts`
- Possibly `TASKS.md`
- Possibly `PROJECT_STATE.md`

## Existing behavior inspected

- TASK-038 requires an EAS preview profile, staging app identifier suffix, EAS environment variables, staging installable build, Sentry, source maps, release naming, release channel, a deliberate staging test error, and safeguards that staging builds cannot write to production.
- TASK-035 intentionally deferred concrete Sentry SDK setup, DSN, source maps, release naming, and deliberate staging test-error verification to TASK-038.
- TASK-024A created hosted Supabase staging project `babywalk` (`pspaowtnajsdwcyzrafl`) and documented publishable staging configuration without committing secrets.
- TASK-005 and TASK-027B keep EAS development builds deferred until native dependency or release testing; TASK-038 is the first release-environment task that can require EAS.

## Implementation steps

1. Inventory local prerequisites: Expo account/EAS login, EAS CLI availability, existing Expo project ID, Apple/Android build credentials, and monitoring configuration.
2. If prerequisites are present, add staging build/update configuration with staging-only identifiers and non-secret environment placeholders.
3. If monitoring prerequisites are present, wire the existing error-reporting abstraction to the provider without logging sensitive payloads and verify a deliberate staging test error.
4. Run local checks and any available EAS validation/build commands.
5. Update task state truthfully: complete only if a real staging build installs and reports to staging monitoring; otherwise add a blocker with exact missing prerequisites.

## Test plan

### Automated

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

- Device/environment: Real iOS or Android device using an installable staging build.
- Steps: Install the staging build, confirm the app visibly identifies staging, confirm it cannot point to production, trigger the deliberate staging test error, and confirm the sanitized event appears in the staging monitoring project.
- Expected result: Staging build installs, reads/writes staging only, and reports sanitized errors to staging monitoring.

## Risks and rollback

- Risk: Accidentally committing secrets or pointing staging to production.
- Mitigation: Use examples/placeholders only, rely on publishable keys in local env files, and add explicit production guard checks.
- Rollback: Revert TASK-038 configuration changes and remove any external staging build/profile created during testing.

## Security/privacy review

- New data collected: Crash/error metadata only if monitoring is configured.
- Secrets involved: EAS credentials, Sentry auth token/DSN, Apple/Android signing credentials, and Supabase staging values must remain outside Git.
- RLS/auth impact: No RLS weakening is allowed.
- Logging impact: Error reporting must use the existing sanitizer and must not include child data, precise location, raw family profiles, tokens, passwords, or service-role keys.

## Completion evidence

- Files changed: `docs/plans/TASK-038.md`, `TASKS.md`, and `PROJECT_STATE.md`.
- Commands run and results: `npx eas-cli --version` passed with eas-cli/21.0.1 via npx; `npx eas-cli whoami` failed because no Expo/EAS user is logged in; `npx eas-cli project:info` failed because an Expo user account is required; `Test-Path mobile\eas.json` returned false; repository/env search found no app-level EAS project configuration, Sentry/monitoring configuration, or EAS/Expo/Sentry credentials in the current shell.
- Manual test result: Not run. There is no installable staging build or staging monitoring project available to test.
- Remaining limitations: TASK-038 is blocked until Expo/EAS authentication, staging build credentials/distribution for at least one real device, and staging monitoring credentials are available outside Git.
- Acceptance criteria status: Blocked. A staging build cannot be installed or verified, and no deliberate staging monitoring event can be confirmed.
