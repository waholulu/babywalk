# TASK-025 Execution Plan — Implement Incorrect-Data Feedback

## Objective

Let a parent submit structured incorrect-data feedback from place detail without exposing moderation internals, while preserving the current guest flow.

## In scope

- Add a feedback type model that matches the existing `place_feedback` SQL constraint.
- Add a feedback repository boundary for submitting reports.
- Add a place-detail report form with feedback type and optional details.
- Keep internal moderation status hidden from the mobile UI.
- Add tests for validation, payload shaping, and UI action model behavior.

## Out of scope

- Staging Supabase project setup, which is currently scheduled for TASK-038.
- Admin moderation UI.
- Feedback history screen.
- Provider-side correction workflows.
- Anonymous database writes, because current RLS allows `place_feedback` only for authenticated owners.

## Files expected to change

- `mobile/src/data/repositories/*feedback*`
- `mobile/src/features/places/*feedback*`
- `mobile/src/features/places/place-detail-screen.tsx`
- `mobile/src/lib/supabase.ts`
- `mobile/src/test/*`
- `docs/plans/TASK-025.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `TASKS.md` acceptance says a report should reach staging database.
- `PROJECT_STATE.md` says staging is not configured yet; TASK-038 is the planned staging-environment task.
- `supabase/migrations/20260714191031_initial_schema.sql` defines `place_feedback` with `feedback_type`, `details`, and internal `status`.
- `supabase/migrations/20260714191641_rls_policies.sql` grants authenticated users `select, insert` only for their own `place_feedback`; anonymous users cannot insert.
- `mobile/src/features/places/place-detail-screen.tsx` currently says incorrect-data reporting is deferred to TASK-025.

## Implementation steps

1. Confirm whether TASK-025 can be completed against local Supabase or whether staging is a blocking prerequisite.
2. If local implementation is acceptable, add a typed repository and UI form that submits only `user_id`, `place_id`, `feedback_type`, and `details`.
3. Add tests for validation and payload shaping.
4. Run available checks.
5. Update docs honestly with either completion evidence or blocker evidence.

## Test plan

### Automated

- Command: `npm run format:check`
- Expected result: Passes.
- Command: `npm run lint`
- Expected result: Passes.
- Command: `npm run typecheck`
- Expected result: Passes.
- Command: `npm test -- --runInBand`
- Expected result: Passes.
- Command: `npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Requires either local authenticated Supabase session or staging Supabase, depending on final scope decision.
- Steps: Submit a structured incorrect-data report from place detail.
- Expected result: Report reaches `place_feedback` without exposing or allowing edits to moderation `status`.

## Risks and rollback

- Risk: Current task acceptance requires staging before the project has staging.
- Mitigation: Do not mark TASK-025 complete unless the database target is real and verified; create a blocker if staging is required.
- Rollback: Revert the TASK-025 commit if implementation proceeds and causes regression.

## Security/privacy review

- New data collected: Optional free-text report details.
- Secrets involved: None.
- RLS/auth impact: Uses existing authenticated owner-only insert policy.
- Logging impact: None.

## Completion evidence

- Files changed: `docs/plans/TASK-025.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `rg -n "place_feedback|feedback|incorrect" supabase\migrations mobile\src TASKS.md DATABASE.md PRODUCT_SPEC.md` — inspected feedback schema, RLS policies, product requirements, and current UI references.
- Manual test result: Confirmed `place_feedback` exists locally and authenticated owner-only insert policy exists, but no staging database target is documented or configured.
- Remaining limitations: No application feature was implemented for TASK-025 because the stated acceptance cannot be truthfully verified without staging.
- Acceptance criteria status: Blocked. Added `BLOCKER — Provide staging Supabase target for TASK-025`.
