import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const csvPath = resolve("docs/data/pilot_places.csv");
const text = readFileSync(csvPath, "utf8").trim();

const requiredColumns = [
  "slug",
  "name",
  "category",
  "city",
  "region",
  "source_url",
  "source_owner",
  "manually_reviewed_on",
  "source_freshness",
  "age_min_months",
  "age_max_months",
  "price_band",
  "indoor_outdoor",
  "verification_notes",
];

const allowedCategories = new Set([
  "library",
  "playground",
  "museum",
  "zoo",
  "farm",
  "park",
  "waterfront",
  "indoor_play",
  "community_center",
  "other",
]);

const allowedRegions = new Set(["NJ", "NY"]);
const allowedPriceBands = new Set(["free", "under_30", "paid", "unknown"]);
const allowedModes = new Set(["indoor", "outdoor", "mixed", "unknown"]);
const allowedFreshness = new Set(["manual_source_review"]);

const rows = parseCsv(text);
const header = rows[0] ?? [];
const records = rows.slice(1).map((row, index) => toRecord(header, row, index + 2));
const failures = [];

for (const column of requiredColumns) {
  if (!header.includes(column)) {
    failures.push(`Missing required column: ${column}`);
  }
}

if (records.length < 50 || records.length > 100) {
  failures.push(`Expected 50-100 places but found ${records.length}.`);
}

const slugs = new Set();
const categories = new Set();
const regions = new Set();

for (const record of records) {
  const rowLabel = `Row ${record.__line}`;
  const slug = record.slug;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    failures.push(`${rowLabel}: slug must be lowercase kebab case.`);
  }
  if (slugs.has(slug)) {
    failures.push(`${rowLabel}: duplicate slug "${slug}".`);
  }
  slugs.add(slug);

  for (const column of requiredColumns) {
    if (!record[column]) {
      failures.push(`${rowLabel}: ${column} is required.`);
    }
  }

  if (!allowedCategories.has(record.category)) {
    failures.push(`${rowLabel}: invalid category "${record.category}".`);
  }
  categories.add(record.category);

  if (!allowedRegions.has(record.region)) {
    failures.push(`${rowLabel}: invalid region "${record.region}".`);
  }
  regions.add(record.region);

  if (!allowedFreshness.has(record.source_freshness)) {
    failures.push(`${rowLabel}: invalid source_freshness "${record.source_freshness}".`);
  }

  if (!allowedPriceBands.has(record.price_band)) {
    failures.push(`${rowLabel}: invalid price_band "${record.price_band}".`);
  }

  if (!allowedModes.has(record.indoor_outdoor)) {
    failures.push(`${rowLabel}: invalid indoor_outdoor "${record.indoor_outdoor}".`);
  }

  if (!/^https?:\/\/[^\s]+$/i.test(record.source_url)) {
    failures.push(`${rowLabel}: source_url must be an http or https URL.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.manually_reviewed_on)) {
    failures.push(`${rowLabel}: manually_reviewed_on must be YYYY-MM-DD.`);
  }

  const minAge = Number(record.age_min_months);
  const maxAge = Number(record.age_max_months);
  if (!Number.isInteger(minAge) || !Number.isInteger(maxAge)) {
    failures.push(`${rowLabel}: age range must use integer months.`);
  } else if (minAge < 0 || maxAge > 120 || minAge > maxAge) {
    failures.push(`${rowLabel}: age range must be within 0-120 months and ordered.`);
  }

  if (record.verification_notes.length < 24) {
    failures.push(`${rowLabel}: verification_notes should be specific.`);
  }

  const searchable = Object.values(record).join(" ");
  if (containsSecretLikeValue(searchable)) {
    failures.push(`${rowLabel}: possible secret or token-like value found.`);
  }
}

if (categories.size < 7) {
  failures.push(`Expected at least 7 categories but found ${categories.size}.`);
}

for (const region of allowedRegions) {
  if (!regions.has(region)) {
    failures.push(`Expected at least one ${region} place.`);
  }
}

if (failures.length > 0) {
  console.error("Pilot place validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Pilot place validation passed: ${records.length} places, ${categories.size} categories, ${regions.size} regions.`,
);

function parseCsv(input) {
  const lines = input.split(/\r?\n/);
  return lines.map((line) => line.split(",").map((cell) => cell.trim()));
}

function toRecord(headerRow, row, line) {
  if (row.length !== headerRow.length) {
    failures.push(
      `Row ${line}: expected ${headerRow.length} columns but found ${row.length}. Avoid commas inside fields.`,
    );
  }

  const record = { __line: line };
  for (let index = 0; index < headerRow.length; index += 1) {
    record[headerRow[index]] = row[index] ?? "";
  }
  return record;
}

function containsSecretLikeValue(value) {
  return [
    /service[_-]?role/i,
    /supabase[_-]?access[_-]?token/i,
    /(?:password|secret|api[_-]?key|token)=/i,
    /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/,
  ].some((pattern) => pattern.test(value));
}
