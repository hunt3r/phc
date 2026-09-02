#!/usr/bin/env node
/**
 * Generate Netlify _redirects from scraped WordPress URLs.
 * Run: npm run generate:redirects
 */

import { readFile, writeFile, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MANIFEST = join(ROOT, "scraped", "manifest.json");
const TAXONOMY_DIR = join(ROOT, "scraped", "taxonomy");
const PORTFOLIO_DIR = join(ROOT, "src", "content", "portfolio");
const TAGS_DIR = join(ROOT, "src", "content", "tags");
const OUTPUT = join(ROOT, "public", "_redirects");

// Root tag types map to bespoke hub pages and a URL namespace for their leaves.
// Keep in sync with ROOT_ROUTES in src/lib/tags.ts.
const ROOT_HUB = { portfolio: "/portfolio", services: "/services" };
const ROOT_LEAF_BASE = { portfolio: "/portfolio", services: "/services" };
// Where to send a tag URL when the tag/root can't be resolved.
const TAG_FALLBACK = "/portfolio/";

const PAGE_REDIRECTS = {
  "about-us": "/about/",
  "our-portfolio": "/portfolio/",
  "welcome-to-phc": "/",
  "contact-us": "/contact/",
  "our-services": "/services/",
  "project-sectors": "/portfolio/",
  video: "/",
};

// Categories are retired; every /category/<slug> now redirects to /tags/<slug>.
const CATEGORY_TO_TAG = {
  "multi-family": "residential",
};

// Tags that were merged/renamed; old tag archive URLs redirect to the survivor.
const TAG_TO_TAG = {
  retailers: "retail",
};

// "Overview" portfolio items were merged into tag landing pages and removed.
const OVERVIEW_TO_TAG = {
  "retail-property-development": "retail",
  "office-overview": "office",
  "healthcare-overview": "healthcare",
  "government-overview": "government",
  "office-overview-2": "institutional",
  "residential-multi-family-overview": "residential",
  "custom-self-storage-development": "self-storage",
};

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

function addRule(rules, from, to) {
  const normalizedTo = to.endsWith("/") || to === "/" ? to : `${to}/`;
  for (const variant of [from, from.endsWith("/") ? from.slice(0, -1) : `${from}/`]) {
    const key = `${variant} -> ${normalizedTo}`;
    rules.set(key, `${variant} ${normalizedTo} 301!`);
  }
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf-8"));
}

async function loadNewTagSlugs() {
  const files = (await readdir(PORTFOLIO_DIR)).filter((f) => f.endsWith(".md"));
  const slugs = new Set();
  for (const file of files) {
    const raw = await readFile(join(PORTFOLIO_DIR, file), "utf-8");
    const { data } = matter(raw);
    for (const tag of data.tags ?? []) {
      const ref = typeof tag === "string" ? tag : tag?.tag ?? "";
      const base = (ref.split("/").pop() ?? "").replace(/\.(md|mdx|json)$/i, "");
      const slug = slugify(base);
      if (slug) slugs.add(slug);
    }
  }
  return slugs;
}

function refToSlug(ref) {
  if (!ref || typeof ref !== "string") return "";
  const base = ref.split("/").pop() ?? ref;
  return base.replace(/\.(md|mdx|json)$/i, "");
}

/**
 * Load the tag hierarchy from src/content/tags and return the set of tag slugs
 * plus a `tagUrl(slug)` helper that resolves a tag to its namespaced landing
 * page URL by walking its parent chain to a registered root type.
 */
async function loadTagHierarchy() {
  const files = (await readdir(TAGS_DIR)).filter((f) => f.endsWith(".md"));
  const parentOf = new Map();
  const slugs = new Set();
  for (const file of files) {
    const slug = file.replace(/\.md$/i, "");
    const raw = await readFile(join(TAGS_DIR, file), "utf-8");
    const { data } = matter(raw);
    parentOf.set(slug, refToSlug(data.parent ?? ""));
    slugs.add(slug);
  }

  function rootAncestor(slug) {
    const visited = new Set([slug]);
    let current = slug;
    while (true) {
      const parent = parentOf.get(current);
      if (!parent || visited.has(parent)) return current;
      visited.add(parent);
      current = parent;
    }
  }

  function tagUrl(slug) {
    if (ROOT_HUB[slug]) return `${ROOT_HUB[slug]}/`.replace(/\/+$/, "/");
    if (!slugs.has(slug)) return TAG_FALLBACK;
    const base = ROOT_LEAF_BASE[rootAncestor(slug)];
    return base ? `${base}/${slug}/` : TAG_FALLBACK;
  }

  return { slugs, tagUrl };
}

async function main() {
  const manifest = await loadJson(MANIFEST);
  const tags = await loadJson(join(TAXONOMY_DIR, "tags.json"));
  const categories = await loadJson(join(TAXONOMY_DIR, "categories.json"));
  const authors = await loadJson(join(TAXONOMY_DIR, "authors.json"));
  const newTagSlugs = await loadNewTagSlugs();
  const { slugs: tagSlugs, tagUrl } = await loadTagHierarchy();

  const rules = new Map();

  for (const [oldSlug, target] of Object.entries(PAGE_REDIRECTS)) {
    addRule(rules, `/${oldSlug}`, target);
  }

  for (const entry of manifest) {
    if (entry.type !== "post") continue;
    const overviewTag = OVERVIEW_TO_TAG[entry.slug];
    const target = overviewTag ? tagUrl(overviewTag) : `/portfolio/${entry.slug}/`;
    addRule(rules, `/${entry.slug}`, target);
  }

  for (const tag of tags) {
    const aliased = TAG_TO_TAG[tag.slug] ?? tag.slug;
    const target = newTagSlugs.has(aliased) ? tagUrl(aliased) : TAG_FALLBACK;
    addRule(rules, `/tag/${tag.slug}`, target);
  }

  for (const category of categories) {
    const tagSlug = CATEGORY_TO_TAG[category.slug] ?? category.slug;
    addRule(rules, `/category/${category.slug}`, tagUrl(tagSlug));
  }

  // Retire the interim /tags/* namespace in favor of the type-namespaced URLs.
  for (const slug of tagSlugs) {
    if (ROOT_HUB[slug]) continue; // root tags never had a /tags/<slug> URL
    addRule(rules, `/tags/${slug}`, tagUrl(slug));
  }
  addRule(rules, "/tags", "/portfolio/");

  for (const author of authors) {
    addRule(rules, `/author/${author.slug}`, "/about/");
  }

  const lines = [
    "# Generated by scripts/generate-redirects.mjs — do not edit by hand",
    `# ${rules.size} redirect rules`,
    "",
    ...Array.from(rules.values()).sort(),
    "",
  ];

  await writeFile(OUTPUT, lines.join("\n"), "utf-8");
  console.log(`Wrote ${rules.size} redirect rules to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
