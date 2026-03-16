#!/usr/bin/env node
/**
 * Generate portfolio markdown from scraped data.
 * Downloads images to public/images/portfolio/<slug>/ and writes local paths.
 * Run: npm run generate:portfolio
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import TurndownService from "turndown";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCRAPED = join(ROOT, "scraped");
const PUBLIC_IMAGES = join(ROOT, "public", "images", "portfolio");
const CONTENT_PORTFOLIO = join(ROOT, "src", "content", "portfolio");

const THEME_ASSET = /themes\/phc\/assets/i;

function slugFromLocalPath(localPath) {
  return localPath.replace(/^portfolio\/|\/$/g, "");
}

function cleanTitle(title) {
  if (!title) return "";
  return title.replace(/\s*-\s*PH&C\s*$/i, "").trim();
}

function parseLocation(title) {
  if (!title) return "";
  const m = title.match(/\s*-\s*([^\-]+(?:,\s*[A-Z]{2})?|[^\-]+(?:,\s*[A-Z]{2})?)\s*(?:-\s*PH&C)?$/i);
  return m ? m[1].replace(/\s*-\s*PH&C\s*$/i, "").trim() : "";
}

function safeBasename(url) {
  try {
    const u = new URL(url);
    let name = u.pathname.replace(/^\//, "").split("/").pop() || "image";
    name = name.replace(/[?&#].*$/, "").replace(/[^\w.\-]/g, "-").replace(/-+/g, "-") || "image";
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(name)) name += ".jpg";
    return name;
  } catch {
    return "image.jpg";
  }
}

function inferTags(title, excerpt, contentText) {
  const text = [title, excerpt, contentText].filter(Boolean).join(" ").toLowerCase();
  const tags = new Set();

  if (/\b(wawa|lidl|target|shoprite|retail|shopping center|plaza|shoppes|cvs|pnc|bank of america)\b/.test(text)) {
    tags.add("retail");
  }
  if (/\b(wawa|lidl|target|shoprite)\b/.test(text)) tags.add("retailers");
  if (/\b(government|barracks|fta|federal|police|state police)\b/.test(text)) tags.add("government");
  if (/\bfta\b/.test(text)) tags.add("federal-government");
  if (/\b(residential|multi-family|cottages|estates|lofts|multi family)\b/.test(text)) tags.add("multi-family");
  if (/\b(office|warehouse|corporate)\b/.test(text)) tags.add("office");
  if (/\b(healthcare|cardiology|pediatrics|medical|nemours)\b/.test(text)) tags.add("healthcare");
  if (/\b(remediation|demolition|environmental)\b/.test(text)) tags.add("remediation");
  if (/\b(demolition)\b/.test(text)) tags.add("demolition");
  if (/\b(storage|self-storage|self storage)\b/.test(text)) tags.add("self-storage");
  if (/\b(college|academy|campus|education)\b/.test(text)) tags.add("institutional");
  if (/\b(project management|oversaw|managing)\b/.test(text)) tags.add("project-management");
  if (/\b(retail property development)\b/.test(text)) tags.add("retail-property-development");
  if (/\b(landscaping)\b/.test(text)) tags.add("landscaping");
  if (/\b(signage)\b/.test(text)) tags.add("signage");
  if (/\b(grant|racp)\b/.test(text)) tags.add("grant");
  if (/\b(small business)\b/.test(text)) tags.add("small-business");

  return Array.from(tags).slice(0, 6);
}

async function downloadImage(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function main() {
  const manifestPath = join(SCRAPED, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
  const portfolioEntries = manifest.filter((e) => e.localPath && e.localPath.startsWith("portfolio/"));
  portfolioEntries.sort((a, b) => new Date(b.lastmod || 0) - new Date(a.lastmod || 0));

  const turndown = new TurndownService({ headingStyle: "atx" });
  turndown.remove(["script", "style"]);

  let order = 1;
  for (const entry of portfolioEntries) {
    const slug = slugFromLocalPath(entry.localPath);
    const indexPath = join(SCRAPED, "portfolio", slug, "index.json");
    let data;
    try {
      data = JSON.parse(await readFile(indexPath, "utf-8"));
    } catch (err) {
      console.warn("Skip (no index.json):", slug);
      continue;
    }

    const title = cleanTitle(data.title || "");
    const description = (data.excerpt || "").trim();
    const location = parseLocation(data.title || "");
    const client = "";
    const date = (data.date || "").trim();

    const allUrls = [
      ...(data.featuredImageUrl ? [data.featuredImageUrl] : []),
      ...(data.allImageUrls || []),
    ].filter((u) => u && !THEME_ASSET.test(u));
    const seen = new Set();
    const uniqueUrls = allUrls.filter((u) => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });

    const imageDir = join(PUBLIC_IMAGES, slug);
    await ensureDir(imageDir);

    const urlToLocalPath = new Map();
    const usedNames = new Set();
    for (let i = 0; i < uniqueUrls.length; i++) {
      const url = uniqueUrls[i];
      let base = safeBasename(url);
      let name = base;
      let n = 0;
      while (usedNames.has(name)) {
        n++;
        const ext = base.replace(/^(.+)(\.[a-z]+)$/i, "$2");
        const stem = base.replace(/\.[a-z]+$/i, "");
        name = `${stem}-${n}${ext}`;
      }
      usedNames.add(name);
      urlToLocalPath.set(url, name);

      const outPath = join(imageDir, name);
      try {
        const buf = await downloadImage(url);
        if (buf && buf.length > 0) await writeFile(outPath, buf);
      } catch (e) {
        console.warn("Download failed:", url, e.message);
      }
    }

    const heroName = data.featuredImageUrl ? urlToLocalPath.get(data.featuredImageUrl) : null;
    const image = heroName ? `/images/portfolio/${slug}/${heroName}` : (uniqueUrls[0] ? `/images/portfolio/${slug}/${urlToLocalPath.get(uniqueUrls[0])}` : undefined);

    const gallery = uniqueUrls.map((url, i) => {
      const name = urlToLocalPath.get(url);
      return name ? { src: `/images/portfolio/${slug}/${name}`, alt: `${title} - image ${i + 1}` } : null;
    }).filter(Boolean);

    const tags = inferTags(title, description, data.contentText || "");

    const bodyHtml = (data.contentHtml || "").trim();
    const body = bodyHtml ? turndown.turndown(bodyHtml) : "";

    const frontMatter = {
      title,
      ...(description && { description }),
      ...(location && { location }),
      ...(client && { client }),
      ...(date && { date }),
      ...(image && { image }),
      ...(gallery.length > 0 && { gallery }),
      ...(tags.length > 0 && { tags }),
      order,
    };

    const md = matter.stringify(body, frontMatter, { lineWidth: -1 });
    const outMd = join(CONTENT_PORTFOLIO, `${slug}.md`);
    await ensureDir(CONTENT_PORTFOLIO);
    await writeFile(outMd, md, "utf-8");
    console.log("Wrote", slug, "order", order);
    order++;
  }

  console.log("Done. Generated", order - 1, "portfolio entries.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
