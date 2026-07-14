# TASK-018 Execution Plan — Initialize Local Supabase

## Objective

Initialize a reproducible local Supabase project only after the required local Docker prerequisite is available.

## In scope

- Verify Docker availability.
- Verify Supabase CLI availability.
- Create `supabase/` configuration only when local Supabase can be started and reset.
- Document start/reset commands after successful verification.

## Out of scope

- Cloud Supabase workaround.
- Schema migrations.
- RLS policies.
- Seed data.
- Mobile Supabase client wiring.

## Files expected to change

- `docs/plans/TASK-018.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` requires a new local database to start and reset reproducibly.
- `PROJECT_STATE.md` already listed Docker as missing and required before local Supabase work.
- `docker --version` failed because `docker` is not installed or not on PATH.
- `docker info` failed because `docker` is not installed or not on PATH.
- `supabase --version` failed because the Supabase CLI is not globally installed.
- `npx supabase --version` succeeded with `2.109.1`, so the CLI can be run through `npx` after Docker is available.

## Implementation steps

1. Block TASK-018 until Docker Desktop is installed and `docker info` succeeds.
2. After Docker is available, run `npx supabase init`.
3. Start the local stack and verify `npx supabase status`.
4. Reset the local database and verify the reset is reproducible.
5. Document commands and update task state only after successful verification.

## Test plan

### Automated

- Command: `docker --version`
- Expected result: Passes after Docker installation.
- Command: `docker info`
- Expected result: Passes after Docker Desktop is running.
- Command: `npx supabase --version`
- Expected result: Passes.
- Command: `npx supabase start`
- Expected result: Starts local Supabase stack after Docker is available.
- Command: `npx supabase db reset`
- Expected result: Resets local database reproducibly after initialization.

### Manual

- Device/environment: Windows Docker Desktop.
- Steps: Install/start Docker Desktop, then rerun the TASK-018 plan.
- Expected result: Docker commands work before Supabase initialization begins.

## Risks and rollback

- Risk: Initializing Supabase without Docker would create unverified config.
- Mitigation: Stop at the prerequisite blocker.
- Rollback: Remove this plan and blocker documentation after Docker is available and TASK-018 is completed.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `docs/plans/TASK-018.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `docker --version` — failed; `docker` is not recognized.
  - `docker info` — failed; `docker` is not recognized.
  - `supabase --version` — failed; `supabase` is not recognized.
  - `npx supabase --version` — passed, `2.109.1`.
- Manual test result: Not run; Docker Desktop is not available.
- Remaining limitations: TASK-018 is blocked until Docker Desktop is installed and running.
- Acceptance criteria status: Blocked. A local Supabase database cannot start/reset without Docker.
