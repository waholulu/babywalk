import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sourceName = "sproutscout_pilot_20260716";
const csvPath = resolve("docs/data/pilot_places.csv");
const outputPath = resolve("supabase/seeds/pilot_places_20260716.sql");
const isCheck = process.argv.includes("--check");

const csvText = readFileSync(csvPath, "utf8").trim();
const records = parseCsv(csvText);
const sql = buildSeedSql(records);

if (isCheck) {
  const current = readFileSync(outputPath, "utf8");
  if (current !== sql) {
    console.error(`${outputPath} is out of date. Run node scripts/build-pilot-place-seed.mjs.`);
    process.exit(1);
  }
  console.log(`Pilot place seed is current: ${records.length} places.`);
} else {
  writeFileSync(outputPath, sql);
  console.log(`Wrote ${outputPath} with ${records.length} places.`);
}

function parseCsv(input) {
  const lines = input.split(/\r?\n/);
  const header = lines[0].split(",").map((column) => column.trim());

  return lines.slice(1).map((line, index) => {
    const cells = line.split(",").map((cell) => cell.trim());
    if (cells.length !== header.length) {
      throw new Error(`Row ${index + 2} has ${cells.length} cells but expected ${header.length}.`);
    }

    return Object.fromEntries(header.map((column, columnIndex) => [column, cells[columnIndex]]));
  });
}

function buildSeedSql(records) {
  const values = records.map(formatPlaceValues).join(",\n");

  return `begin;\n\n` +
    `delete from public.places\n` +
    `where source = ${sqlString(sourceName)};\n\n` +
    `insert into public.places (\n` +
    `  source,\n` +
    `  source_place_id,\n` +
    `  name,\n` +
    `  category,\n` +
    `  description,\n` +
    `  address_text,\n` +
    `  website_url,\n` +
    `  indoor_outdoor,\n` +
    `  min_age_months,\n` +
    `  max_age_months,\n` +
    `  price_band,\n` +
    `  amenities,\n` +
    `  verification_notes,\n` +
    `  manually_reviewed_at,\n` +
    `  is_active\n` +
    `)\n` +
    `values\n` +
    `${values};\n\n` +
    `commit;\n`;
}

function formatPlaceValues(record) {
  const address = `${record.city}, ${record.region}`;
  const reviewTimestamp = `${record.manually_reviewed_on} 00:00:00-04`;
  const verificationNotes = `${record.verification_notes} Source owner: ${record.source_owner}.`;

  return `  (\n` +
    `    ${sqlString(sourceName)},\n` +
    `    ${sqlString(record.slug)},\n` +
    `    ${sqlString(record.name)},\n` +
    `    ${sqlString(record.category)},\n` +
    `    null,\n` +
    `    ${sqlString(address)},\n` +
    `    ${sqlString(record.source_url)},\n` +
    `    ${sqlString(record.indoor_outdoor)},\n` +
    `    ${sqlNumber(record.age_min_months)},\n` +
    `    ${sqlNumber(record.age_max_months)},\n` +
    `    ${sqlString(record.price_band)},\n` +
    `    '{"strollerFriendly": "unknown", "bathroomAvailable": "unknown", "parkingAvailable": "unknown"}'::jsonb,\n` +
    `    ${sqlString(verificationNotes)},\n` +
    `    ${sqlString(reviewTimestamp)},\n` +
    `    true\n` +
    `  )`;
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Expected integer but got ${value}.`);
  }
  return String(parsed);
}
