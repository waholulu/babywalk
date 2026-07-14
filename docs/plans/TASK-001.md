# TASK-001 Execution Plan — Verify Developer Prerequisites

## Objective

Document the local development prerequisites for SproutScout and ensure the repository has a safe baseline `.gitignore` before application scaffold work begins.

## In scope

- Run the Windows prerequisite doctor script.
- Record versions/status for Git, Node/npm, Docker, mobile test paths, Expo, Supabase, and GitHub repository state.
- Review and, if needed, update the root `.gitignore` for secrets, local build output, Expo/React Native artifacts, Supabase temp files, and editor/OS noise.
- Update `PROJECT_STATE.md` and check off only `TASK-001` in `TASKS.md` after verification.

## Out of scope

- Creating the Expo app or `mobile/` scaffold.
- Installing missing tools.
- Creating Supabase projects, Expo accounts, or GitHub repositories.
- Changing product, architecture, or database design.

## Files expected to change

- `.gitignore`
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-001.md`

## Existing behavior inspected

- Read `AGENTS.md`, `START_HERE.md`, `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `TASKS.md`, `PROJECT_STATE.md`, and `docs/EXECPLAN_TEMPLATE.md`.
- Read `scripts/doctor.ps1` and confirmed it checks required command availability without installing or modifying tools.
- Read the current `.gitignore`; it already ignores secrets, Node dependencies, Expo output, Supabase temp files, coverage/artifacts, editor files, and temporary agent files.
- Ran `git status --short`; it failed because `D:\github\babywalk` is not currently inside a Git repository.

## Implementation steps

1. Run `.\scripts\doctor.ps1` from the repository root and capture the result.
2. Run a few targeted version/status commands if needed to fill gaps in `PROJECT_STATE.md`.
3. Make the smallest necessary `.gitignore` update, if the existing ignore file is missing common generated artifacts.
4. Update `PROJECT_STATE.md` with the verified environment inventory, commands run, known limitations, and next task.
5. Mark `TASK-001` complete in `TASKS.md` only if the acceptance criteria are documented.
6. Review the final diff.

## Test plan

### Automated

- Command: `.\scripts\doctor.ps1`
- Expected result: Required command checks pass or missing required tools are documented.

### Manual

- Device/environment: Local Windows development machine.
- Steps: Inspect doctor output and repository state; record mobile test path and account statuses as unknown/not configured when they cannot be verified locally.
- Expected result: `PROJECT_STATE.md` truthfully documents available tools, missing tools, and any temporary limitations.

## Risks and rollback

- Risk: Recording an unavailable tool as available could send later tasks down a broken path.
- Mitigation: Use command output for tool versions/status and explicitly mark unverifiable manual items as unknown/not configured.
- Rollback: Revert the documentation and `.gitignore` changes from this task.

## Security/privacy review

- New data collected: Local tool versions and development environment status only.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `docs/plans/TASK-001.md`, `PROJECT_STATE.md`, `TASKS.md`.
- Commands run and results: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\doctor.ps1` passed required checks and reported optional missing Docker, adb, and eas; direct `.\scripts\doctor.ps1` failed because the unsigned script is blocked by local execution policy; `git --version`, `node --version`, `npm --version`, and `npx --version` reported installed versions; Docker, adb, and eas version checks failed because the commands are unavailable; `git rev-parse --is-inside-work-tree` failed because this folder is not a Git worktree.
- Manual test result: Reviewed `.gitignore`; no changes were required for the current planning-only repository state.
- Remaining limitations: Docker, mobile device/emulator path, Expo/EAS setup, Supabase account, and GitHub repository setup are not configured or not verified.
- Acceptance criteria status: Git, Node/npm, and the current mobile test-path gap are documented. Docker is not available, so `PROJECT_STATE.md` documents an explicit temporary exception until local Supabase work begins.
