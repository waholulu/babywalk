# Pilot Place Curation

This folder holds the TASK-039 curated input package for the North Jersey + NYC pilot. It prepares places for TASK-040 import, but it is not the database seed yet.

## Files

- `pilot_places.csv` — 50–100 manually reviewed candidate places for the pilot geography.
- `scripts/validate-pilot-places.mjs` — no-dependency validation for the CSV shape and quality gates.

## Quality Checklist

Before a row is eligible for TASK-040 import:

- It has a unique stable `slug`.
- `name`, `category`, `city`, `region`, `source_url`, `source_owner`, `manually_reviewed_on`, `price_band`, `indoor_outdoor`, and `verification_notes` are present.
- `category` matches the existing database enum: `library`, `playground`, `museum`, `zoo`, `farm`, `park`, `waterfront`, `indoor_play`, `community_center`, or `other`.
- `region` is `NJ` or `NY`.
- `source_url` points to an official place, agency, library, park, museum, zoo, or venue source where possible.
- `manually_reviewed_on` records the day the source was checked.
- Age fit is expressed as a rough recommendation band, not a guarantee.
- `price_band` is conservative. Use `unknown` when the current admission or parking cost needs another source check.
- `indoor_outdoor` is conservative. Use `mixed` for venues where the recommended outing may use both indoor and outdoor areas.
- `verification_notes` explicitly tells the app or reviewer what to check before a parent leaves.
- The row does not claim live open status, exact hours, safety, cleanliness, crowd level, changing-table availability, or full accessibility.

## Field Notes

- `source_freshness` is `manual_source_review` for TASK-039 rows. The exact import timestamp will be added in TASK-040.
- `age_min_months` and `age_max_months` are planning hints for the deterministic recommender. They must remain broad unless an official source gives a clear age range.
- `price_band` follows the current app vocabulary: `free`, `under_30`, `paid`, or `unknown`.
- `verification_notes` should be parent-facing enough to become or inform the later “verify before leaving” copy.

## Correction Process

1. When a reviewer or tester finds a problem, record the place `slug`, the wrong field, the corrected value, the source URL, and the date checked.
2. Update `pilot_places.csv` only from a public source or direct venue confirmation. Do not use social posts or third-party snippets as the only source for hours, price, or age restrictions.
3. If the correction affects whether a place can be recommended today, change the row before importing or re-importing it.
4. Run `node scripts/validate-pilot-places.mjs`.
5. In TASK-040, import only rows that pass validation and have no unresolved correction notes.

## Import Readiness For TASK-040

TASK-040 should convert this CSV into local and staging Supabase records using a versioned import script. That task should also decide how to map:

- `slug` to `source_place_id`;
- `source_owner` and `source_url` into provenance metadata;
- broad age bands into `min_age_months` and `max_age_months`;
- unknown amenities into the existing `amenities` JSON object;
- `verification_notes` into parent-visible verification text.

No database password, Supabase access token, secret key, or service-role key belongs in this folder.
