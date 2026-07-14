# TASK-007 Execution Plan — Create Theme and UI Primitives

## Objective

Add a small, beginner-friendly theme layer and reusable UI primitives that future app-shell and MVP screens can share without adding new production dependencies.

## In scope

- Expand theme tokens for colors, spacing, typography, radii, layout widths, and shadows.
- Add reusable screen container, button, chip, card, loading, empty, and error components.
- Keep components typed, accessible, and compatible with Expo Go.
- Update the existing route placeholders to use the new primitives as a lightweight preview.

## Out of scope

- Polished final visual design.
- Building real onboarding, recommendation, saved, place-detail, settings, or day-plan behavior.
- Adding Storybook, React Native Testing Library, icons, animation libraries, or production dependencies.
- Changing backend, auth, persistence, or domain logic.

## Files expected to change

- `mobile/src/constants/theme.ts`
- `mobile/src/components/themed-text.tsx`
- `mobile/src/components/themed-view.tsx`
- `mobile/src/components/ui/screen-container.tsx`
- `mobile/src/components/ui/button.tsx`
- `mobile/src/components/ui/chip.tsx`
- `mobile/src/components/ui/card.tsx`
- `mobile/src/components/ui/feedback-state.tsx`
- `mobile/src/components/ui/index.ts`
- `mobile/src/features/navigation/placeholder-screen.tsx`
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-007.md`

## Existing behavior inspected

- `theme.ts` currently contains basic light/dark colors, spacing, fonts, and layout constants from the Expo starter.
- `ThemedText` provides starter text variants but no shared typography token map.
- `ThemedView` maps a `ThemeColor` to a background color.
- TASK-006 placeholders use local styles and direct `Link` text instead of UI primitives.
- No extra UI dependencies are installed, and the project should stay dependency-free for this task.

## Implementation steps

1. Expand theme constants while preserving existing exports used by starter components.
2. Add `ScreenContainer`, `Button`, `Chip`, `Card`, `LoadingState`, `EmptyState`, and `ErrorState`.
3. Export the primitives from `components/ui/index.ts`.
4. Update placeholder route rendering to use `ScreenContainer`, `Card`, `Button`, and `Chip` as a lightweight preview.
5. Run formatting, lint, typecheck, tests, and Expo Doctor.
6. Run a route smoke check if practical.
7. Update `PROJECT_STATE.md`, mark TASK-007 complete in `TASKS.md`, review diff, commit, push, and verify CI.

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

- Command: `cd mobile; npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Expo web route smoke.
- Steps: Start Expo web and request the existing skeleton routes.
- Expected result: Routes render using the new primitives without route errors.

## Risks and rollback

- Risk: Over-designing the component layer before real app flows exist.
- Mitigation: Keep primitives small, typed, and focused on the explicit task list.
- Rollback: Revert the TASK-007 commit.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

Fill after implementation:

- Files changed: `mobile/src/constants/theme.ts`, `mobile/src/components/themed-text.tsx`, `mobile/src/components/ui/screen-container.tsx`, `mobile/src/components/ui/button.tsx`, `mobile/src/components/ui/chip.tsx`, `mobile/src/components/ui/card.tsx`, `mobile/src/components/ui/feedback-state.tsx`, `mobile/src/components/ui/index.ts`, `mobile/src/features/navigation/placeholder-screen.tsx`, and placeholder routes that preview loading, empty, and error states.
- Commands run and results: `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed; `npx expo-doctor` passed 18/18 checks.
- Manual test result: Started Expo web on port 8083 and verified HTTP 200 for `/`, `/onboarding`, `/results`, `/places/demo-place`, `/plan/demo-plan`, `/saved`, and `/settings`.
- Remaining limitations: Primitives are intentionally basic. Final visual polish, icons, form controls, and richer interaction states remain for later feature tasks.
- Acceptance criteria status: Complete.
