# TASK-009 Execution Plan — Define Domain Models

## Objective

Create provider-neutral TypeScript domain models for family constraints, place candidates, weather, recommendation results, reason codes, warnings, score components, and confidence.

## In scope

- Add pure domain types under `mobile/src/domain/`.
- Model unknown values explicitly where recommendation behavior depends on uncertainty.
- Export runtime constant lists for reason codes, warning codes, score components, and confidence values.
- Add small tests that verify the expected domain vocabularies exist and contain no provider-specific naming.

## Out of scope

- Mock candidate data.
- Filtering, scoring, diversity selection, or recommendation algorithms.
- Provider adapters, Supabase schema, persistence, UI rendering, or network calls.
- Real place facts or curated pilot records.

## Files expected to change

- `mobile/src/domain/common.ts`
- `mobile/src/domain/family/types.ts`
- `mobile/src/domain/place/types.ts`
- `mobile/src/domain/weather/types.ts`
- `mobile/src/domain/recommendation/types.ts`
- `mobile/src/domain/index.ts`
- `mobile/src/test/domain-models.test.ts`
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-009.md`

## Existing behavior inspected

- No `mobile/src/domain/` files exist yet.
- `PRODUCT_SPEC.md` defines hard filters, score components, reason codes, warnings, and confidence expectations.
- `ARCHITECTURE.md` requires pure domain logic under `src/domain/` and provider-specific data to stay behind adapters.
- TASK-009 acceptance requires no provider-specific type in domain models.

## Implementation steps

1. Add shared primitives for ISO timestamps, coordinates, source metadata, unknown booleans, time windows, age ranges, and money.
2. Add `FamilyConstraints` without child names, exact birth dates, medical details, or precise home address.
3. Add `PlaceCandidate` with structured facts and explicit unknown values.
4. Add `WeatherSnapshot` with provider-neutral weather fields.
5. Add recommendation score, reason, warning, confidence, and result types.
6. Add an index export and focused tests for vocabulary coverage/provider neutrality.
7. Run all checks.
8. Update `PROJECT_STATE.md`, mark TASK-009 complete in `TASKS.md`, review diff, commit, push, and verify CI.

## Test plan

### Automated

- Command: `cd mobile; npm run format:check`
- Expected result: Passes.

- Command: `cd mobile; npm run lint`
- Expected result: Passes.

- Command: `cd mobile; npm run typecheck`
- Expected result: Passes.

- Command: `cd mobile; npm test -- --runInBand`
- Expected result: Passes.

- Command: `cd mobile; npx expo-doctor`
- Expected result: Passes.

### Manual

- Device/environment: Code review.
- Steps: Inspect domain types for provider-specific names and sensitive child/family fields.
- Expected result: Domain models are provider-neutral and do not include child names, exact birthdays, medical data, or precise home addresses.

## Risks and rollback

- Risk: Modeling too much before real fixtures and filters exist.
- Mitigation: Keep fields broad but minimal, and leave algorithm behavior to later tasks.
- Rollback: Revert the TASK-009 commit.

## Security/privacy review

- New data collected: None; types only.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.
- Sensitive family data: Domain constraints avoid child names, exact dates of birth, medical details, and precise home addresses.

## Completion evidence

Fill after implementation:

- Files changed: `mobile/src/domain/common.ts`, `mobile/src/domain/family/types.ts`, `mobile/src/domain/place/types.ts`, `mobile/src/domain/weather/types.ts`, `mobile/src/domain/recommendation/types.ts`, `mobile/src/domain/index.ts`, `mobile/src/test/domain-models.test.ts`, `PROJECT_STATE.md`, `TASKS.md`, and this plan.
- Commands run and results: `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed; `npx expo-doctor` passed 18/18 checks; `rg -n "google|mapbox|openweather|yelp|foursquare|supabase|provider|api" mobile\src\domain` found no matches.
- Manual test result: Reviewed the domain files for provider-specific names and sensitive family fields. The models avoid child names, exact birth dates, medical details, and precise home addresses.
- Remaining limitations: Types only. Mock data, hard filters, scoring, diversity selection, and UI wiring remain for later tasks.
- Acceptance criteria status: Complete.
