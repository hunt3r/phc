#!/usr/bin/env node
/**
 * Backfill portfolio frontmatter with category inferred from tags.
 * Run: node scripts/backfill-category.mjs [--dry-run]
 * With --dry-run, only logs what would be written; no files are modified.
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const PORTFOLIO_DIR = join(ROOT, "src", "content", "portfolio");

/** Tag (lowercase) -> category label (as stored in frontmatter / Tina select) */
const TAG_TO_CATEGORY = {
  retail: "Retail",
  retailers: "Retail",
  "retail-property-development": "Retail",
  healthcare: "Healthcare",
  government: "Government",
  "multi-family": "Residential",
  office: "Office",
  institutional: "Institutional",
  "self-storage": "Self-Storage",
};

const dryRun = process.argv.includes("--dry-run");

function inferCategory(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return "Uncategorized";
  const lower = tags.map((t) => String(t).toLowerCase());
  for (const [tag, category] of Object.entries(TAG_TO_CATEGORY)) {
    if (lower.includes(tag)) return category;
  }
  return "Uncategorized";
}

async function main() {
  const files = await readdir(PORTFOLIO_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  let updated = 0;
  for (const file of mdFiles) {
    const path = join(PORTFOLIO_DIR, file);
    const raw = await readFile(path, "utf-8");
    const { data, content } = matter(raw);
    const existing = data.category;
    const inferred = inferCategory(data.tags ?? []);
    if (existing === inferred) continue;
    const next = { ...data, category: inferred };
    const out = matter.stringify(content, next, { lineWidth: 1000 });
    if (dryRun) {
      console.log(`${file}: category ${existing ?? "(none)"} -> ${inferred}`);
    } else {
      await writeFile(path, out);
      console.log(`${file}: category ${existing ?? "(none)"} -> ${inferred}`);
    }
    updated++;
  }
  console.log(dryRun ? `[dry-run] Would update ${updated} files.` : `Updated ${updated} files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
