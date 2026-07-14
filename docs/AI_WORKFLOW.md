# Working with Claude Code and Codex

## 1. Use the agent as an implementer, not an oracle

The repository documents are the source of scope and architecture. The coding agent may suggest changes, but a suggestion does not become a project decision until it is documented and reviewed.

## 2. Session size

A good agent session normally changes one coherent behavior and produces one commit. Examples:

- create a pure filter with tests;
- add one route and its states;
- add one migration and policy tests;
- fix one reproducible crash.

Bad session requests:

- “Build the MVP.”
- “Make the UI beautiful.”
- “Add all APIs.”
- “Refactor everything.”

## 3. Standard task prompt

```text
Read the repository instructions and current project state. Work only on
TASK-XXX. Create an ExecPlan before editing. Inspect existing code before
choosing an implementation. Keep the change small and beginner-friendly.
Run all relevant checks and update PROJECT_STATE.md only if acceptance criteria
pass. Do not begin another task.
```

## 4. Bug-fix prompt

```text
Investigate this bug without changing code first:

<exact symptom and error>

Environment:
<device, OS, app version, branch, last known working commit>

Reproduce it, identify the failing layer, and write the smallest plan. Add a
failing test when practical. Do not hide the error or change unrelated code.
After the fix, run regression checks and explain the root cause in plain English.
```

## 5. Review prompt

```text
Review the current diff against TASK-XXX, CLAUDE.md/AGENTS.md, and the product
acceptance criteria. Look specifically for incorrect assumptions, privacy or RLS
issues, unhandled loading/error/unknown states, provider coupling, missing tests,
and unnecessary dependencies. Do not edit until the findings are listed by
severity. Then fix only confirmed findings.
```

## 6. Deployment prompt

```text
Read docs/DEPLOYMENT.md. Prepare the <staging|production> release without
submitting anything yet. Verify environment separation, versioning, secrets,
database migrations, checks, rollback steps, and store configuration. Produce a
release checklist with pass/fail evidence. Do not use production credentials in
logs or source files.
```

## 7. When the agent gets stuck

Ask it to narrow the problem:

```text
Stop feature work. State the first failing command, exact error, likely layer,
and the smallest experiment that distinguishes the top two causes. Run only
that experiment and report the result.
```

## 8. Context management

- Keep `CLAUDE.md` and `AGENTS.md` short and durable.
- Put procedures in `docs/` or agent skills, not in giant instruction files.
- Update `PROJECT_STATE.md` after each completed task.
- Keep task-specific discoveries in its ExecPlan.
- When a repeated mistake occurs twice, add a concise permanent rule.

## 9. Git discipline

Before an agent edits:

```bash
git status
git branch --show-current
```

After checks:

```bash
git diff --check
git diff --stat
git diff
```

Commit only the selected task. Do not combine formatting of unrelated files, dependency upgrades, and feature work.

## 10. Agent hooks and automation

Deterministic checks such as formatting or forbidden-secret scanning may later be added as Claude Code hooks or CI actions. Start without complex hooks; add them only when the underlying commands are stable and cross-platform behavior is understood.

A hook must never automatically deploy, delete data, submit an app, rotate credentials, or run destructive database commands.
