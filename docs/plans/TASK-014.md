# TASK-014 Execution Plan — Build Plan Input Form

## Objective

Replace the home placeholder with a mobile-first “Plan today” input form that captures the core local recommendation constraints with validation, accessible controls, reset behavior, and beginner-friendly defaults.

## In scope

- Home screen plan input form.
- Child age, available window, max travel, budget, indoor/outdoor preference, energy level, coarse area, nap time, stroller, bathroom, and interests inputs.
- Local validation for required and bounded fields.
- Accessible labels, roles, states, and hints for controls.
- Keyboard-friendly text/number inputs.
- Reset behavior back to default values.
- No feature navigation or recommendation generation yet.

## Out of scope

- Persisting defaults to storage.
- Wiring the form to hard filters, scoring, diversity, or results.
- Location permission flow.
- Supabase or backend calls.
- Full onboarding.

## Files expected to change

- `mobile/src/features/plan-input/plan-input-form.tsx`
- `mobile/src/features/plan-input/plan-input-validation.ts`
- `mobile/src/features/plan-input/index.ts`
- `mobile/src/app/index.tsx`
- `mobile/src/components/ui/screen-container.tsx`
- `mobile/src/test/plan-input.test.ts`
- `docs/plans/TASK-014.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` requires home screen inputs with validation, keyboard behavior, screen reader labels, validation, and reset behavior.
- `PROJECT_STATE.md` shows TASK-013 complete and TASK-014 next.
- `mobile/src/app/index.tsx` currently renders a placeholder home screen.
- Existing UI primitives include `ScreenContainer`, `Button`, `Chip`, and `Card`.
- Theme tokens are available in `mobile/src/constants/theme.ts`.

## Implementation steps

1. Add a feature-level `PlanInputForm` component with local state and defaults.
2. Add small validation helpers for numeric age/travel, time order, optional nap time, area, and interest length.
3. Render accessible inputs and segmented chip groups for quick choices.
4. Add reset behavior that restores defaults and clears validation/submitted preview.
5. Replace the home placeholder with the form.
6. Run all available mobile checks.
7. Update project state, mark TASK-014 complete only after verification, review diff, commit, push, and verify CI.

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

- Device/environment: Expo web local route check.
- Steps: Start Expo web and verify `/` returns HTTP 200 after replacing the placeholder.
- Expected result: Home route renders without server errors. Physical device QA remains optional because this task uses standard React Native controls only.

## Risks and rollback

- Risk: The first form may need UX tuning once connected to results.
- Mitigation: Keep state local, controls simple, and no persistence side effects.
- Rollback: Revert the TASK-014 commit.

## Security/privacy review

- New data collected: None persisted or sent. The form stores temporary local component state only.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/app/index.tsx`, `mobile/src/components/ui/screen-container.tsx`, `mobile/src/features/plan-input/plan-input-form.tsx`, `mobile/src/features/plan-input/plan-input-validation.ts`, `mobile/src/features/plan-input/index.ts`, `mobile/src/test/plan-input.test.ts`, `docs/plans/TASK-014.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results:
  - `npm test -- --runInBand src/test/plan-input.test.ts` — passed, 5 tests.
  - `npm run format:check` — passed.
  - `npm run lint` — passed.
  - `npm run typecheck` — passed.
  - `npm test -- --runInBand` — passed, 8 test suites, 32 tests, and 1 snapshot.
  - `npx expo-doctor` — passed, 18/18 checks.
- Manual test result: Started Expo web on port 8084 with `EXPO_PUBLIC_APP_ENV=local`; `http://localhost:8084/` returned HTTP 200. The server was stopped afterward. The cleanup command killed its own PowerShell process after printing the 200 result, so the shell exit code was non-zero despite the successful HTTP response.
- Remaining limitations: Form submission only validates and shows a local ready summary. Results wiring, persistence, location permission, and recommendation generation remain later tasks.
- Acceptance criteria status: Complete. The home form includes keyboard-friendly inputs, accessible labels/states, validation, reset behavior, and default values.
