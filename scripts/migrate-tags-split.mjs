#!/usr/bin/env node
/**
 * Split the portfolio `tags` reference list into two flat slug arrays:
 * `sectors` (tags whose root ancestor is `portfolio`) and `services` (tags
 * whose root ancestor is `services`). This backs the new native checkbox
 * multi-select fields in tina/config.ts.
 *
 * What it does:
 *  1. Reads every tag doc in src/content/tags to build a slug -> parent map and
 *     resolve each tag's root ancestor.
 *  2. For each portfolio .md, reads the existing `tags` (Tina reference objects
 *     or legacy plain strings), maps each to its slug, and buckets it into
 *     `sectors` or `services` by root ancestor.
 *  3. Writes `sectors` / `services` arrays and removes the old `tags` field.
 *  4. Logs any slug whose root is neither portfolio nor services (nothing is
 *     silently dropped).
 *
 * Usage:
 *   node scripts/migrate-tags-split.mjs           # dry-run (default)
 *   node scripts/migrate-tags-split.mjs --write   # apply changes
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORTFOLIO_DIR = join(ROOT, "src", "content", "portfolio");
const TAGS_DIR = join(ROOT, "src", "content", "tags");

const WRITE = process.argv.includes("--write");

function refToSlug(ref) {
  if (!ref || typeof ref !== "string") return "";
  const base = ref.split("/").pop() ?? ref;
  return base.replace(/\.(md|mdx|json)$/i, "");
}

/** Build slug -> { parent } from the tags collection. */
async function loadTagGraph() {
  const files = (await readdir(TAGS_DIR)).filter((f) => f.endsWith(".md"));
  const bySlug = new Map();
  for (const f of files) {
    const { data } = matter(await readFile(join(TAGS_DIR, f), "utf-8"));
    const slug = f.replace(/\.md$/, "");
    bySlug.set(slug, { slug, parent: refToSlug(data.parent ?? "") });
  }
  return bySlug;
}

/** Walk parents to the topmost ancestor (cycle-guarded). */
function rootOf(slug, bySlug) {
  let current = bySlug.get(slug);
  const seen = new Set([slug]);
  while (current?.parent && !seen.has(current.parent)) {
    seen.add(current.parent);
    const next = bySlug.get(current.parent);
    if (!next) return current.parent;
    current = next;
  }
  return current ? current.slug : slug;
}

async function main() {
  const bySlug = await loadTagGraph();
  const files = (await readdir(PORTFOLIO_DIR)).filter((f) => f.endsWith(".md"));

  const rewrites = [];
  const orphans = new Map(); // slug -> Set(portfolio file)

  for (const fileName of files) {
    const path = join(PORTFOLIO_DIR, fileName);
    const { data, content } = matter(await readFile(path, "utf-8"));

    const existing = Array.isArray(data.tags) ? data.tags : [];
    const slugs = existing
      .map((t) => refToSlug(typeof t === "string" ? t : t?.tag ?? ""))
      .filter(Boolean);

    const sectors = [];
    const services = [];
    for (const slug of slugs) {
      const root = rootOf(slug, bySlug);
      if (root === "portfolio") sectors.push(slug);
      else if (root === "services") services.push(slug);
      else {
        if (!orphans.has(slug)) orphans.set(slug, new Set());
        orphans.get(slug).add(fileName);
        // Keep orphans out of both buckets but do not lose them: default to
        // services so a curated tag review can re-home them later.
        services.push(slug);
      }
    }

    rewrites.push({ fileName, path, data, content, sectors, services });
  }

  console.log(`Portfolio files: ${rewrites.length}`);
  if (orphans.size) {
    console.warn(
      `\nTags whose root is neither 'portfolio' nor 'services' (defaulted to services):`
    );
    for (const [slug, inFiles] of orphans) {
      console.warn(`  ${slug}  (in ${inFiles.size} file(s))`);
    }
  }

  if (!WRITE) {
    console.log("\n[dry-run] No files written. Re-run with --write to apply.\n");
    for (const r of rewrites.slice(0, 10)) {
      console.log(
        `  ${r.fileName}  sectors -> [${r.sectors.join(", ")}]  services -> [${r.services.join(", ")}]`
      );
    }
    return;
  }

  let written = 0;
  for (const r of rewrites) {
    const next = { ...r.data };
    delete next.tags;
    if (r.sectors.length) next.sectors = r.sectors;
    else delete next.sectors;
    if (r.services.length) next.services = r.services;
    else delete next.services;
    const out = matter.stringify(r.content, next, { lineWidth: 1000 });
    await writeFile(r.path, out, "utf-8");
    written++;
  }
  console.log(`\nRewrote ${written} portfolio files.`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
