#!/usr/bin/env node
/**
 * Generate static page markdown from scraped WordPress pages.
 * Run: npm run generate:pages
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import TurndownService from "turndown";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCRAPED_PAGES = join(ROOT, "scraped", "pages");
const PUBLIC_PAGES = join(ROOT, "public", "images", "pages");
const CONTENT_PAGES = join(ROOT, "src", "content", "pages");

const THEME_ASSET = /themes\/phc\/assets/i;

const PAGE_MAP = [
  { scraped: "contact-us", output: "contact", title: "Contact" },
  { scraped: "privacy-policy", output: "privacy-policy" },
  { scraped: "our-services", output: "services" },
];

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

async function downloadImage(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function cleanTitle(rawTitle, fallback) {
  return (rawTitle || fallback).replace(/\s*-\s*PH&C\s*$/i, "").trim() || fallback;
}

async function generatePage({ scraped, output, title: titleOverride }) {
  const indexPath = join(SCRAPED_PAGES, scraped, "index.json");
  let data;
  try {
    data = JSON.parse(await readFile(indexPath, "utf-8"));
  } catch (err) {
    console.error("Missing or invalid scraped data:", indexPath, err.message);
    return false;
  }

  const title = titleOverride ?? cleanTitle(data.title, output);
  const description = (data.excerpt || "").replace(/\s*\[\s*…\s*\]\s*$/, "").trim() || undefined;
  const featuredImageUrl =
    data.featuredImageUrl && !THEME_ASSET.test(data.featuredImageUrl) ? data.featuredImageUrl : null;

  let featuredImagePath = null;
  if (featuredImageUrl) {
    await ensureDir(PUBLIC_PAGES);
    const name = `${output}-${safeBasename(featuredImageUrl)}`;
    const outPath = join(PUBLIC_PAGES, name);
    try {
      const buf = await downloadImage(featuredImageUrl);
      if (buf && buf.length > 0) {
        await writeFile(outPath, buf);
        featuredImagePath = `/images/pages/${name}`;
        console.log("Downloaded featured image:", featuredImagePath);
      }
    } catch (e) {
      console.warn("Download failed:", featuredImageUrl, e.message);
    }
  }

  const turndown = new TurndownService({ headingStyle: "atx" });
  turndown.remove(["script", "style"]);
  const bodyHtml = (data.contentHtml || "").trim();
  const body = bodyHtml ? turndown.turndown(bodyHtml) : "";

  const frontMatter = {
    title,
    ...(description && { description }),
    ...(featuredImagePath && { featuredImage: featuredImagePath }),
  };
  const md = matter.stringify(body, frontMatter, { lineWidth: -1 });
  await ensureDir(CONTENT_PAGES);
  const outMd = join(CONTENT_PAGES, `${output}.md`);
  await writeFile(outMd, md, "utf-8");
  console.log("Wrote", outMd);
  return true;
}

async function main() {
  let ok = 0;
  for (const page of PAGE_MAP) {
    if (await generatePage(page)) ok++;
  }
  console.log(`Done. Generated ${ok}/${PAGE_MAP.length} pages.`);
  if (ok === 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
