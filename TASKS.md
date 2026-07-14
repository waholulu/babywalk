# Atomic Task Backlog

## Task rules

- Work on one task at a time.
- Every task gets `docs/plans/TASK-XXX.md` before implementation.
- Do not mark a task complete without command output or manual-test evidence.
- A failed prerequisite creates a new blocking task; do not improvise a large workaround.
- Keep commits small enough to revert independently.

## Foundation

- [x] **TASK-001 — Verify developer prerequisites**  
  Run the appropriate doctor script, document versions and missing tools in `PROJECT_STATE.md`, and create a safe `.gitignore`.  
  **Accept:** Git, Node/npm, and a viable mobile test path are documented. Docker is available or an explicit temporary cloud-backend exception is documented.

- [x] **TASK-002 — Scaffold Expo app**  
  Create `mobile/` using the current stable Expo TypeScript starter and Expo Router. Pin the Node major and lockfile.  
  **Accept:** Starter launches, and generated files are committed without unrelated customization.

- [x] **TASK-003 — Configure quality commands**  
  Add `lint`, `typecheck`, `test`, and `format:check`; configure strict TypeScript and a first passing test.  
  **Accept:** All commands pass locally.

- [x] **TASK-004 — Activate CI**  
  Adapt `templates/ci.yml` to the scaffold and add GitHub Actions.  
  **Accept:** CI passes on the default branch and a test pull request.

- [x] **BLOCKER — Initialize GitHub repository for TASK-004**  
  Initialize the project root as a Git repository, create/connect the GitHub remote, and make a default branch available for GitHub Actions verification.  
  **Accept:** `git status` works at `D:\github\babywalk`, a GitHub remote exists, and a test pull request can be opened for CI.

- [x] **TASK-005 — Establish physical-device Expo Go path**
  Verify the current app runs on at least one physical iOS or Android device using Expo Go, and document the beginner-friendly Windows workflow.  
  **Accept:** `npx expo start` runs, the app opens on a physical device from the Expo Go QR code, Fast Refresh is verified after changing visible text, LAN or Tunnel mode is documented, and the device/OS are recorded in `PROJECT_STATE.md`.

## App shell

- [x] **TASK-006 — Create route skeleton**
  Add onboarding, home, results, place detail, day plan, saved, and settings routes with placeholder content.  
  **Accept:** Every route is reachable without console errors.

- [x] **TASK-007 — Create theme and UI primitives**
  Add spacing, typography, radii, screen container, button, chip, card, loading, empty, and error components.  
  **Accept:** Components have simple tests or Storybook-equivalent preview only if it does not add major complexity.

- [x] **TASK-008 — Add environment validation**
  Parse client-safe environment variables and show a clear development error when missing.  
  **Accept:** Invalid configuration fails early without printing secrets.

## Domain and local vertical slice

- [x] **TASK-009 — Define domain models**
  Add `FamilyConstraints`, `PlaceCandidate`, `WeatherSnapshot`, `RecommendationResult`, reason codes, warnings, and confidence types.  
  **Accept:** No provider-specific type appears in domain models.

- [x] **TASK-010 — Create mock candidate dataset**
  Add 15–20 varied pilot fixtures with known/unknown fields.  
  **Accept:** Dataset covers all canonical test scenarios and contains no copyrighted descriptions copied at length.

- [ ] **TASK-011 — Implement hard filters**  
  Implement pure age, schedule, travel, budget, indoor/outdoor, blocked-place, and return-time filters.  
  **Accept:** Unit tests include boundaries and unknown values.

- [ ] **TASK-012 — Implement scoring**  
  Implement transparent component scores, reason codes, warnings, confidence, and deterministic tie-breaking.  
  **Accept:** Snapshot/fixture tests show complete score breakdowns.

- [ ] **TASK-013 — Implement diversity selection**  
  Prevent the top three from being near-duplicates when comparable alternatives exist.  
  **Accept:** Unit tests verify category/location diversity rules.

- [ ] **TASK-014 — Build plan input form**  
  Build the home screen inputs with validation and saved defaults.  
  **Accept:** Keyboard, screen reader labels, validation, and reset behavior work.

- [ ] **TASK-015 — Build recommendation results**  
  Connect local fixtures to domain logic and render three cards.  
  **Accept:** Canonical scenarios display expected reason codes and warnings.

- [ ] **TASK-016 — Build place detail screen**  
  Render structured data, source/freshness, verify-before-leaving text, and placeholder actions.  
  **Accept:** Unknown data is not displayed as a confident fact.

- [ ] **TASK-017 — Add development score inspector**  
  Add a development-only panel for score components and exclusion reasons.  
  **Accept:** It is absent from production builds.

## Backend

- [ ] **TASK-018 — Initialize local Supabase**  
  Create `supabase/`, config, and documented start/reset commands.  
  **Accept:** A new local database starts and resets reproducibly.

- [ ] **TASK-019 — Create initial schema migration**  
  Implement the reviewed subset of `DATABASE.md`, constraints, timestamps, and indexes.  
  **Accept:** Migration applies from empty database and rolls forward cleanly.

- [ ] **TASK-020 — Add RLS policies and tests**  
  Implement public curated reads and user-owned writes.  
  **Accept:** Automated cross-user tests prove isolation.

