# TASK-024A Execution Plan — Create Minimal Hosted Supabase Staging Target

## Objective

Define the minimal hosted Supabase staging prerequisite that unblocks TASK-025 without pulling in release-build, app-signing, monitoring, or production-environment work.

## In scope

- Add TASK-024A before TASK-025 in `TASKS.md`.
- Replace the existing TASK-025 blocker with the numbered staging-prerequisite task.
- Rename and narrow TASK-038 to the later staging release environment work.
- Update `PROJECT_STATE.md` so the next task is TASK-024A.

## Out of scope

- Creating a hosted Supabase project in this documentation-only change.
- Applying migrations to hosted staging.
- Configuring EAS builds, app identifiers, Sentry, release channels, or production.
- Implementing incorrect-data feedback or any app feature.

## Files expected to change

- `TASKS.md`
- `PROJECT_STATE.md`
- `docs/plans/TASK-024A.md`

## Existing behavior inspected

- `TASKS.md` currently has `BLOCKER — Provide staging Supabase target for TASK-025` before TASK-025.
- `TASKS.md` currently schedules `TASK-038 — Create staging environment` with Supabase, EAS profile, and app identifier/suffix bundled together.
- `PROJECT_STATE.md` says TASK-025 is blocked because no staging Supabase target exists.
- `PRODUCT_SPEC.md` release gate requires staging and production to be separate.
- `ARCHITECTURE.md` defines local, staging, and production environments, and says mobile may contain only publishable client configuration such as the Supabase URL and anon key.

## Implementation steps

1. Insert `TASK-024A — Create minimal hosted Supabase staging target` before TASK-025.
2. Make TASK-024A acceptance focus on separate hosted staging Supabase, migrations, publishable client config, visible staging identification, and secret safety.
3. Rename TASK-038 to `Complete staging release environment` and keep EAS preview profile, staging app identifiers, EAS environment variables, staging installable build, Sentry, release channel, and production-write prevention there.
4. Update project state to point at TASK-024A and explain that the previous blocker has become the next numbered task.
5. Review the diff and run lightweight documentation checks.

## Test plan

### Automated

- Command: `git diff --check`
- Expected result: Passes without whitespace errors.

### Manual

- Device/environment: Local repository review.
- Steps: Inspect `TASKS.md`, `PROJECT_STATE.md`, and this plan.
- Expected result: TASK-024A appears before TASK-025, TASK-038 covers later release-environment work, and no application features or secrets are changed.

## Risks and rollback

- Risk: The task order could still be too broad and slow TASK-025.
- Mitigation: Keep TASK-024A limited to hosted Supabase staging and Expo client connection only.
- Rollback: Revert the documentation commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: No secret values are added; TASK-024A explicitly forbids committing database passwords, access tokens, secret keys, or service-role keys.
- RLS/auth impact: No policy changes in this task-order update.
- Logging impact: None.

## Completion evidence

- Files changed: `TASKS.md`, `PROJECT_STATE.md`, `docs/plans/TASK-024A.md`.
- Commands run and results: `git diff --check` passed; only line-ending normalization warnings were reported for existing Windows checkout behavior.
- Manual test result: Reviewed the diff to confirm TASK-024A now sits before TASK-025, TASK-038 is narrowed to later staging release work, and no app feature files or secrets changed.
- Remaining limitations: No hosted Supabase project was created in this documentation-only task-order update.
- Acceptance criteria status: Documentation change complete; TASK-024A itself remains the next task to execute.
