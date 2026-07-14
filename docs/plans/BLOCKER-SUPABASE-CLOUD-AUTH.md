# BLOCKER Execution Plan — Supabase Cloud Auth for TASK-024A

## Objective

Document the missing Supabase cloud authentication prerequisite that prevents TASK-024A from creating or configuring a hosted staging project.

## In scope

- Add a blocker before TASK-024A in `TASKS.md`.
- Update `PROJECT_STATE.md` with the exact command failure and next step.
- Keep secrets out of the repository.

## Out of scope

- Running `supabase login` on behalf of the user without an available token/session.
- Creating a hosted Supabase project.
- Applying migrations to hosted staging.
- Configuring Expo staging environment variables.

## Files expected to change

- `TASKS.md`
- `PROJECT_STATE.md`
- `docs/plans/BLOCKER-SUPABASE-CLOUD-AUTH.md`

## Existing behavior inspected

- `TASKS.md` now defines `TASK-024A — Create minimal hosted Supabase staging target`.
- `PROJECT_STATE.md` names TASK-024A as the next task.
- `npx supabase projects list` fails because no Supabase access token is available to the CLI.

## Implementation steps

1. Add a blocker that asks for Supabase CLI cloud authentication and staging project creation inputs.
2. Update project state with the failed command and safe next action.
3. Run `git diff --check`.

## Test plan

### Automated

- Command: `git diff --check`
- Expected result: Passes without whitespace errors.

### Manual

- Device/environment: Windows PowerShell in `D:\github\babywalk`.
- Steps: Review the blocker text.
- Expected result: It asks for cloud auth without requesting any secret be committed.

## Risks and rollback

- Risk: A user might paste a token into a tracked file.
- Mitigation: The blocker explicitly requires no token, database password, secret key, or service-role key be committed.
- Rollback: Revert the blocker documentation commit after Supabase cloud auth is available.

## Security/privacy review

- New data collected: None.
- Secrets involved: Supabase access token may be needed in the local shell or interactive login, but must not be committed.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `TASKS.md`, `PROJECT_STATE.md`, `docs/plans/BLOCKER-SUPABASE-CLOUD-AUTH.md`.
- Commands run and results:
  - `npx supabase --version` — passed, 2.109.1.
  - `npx supabase projects list` — failed with `LegacyPlatformAuthRequiredError`; the CLI requested `supabase login` or `SUPABASE_ACCESS_TOKEN`.
  - `git diff --check` — passed; only line-ending normalization warnings were reported for existing Windows checkout behavior.
- Manual test result: Reviewed the blocker text to confirm it asks for local cloud authentication without committing secrets.
- Remaining limitations: TASK-024A cannot proceed until Supabase cloud auth is available and the staging organization/region/project naming is known.
- Acceptance criteria status: Blocker documented.
