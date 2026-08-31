#!/usr/bin/env node
/**
 * Migrate the portfolio from categories to a first-class tags system.
 *
 * What it does (deterministic, offline - parses the scraped site nav):
 *  1. Reads the authoritative `ul.portfolio-menu` from a scraped portfolio page
 *     to learn which sections each project belongs to.
 *  2. Creates one tag document per tag in `src/content/tags/`:
 *       - the 7 sections get showInNav + order + content migrated from their
 *         "Overview" portfolio item (image/description/body),
 *       - every other existing tag gets a minimal, non-nav tag doc so that all
 *         Tina references resolve.
 *  3. Rewrites each portfolio `.md`: sets `tags` to the Tina reference format
 *     (union of section tags + existing tags), removes `category`.
 *  4. Removes the now-redundant "Overview" portfolio items.
 *
 * Usage:
 *   node scripts/migrate-tags.mjs            # dry-run (default), writes nothing
 *   node scripts/migrate-tags.mjs --write    # apply changes
 */

import { readdir, readFile, writeFile, mkdir, rm } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import * as cheerio from "cheerio";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORTFOLIO_DIR = join(ROOT, "src", "content", "portfolio");
const TAGS_DIR = join(ROOT, "src", "content", "tags");
const SCRAPED_PORTFOLIO_DIR = join(ROOT, "scraped", "portfolio");

const WRITE = process.argv.includes("--write");

/** Live nav section label -> { slug, order, label } for the tag doc. */
const SECTION_BY_LABEL = {
  Retail: { slug: "retail", order: 1, label: "Retail" },
  "Office/Warehouse": { slug: "office", order: 2, label: "Office/Warehouse" },
  Healthcare: { slug: "healthcare", order: 3, label: "Healthcare" },
  Government: { slug: "government", order: 4, label: "Government" },
  Institutional: { slug: "institutional", order: 5, label: "Institutional" },
  "Residential / Multi-Family": { slug: "residential", order: 6, label: "Residential" },
  "Self Storage": { slug: "self-storage", order: 7, label: "Self-Storage" },
};

/** section slug -> the "Overview" portfolio slug whose content seeds the tag doc (and is then removed). */
const OVERVIEW_BY_SECTION = {
  retail: "retail-property-development",
  office: "office-overview",
  healthcare: "healthcare-overview",
  government: "government-overview",
  institutional: "office-overview-2",
  residential: "residential-multi-family-overview",
  "self-storage": "custom-self-storage-development",
};

/** Cleanup applied to existing free-form tags. */
const TAG_ALIASES = { "multi-family": "residential" };
const TAG_DROP = new Set(["retail-property-development"]);

const OVERVIEW_SLUGS = new Set(Object.values(OVERVIEW_BY_SECTION));

