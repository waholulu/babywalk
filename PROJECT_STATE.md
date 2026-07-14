# Project State

**Working name:** SproutScout  
**Current phase:** Phase 1 — App shell and developer experience  
**Last completed task:** TASK-004 — Activate CI  
**Next task:** TASK-005 — Configure development build  
**Last updated:** 2026-07-14

## Current facts

- The MVP product scope and architecture are documented.
- The pilot geography is North Jersey + NYC.
- `mobile/` contains the initial Expo SDK 57 + React Native + TypeScript starter with Expo Router.
- No external API is required for the first local recommendation slice.
- The working name has not received trademark or domain clearance.
- Node major is pinned to 22 in `.nvmrc`.
- The Expo starter currently uses `mobile/src/app` as the Expo Router root.
- `mobile/` has passing local quality commands for format, lint, type checking, and Jest tests.
- GitHub Actions CI is active for pushes to `main` and pull requests.

## Environment inventory

| Item | Version/status | Notes |
|---|---|---|
| Operating system | Microsoft Windows NT 10.0.26200.0 | `scripts/doctor.ps1` ran under Windows PowerShell 5.1.26100.8655; interactive shell also reported PowerShell 7.5.8. |
| Git | 2.41.0.windows.3 | Git command is installed. `D:\github\babywalk` is initialized as a Git repository on branch `main`. |
| Node | v22.22.2 | Installed. Expo SDK 57 requires Node 22.13.x minimum; project pins Node major 22 in `.nvmrc`. |
| npm | 10.9.7 | Installed. `npx` also reports 10.9.7. |
| Docker | Missing | Needed for local Supabase. Temporary exception: continue through app scaffold/local fixture tasks without Docker; install Docker Desktop or document a reviewed cloud-backend exception before TASK-018. |
| iOS test path | Not configured | Windows cannot run the iOS simulator. Viable path to document/confirm later: physical iPhone with Expo Go/development build. |
| Android test path | Not configured | `adb` and Android emulator commands are missing. Viable path to document/confirm later: physical Android device or Android Studio emulator before native/dev-build verification. |
| Expo account | Not verified | `eas` CLI is not installed. Needed for EAS/development build tasks. |
| Supabase account | Not verified | Not needed until later staging work; local Supabase will require Docker. |
| GitHub repository | Connected | Remote `origin` points to `https://github.com/waholulu/babywalk.git`; default branch is `main`. |

## Open decisions

1. Which real device will be the primary development device?
2. Whether guest mode remains fully local or uses anonymous authentication.
3. Which external place and weather providers will be used after the local slice.
4. Final product name after professional clearance.
5. Whether the first pilot is iOS-first or simultaneous iOS/Android.

## Known risks

- External place data costs and licensing can change.
- Local event data is fragmented.
- Family recommendations can lose trust quickly when hours or amenities are wrong.
- Coding agents may overbuild unless tasks remain atomic.
- App-store and privacy disclosures must match actual data behavior.

## Task completion log

```text
2026-07-14 — TASK-001
Summary:
Verified local developer prerequisites and reviewed the safe root .gitignore. Required commands Git, Node, npm, and npx are installed. Docker, adb, eas, and a Git worktree are not currently available/configured.
Commands/tests:
`powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\doctor.ps1` — passed required checks; reported Docker, adb, and eas as optional missing.
`git --version` — git version 2.41.0.windows.3.
`node --version` — v22.22.2.
`npm --version` — 10.9.7.
`npx --version` — 10.9.7.
`docker --version` and `docker info` — failed; Docker command is not installed.
`adb version` — failed; adb is not installed.
`eas --version` — failed; eas is not installed.
`git rev-parse --is-inside-work-tree` — failed; this folder is not a Git worktree.
Manual verification:
Reviewed `.gitignore`; it already ignores secrets, local env files, Node dependencies, Expo/React Native output, Supabase temp files, coverage/artifacts, editor files, OS files, and temporary agent files.
Known limitations:
Docker must be installed before local Supabase work unless a reviewed temporary cloud-backend exception is created. A physical iOS/Android device or Android emulator path still needs to be confirmed. Expo/EAS, Supabase account, and GitHub repository setup are not verified.
Next task:
TASK-002 — Scaffold Expo app.
```

