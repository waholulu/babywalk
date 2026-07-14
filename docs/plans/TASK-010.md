# TASK-010 Execution Plan — Create Mock Candidate Dataset

## Objective

Add 15-20 varied pilot-market mock place candidates that future hard-filter, scoring, and UI tasks can use without network calls or external providers.

## In scope

- Add a fixture dataset under `mobile/src/data/fixtures/`.
- Use the provider-neutral `PlaceCandidate` domain type.
- Cover varied categories, locations, age ranges, indoor/outdoor modes, price bands, amenities, and known/unknown fields.
- Add scenario coverage metadata for future canonical tests.
- Add tests for fixture count, unique IDs, scenario coverage, unknown values, and category/price/mode variety.

## Out of scope

- Real curated place records.
- Long descriptions copied from websites.
- Provider IDs, provider payloads, scraping, maps, weather, or travel-time APIs.
- Recommendation filtering, scoring, or UI integration.

## Files expected to change

- `mobile/src/data/fixtures/place-candidates.ts`
- `mobile/src/data/fixtures/index.ts`
- `mobile/src/test/mock-candidates.test.ts`
- `PROJECT_STATE.md`
- `TASKS.md`
- `docs/plans/TASK-010.md`

## Existing behavior inspected

- `mobile/src/domain/place/types.ts` defines `PlaceCandidate`.
- There is no existing `mobile/src/data/` fixture dataset.
- TASK-010 acceptance requires 15-20 varied pilot fixtures with known/unknown fields and no copyrighted descriptions copied at length.

## Implementation steps

1. Create a fixture source object and 18 mock candidates for North Jersey + NYC-style outing scenarios.
2. Include varied categories such as library, playground, museum, zoo, farm, park, waterfront, indoor play, and community center.
3. Add explicit unknown values for age fit, price, indoor/outdoor mode, and amenities where useful.
4. Add scenario coverage metadata for future filters/scoring tests.
5. Add tests for count, unique IDs, scenario coverage, category variety, price variety, indoor/outdoor variety, and unknown field coverage.
6. Run all checks.
7. Update `PROJECT_STATE.md`, mark TASK-010 complete in `TASKS.md`, review diff, commit, push, and verify CI.

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
- Steps: Review fixture records for obvious real-place factual claims, copied descriptions, sensitive family data, and provider-specific fields.
- Expected result: Fixtures are local-style mock records only and contain no long copied descriptions, child data, provider IDs, or secrets.

## Risks and rollback

- Risk: Fictional fixture names may be mistaken for verified real-world facts.
- Mitigation: Keep source labels and file names explicitly fixture-oriented.
- Rollback: Revert the TASK-010 commit.

## Security/privacy review

- New data collected: None; mock fixture data only.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.
- Sensitive family data: None.

## Completion evidence

Fill after implementation:

- Files changed: `mobile/src/data/fixtures/place-candidates.ts`, `mobile/src/data/fixtures/index.ts`, `mobile/src/test/mock-candidates.test.ts`, `PROJECT_STATE.md`, `TASKS.md`, and this plan.
- Commands run and results: `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed; `npx expo-doctor` passed 18/18 checks; `rg -n "description|google|mapbox|openweather|yelp|foursquare|provider|api|copyright" mobile\src\data\fixtures` found no matches.
- Manual test result: Reviewed fixture records for obvious real-place factual claims, copied descriptions, sensitive family data, and provider-specific fields. Fixtures are explicitly labeled as local fixture data and contain no descriptions.
- Remaining limitations: Fixture data is not real curated data. It is only for local deterministic development and tests.
- Acceptance criteria status: Complete.