function slugify(value) {
  if (!value || typeof value !== "string") return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleize(value) {
  return String(value)
    .trim()
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function slugFromHref(href) {
  try {
    const path = href.startsWith("http") ? new URL(href).pathname : href;
    return path.split("/").filter(Boolean).pop() || "";
  } catch {
    return "";
  }
}

function normalizeTag(slug) {
  const s = slugify(slug);
  return TAG_ALIASES[s] ?? s;
}

/** Find a scraped portfolio page that contains the portfolio nav menu. */
async function findNavHtml() {
  const dirs = await readdir(SCRAPED_PORTFOLIO_DIR, { withFileTypes: true });
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const file = join(SCRAPED_PORTFOLIO_DIR, d.name, "index.html");
    try {
      const html = await readFile(file, "utf-8");
      if (html.includes("portfolio-menu")) return { file, html };
    } catch {
      // no index.html in this folder; skip
    }
  }
  throw new Error("No scraped page containing 'portfolio-menu' was found.");
}

/** Parse the nav into sectionSlug -> Set(projectSlug). */
function parseSections(html) {
  const $ = cheerio.load(html);
  const sections = new Map();
  const unknownLabels = [];

  $("ul.portfolio-menu > li").each((_, li) => {
    const label = $(li).children("span").first().text().trim();
    const section = SECTION_BY_LABEL[label];
    if (!section) {
      if (label) unknownLabels.push(label);
      return;
    }
    const slugs = new Set();
    $(li)
      .find("ul.children a[href]")
      .each((__, a) => {
        const slug = slugFromHref($(a).attr("href"));
        if (slug) slugs.add(slug);
      });
    sections.set(section.slug, slugs);
  });

  return { sections, unknownLabels };
}

async function main() {
  const { file: navFile, html } = await findNavHtml();
  console.log(`Nav source: ${navFile.replace(ROOT + "/", "")}`);

  const { sections, unknownLabels } = parseSections(html);
  if (unknownLabels.length) {
    console.warn(`Unmapped nav sections (ignored): ${unknownLabels.join(", ")}`);
  }

  // projectSlug -> Set(sectionSlug), excluding the Overview items themselves.
  const projectSections = new Map();
  for (const [sectionSlug, slugs] of sections) {
    for (const slug of slugs) {
      if (OVERVIEW_SLUGS.has(slug)) continue;
      if (!projectSections.has(slug)) projectSections.set(slug, new Set());
      projectSections.get(slug).add(sectionSlug);
    }
  }

  const files = (await readdir(PORTFOLIO_DIR)).filter((f) => f.endsWith(".md"));
  const localSlugs = new Set(files.map((f) => f.replace(/\.md$/, "")));

  // Compute final tag set per portfolio file and collect the tag universe.
  const allTagSlugs = new Set(Object.values(SECTION_BY_LABEL).map((s) => s.slug));
  const fileTags = new Map(); // slug -> string[] of tag slugs
  const rewrites = []; // { slug, path, data, content, nextTags }

  for (const fileName of files) {
    const slug = fileName.replace(/\.md$/, "");
    if (OVERVIEW_SLUGS.has(slug)) continue; // handled separately (removed)

    const path = join(PORTFOLIO_DIR, fileName);
    const raw = await readFile(path, "utf-8");
    const { data, content } = matter(raw);

    const tagSet = new Set();
    for (const s of projectSections.get(slug) ?? []) tagSet.add(s);
    for (const existing of data.tags ?? []) {
      const norm = normalizeTag(typeof existing === "string" ? existing : existing?.tag ?? "");
      if (!norm || TAG_DROP.has(norm)) continue;
      tagSet.add(norm);
    }

    const nextTags = [...tagSet];
    for (const t of nextTags) allTagSlugs.add(t);
    fileTags.set(slug, nextTags);
    rewrites.push({ slug, path, data, content, nextTags });
  }

  // Build tag docs.
  const tagDocs = []; // { slug, frontmatter, body }
  for (const slug of [...allTagSlugs].sort()) {
    const section = Object.values(SECTION_BY_LABEL).find((s) => s.slug === slug);
    if (section) {
      const overviewSlug = OVERVIEW_BY_SECTION[slug];
      let description;
      let image;
      let body = "";
      try {
        const raw = await readFile(join(PORTFOLIO_DIR, `${overviewSlug}.md`), "utf-8");
        const parsed = matter(raw);
        description = parsed.data.description;
        image = parsed.data.image;
        body = parsed.content.trim();
      } catch {
        console.warn(`Overview file missing for section '${slug}': ${overviewSlug}.md`);
      }
      const frontmatter = { label: section.label, order: section.order, showInNav: true };
      if (description) frontmatter.description = description;
      if (image) frontmatter.image = image;
      tagDocs.push({ slug, frontmatter, body });
    } else {
      tagDocs.push({ slug, frontmatter: { label: titleize(slug), showInNav: false }, body: "" });
    }
  }

  // Report
  console.log(`\nSections parsed: ${sections.size}`);
  console.log(`Tag docs to create: ${tagDocs.length} (${tagDocs.filter((t) => t.frontmatter.showInNav).length} in nav)`);
  console.log(`Portfolio files to rewrite: ${rewrites.length}`);
  console.log(`Overview files to remove: ${OVERVIEW_SLUGS.size}`);

  const navSlugsMissingLocally = new Set();
  for (const slugs of sections.values()) {
    for (const slug of slugs) if (!localSlugs.has(slug)) navSlugsMissingLocally.add(slug);
  }
  if (navSlugsMissingLocally.size) {
    console.warn(`\nNav slugs with no local .md (skipped): ${[...navSlugsMissingLocally].join(", ")}`);
  }
  const uncategorized = rewrites.filter((r) => (projectSections.get(r.slug) ?? new Set()).size === 0);
  if (uncategorized.length) {
    console.warn(`\nProjects in no section (kept existing tags only): ${uncategorized.map((r) => r.slug).join(", ")}`);
  }

  if (!WRITE) {
    console.log("\n[dry-run] No files written. Re-run with --write to apply.");
    console.log("\nSample tag docs:");
    for (const t of tagDocs.slice(0, 8)) {
      console.log(`  ${t.slug}.md  ${JSON.stringify(t.frontmatter)}`);
    }
    console.log("\nSample portfolio rewrites:");
    for (const r of rewrites.slice(0, 8)) {
      console.log(`  ${r.slug}.md  tags -> [${r.nextTags.join(", ")}]`);
    }
    return;
  }

  // Write tag docs
  await mkdir(TAGS_DIR, { recursive: true });
  for (const t of tagDocs) {
    const out = matter.stringify(t.body ? `\n${t.body}\n` : "", t.frontmatter, { lineWidth: 1000 });
    await writeFile(join(TAGS_DIR, `${t.slug}.md`), out, "utf-8");
  }
  console.log(`\nWrote ${tagDocs.length} tag docs to src/content/tags/`);

  // Rewrite portfolio files
  for (const r of rewrites) {
    const next = { ...r.data };
    delete next.category;
    if (r.nextTags.length) {
      next.tags = r.nextTags.map((slug) => ({ tag: `src/content/tags/${slug}.md` }));
    } else {
      delete next.tags;
    }
    const out = matter.stringify(r.content, next, { lineWidth: 1000 });
    await writeFile(r.path, out, "utf-8");
  }
  console.log(`Rewrote ${rewrites.length} portfolio files`);

  // Remove Overview portfolio items
  let removed = 0;
  for (const overviewSlug of OVERVIEW_SLUGS) {
    const path = join(PORTFOLIO_DIR, `${overviewSlug}.md`);
    try {
      await rm(path);
      removed++;
    } catch {
      console.warn(`Could not remove ${overviewSlug}.md (already gone?)`);
    }
  }
  console.log(`Removed ${removed} Overview portfolio files`);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