```text
2026-07-14 — TASK-002
Summary:
Scaffolded `mobile/` with the Expo SDK 57 TypeScript starter and Expo Router, installed dependencies with `package-lock.json`, pinned Node major 22, removed the generated nested `mobile/.git`, and made two minimal starter compatibility fixes so lint and TypeScript pass.
Commands/tests:
`npx create-expo-app@latest mobile --template default@sdk-57 --yes` — succeeded and installed dependencies; npm reported 11 moderate audit findings in generated dependencies.
`npx expo-doctor` — passed 20/20 checks.
`npm run lint` — initially auto-installed ESLint packages and failed on generated `use-color-scheme.web.ts`; passed after replacing the hydration effect with `useSyncExternalStore`.
`npx tsc --noEmit` — initially failed on generated CSS imports; passed after adding CSS module declarations.
`npm audit --audit-level=moderate` — failed with 11 moderate `uuid` advisories through Expo's generated dependency chain; npm's force fix would install a breaking Expo downgrade, so no dependency change was made.
`npm run web -- --non-interactive --port 8083` — Metro started and reached `Waiting on http://localhost:8083`; the process was then stopped. Expo warned that `--non-interactive` is unsupported and recommends `CI=1`.
Manual verification:
Inspected generated `mobile/package.json`, `mobile/app.json`, `mobile/src/app/_layout.tsx`, `mobile/src/app/index.tsx`, `mobile/tsconfig.json`, and confirmed `package-lock.json` exists. Confirmed `mobile/.git` was removed so `mobile/` is not an accidental nested repository.
Known limitations:
Root `D:\github\babywalk` is still not a Git worktree, so changes could not be committed and `git diff` is unavailable. No iOS/Android device or emulator launch was performed. The starter still contains generic Expo app name/content; product route/content customization belongs to later tasks.
Next task:
TASK-003 — Configure quality commands.
```

```text
2026-07-14 — TASK-003
Summary:
Added local quality commands in `mobile/` for `format:check`, `lint`, `typecheck`, and `test`; configured Jest with `jest-expo`; added Prettier checking; and added a first pure TypeScript smoke test.
Commands/tests:
`npm install --save-dev jest jest-expo @types/jest prettier` — succeeded; npm reported the existing 11 moderate audit findings.
`npm install --save-dev @types/jest@29.5.14` — aligned Jest types with Expo SDK 57 after Expo Doctor reported the initially installed 30.0.0 version mismatch.
`npx prettier --write .` — formatted generated starter files and new config/test files once.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 1 test.
`npx expo-doctor` — passed 20/20 checks.
`npm audit --audit-level=moderate` — failed with 11 moderate `uuid` advisories through Expo's generated dependency chain; npm's force fix would install a breaking Expo package change, so no dependency change was made.
Manual verification:
Inspected `mobile/package.json`, `mobile/jest.config.js`, `mobile/.prettierignore`, `mobile/tsconfig.json`, and the smoke test placement under `mobile/src/test`.
Known limitations:
Root `D:\github\babywalk` is still not a Git worktree, so changes could not be committed and normal `git diff` remains unavailable. Audit advisories remain in transitive Expo tooling dependencies.
Next task:
TASK-004 — Activate CI.
```

```text
2026-07-14 — TASK-004
Summary:
Activated GitHub Actions CI for mobile quality checks on pushes to `main` and pull requests. Initialized the root Git repository, connected it to `https://github.com/waholulu/babywalk.git`, pushed `main`, opened test PR #1, and verified both CI contexts.
Commands/tests:
`git init -b main` — initialized the root repository.
`git remote add origin https://github.com/waholulu/babywalk.git` — connected the GitHub remote.
`npm run format:check` — passed locally.
`npm run lint` — passed locally.
`npm run typecheck` — passed locally.
`npm test -- --runInBand` — passed locally.
`git commit -m "Initialize SproutScout Expo scaffold"` — created initial commit `e35abd3`.
`git push -u origin main` — pushed `main`.
`gh run watch 29348932412 --repo waholulu/babywalk --exit-status` — push CI passed on `main`.
`gh pr create ...` — opened PR #1, `Validate CI workflow`.
`gh run watch 29349028561 --repo waholulu/babywalk --exit-status` — pull request CI passed.
Manual verification:
Reviewed `.github/workflows/ci.yml`; it runs `npm ci`, `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm test -- --runInBand` from `mobile/`.
Known limitations:
GitHub Actions reported a warning that `actions/checkout@v4` and `actions/setup-node@v4` target Node.js 20 and are being forced to run on Node.js 24 by GitHub-hosted runners. This does not fail CI.
Next task:
TASK-005 — Configure development build.
```
