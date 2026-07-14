# Security and Privacy Baseline

## 1. Audience design

SproutScout is an app for adults planning family activities. It is not designed for children to use independently. Product copy, onboarding, accounts, analytics, and store classification should consistently reflect that audience.

## 2. Data minimization

MVP should not collect:

- child legal name;
- exact date of birth;
- photos of children;
- medical diagnoses;
- school/daycare identity;
- precise home address;
- continuous background location;
- contacts;
- microphone/camera data.

Use age in months or age band, coarse home area, and one-time/current foreground location only when needed.

## 3. Location

- Ask only at the moment the user requests nearby recommendations.
- Explain the benefit before the system permission prompt.
- Provide manual area entry.
- Do not persist raw precise coordinates by default.
- Round or transform saved location where feasible.
- Do not include coordinates in analytics or general logs.

## 4. Authentication

- Keep the guest path useful.
- Use secure provider-supported auth flows.
- Do not store passwords directly.
- Clear protected query caches on sign-out.
- Implement account/data deletion before a public account-based launch when required.

## 5. Database

- Enable RLS on client-accessible tables.
- Write ownership policies for each action.
- Test User A versus User B.
- Keep admin/internal columns out of public views.
- Use service role only in trusted server-side contexts.
- Index ownership columns used in policies.

## 6. External APIs

- Put secret keys in server-side secret storage.
- Restrict keys by API, environment, and platform/IP where supported.
- Request only needed fields.
- Validate responses and set timeouts.
- Review caching, attribution, retention, and display requirements.
- Monitor quota and spend.

## 7. Logging and analytics

Allowed examples:

- app version;
- anonymous session/user ID;
- broad age band;
- broad metro area;
- reason codes;
- result count;
- provider success/failure;
- latency;
- sanitized error code.

Prohibited examples:

- auth tokens;
- API keys;
- precise coordinates/address;
- exact child age plus other identifying details in free text;
- raw feedback containing personal information without controls;
- full provider payloads.

## 8. User-generated feedback

Treat free text as potentially sensitive. Limit length, provide structured categories first, restrict internal access, and define retention/deletion handling.

## 9. Dependencies

Before adding an SDK, review:

- data collected automatically;
- native permissions;
- network destinations;
- privacy disclosure impact;
- maintenance and security record;
- whether a small internal wrapper can limit exposure.

## 10. Pre-beta review

- secret scan;
- RLS tests;
- dependency audit;
- permission review;
- analytics payload review;
- error-log redaction review;
- external API key restrictions;
- staging/production separation;
- privacy policy consistency;
- deletion/support process.

This file is an engineering baseline, not legal advice. Obtain qualified review for privacy, consumer protection, affiliate disclosures, trademarks, and platform compliance before public launch.
