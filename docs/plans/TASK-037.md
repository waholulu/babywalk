# TASK-037 Execution Plan — Accessibility and Copy Audit

## Objective

Improve the critical mobile flows so they are easier to use with a screen reader and large text, while keeping uncertainty language clear and avoiding internal implementation codes in parent-facing copy.

## In scope

- Audit home, recommendation results, place detail, and day-plan UI.
- Fix obvious screen-reader role/label issues.
- Keep touch targets at least 44 px where interactive.
- Improve uncertainty/verification copy where internal codes leak into UI.
- Add a short audit note with what was checked and remaining manual checks.

## Out of scope

- Full screen-reader certification.
- Automated visual regression.
- New design system dependency.
- E2E automation.
- App-store accessibility review.

## Files expected to change

- `mobile/src/components/ui/chip.tsx`
- `mobile/src/features/recommendations/recommendation-results-screen.tsx`
- `mobile/src/features/places/place-detail-screen.tsx`
- `mobile/src/features/plans/day-plan-screen.tsx`
- `docs/testing/ACCESSIBILITY_COPY_AUDIT.md`
- `docs/plans/TASK-037.md`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `Button` already uses `accessibilityRole="button"` and a 48 px minimum height.
- `Chip` always renders as a pressable button with 36 px minimum height, even when used as static display metadata.
- Recommendation warnings render internal warning codes before the parent-facing message.
- Place detail action buttons have labels/hints, but feedback type buttons do not expose selected state.
- Day-plan timeline markers are visual structure and should not add noise to the accessibility tree.

## Implementation steps

1. Update `Chip` so non-interactive chips are static text/badges and interactive chips keep button semantics with a 44 px minimum touch target.
2. Make recommendation result action labels more specific and remove internal warning codes from visible copy.
3. Add selected accessibility state to feedback type buttons.
4. Hide decorative day-plan timeline markers from accessibility.
5. Add an audit note and run checks.

## Test plan

### Automated

- Command: `cd mobile; npm test -- --runInBand`
- Expected result: Full Jest suite passes.
- Command: `cd mobile; npm run format:check`
- Expected result: Prettier check passes.
- Command: `cd mobile; npm run lint`
- Expected result: ESLint passes.
- Command: `cd mobile; npm run typecheck`
- Expected result: TypeScript passes.
- Command: `cd mobile; npx expo-doctor`
- Expected result: Expo Doctor passes.

### Manual

- Device/environment: iPhone 16 Pro, iOS 26.5, Expo Go LAN mode.
- Steps: Use the TASK-036 checklist with VoiceOver and large text enabled.
- Expected result: Critical flows are understandable, controls are reachable, and verification/unknown copy is clear.

## Risks and rollback

- Risk: Changing shared `Chip` semantics could affect form controls.
- Mitigation: Preserve pressable/button behavior whenever an interaction handler is present.
- Rollback: Revert the shared `Chip` change and screen copy updates.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/components/ui/chip.tsx`, `mobile/src/features/recommendations/recommendation-results-screen.tsx`, `mobile/src/features/places/place-detail-screen.tsx`, `mobile/src/features/plans/day-plan-screen.tsx`, and `docs/testing/ACCESSIBILITY_COPY_AUDIT.md`.
- Commands run and results: `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed after deleting a corrupt generated `.expo/types/router.d.ts`; `npm test -- --runInBand` passed with 26 suites and 106 tests; `npx expo-doctor` passed 18/18 checks; `npx expo export --platform web` passed and generated 9 static routes.
- Manual test result: Physical-device VoiceOver and large-text checks are documented for iPhone 16 Pro on iOS 26.5 with Expo Go LAN mode, but were not run by Codex because the device is user-controlled.
- Remaining limitations: No automated screen-reader, focus-order, or contrast tooling was added. Expo web smoke through `expo start --web` did not become ready on port 54264 in the current shell, so static export was used as the web verification.
- Acceptance criteria status: Code-side accessibility and copy audit complete; remaining physical-device confirmation is captured in the manual checklist.
