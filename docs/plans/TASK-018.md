# TASK-018 Execution Plan — Initialize Local Supabase

## Objective

Initialize a reproducible local Supabase project after the required local Docker prerequisite is available.

## In scope

- Verify Docker availability.
- Verify Supabase CLI availability.
- Create `supabase/` configuration.
- Add minimal local Supabase command documentation.
- Verify local Supabase can start, report status, and reset.

## Out of scope

- Cloud Supabase workaround.
- Schema migrations.
- RLS policies.
- Seed data.
- Mobile Supabase client wiring.

## Files expected to change

- `supabase/.gitignore`
- `supabase/config.toml`
- `supabase/README.md`
- `supabase/seed.sql`
- `docs/plans/TASK-018.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` requires a new local database to start and reset reproducibly.
- `PROJECT_STATE.md` listed Docker as missing and required before local Supabase work.
- Initial `docker --version` and `docker info` failed because the current shell PATH had not refreshed after Docker Desktop installation.
- Docker Desktop was installed at `C:\Program Files\Docker\Docker\`; using the full Docker binary path worked after starting Docker Desktop.
- `supabase --version` failed because the Supabase CLI is not globally installed.
- `npx supabase --version` succeeded with `2.109.1`, so the CLI can be run through `npx` after Docker is available.

## Implementation steps

1. Start Docker Desktop and temporarily add Docker's bin directory to PATH for this shell.
2. Run `npx supabase init`.
3. Start the local stack and verify `npx supabase status`.
4. Add an empty seed file so reset is warning-free until TASK-021 adds real seed data.
5. Reset the local database and verify the reset is reproducible.
6. Document commands and update task state only after successful verification.

## Test plan

### Automated

- Command: `docker --version`
- Expected result: Passes after Docker installation or after temporarily adding Docker's bin directory to PATH.
- Command: `docker info`
- Expected result: Passes after Docker Desktop is running and Docker is on PATH.
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

- Files changed: `supabase/.gitignore`, `supabase/config.toml`, `supabase/README.md`, `supabase/seed.sql`, `docs/plans/TASK-018.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `docker --version` — initially failed in the existing shell because `docker` was not on PATH after installation.
  - `docker info` — initially failed in the existing shell because `docker` was not on PATH after installation.
  - `C:\Program Files\Docker\Docker\resources\bin\docker.exe --version` after starting Docker Desktop — passed, Docker version 29.6.1.
  - `C:\Program Files\Docker\Docker\resources\bin\docker.exe info --format '{{.ServerVersion}}'` — passed, server version 29.6.1.
  - `supabase --version` — failed; `supabase` is not recognized.
  - `npx supabase --version` — passed, `2.109.1`.
  - `npx supabase init` — passed and created local Supabase config.
  - `npx supabase start` — passed and started the local stack. Output included local default keys/secrets, which were not copied into docs.
  - `npx supabase status` — passed. Output included local default keys/secrets, which were not copied into docs.
  - `npx supabase db reset` — passed. After adding `supabase/seed.sql`, reset completed without the missing-seed warning.
- Manual test result: Docker Desktop was started locally; no mobile/device manual test was required.
- Remaining limitations: Docker's bin directory was not visible in the existing shell PATH, so commands in this session used a temporary PATH prefix. A new terminal should pick up the installed Docker PATH, or the documented temporary PATH command can be used.
- Acceptance criteria status: Complete. A local Supabase database starts and resets reproducibly.
