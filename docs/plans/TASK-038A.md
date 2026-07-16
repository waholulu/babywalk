# TASK-038A Execution Plan — Reorder Post-Expo-Go Backlog

## Objective

Adjust the remaining task backlog so work continues on the Expo Go + hosted Supabase path before returning to EAS builds, native release configuration, monitoring credentials, and app-store tasks.

## In scope

- Review TASK-038 and all later tasks.
- Move EAS, Sentry/source-map, native build, TestFlight/internal distribution, and store submission work later.
- Make TASK-039 the next actionable task.
- Add explicit Expo Go + Supabase verification tasks before native release work.
- Update project state to explain the new sequencing.

## Out of scope

- Implementing app features.
- Creating EAS builds.
- Adding Sentry or another monitoring SDK.
- Changing database schema.
- Curating the actual 50–100 places.

## Files expected to change

- `TASKS.md`
- `PROJECT_STATE.md`
- `DEVELOPMENT_PLAN.md`
- `docs/DEPLOYMENT.md`
- `docs/plans/TASK-038A.md`

## Existing behavior inspected

- TASK-038 is currently blocked by missing Expo/EAS authentication and monitoring credentials.
- TASK-039 is data curation, which can proceed with Expo Go + Supabase.
- Current physical-device path is iPhone 16 Pro on iOS 26.5 using Expo Go LAN mode.
- Hosted Supabase staging already exists and can be used with publishable client configuration.

## Implementation steps

1. Update TASKS.md so Expo Go + Supabase pilot-readiness tasks happen before native release tasks.
2. Update PROJECT_STATE.md current facts, next task, and completion log.
3. Update DEVELOPMENT_PLAN.md Phase 6 to distinguish Expo Go staging QA from later native/internal distribution.
4. Update docs/DEPLOYMENT.md to document the interim Expo Go + Supabase staging track.
5. Run formatting/diff checks and commit the documentation-only change.

## Test plan

### Automated

- Command: `git diff --check`
- Expected result: No whitespace errors.
- Command: `cd mobile; npm run format:check`
- Expected result: Prettier check passes.

### Manual

- Device/environment: Not required.
- Steps: Review the task order and confirm the next task is TASK-039.
- Expected result: No feature work is added; deferred EAS/monitoring tasks remain explicit.

## Risks and rollback

- Risk: Renumbering could make historical task logs confusing.
- Mitigation: Keep completed task numbers unchanged and only adjust future tasks.
- Rollback: Revert this documentation-only commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `TASKS.md`, `PROJECT_STATE.md`, `DEVELOPMENT_PLAN.md`, `docs/DEPLOYMENT.md`, and `docs/plans/TASK-038A.md`.
- Commands run and results: `git diff --check` passed; `npm run format:check` passed.
- Manual test result: Reviewed the revised task order and supporting docs. TASK-039 is now the next actionable task, while EAS/monitoring/native release work remains explicit but deferred.
- Remaining limitations: No app feature, EAS configuration, monitoring SDK, or database change was implemented.
- Acceptance criteria status: Complete.
