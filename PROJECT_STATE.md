# Project State

**Working name:** SproutScout  
**Current phase:** Phase 1 — App shell and developer experience  
**Last completed task:** TASK-015 — Build recommendation results
**Next task:** TASK-016 — Build place detail screen
**Last updated:** 2026-07-14

## Current facts

- The MVP product scope and architecture are documented.
- The pilot geography is North Jersey + NYC.
- `mobile/` contains an Expo SDK 54 + React Native + TypeScript starter with Expo Router.
- No external API is required for the first local recommendation slice.
- The working name has not received trademark or domain clearance.
- Node major is pinned to 22 in `.nvmrc`.
- The Expo starter currently uses `mobile/src/app` as the Expo Router root.
- `mobile/` has passing local quality commands for format, lint, type checking, and Jest tests.
- GitHub Actions CI is active for pushes to `main` and pull requests.
- TASK-005 verified Expo Go as the initial physical-device path for the Windows beginner workflow; EAS development builds are deferred until a required native dependency is unsupported by Expo Go or native release testing begins.
- The app was aligned to Expo SDK 54 because the user's fully updated iPhone Expo Go app could not run the scaffolded SDK 57 project while the SDK 57 iOS App Store Expo Go release was still unavailable.
- TASK-006 replaced the generated starter tabs with a simple Expo Router route skeleton for home, onboarding, results, place detail, day plan, saved, and settings.
- TASK-007 added shared theme tokens and UI primitives for screen containers, buttons, chips, cards, loading, empty, and error states.
- TASK-008 added dependency-free client environment validation for `EXPO_PUBLIC_APP_ENV`, a safe configuration error screen, and `mobile/.env.example`.
- TASK-009 added provider-neutral domain models for family constraints, place candidates, weather snapshots, recommendation results, reason codes, warnings, score components, and confidence.
- TASK-010 added 18 local fixture place candidates and scenario coverage metadata for future filter/scoring tests.
- TASK-011 added a pure hard-filtering layer for recommendation candidates, including age, schedule, travel, budget, indoor/outdoor, blocked-place, and return-time exclusions.
- TASK-012 added a pure transparent 100-point scoring layer with component breakdowns, reason codes, warnings, confidence, deterministic sorting, and fixture snapshot coverage.
- TASK-013 added a pure diversity-selection step that prevents comparable top results from being near-duplicates by category or coarse area.
- TASK-014 replaced the home placeholder with a local mobile-first plan input form, validation helpers, accessibility labels/states, keyboard-friendly scrolling, reset behavior, and default values.
- TASK-015 connected local fixtures to the deterministic recommendation pipeline and replaced the results placeholder with three explainable recommendation cards.

## Environment inventory

| Item | Version/status | Notes |
|---|---|---|
| Operating system | Microsoft Windows NT 10.0.26200.0 | `scripts/doctor.ps1` ran under Windows PowerShell 5.1.26100.8655; interactive shell also reported PowerShell 7.5.8. |
| Git | 2.41.0.windows.3 | Git command is installed. `D:\github\babywalk` is initialized as a Git repository on branch `main`. |
| Node | v22.22.2 | Installed. Project pins Node major 22 in `.nvmrc`. |
| npm | 10.9.7 | Installed. `npx` also reports 10.9.7. |
| Docker | Missing | Needed for local Supabase. Temporary exception: continue through app scaffold/local fixture tasks without Docker; install Docker Desktop or document a reviewed cloud-backend exception before TASK-018. |
| iOS test path | Verified | iPhone 16 Pro on iOS 26.5 opened the app through Expo Go QR code in LAN mode, loaded the initial screen, and received a Fast Refresh text update. |
| Android test path | Not configured | `adb` and Android emulator commands are missing. Preferred initial path: physical Android device with Expo Go QR scan. |
| Expo account | Not required for TASK-005 | EAS CLI/account setup is deferred until TASK-027B or native release testing. |
| Supabase account | Not verified | Not needed until later staging work; local Supabase will require Docker. |
| GitHub repository | Connected | Remote `origin` points to `https://github.com/waholulu/babywalk.git`; default branch is `main`. |

