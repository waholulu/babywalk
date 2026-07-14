# TASK-004 Execution Plan — Activate CI

## Objective

Add GitHub Actions CI for the scaffolded mobile app so formatting, linting, type checking, and tests run on pushes to the default branch and pull requests.

## In scope

- Adapt `templates/ci.yml` to the current `mobile/` scaffold.
- Add the workflow under `.github/workflows/`.
- Verify CI locally as far as possible with the same commands.
- Verify CI on GitHub default branch and a test pull request before marking complete.

## Out of scope

- Changing the quality commands themselves; TASK-003 completed those.
- Adding deployment, EAS, Supabase, or native-build checks.
- Creating a GitHub repository without an explicit repository/remote decision.

## Files expected to change

- `.github/workflows/ci.yml`
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-004.md`

## Existing behavior inspected

- Read `PROJECT_STATE.md`, selected `TASK-004` in `TASKS.md`, and `templates/ci.yml`.
- Confirmed `templates/ci.yml` already matches the intended mobile commands and uses `.nvmrc`, `mobile/package-lock.json`, and the `mobile` working directory.
- Ran `git rev-parse --is-inside-work-tree`; it failed because `D:\github\babywalk` is not currently a Git repository.
- Confirmed `.github/workflows/` does not exist.

## Implementation steps

1. Block until the repository root is initialized as a Git worktree and connected to GitHub, or the user provides a different CI target.
2. Add `.github/workflows/ci.yml` from the template.
3. Run local command equivalents from `mobile/`.
4. Push to the default branch and open a test pull request.
5. Mark TASK-004 complete only after GitHub Actions passes in both required contexts.

## Test plan

### Automated

- Command: `cd mobile; npm run format:check`
- Expected result: Passes.

- Command: `cd mobile; npm run lint`
- Expected result: Passes.

- Command: `cd mobile; npm run typecheck`
- Expected result: Passes.

- Command: `cd mobile; npm test -- --runInBand`
- Expected result: Passes.

### Manual

- Device/environment: GitHub repository with Actions enabled.
- Steps: Push workflow to default branch, then open a test pull request.
- Expected result: CI passes on both default branch and test pull request.

## Risks and rollback

- Risk: Adding workflow files before Git/GitHub exists could create false confidence that CI is active.
- Mitigation: Do not mark the task complete until the workflow actually runs in GitHub Actions.
- Rollback: Remove `.github/workflows/ci.yml` and restore task state if activation fails.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `docs/plans/TASK-004.md`.
- Commands run and results: `git rev-parse --is-inside-work-tree` failed because the workspace root is not a Git repository.
- Manual test result: Blocked; no GitHub repository/default branch/test pull request is available.
- Remaining limitations: CI cannot be activated or accepted until the root project is initialized as a Git repository and connected to GitHub.
- Acceptance criteria status: Blocked, not complete.
