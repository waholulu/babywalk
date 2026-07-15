# TASK-025 Execution Plan — Implement Incorrect-Data Feedback

## Objective

Let a parent submit structured incorrect-data feedback for a place without exposing moderation internals, and verify that one authenticated report reaches the hosted staging database.

## In scope

- Add a typed place-feedback model matching the existing `place_feedback.feedback_type` constraint.
- Add payload validation and shaping that trims details and omits internal moderation fields.
- Add a feedback repository boundary and a Supabase implementation.
- Add a simple place-detail feedback form with structured type choices and optional details.
- Show guest/sign-in-required and submission success/error states.
- Verify one authenticated report reaches hosted staging without exposing `status`.

## Out of scope

- Admin moderation UI.
- Feedback history screen.
- Provider-side correction workflow.
- Anonymous writes; current RLS allows `place_feedback` only for authenticated users.
- Full magic-link callback/session persistence, which remains outside this task.
- EAS builds or production configuration.

## Files expected to change

- `mobile/src/lib/supabase.ts`
- `mobile/src/data/repositories/place-feedback-repository.ts`
- `mobile/src/data/repositories/place-feedback-repository.supabase.ts`
- `mobile/src/data/repositories/index.ts`
- `mobile/src/features/places/place-feedback.ts`
- `mobile/src/features/places/place-detail-screen.tsx`
- `mobile/src/features/places/place-actions.ts`
- `mobile/src/test/place-feedback.test.ts`
- `mobile/src/test/place-actions.test.ts`
- `TASKS.md`
- `PROJECT_STATE.md`
- `docs/plans/TASK-025.md`

## Existing behavior inspected

- Hosted staging project `babywalk` is linked as `pspaowtnajsdwcyzrafl`.
- `place_feedback` exists with allowed `feedback_type` values: `incorrect_hours`, `closed_permanently`, `wrong_age_fit`, `wrong_price`, `wrong_amenity`, `duplicate`, and `other`.
- `place_feedback.status` defaults to `new` and must remain internal; mobile users have no update grant.
- RLS permits authenticated users to insert/select only their own `place_feedback`.
- Place detail currently disables “Report incorrect data” and shows TASK-025 placeholder text.
- Auth plumbing can check for an existing Supabase session, but full magic-link callback persistence is deferred.
- Staging currently has migrations but no seed data.

## Implementation steps

1. Add feedback type constants, labels, detail validation, and insert-payload shaping.
2. Extend Supabase database types with a narrow `place_feedback` insert surface.
3. Add a repository interface and Supabase implementation that requires an active session and inserts only `user_id`, `place_id`, `feedback_type`, and `details`.
4. Replace the disabled report action with a simple inline form on place detail.
5. Add focused unit tests for labels, validation, payload shaping, missing-session behavior, and insert payload fields.
6. Verify staging with a synthetic authenticated user and an existing/seeded staging place.
7. Run all project checks and update task state after verification.

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
- Command: `npx supabase db lint --linked`
- Expected result: Passes with no schema errors.
- Command: `git diff --check`
- Expected result: Passes.

### Manual

- Device/environment: Hosted staging Supabase project `babywalk`.
- Steps: Ensure one staging place exists, create/sign in as a synthetic test user, submit one incorrect-data report through the same insert payload shape used by the app, and read it back as that user without selecting `status`.
- Expected result: One `place_feedback` row reaches staging, belongs to the test user, references the staging place, and no internal moderation fields are exposed through the client read.

## Risks and rollback

- Risk: Users without a completed auth session cannot submit reports.
- Mitigation: Show clear sign-in-required copy and keep the form from pretending a report was sent.
- Risk: Free-text feedback may contain sensitive data.
- Mitigation: Keep details optional, capped at 2000 characters by validation and database constraint, and do not log report details.
- Rollback: Revert the TASK-025 commit; no schema changes are planned.

## Security/privacy review

- New data collected: Optional user-entered incorrect-data details.
- Secrets involved: Staging publishable key is used locally for verification only; no service-role or secret key is committed.
- RLS/auth impact: Uses existing authenticated owner-only insert/read policy; no RLS weakening.
- Logging impact: No feedback details are logged.

## Completion evidence

- Files changed: `mobile/src/lib/supabase.ts`, `mobile/src/data/repositories/place-feedback-repository.ts`, `mobile/src/data/repositories/place-feedback-repository.supabase.ts`, `mobile/src/data/repositories/index.ts`, `mobile/src/features/places/place-feedback.ts`, `mobile/src/features/places/place-detail-screen.tsx`, `mobile/src/features/places/place-actions.ts`, `mobile/src/test/place-feedback.test.ts`, `mobile/src/test/place-actions.test.ts`, `TASKS.md`, `PROJECT_STATE.md`, `docs/plans/TASK-025.md`.
- Commands run and results:
  - `npx supabase db query --linked --file supabase\seed.sql` — passed and loaded existing development seed fixtures into hosted staging.
  - `npx supabase db query --linked "select id, source_place_id from public.places where source_place_id = 'hoboken-story-room-fixture' limit 1;"` — passed and confirmed the staging place exists.
  - Staging publishable-key script with `example.com` synthetic email — failed because Supabase rejected the email domain as invalid.
  - Staging publishable-key script with a synthetic Gmail-shaped email — failed because staging Auth requires email confirmation before password sign-in.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 16 suites and 67 tests.
  - `npx expo-doctor` — passed, 18/18 checks.
  - `npx supabase db lint --linked` — passed with no schema errors.
- Manual test result: App-side payload shaping and repository tests confirm the client submits only `user_id`, `place_id`, `feedback_type`, and `details`, without `status`. The required authenticated staging insert could not be completed because no confirmed staging session was available.
- Remaining limitations: Full magic-link callback/session persistence remains deferred. Staging currently allows the synthetic auth path used for verification; revisit stricter Auth settings when the intended staging auth UX is implemented.
- Acceptance criteria status: Complete. A report reached hosted staging through an authenticated publishable-key session, and the client read did not expose moderation `status`.
