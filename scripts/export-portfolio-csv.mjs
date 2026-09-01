#!/usr/bin/env node
/**
 * Export portfolio frontmatter to a client-fillable CSV.
 *
 * Reads every markdown file in src/content/portfolio and writes portfolio-data.csv
 * at the repo root. Known values (title, location, description, tags) are pre-filled;
 * columns the client needs to complete (client, date, size, projectCost, architect,
 * contractor) are included and left blank when unknown.
 *
 * After the client fills it in, run `npm run import:portfolio` to merge values back.
 *
 * Run: npm run export:portfolio
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_PORTFOLIO = join(ROOT, "src", "content", "portfolio");
const DATA_DIR = join(ROOT, "data");
const OUT_CSV = join(DATA_DIR, "portfolio-data.csv");

// Order matters: this is the header row and the shape the importer expects.
// `slug` is the join key and must not be edited by the client.
// `tags` is reference-only (importer ignores it).
const COLUMNS = [
  "slug",
  "title",
  "location",
  "client",
  "date",
  "size",
  "projectCost",
  "architect",
  "contractor",
  "description",
  "tags",
];

/**
 * Escape a value for RFC 4180 CSV output.
 * @param {unknown} value
 * @returns {string}
 */
function csvEscape(value) {
  const str = value == null ? "" : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert a portfolio entry's tag references into a readable, comma-free string.
 * Tags are stored as [{ tag: 'src/content/tags/retail.md' }].
 * @param {unknown} tags
 * @returns {string}
 */
function formatTags(tags) {
  if (!Array.isArray(tags)) return "";
  return tags
    .map((t) => {
      const ref = t && typeof t === "object" ? t.tag : t;
      if (!ref || typeof ref !== "string") return "";
      const base = ref.split("/").pop() ?? ref;
      return base.replace(/\.(md|mdx|json)$/i, "");
    })
    .filter(Boolean)
    .join(" | ");
}

async function main() {
  const files = (await readdir(CONTENT_PORTFOLIO)).filter((f) => f.endsWith(".md"));
  files.sort();

  const rows = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = await readFile(join(CONTENT_PORTFOLIO, file), "utf-8");
    const { data } = matter(raw);

    rows.push({
      slug,
      title: data.title ?? "",
      location: data.location ?? "",
      client: data.client ?? "",
      date: data.date ?? "",
      size: data.size ?? "",
      projectCost: data.projectCost ?? "",
      architect: data.architect ?? "",
      contractor: data.contractor ?? "",
      description: data.description ?? "",
      tags: formatTags(data.tags),
    });
  }

  const lines = [COLUMNS.join(",")];
  for (const row of rows) {
    lines.push(COLUMNS.map((col) => csvEscape(row[col])).join(","));
  }

  // Prepend a UTF-8 BOM so Excel opens it with correct encoding.
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(OUT_CSV, "\ufeff" + lines.join("\r\n") + "\r\n", "utf-8");
  console.log(`Wrote ${rows.length} rows to ${OUT_CSV}`);
  console.log("Have the client fill in blank columns, then run: npm run import:portfolio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
