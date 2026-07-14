# SproutScout — Start Here

> **Working name only:** `SproutScout`. Do not spend money on branding until an attorney or qualified search confirms trademark, domain, social-handle, and app-store availability.

SproutScout is a mobile-first family outing planner for English-speaking parents in the United States. The first pilot market is **North Jersey + New York City**.

The product answers one question:

> **What should we do with our child today?**

It should return a small number of practical, age-appropriate choices—or one ready-to-follow day plan—based on location, weather, schedule, budget, distance, and family preferences.

## Recommended build strategy

Do **not** ask Claude or Codex to “build the whole app.” Work through one numbered task at a time from `TASKS.md`.

For every task:

1. Read `CLAUDE.md` or `AGENTS.md`.
2. Read `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, and `PROJECT_STATE.md`.
3. Create an execution plan from `docs/EXECPLAN_TEMPLATE.md`.
4. Implement only the selected task.
5. Run the required checks.
6. Explain any remaining manual test.
7. Update `PROJECT_STATE.md` and check off `TASKS.md` only after verification.
8. Commit the change with a small, descriptive commit message.

## First prompt for Claude Code

```text
Read START_HERE.md, CLAUDE.md, PRODUCT_SPEC.md, ARCHITECTURE.md,
DEVELOPMENT_PLAN.md, TASKS.md, and PROJECT_STATE.md.

Work only on TASK-001. Before editing, create docs/plans/TASK-001.md using
EXECPLAN_TEMPLATE.md. Keep the implementation beginner-friendly. Do not add
production dependencies unless required. Run every verification command that
is currently available. At the end, update PROJECT_STATE.md with what changed,
commands run, results, known issues, and the exact next task.
```

## First prompt for Codex

```text
Follow AGENTS.md. Read the project specifications and current state. Execute
only TASK-001. Write an ExecPlan first, make the smallest complete change,
run checks, review the diff, and update PROJECT_STATE.md. Do not begin TASK-002.
```

## Important product decisions already made

- Mobile app: Expo + React Native + TypeScript.
- Backend: Supabase Postgres, Auth, Storage, and Edge Functions.
- The first recommendation engine is deterministic and fully testable.
- Large-language-model output is optional and must never invent place facts,
  operating hours, prices, accessibility, or safety claims.
- Start with curated local data; add external providers behind adapters.
- No social feed, chat, marketplace, live crowd prediction, or payments in MVP.
- Avoid collecting a child’s name, exact date of birth, medical information, or
  precise home address.
