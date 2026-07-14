# SproutScout Development Pack

This repository is a planning and agent-instruction pack for building the SproutScout MVP with Claude Code or Codex. It deliberately starts with documentation rather than generated application code so that every technical decision remains visible and reversible.

## Folder map

```text
.
├── START_HERE.md              # First file for humans and agents
├── PRODUCT_SPEC.md            # Product scope and UX requirements
├── ARCHITECTURE.md            # Technical design and boundaries
├── DATABASE.md                # Data model and access-control plan
├── DEVELOPMENT_PLAN.md        # Milestones, gates, and rollout
├── TASKS.md                   # Atomic implementation backlog
├── PROJECT_STATE.md           # Current status and next task
├── CLAUDE.md                  # Persistent Claude Code instructions
├── AGENTS.md                  # Persistent Codex instructions
├── docs/
│   ├── AI_WORKFLOW.md         # How to use coding agents safely
│   ├── DEBUGGING.md           # New-developer debugging playbook
│   ├── DEPLOYMENT.md          # Environments and app-store path
│   ├── EXECPLAN_TEMPLATE.md   # Required plan for each task
│   ├── MONETIZATION.md        # Revenue sequencing
│   ├── SECURITY_PRIVACY.md    # Security and privacy baseline
│   └── plans/                 # One execution plan per task
├── templates/
│   ├── .env.example           # Environment-variable template
│   └── ci.yml                 # CI template to activate after scaffold
└── scripts/
    ├── doctor.ps1             # Windows prerequisite check
    └── doctor.sh              # macOS/Linux/WSL prerequisite check
```

## Development philosophy

1. **Vertical slices over infrastructure marathons.** Each milestone should create something visible and testable.
2. **Pure logic before AI.** Ranking and scheduling logic must be unit tested without a network connection.
3. **Provider adapters.** Google Places, weather, events, analytics, and LLM vendors stay behind small interfaces.
4. **Local-first debugging.** Mock data and a local Supabase environment must support most development.
5. **Three environments.** Local development, staging/internal beta, and production never share secrets or databases.
6. **Small agent tasks.** A normal task should fit in one coding session and one reviewable commit.
7. **Evidence before completion.** A task is not done because an agent says it is done; it is done when checks and acceptance criteria pass.

## Expected repository after TASK-002

```text
.
├── mobile/                    # Expo application
├── supabase/                  # Migrations, seed, Edge Functions
├── docs/
├── scripts/
└── ...planning files
```

Avoid a complex JavaScript monorepo tool at the beginning. Root-level helper scripts may be added later, but the app should remain understandable by entering `mobile/` and running normal Expo commands.

## Version policy

- Use the latest stable Expo project generator when the scaffold task is executed.
- Pin all resolved packages in `package-lock.json`.
- Pin the Node major version in `.nvmrc` after confirming the current Expo-supported LTS release.
- Do not perform broad dependency upgrades during feature work.
- Dependency upgrades require their own task, tests, and rollback point.

## Definition of a healthy local project

From a clean clone, a developer should be able to:

1. Run the doctor script.
2. copy the environment template;
3. install dependencies from the lockfile;
4. start local Supabase;
5. apply migrations and seed data;
6. launch the app in a development build;
7. run lint, type checking, unit tests, and database checks;
8. reproduce the same result without hidden dashboard-only changes.
