# TASK-030 Execution Plan — Merge Curated and Provider Candidates

## Objective

Add a pure, deterministic merge step that combines curated and provider place candidates, removes duplicates, keeps curated data authoritative, and preserves provenance for every included candidate.

## In scope

- Define candidate merge inputs, output, duplicate records, and provenance metadata.
- Implement conservative duplicate detection using normalized name/area and near-coordinate matching.
- Prefer curated candidates when a provider candidate duplicates curated data.
- Keep unique provider candidates after curated candidates.
- Add unit tests for duplicates, source precedence, unique provider inclusion, and provenance.

## Out of scope

- Persisting provider candidates.
- Calling a provider or Edge Function from recommendation results.
- Field-level merge/fill behavior beyond provenance tracking.
- Manual curation workflow.
- UI changes.

## Files expected to change

- `mobile/src/domain/place/merge.ts`
- `mobile/src/domain/index.ts`
- `mobile/src/test/place-merge.test.ts`
- `TASKS.md`
- `PROJECT_STATE.md`

## Existing behavior inspected

Record relevant files, commands, and findings before editing.

- `TASKS.md` marks TASK-030 as next.
- `PlaceCandidate` has one primary `source`, so provenance should be returned alongside candidates rather than changing the core model.
- TASK-029 added provider candidates as internal `PlaceCandidate` records, which makes a pure merge step possible without provider raw objects.
- Existing recommendation code can continue using plain `PlaceCandidate[]`; merge integration into live results can happen later.

## Implementation steps

1. Add a pure merge module under `domain/place`.
2. Implement duplicate matching and curated-first precedence.
3. Preserve provenance and duplicate records separately from the candidate model.
4. Add focused Jest tests.
5. Run checks and update task/project docs after verification.

## Test plan

### Automated

- Command: `npm test -- --runInBand src/test/place-merge.test.ts`
- Expected result: Merge-specific tests pass.
- Command: `npm run format:check`
- Expected result: Pass.
- Command: `npm run lint`
- Expected result: Pass.
- Command: `npm run typecheck`
- Expected result: Pass.
- Command: `npm test -- --runInBand`
- Expected result: Full Jest suite passes.
- Command: `npx expo-doctor`
- Expected result: Pass.

### Manual

- Device/environment: Not required.
- Steps: Review diff and test output.
- Expected result: Pure domain merge has no runtime/device behavior.

## Risks and rollback

- Risk: Duplicate matching may be too aggressive.
- Mitigation: Require matching normalized names and either matching area label or near coordinates.
- Rollback: Remove the merge module and tests.

## Security/privacy review

- New data collected: None.
- Secrets involved: None.
- RLS/auth impact: None.
- Logging impact: None.

## Completion evidence

- Files changed: `mobile/src/domain/place/merge.ts`, `mobile/src/domain/index.ts`, `mobile/src/test/place-merge.test.ts`, `TASKS.md`, `PROJECT_STATE.md`.
- Commands run and results: `npm test -- --runInBand src/test/place-merge.test.ts` passed with 1 suite and 4 tests; `npm run format:check` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test -- --runInBand` passed with 21 suites and 88 tests; `npx expo-doctor` passed 18/18 checks.
- Manual test result: Reviewed the diff and test output. No device or Edge Function manual test was required because this is pure domain logic.
- Remaining limitations: Not wired into live recommendations yet; no persistence or field-level enrichment from provider duplicates.
- Acceptance criteria status: Met. Duplicate records are tested, curated-first precedence is tested, unique provider inclusion is tested, and provenance is preserved outside the core candidate model.
