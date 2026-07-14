# CLAUDE.md — Project Instructions

## Mission

Build SproutScout as a reliable, explainable family outing planner. Optimize for a beginner maintainer, small reversible changes, privacy, and deterministic tests.

## Start every task

1. Read `PROJECT_STATE.md`.
2. Read the selected task in `TASKS.md`.
3. Read relevant product/architecture documents.
4. Create or update `docs/plans/TASK-XXX.md` from `docs/EXECPLAN_TEMPLATE.md`.
5. State assumptions in the plan; do not silently broaden scope.

## Scope discipline

- Work on exactly one numbered task unless the user explicitly changes scope.
- Do not begin the next task after finishing.
- Do not rewrite unrelated files.
- Do not perform broad dependency upgrades during feature work.
- Do not add a new production dependency when the platform or existing dependency can solve the problem simply.
- When a new dependency is necessary, document purpose, maintenance risk, alternatives, bundle/native impact, and removal path.

## Coding rules

- TypeScript strict mode; avoid `any`. If unavoidable at an external boundary, isolate and validate it.
- Keep route files thin.
- Put business rules in pure functions under `mobile/src/domain/`.
- Validate external input and provider responses.
- Do not expose provider response objects to UI components.
- Preserve `unknown` rather than converting missing data to false.
- Prefer explicit names and small functions over clever abstractions.
- Add comments for *why*, not for obvious syntax.
- Do not create generic frameworks before two concrete uses exist.
- Use US English in user-facing copy.

## Security and privacy

Never commit, print, or place in client code:

- service role keys;
- external provider secret keys;
- auth tokens;
- precise home coordinates;
- child names, exact birthdays, medical data, or raw family profiles;
- production database credentials.

All client-accessible tables require reviewed Row Level Security. Do not use `USING (true)` or equivalent broad policies without an explicit documented public-read requirement.

## AI rules

- The deterministic recommendation engine is the source of selection and reason codes.
- An LLM cannot invent or decide factual place attributes.
- LLM failure must have a deterministic fallback.
- Do not add an LLM API before its numbered task.

## Required verification

Run the commands relevant to changed code. Once available, the normal set is:

```bash
cd mobile
npm run format:check
npm run lint
npm run typecheck
npm test -- --runInBand
```

For database changes, also start/reset local Supabase and run database tests. For native configuration changes, create or run the appropriate development build and state what was manually verified.

Never claim a command passed if it was not run. If a command cannot run, include the exact blocker and the smallest next action.

## Debugging behavior

When fixing a bug:

1. Reproduce it.
2. Capture the exact error and environment.
3. Identify the smallest failing layer.
4. Add a failing test when practical.
5. Make the smallest fix.
6. Run regression checks.
7. Explain the root cause in plain language.

Do not hide errors with broad `try/catch`, empty catches, disabled lint rules, non-null assertions, or arbitrary delays.

## Database behavior

- Migrations are immutable after they have been applied beyond local development; create a new migration for fixes.
- Do not make dashboard-only schema changes.
- Include indexes for ownership/policy/filter columns when warranted.
- Preserve source and freshness metadata.
- Review external provider retention/licensing before storing fields.

## UI behavior

- Always implement loading, empty, error, and permission-denied states.
- Unknown facts must be labeled or omitted, not asserted.
- Do not use color alone to convey state.
- Use accessible labels and reasonable touch targets.
- Avoid premature visual polish that blocks core-flow completion.

## Completion report

At the end of a task, provide:

- files changed;
- behavior implemented;
- commands run and results;
- manual tests performed or still required;
- known limitations;
- security/privacy impact;
- exact next task, without starting it.

Then update `PROJECT_STATE.md` and the checkbox in `TASKS.md` only if acceptance criteria are met.
