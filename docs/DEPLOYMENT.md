# Deployment and Release Guide

## 1. Release principle

A mobile release and a backend release are separate changes. Verify compatibility and sequence explicitly. Never assume that submitting a new mobile binary will immediately reach all users.

## 2. Environments

### Local

- local Supabase through CLI/Docker;
- local seed data;
- development-only diagnostics;
- mock external providers by default.

### Staging

- separate Supabase project;
- separate provider keys and quotas;
- separate application identifier/suffix when practical;
- internal EAS distribution or store test track;
- test accounts and non-production data.

### Production

- production Supabase project;
- restricted production keys;
- store application identifiers;
- monitoring and support;
- no debug screens or verbose sensitive logs.

## 3. Configuration model

Use app configuration and EAS profiles to select environment. The app must expose a non-sensitive environment label in development/settings so testers can confirm where they are connected.

Suggested profiles:

- `development`
- `preview` or `staging`
- `production`

Do not place secrets directly in `eas.json`, source files, screenshots, issue descriptions, or agent prompts.

## 4. Normal staging release

1. Confirm clean Git status and intended commit.
2. Confirm `PROJECT_STATE.md` and release task.
3. Run format, lint, typecheck, unit, database, and E2E smoke checks.
4. Apply migrations to staging.
5. Verify migration and RLS behavior in staging.
6. Build staging development/preview binary.
7. Test core flows on real iOS and Android devices.
8. Trigger deliberate error-monitoring test if configuration changed.
9. Record build version, backend migration, commit, test result, and known limitations.
10. Distribute to internal testers.

## 5. Production release order

Choose order based on compatibility:

- Backend-first changes must remain compatible with the currently released app.
- Mobile-first changes must tolerate the old backend until the backend change is deployed.
- Breaking changes require an expand/migrate/contract sequence rather than one destructive migration.

Recommended sequence:

1. deploy backward-compatible database/function changes;
2. verify production backend health;
3. submit/release mobile build;
4. wait for adoption and monitor;
5. remove deprecated fields/endpoints in a later release.

## 6. Database safety

Before production migration:

- review SQL and locks;
- confirm backups and recovery options;
- test on staging data shape;
- avoid destructive renames/drops in the same release that introduces replacements;
- prepare forward-fix or rollback SQL;
- record migration version.

If a migration has reached staging or production, do not edit its historical file. Add a new migration.

## 7. Mobile build and store path

Expo Application Services supports creating store-ready iOS/Android binaries and submitting them to app stores. Use development builds for normal production-grade development, then preview/internal distribution before production.

Required business accounts and platform agreements remain the owner’s responsibility. Store review, privacy questionnaires, age ratings, export/compliance questions, screenshots, and support URLs must be completed truthfully.

## 8. Over-the-air updates

Use over-the-air JavaScript updates only when the change is compatible with the installed native runtime. Native dependency/config changes require a new binary. Keep runtime/version policy explicit and test updates in staging first.

Never use an over-the-air update to bypass app-store review for behavior that platform rules require to be reviewed.

## 9. Rollback

### Mobile binary issue

- pause phased rollout when available;
- disable affected server-side feature if designed with a flag;
- publish a compatible rollback update only when runtime-safe;
- prepare and submit a fixed binary for native issues.

### Edge Function issue

- redeploy the last known good function;
- route to a deterministic fallback;
- disable the provider integration if necessary.

### Database issue

Prefer a forward fix. Use rollback only when explicitly tested and safe. Never restore production blindly without understanding writes after the backup point.

## 10. Release record template

```text
Release:
Date:
Git commit/tag:
Mobile version/build:
EAS profile:
Backend environment:
Database migrations:
Edge Functions:
Checks run:
Devices tested:
Known issues:
Rollback action:
Owner:
```

## 11. Pre-submission checklist

- [ ] Correct production name, icons, splash, identifiers, and version
- [ ] No development menu or score inspector in production
- [ ] Privacy policy and support URL reachable
- [ ] Data collection disclosures match code and SDKs
- [ ] Location permission copy explains purpose
- [ ] Account deletion path exists if accounts are offered and required by platform rules
- [ ] Provider attribution is correct
- [ ] All secrets are server-side/restricted
- [ ] Monitoring release is configured
- [ ] Core flow tested on physical devices
- [ ] Empty/offline/provider-failure states tested
- [ ] Store screenshots match current UI
- [ ] Rollback and support owner documented
