# Development Plan

## Overview

The plan is organized around release gates rather than calendar promises. A solo beginner using coding agents should not move forward because a nominal week has passed; move forward when the acceptance gate is satisfied.

## Phase 0 — Product and environment readiness

### Outcome

A clean repository, reproducible tools, frozen MVP scope, and a curated pilot-data template.

### Work

- run prerequisite doctor script;
- initialize GitHub repository and branch protection basics;
- confirm working name is provisional;
- decide pilot geography boundaries;
- define 10 representative family scenarios;
- define the curated place CSV columns;
- create local/staging/production account inventory without sharing secrets in docs;
- select and document the currently supported Node LTS during scaffold.

### Gate

- repository is backed up remotely;
- all planning files are committed;
- developer can explain the MVP non-goals;
- no API subscription is required to begin UI and recommendation development.

## Phase 1 — App shell and developer experience

### Outcome

An Expo application that launches on a real phone and has reliable quality commands.

### Work

- scaffold `mobile/` with Expo and TypeScript;
- create development build configuration;
- add route skeletons;
- configure strict TypeScript, linting, formatting, and tests;
- add a neutral theme and reusable screen/layout components;
- activate CI;
- add environment parsing and a safe configuration screen for development.

### Gate

- clean install succeeds from the lockfile;
- iOS or Android real-device development build opens;
- `lint`, `typecheck`, and unit tests pass locally and in CI;
- no secret appears in source or built client configuration.

## Phase 2 — Local data and deterministic recommendation vertical slice

### Outcome

A user can enter constraints and receive three explainable recommendations from local mock/seed data.

### Work

- define domain types;
- create 15–20 representative mock places;
- implement hard filters;
- implement scoring and reason codes;
- write edge-case unit tests;
- build home input UI;
- build recommendation results UI;
- add a development-only score breakdown view.

### Gate

Given fixed input fixtures, the same candidates and scores are returned every time. Test cases cover age, schedule, distance, weather mode, budget, unknown data, and return-before-nap behavior.

## Phase 3 — Local Supabase and curated pilot database

### Outcome

The app reads pilot places from a reproducible local database and supports user-owned saved/visited data.

### Work

- initialize Supabase directory;
- create migrations and seed data;
- implement access policies;
- create repositories;
- add guest/local fallback or optional sign-in;
- add save, visited, block, and feedback actions;
- write database access tests.

### Gate

- local reset rebuilds the full backend;
- cross-user data access tests fail safely;
- the app works after the database is rebuilt from scratch;
- no production dashboard manual step is needed.

## Phase 4 — Location, weather, and provider adapters

### Outcome

Recommendations account for current area and weather without coupling domain logic to vendor payloads.

### Work

- location permission flow and manual fallback;
- rounded/coarse location storage;
- weather Edge Function adapter;
- place-provider adapter behind server-side secrets;
- request validation, timeouts, retry limits, and structured errors;
- cached/curated fallback behavior;
- cost logging and quotas.

### Gate

- denial of location permission does not block the app;
- provider outage does not crash the recommendation flow;
- external response schemas are validated;
- keys are not present in the mobile bundle;
- API requests have bounded field selection and cost controls.

## Phase 5 — Day planner and product polish

### Outcome

A parent can generate a realistic one- or two-stop morning plan and understand every assumption.

### Work

- schedule planner domain logic;
- travel and activity buffers;
- optional second stop only when confidence is sufficient;
- verification warnings;
- favorites/history personalization;
- empty, loading, offline, and error states;
- accessibility pass;
- analytics event definitions;
- crash reporting.

### Gate

- ten canonical family scenarios pass manual QA;
- the plan never schedules impossible overlaps;
- every fallback is usable;
- analytics contain no prohibited personal data;
- core screens meet basic screen-reader and touch-target expectations.

## Phase 6 — Expo Go staging and private pilot readiness

### Outcome

A staging-backed Expo Go workflow is strong enough for owner-operated QA and a very small private pilot with testers who can use Expo Go.

### Work

- separate staging Supabase project;
- import/review 50–100 pilot places;
- support contact and in-app feedback;
- privacy/support docs appropriate for a private non-store pilot;
- Expo Go staging QA on physical devices;
- pilot onboarding guide for Expo Go testers;
- weekly data-quality triage.

### Gate

- no unresolved critical security issue;
- incorrect-data reports can be resolved;
- recommendation usefulness is measured;
- Expo Go limitations are explicit;
- at least a meaningful subset of invited testers can complete the core flow.

## Phase 7 — Native staging beta and public MVP release

### Outcome

A narrowly scoped, supportable native beta progresses into app-store release only after the Expo Go + Supabase path proves the core product.

### Work

- EAS preview/staging profile and internal distribution;
- staging monitoring, source maps, release naming, and release channels;
- native staging builds for iOS and Android;
- production Supabase project and secrets;
- production build profile;
- final privacy disclosures;
- store screenshots and description;
- App Store/Play testing tracks;
- rollback instructions;
- support and incident checklist;
- phased release where available.

### Gate

- staging build matches production configuration except secrets/IDs;
- database migration is verified before mobile rollout;
- monitoring and support channel are active;
- release can be paused or rolled back.

## Phase 8 — Monetization experiments

Do not implement payments before repeated usage and recommendation quality are demonstrated.

Experiment order:

1. outbound affiliate links or tracked ticket referrals;
2. a small paid `SproutScout+` test for advanced planning or family sharing;
3. clearly labeled sponsored placements that cannot bypass safety/fit filters;
4. merchant tools only after enough parent demand exists.

Each experiment requires its own product hypothesis, metric, privacy review, and kill condition.

## Canonical manual test scenarios

Maintain fixtures and manual scripts for at least these cases:

1. 13-month-old, free, outdoor, 20-minute drive, home before 2 PM nap.
2. 3-year-old, rainy morning, indoor only, under $30.
3. 6-year-old, high-energy, weekend afternoon, 40-minute drive.
4. Location permission denied; manual ZIP/area used.
5. Weather provider unavailable.
6. Place hours unknown.
7. Only two valid places remain after filtering.
8. User has visited the highest-scoring place twice recently.
9. Stroller required but amenity is unknown.
10. No candidate can meet return-home target.

The expected behavior for each scenario belongs in tests or a versioned QA document, not in memory.
