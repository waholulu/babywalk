# AGENTS.md

## Repository purpose

SproutScout is an Expo/React Native family outing planner with Supabase backend. It prioritizes explainable deterministic recommendations, privacy, and beginner maintainability.

## Mandatory workflow

- Read `PROJECT_STATE.md` and the selected task in `TASKS.md`.
- Create `docs/plans/TASK-XXX.md` before editing.
- Implement only one numbered task.
- Keep changes small and review the final diff.
- Run all relevant checks; report commands truthfully.
- Update `PROJECT_STATE.md` only after verification.

## Architecture

- Thin routes in `mobile/app/`.
- Features under `mobile/src/features/`.
- Pure business logic under `mobile/src/domain/`.
- Persistence and network calls behind repositories/adapters.
- Supabase schema changes through committed migrations only.
- Provider secrets only in server-side secret storage.

## Code quality

- Strict TypeScript; no casual `any`.
- Validate external data.
- Preserve unknown values.
- Avoid unnecessary dependencies and abstractions.
- Add tests for business rules and bug fixes.
- Never suppress errors merely to make checks pass.

## Normal checks once scaffolded

```bash
cd mobile
npm run format:check
npm run lint
npm run typecheck
npm test -- --runInBand
```

Database changes also require local Supabase reset and policy tests. Native configuration changes require a development-build verification.

## Safety

Do not expose secrets, tokens, precise home location, child names, exact birthdays, medical data, or raw family profiles. Never weaken RLS to unblock development without an explicit reviewed requirement.
