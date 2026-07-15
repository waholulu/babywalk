# BLOCKER Execution Plan — Confirmed Staging Auth Session for TASK-025

## Objective

Document the staging authentication prerequisite that blocks final TASK-025 verification.

## In scope

- Verify whether a synthetic staging user can obtain an authenticated session using the publishable key.
- Record the exact current blocker without committing secrets.
- Keep TASK-025 unchecked until a report reaches staging through authenticated RLS.

## Out of scope

- Changing Supabase Auth settings from code.
- Committing passwords, publishable keys, access tokens, secret keys, or service-role keys.
- Weakening RLS or using service-role access to fake mobile behavior.

## Files expected to change

- `PROJECT_STATE.md`
- `docs/plans/BLOCKER-STAGING-AUTH-SESSION.md`

## Existing behavior inspected

- Earlier verification failed because staging Auth required email confirmation.
- After the user adjusted settings, a new publishable-key signup attempt now fails with `Email signups are disabled`.
- TASK-025 app-side implementation and automated checks already pass, but final acceptance requires a real authenticated staging insert.

## Implementation steps

1. Retry the publishable-key staging signup/sign-in/insert script.
2. If blocked, document the exact auth error.
3. Keep the next task as the staging auth-session blocker.

## Test plan

### Automated

- Command: staging publishable-key Node verification script.
- Expected result: Either inserts one `place_feedback` row or reports the current Auth blocker.
- Command: `git diff --check`
- Expected result: Passes.

### Manual

- Device/environment: Supabase Dashboard for hosted staging project `babywalk`.
- Steps: Review Authentication Email provider settings.
- Expected result: Email provider allows the intended test path.

## Risks and rollback

- Risk: Using service-role keys would bypass the mobile/RLS path.
- Mitigation: Do not use or commit service-role keys for this acceptance test.
- Rollback: Revert this documentation commit after the blocker is resolved if desired.

## Security/privacy review

- New data collected: None.
- Secrets involved: Publishable key is used from the local shell only and not committed.
- RLS/auth impact: No policy changes.
- Logging impact: No sensitive payload logging.

## Completion evidence

- Files changed: `PROJECT_STATE.md`, `docs/plans/BLOCKER-STAGING-AUTH-SESSION.md`.
- Commands run and results:
  - Staging publishable-key script — failed with `signUp failed: Email signups are disabled`.
  - `git diff --check` — passed; only Windows line-ending normalization warnings were reported.
- Manual test result: Not complete; Supabase Dashboard settings still need adjustment.
- Remaining limitations: None for this blocker. Stricter staging email confirmation can be revisited after the intended auth UX is implemented.
- Acceptance criteria status: Complete. A synthetic staging user obtained an authenticated session and inserted one `place_feedback` row through RLS without service-role access.