## Open decisions

1. Whether iPhone 16 Pro on iOS 26.5 remains the primary development device.
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
TASK-005 — Establish physical-device Expo Go path.
```

```text
2026-07-14 — TASK-005
Summary:
Established the Windows beginner physical-device path using Expo Go. The original SDK 57 scaffold could not open on the user's fully updated iPhone Expo Go app because SDK 57 support was not yet available through the iOS App Store path, so the project was aligned to Expo SDK 54 and the generated starter was minimally adjusted for SDK 54-compatible APIs.
Commands/tests:
`npm install expo@~54.0.0` — succeeded and moved the project toward SDK 54.
`npx expo install --fix` — failed after identifying SDK 54-compatible target versions because the existing SDK 57 dependency tree created an npm peer-resolution conflict.
Removed generated `mobile/node_modules` and `mobile/package-lock.json`, then ran `npm install` — succeeded and regenerated the lockfile for SDK 54.
`npx expo-doctor` — passed 18/18 checks.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 1 test.
Manual verification:
Started the app with `npx expo start --clear` from `mobile/` and used LAN mode. The app opened from the Expo Go QR code on an iPhone 16 Pro running iOS 26.5. The initial screen loaded. Fast Refresh was verified by temporarily changing visible text from `get started` to `fast refresh check`, observing the phone update, and restoring the original text.
Known limitations:
Expo SDK 57 was deferred because the iOS App Store Expo Go app available on the user's device could not run it yet. EAS development builds, expo-dev-client, Apple signing, iOS device registration, and Android APK generation remain deferred to TASK-027B or native release testing.
Next task:
TASK-006 — Create route skeleton.
```

```text
2026-07-14 — TASK-006
Summary:
Created the first SproutScout route skeleton with placeholder screens for home, onboarding, results, place detail, day plan, saved, and settings. Replaced the generated starter tab/explore route with a simple Expo Router Slot layout and a shared placeholder screen component under `src/features/navigation`.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed after refreshing Expo Router generated route types.
`npm test -- --runInBand` — passed, 1 test.
`npx expo-doctor` — passed 18/18 checks.
Manual verification:
Started Expo web on port 8083 and verified HTTP 200 for `/`, `/onboarding`, `/results`, `/places/demo-place`, `/plan/demo-plan`, `/saved`, and `/settings`.
Known limitations:
All TASK-006 screens are placeholders only. Real onboarding inputs, recommendation results, place details, day-plan behavior, saved data, settings behavior, and polished UI primitives remain for later tasks.
Next task:
TASK-007 — Create theme and UI primitives.
```

```text
2026-07-14 — TASK-007
Summary:
Added shared theme tokens for color, spacing, typography, radii, and card shadows. Added reusable UI primitives for screen containers, buttons, chips, cards, loading states, empty states, and error states. Updated the placeholder route skeleton to use the new primitives as a lightweight preview without adding dependencies.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 1 test.
`npx expo-doctor` — passed 18/18 checks.
Manual verification:
Started Expo web on port 8083 and verified HTTP 200 for `/`, `/onboarding`, `/results`, `/places/demo-place`, `/plan/demo-plan`, `/saved`, and `/settings`.
Known limitations:
The primitives are intentionally simple. Final visual polish, icons, richer form controls, and feature-specific interaction states remain for later tasks.
Next task:
TASK-008 — Add environment validation.
```

```text
2026-07-14 — TASK-008
Summary:
Added dependency-free client environment validation for `EXPO_PUBLIC_APP_ENV` with allowed values `local`, `staging`, and `production`. Added `mobile/.env.example`, pure parser tests, and a configuration error screen that names missing or invalid variables without rendering raw values.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 4 tests.
`npx expo-doctor` — passed 18/18 checks.
Manual verification:
With `EXPO_PUBLIC_APP_ENV=local`, Expo web returned HTTP 200 for `/`, `/onboarding`, `/results`, `/places/demo-place`, `/plan/demo-plan`, `/saved`, and `/settings`. Without `EXPO_PUBLIC_APP_ENV`, Expo web returned HTTP 200 for `/` and rendered `Configuration needed`, `EXPO_PUBLIC_APP_ENV`, and `missing` without exposing raw values.
Known limitations:
Only `EXPO_PUBLIC_APP_ENV` is required now because Supabase and external providers are not configured yet. Supabase URL/anon-key and provider adapter validation are deferred to their own implementation tasks.
Next task:
TASK-009 — Define domain models.
```

```text
2026-07-14 — TASK-009
Summary:
Added provider-neutral domain models under `mobile/src/domain/` for shared primitives, family constraints, place candidates, weather snapshots, recommendation results, reason codes, warning codes, score components, and confidence levels. Added vocabulary tests for reason codes, score components, and provider-neutral naming.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 7 tests.
`npx expo-doctor` — passed 18/18 checks.
`rg -n "google|mapbox|openweather|yelp|foursquare|supabase|provider|api" mobile\src\domain` — found no matches.
Manual verification:
Reviewed domain files for provider-specific names and sensitive family fields. The models avoid child names, exact birth dates, medical details, and precise home addresses.
Known limitations:
Types only. Mock data, hard filters, scoring, diversity selection, and UI wiring remain for later tasks.
Next task:
TASK-010 — Create mock candidate dataset.
```

```text
2026-07-14 — TASK-010
Summary:
Added 18 local fixture place candidates under `mobile/src/data/fixtures/` using the provider-neutral `PlaceCandidate` type. The dataset covers varied North Jersey + NYC-style categories, areas, age ranges, price bands, indoor/outdoor modes, schedule windows, amenities, and explicit unknown values. Added scenario coverage metadata and dataset tests.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 11 tests.
`npx expo-doctor` — passed 18/18 checks.
`rg -n "description|google|mapbox|openweather|yelp|foursquare|provider|api|copyright" mobile\src\data\fixtures` — found no matches.
Manual verification:
Reviewed fixture records for obvious real-place factual claims, copied descriptions, sensitive family data, and provider-specific fields. Fixtures are explicitly labeled as local fixture data and contain no descriptions.
Known limitations:
Fixture data is not real curated data. It is only for local deterministic development and tests.
Next task:
TASK-011 — Implement hard filters.
```

```text
2026-07-14 — TASK-011
Summary:
Implemented pure hard filters for recommendation candidates under `mobile/src/domain/recommendation/`. The filter returns included candidates plus excluded candidate IDs with hard-filter codes for age range, schedule conflict, travel too far, over budget, indoor/outdoor mismatch, blocked place, and impossible return time. Unknown or missing values are preserved as non-excluding unless another known value proves incompatibility.
Commands/tests:
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 5 test suites and 22 tests.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Reviewed the implementation and unit tests for inclusive boundaries, unknown age, unknown price, unknown indoor/outdoor mode, unknown travel, missing schedule, missing visit duration, blocked places, and multi-code exclusions. No physical-device test was required because this task only changes pure domain logic.
Known limitations:
Schedule and return-time filtering are intentionally simple single-stop checks. Rich one- or two-stop planning remains for TASK-031.
Next task:
TASK-012 — Implement scoring.
```

```text
2026-07-14 — TASK-012
Summary:
Implemented pure recommendation scoring under `mobile/src/domain/recommendation/scoring.ts`. The scorer produces a 100-point component breakdown for age/activity fit, schedule fit, travel convenience, weather fit, budget fit, amenities confidence, novelty, and family preference. It also attaches deterministic reason codes, uncertainty warnings, confidence, and stable tie-breaking.
Commands/tests:
`npm test -- --runInBand src/test/scoring.test.ts -u` — passed and wrote/updated the scoring snapshot.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 6 test suites, 24 tests, and 1 snapshot.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Reviewed the fixture snapshot for complete score breakdowns, reason codes, warnings, confidence, and deterministic order. No device test was required because this task only changes pure domain logic.
Known limitations:
Scoring heuristics are intentionally early and local. Provider-backed travel/weather data, richer family history, and score tuning remain for later tasks.
Next task:
TASK-013 — Implement diversity selection.
```

```text
2026-07-14 — TASK-013
Summary:
Implemented pure diversity selection under `mobile/src/domain/recommendation/diversity.ts`. The selector takes already-scored recommendations and candidate metadata, then chooses a small result set while promoting comparable alternatives from unused categories and coarse areas. It preserves score order when diverse alternatives are not within the comparable-score threshold.
Commands/tests:
`npm test -- --runInBand src/test/diversity.test.ts` — passed, 3 tests.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 7 test suites, 27 tests, and 1 snapshot.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Reviewed the selector and tests for category diversity, location diversity, comparable-score threshold behavior, and deterministic ordering. No device test was required because this task only changes pure domain logic.
Known limitations:
Diversity uses category and coarse area metadata only. Map-distance clustering and richer similarity rules remain deferred until real data/provider work.
Next task:
TASK-014 — Build plan input form.
```

```text
2026-07-14 — TASK-014
Summary:
Replaced the home placeholder with a mobile-first local `PlanInputForm`. The form captures child age, coarse area, available window, nap start, max travel, budget, indoor/outdoor preference, energy level, stroller and bathroom requirements, and interests. Added pure validation helpers with tests, accessible labels/states, keyboard-friendly screen scrolling, reset behavior, and a local validated summary.
Commands/tests:
`npm test -- --runInBand src/test/plan-input.test.ts` — passed, 5 tests.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 8 test suites, 32 tests, and 1 snapshot.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Started Expo web on port 8084 with `EXPO_PUBLIC_APP_ENV=local`; `http://localhost:8084/` returned HTTP 200. The server was stopped afterward. The cleanup command matched and killed its own PowerShell process after printing the 200 result, so the shell command exit code was non-zero despite the successful HTTP response.
Known limitations:
Form submission only validates and shows a local ready summary. It does not yet generate recommendations, persist defaults, request location permission, or navigate to results.
Next task:
TASK-015 — Build recommendation results.
```

```text
2026-07-14 — TASK-015
Summary:
Added a local recommendation builder that applies hard filters, scoring, and diversity selection to mock place candidates with deterministic travel estimates and a local weather snapshot. Replaced the results placeholder with three recommendation cards showing place facts, travel estimate, price band, indoor/outdoor status, age fit, score, reason codes, warnings, confidence, source, and freshness. Added snapshot coverage for the canonical local scenario.
Commands/tests:
`npm test -- --runInBand src/test/recommendation-results.test.ts -u` — passed and wrote the canonical results snapshot.
`npm run format:check` — passed.
`npm run lint` — passed.
`npm run typecheck` — passed.
`npm test -- --runInBand` — passed, 9 test suites, 33 tests, and 2 snapshots.
`npx expo-doctor` — passed, 18/18 checks.
Manual verification:
Started Expo web on port 8085 with `EXPO_PUBLIC_APP_ENV=local`; `http://localhost:8085/results` returned HTTP 200. The server was stopped afterward.
Known limitations:
Results use a fixed local scenario and do not yet consume live home form input, persist preferences, fetch provider data, or implement place detail content.
Next task:
TASK-016 — Build place detail screen.
```

```text
2026-07-14 — TASK-005 SCOPE UPDATED
Summary:
Changed TASK-005 from EAS development-build setup to the lower-friction Expo Go physical-device workflow for Windows development. Deferred expo-dev-client, EAS Build, Apple signing, Android APK generation, and paid Apple Developer enrollment to a later EAS development-build migration task.
Commands/tests:
Documentation/task update only; no app commands required.
Manual verification:
Reviewed TASKS.md and PROJECT_STATE.md to ensure TASK-005 now requires Expo Go QR launch, Fast Refresh verification, LAN/Tunnel documentation, and physical device/OS recording.
Known limitations:
TASK-005 still requires user-side physical device verification. EAS development-build setup is deferred to TASK-027B.
Next task:
TASK-005 — Establish physical-device Expo Go path.
```
