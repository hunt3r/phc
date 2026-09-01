#!/usr/bin/env node
/**
 * First-pass cleanup of portfolio `description` frontmatter for AI/SEO snippets.
 *
 * Deterministic and conservative: it strips embedded/trailing raw URLs and
 * markdown links, drops the boilerplate "Key Features:" label, and collapses
 * whitespace. It does NOT invent prose - the client can refine each description
 * via the exported CSV (npm run export:portfolio). Idempotent.
 *
 * Usage:
 *   npm run clean:descriptions          # write changes
 *   node scripts/clean-portfolio-descriptions.mjs --dry   # preview only
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { splitFrontmatter, setScalarField } from "./lib/frontmatter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_PORTFOLIO = join(ROOT, "src", "content", "portfolio");
const DRY_RUN = process.argv.includes("--dry");

/**
 * Clean a raw description string.
 * @param {string} input
 * @returns {string}
 */
function cleanDescription(input) {
  let text = String(input);

  // Markdown links: [label](url) -> label (drop when label is itself a URL).
  text = text.replace(/\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, (_m, label) =>
    /^https?:\/\//i.test(label.trim()) ? "" : label
  );

  // Bare URLs.
  text = text.replace(/https?:\/\/\S+/gi, "");

  // WordPress excerpt truncation markers, e.g. [...] or […].
  text = text.replace(/\[\s*(?:…|\.{2,})\s*\]/g, "");

  // Leading boilerplate label.
  text = text.replace(/^\s*key features?\s*:?\s*/i, "");

  // Collapse whitespace.
  text = text.replace(/\s+/g, " ").trim();

  // Tidy dangling separators, connectors and punctuation left after truncation.
  text = text.replace(/[\s/|,;.\-&]+$/g, "").trim();
  text = text.replace(/\s+(?:and|with|the|of|for|to|a|&)$/i, "").trim();

  return text;
}

async function main() {
  const files = (await readdir(CONTENT_PORTFOLIO)).filter((f) => f.endsWith(".md"));
  files.sort();

  let changed = 0;
  for (const file of files) {
    const path = join(CONTENT_PORTFOLIO, file);
    const raw = await readFile(path, "utf-8");
    const parsed = matter(raw);
    const current = parsed.data.description;
    if (typeof current !== "string" || current.trim() === "") continue;

    const cleaned = cleanDescription(current);
    if (cleaned === current || cleaned === "") continue;

    changed++;
    console.log(`\n${file}`);
    console.log(`  - ${current}`);
    console.log(`  + ${cleaned}`);

    if (!DRY_RUN) {
      const parts = splitFrontmatter(raw);
      if (!parts) {
        console.warn(`  ! could not parse frontmatter, skipping ${file}`);
        continue;
      }
      const fm = setScalarField(parts.fm, "description", cleaned);
      await writeFile(path, parts.open + fm + parts.close + parts.body, "utf-8");
    }
  }

  console.log(
    `\n${DRY_RUN ? "[dry run] " : ""}${changed} description(s) ${DRY_RUN ? "would be" : ""} cleaned.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