- [ ] **TASK-021 — Add seed import**  
  Load curated pilot data through versioned seed SQL or a documented import script.  
  **Accept:** Reset creates usable data with provenance/freshness fields.

- [ ] **TASK-022 — Add Supabase client and repositories**  
  Implement typed client initialization and place repository.  
  **Accept:** UI can switch between local fixtures and database implementation through an interface.

- [ ] **TASK-023 — Add optional authentication**  
  Add a low-friction parent sign-in path while preserving a usable guest flow.  
  **Accept:** Sign-out clears protected cache; guest input is not unexpectedly lost.

- [ ] **TASK-024 — Implement save/visit/block actions**  
  Add repository methods, optimistic UI only where safe, and error recovery.  
  **Accept:** User-owned data remains isolated and persists after restart.

- [ ] **TASK-025 — Implement incorrect-data feedback**  
  Add structured reporting and moderation state.  
  **Accept:** A report reaches staging database without exposing internal fields.

## Location and providers

- [ ] **TASK-026 — Implement location permission and fallback**  
  Request permission only when needed; support manual city/ZIP-area entry.  
  **Accept:** Denial, restricted permission, and unavailable GPS are handled.

- [ ] **TASK-027 — Add distance/travel abstraction**  
  Start with a simple estimate and interface that can accept a routing provider later.  
  **Accept:** Domain tests do not require maps or network.

- [ ] **TASK-027B — Migrate from Expo Go to an EAS development build**  
  Add `expo-dev-client`, EAS configuration, application identifiers/placeholders, and written build steps when Expo Go no longer supports a required native dependency or before native release testing.  
  **Accept:** A development build installs and runs on at least one real device, and the selected EAS profile/build steps are documented.

- [ ] **TASK-028 — Add weather Edge Function adapter**  
  Validate input/output, timeout, error mapping, and local mock.  
  **Accept:** Weather outage degrades gracefully.

- [ ] **TASK-029 — Add place-provider Edge Function adapter**  
  Keep secret key server-side, request only needed fields, normalize responses, and enforce cost limits.  
  **Accept:** Mobile receives internal schemas only; provider errors are bounded and logged.

- [ ] **TASK-030 — Merge curated and provider candidates**  
  Define deduplication and source precedence.  
  **Accept:** Duplicate records are tested and provenance is preserved.

## Day planning and quality

- [ ] **TASK-031 — Implement schedule planner**  
  Produce one- or two-stop plans with travel/activity buffers and return target.  
  **Accept:** No overlaps; impossible plans return an explicit no-plan result.

- [ ] **TASK-032 — Build day-plan UI**  
  Render timeline, assumptions, backup, and verification warnings.  
  **Accept:** User can return to results and modify constraints.

- [ ] **TASK-033 — Add personalization from history**  
  Use visits, likes, blocks, and membership preferences as bounded score inputs.  
  **Accept:** Personalization cannot override hard incompatibilities.

- [ ] **TASK-034 — Add analytics wrapper**  
  Define minimal events and prohibit precise location/child data.  
  **Accept:** Development log shows sanitized events; provider can be replaced.

- [ ] **TASK-035 — Add crash/error monitoring**  
  Configure staging and production, source maps, release naming, and privacy filters.  
  **Accept:** A deliberate staging test error is visible without sensitive payloads.

- [ ] **TASK-036 — Add critical E2E smoke tests**  
  Cover first launch, recommendation, place detail, and location-denied fallback.  
  **Accept:** Tests run on a documented device/emulator target.

- [ ] **TASK-037 — Accessibility and copy audit**  
  Review labels, focus order, contrast, dynamic text, touch targets, uncertainty language, and US English.  
  **Accept:** Critical flows are usable with a screen reader and large text.

## Release

- [ ] **TASK-038 — Create staging environment**  
  Separate Supabase project, secrets, EAS profile, and app identifier/suffix.  
  **Accept:** Staging build cannot accidentally write to production.

- [ ] **TASK-039 — Curate 50–100 pilot places**  
  Review source, freshness, categories, age fit, price, and verification notes.  
  **Accept:** Data-quality checklist passes and correction process is documented.

- [ ] **TASK-040 — Internal beta build**  
  Build and distribute to testers; document install and support flow.  
  **Accept:** At least one iOS and one Android tester completes the core flow.

- [ ] **TASK-041 — Privacy, terms, and store disclosures**  
  Finalize legal/business review and platform disclosures.  
  **Accept:** In-app links work and disclosures match actual data collection.

- [ ] **TASK-042 — Production readiness review**  
  Security, backup, rollback, monitoring, support, data freshness, and release checklist.  
  **Accept:** No critical open item; owner signs the checklist.

- [ ] **TASK-043 — Submit public MVP**  
  Produce store builds and submit with phased rollout/testing tracks where available.  
  **Accept:** Store review status is tracked and production monitoring is active.

## Post-MVP experiments

- [ ] **TASK-044 — Affiliate-link experiment**
- [ ] **TASK-045 — Paid-plan willingness test**
- [ ] **TASK-046 — Optional LLM copy adapter**
- [ ] **TASK-047 — Event ingestion pilot**
- [ ] **TASK-048 — Merchant sponsorship experiment with strict labeling**
