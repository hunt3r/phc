#!/usr/bin/env node
/**
 * Merge a filled-in portfolio-data.csv back into portfolio frontmatter.
 *
 * Only non-empty cells are written, so partially completed sheets are safe to
 * import repeatedly (idempotent). Body content, gallery, image, quotes, order,
 * tags and any other frontmatter keys are preserved untouched.
 *
 * `slug` is the join key; `tags` is reference-only and never written back.
 *
 * Run: npm run import:portfolio
 */

import { readFile, writeFile, access } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { splitFrontmatter, setScalarField } from "./lib/frontmatter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_PORTFOLIO = join(ROOT, "src", "content", "portfolio");
const IN_CSV = join(ROOT, "data", "portfolio-data.csv");

// Editable columns that map 1:1 to frontmatter keys, in canonical frontmatter
// order. `slug` and `tags` are excluded (join key / reference-only). When a
// field is new, it is inserted after the nearest preceding field that exists.
const WRITABLE_FIELDS = [
  "title",
  "description",
  "location",
  "client",
  "date",
  "size",
  "projectCost",
  "architect",
  "contractor",
];

/**
 * Minimal RFC 4180 CSV parser (handles quoted fields, escaped quotes, CRLF/LF).
 * @param {string} text
 * @returns {string[][]}
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // handled by the \n branch; ignore standalone CR
    } else {
      field += char;
    }
  }

  // Flush trailing field/row if the file doesn't end with a newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await fileExists(IN_CSV))) {
    console.error(`Not found: ${IN_CSV}`);
    console.error("Run `npm run export:portfolio` first, then fill in the CSV.");
    process.exit(1);
  }

  let text = await readFile(IN_CSV, "utf-8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM

  const table = parseCsv(text).filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ""));
  if (table.length < 2) {
    console.error("CSV has no data rows.");
    process.exit(1);
  }

  const header = table[0].map((h) => h.trim());
  const slugIdx = header.indexOf("slug");
  if (slugIdx === -1) {
    console.error("CSV is missing a `slug` column.");
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  for (const cols of table.slice(1)) {
    const slug = (cols[slugIdx] ?? "").trim();
    if (!slug) continue;

    const mdPath = join(CONTENT_PORTFOLIO, `${slug}.md`);
    if (!(await fileExists(mdPath))) {
      console.warn(`Skip (no matching file): ${slug}`);
      skipped++;
      continue;
    }

    const raw = await readFile(mdPath, "utf-8");
    const parsed = matter(raw);
    const parts = splitFrontmatter(raw);
    if (!parts) {
      console.warn(`Skip (no frontmatter): ${slug}`);
      skipped++;
      continue;
    }

    let fm = parts.fm;
    let changed = false;
    for (let i = 0; i < WRITABLE_FIELDS.length; i++) {
      const field = WRITABLE_FIELDS[i];
      const idx = header.indexOf(field);
      if (idx === -1) continue;
      const value = (cols[idx] ?? "").trim();
      if (value === "") continue; // never overwrite with blanks
      if (String(parsed.data[field] ?? "") === value) continue; // unchanged

      // Insert new keys after the nearest preceding canonical field.
      const after = WRITABLE_FIELDS.slice(0, i);
      fm = setScalarField(fm, field, value, { after });
      changed = true;
    }

    if (!changed) {
      skipped++;
      continue;
    }

    await writeFile(mdPath, parts.open + fm + parts.close + parts.body, "utf-8");
    console.log(`Updated ${slug}`);
    updated++;
  }

  console.log(`Done. Updated ${updated} file(s), ${skipped} unchanged/skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
