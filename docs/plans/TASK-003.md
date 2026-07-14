# TASK-003 Execution Plan — Configure Quality Commands

## Objective

Make the scaffolded Expo app reliably checkable with local commands for formatting, linting, type checking, and unit tests, including one first passing test.

## In scope

- Add `typecheck`, `test`, and `format:check` scripts to `mobile/package.json`.
- Keep the existing `lint` script.
- Add Jest configuration using Expo's recommended `jest-expo` preset.
- Add Prettier for format checking.
- Add a small beginner-friendly pure TypeScript module and unit test.
- Run all quality commands locally and update task documentation after verification.

## Out of scope

- CI wiring; that is TASK-004.
- Broad formatting churn across generated files unless required for `format:check`.
- React Native Testing Library component tests; those can wait until product UI exists.
- Product routes, domain recommendation models, or app behavior changes.

## Files expected to change

- `mobile/package.json`
- `mobile/package-lock.json`
- `mobile/jest.config.js`
- `mobile/.prettierignore`
- `mobile/src/test/smoke.ts`
- `mobile/src/test/smoke.test.ts`
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-003.md`

## Existing behavior inspected

- Read `PROJECT_STATE.md`, selected `TASK-003` in `TASKS.md`, `mobile/package.json`, `mobile/tsconfig.json`, and `mobile/eslint.config.js`.
- Confirmed `mobile/package.json` currently has `lint` only among requested quality scripts.
- Confirmed TypeScript is already strict in `mobile/tsconfig.json`.
- Checked Expo's current unit testing docs: Expo recommends Jest with the `jest-expo` preset for Expo projects, and Expo Router tests should live outside the app directory.

## Implementation steps

1. Install dev dependencies for Jest and Prettier.
2. Add quality scripts: `format:check`, `lint`, `typecheck`, and `test`.
3. Add minimal Jest config with `preset: "jest-expo"` and test file matching outside `src/app`.
4. Add a tiny pure TypeScript smoke module and test so Jest proves the setup works without native/device dependencies.
5. Add Prettier ignore entries for generated output and dependencies.
6. Run all required commands and fix only issues directly related to this setup.
7. Update `PROJECT_STATE.md`, check off `TASK-003`, and fill completion evidence.

## Test plan

### Automated

- Command: `cd mobile; npm run format:check`
- Expected result: Passes.

- Command: `cd mobile; npm run lint`
- Expected result: Passes.

- Command: `cd mobile; npm run typecheck`
- Expected result: Passes.

- Command: `cd mobile; npm test -- --runInBand`
- Expected result: Passes with the first smoke test.

### Manual

- Device/environment: Local Windows machine.
- Steps: Inspect scripts and test placement.
- Expected result: Quality commands are discoverable from `mobile/package.json`, and tests are outside the Expo Router app directory.

## Risks and rollback

- Risk: Jest setup may pull in dependencies that do not yet match Expo SDK 57.
- Mitigation: Use Expo's recommended `jest-expo` preset and keep the first test pure.
- Rollback: Remove the added dev dependencies, scripts, config, and smoke test files.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/package.json`, `mobile/package-lock.json`, `mobile/jest.config.js`, `mobile/.prettierignore`, `mobile/tsconfig.json`, generated starter files formatted by Prettier, `mobile/src/test/smoke.ts`, `mobile/src/test/smoke.test.ts`, `PROJECT_STATE.md`, `TASKS.md`, `docs/plans/TASK-003.md`.
- Commands run and results: `npm install --save-dev jest jest-expo @types/jest prettier` succeeded; `npm install --save-dev @types/jest@29.5.14` aligned with Expo Doctor expectations; `npx prettier --write .` completed; `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`, and `npx expo-doctor` passed. `npm audit --audit-level=moderate` still failed on Expo's generated dependency chain with a breaking force-fix recommendation.
- Manual test result: Inspected package scripts, Jest config, Prettier ignore, TypeScript config, and verified the first test lives outside the Expo Router app directory.
- Remaining limitations: No root Git worktree, so no commit or normal `git diff` was possible. Audit advisories remain in transitive Expo tooling dependencies.
- Acceptance criteria status: All requested local quality commands exist and pass; strict TypeScript is configured; a first passing test exists.
