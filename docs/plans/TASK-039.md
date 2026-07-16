# TASK-039 Execution Plan — Curate 50–100 Pilot Places

## Objective

Create a beginner-reviewable pilot place curation package for North Jersey + NYC with 50–100 candidate places, explicit source/freshness fields, a data-quality checklist, and a correction process. This task prepares data for import but does not modify local or staging Supabase.

## In scope

- Add a versioned curation file for 50–100 pilot place candidates.
- Include source URL, source owner, review date, category, rough age fit, price band, indoor/outdoor mode, and verification notes for every row.
- Add a lightweight validation command that checks shape, counts, allowed values, URLs, and obvious privacy/secret mistakes.
- Document the manual data-quality checklist and correction workflow.
- Update project state and task checklist after verification.

## Out of scope

- Importing rows into local or hosted Supabase.
- Changing migrations, RLS, app code, or seed SQL.
- Claiming live hours, open/closed status, safety, crowding, cleanliness, or full accessibility.
- Adding paid/provider dependencies or scraping.

## Files expected to change

- `docs/plans/TASK-039.md`
- `docs/data/pilot_places.csv`
- `docs/data/PILOT_PLACE_CURATION.md`
- `scripts/validate-pilot-places.mjs`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

- `TASKS.md` says TASK-039 must review source, freshness, categories, age fit, price, and verification notes.
- `PRODUCT_SPEC.md` requires 50–100 manually reviewed pilot places and forbids invented hours, prices, accessibility, safety, or crowd claims.
- `DATABASE.md` and the initial schema show the later import target: `places` with category, age range, price band, indoor/outdoor, amenities, source, review timestamps, and verification notes.
- Existing seed data is intentionally fixture-only and not real pilot data.

## Implementation steps

1. Create a CSV curation package with 50–100 North Jersey + NYC place candidates and conservative review metadata.
2. Add documentation for checklist use, corrections, and field meanings.
3. Add a no-dependency validator for repeatable checks.
4. Run validation and documentation checks.
5. Update `PROJECT_STATE.md` and mark TASK-039 complete only after checks pass.

## Test plan

### Automated

- Command: `node scripts/validate-pilot-places.mjs`
- Expected result: validates row count, required fields, allowed values, URL shape, unique slugs, freshness, and no obvious secrets.

- Command: `git diff --check`
- Expected result: no whitespace errors.

### Manual

- Device/environment: Windows shell, repository docs.
- Steps: Review the curation document and sample rows for unsupported factual claims, source attribution, freshness, and import readiness.
- Expected result: The package is clearly marked as curated input for TASK-040 and does not claim live hours or facts that still need day-of verification.

## Risks and rollback

- Risk: Real-world place details can change or source URLs can move.
- Mitigation: Store review date, official/source URL, and verification notes; require import-time revalidation in TASK-040.
- Rollback: Revert the docs/data files and validator without affecting app code, database schema, or staging data.

## Security/privacy review

- New data collected: Public place candidates only.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

Fill after implementation:

- Files changed: `docs/data/pilot_places.csv`, `docs/data/PILOT_PLACE_CURATION.md`, `scripts/validate-pilot-places.mjs`, `docs/plans/TASK-039.md`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results: `node scripts/validate-pilot-places.mjs` passed with 69 places, 8 categories, and 2 regions; final whitespace checks are recorded in `PROJECT_STATE.md`.
- Manual test result: Reviewed the curation package for scope. It is marked as pre-import curated input, uses source URLs and review dates, and keeps day-of facts in verification notes instead of claiming live status.
- Remaining limitations: The validator checks URL shape rather than fetching every source. TASK-040 must re-check import mapping and any source URLs that will become live app records.
- Acceptance criteria status: Complete after final checks. The data-quality checklist passes and the correction process is documented.
