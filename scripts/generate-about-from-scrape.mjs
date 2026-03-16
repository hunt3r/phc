#!/usr/bin/env node
/**
 * Generate About page markdown from scraped about-us data.
 * Downloads featured image to public/images/about/ and writes src/content/about/index.md.
 * Run: npm run generate:about
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import TurndownService from "turndown";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCRAPED_ABOUT = join(ROOT, "scraped", "pages", "about-us");
const PUBLIC_ABOUT = join(ROOT, "public", "images", "about");
const CONTENT_ABOUT = join(ROOT, "src", "content", "about");

const THEME_ASSET = /themes\/phc\/assets/i;

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

async function main() {
  const indexPath = join(SCRAPED_ABOUT, "index.json");
  let data;
  try {
    data = JSON.parse(await readFile(indexPath, "utf-8"));
  } catch (err) {
    console.error("Missing or invalid scraped data:", indexPath, err.message);
    process.exit(1);
  }

  const title = (data.title || "About Us").replace(/\s*-\s*PH&C\s*$/i, "").trim() || "About Us";
  const featuredImageUrl = data.featuredImageUrl && !THEME_ASSET.test(data.featuredImageUrl)
    ? data.featuredImageUrl
    : null;

  let featuredImagePath = null;
  if (featuredImageUrl) {
    await ensureDir(PUBLIC_ABOUT);
    const name = safeBasename(featuredImageUrl);
    const outPath = join(PUBLIC_ABOUT, name);
    try {
      const buf = await downloadImage(featuredImageUrl);
      if (buf && buf.length > 0) {
        await writeFile(outPath, buf);
        featuredImagePath = `/images/about/${name}`;
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
    ...(featuredImagePath && { featuredImage: featuredImagePath }),
  };
  const md = matter.stringify(body, frontMatter, { lineWidth: -1 });
  await ensureDir(CONTENT_ABOUT);
  const outMd = join(CONTENT_ABOUT, "index.md");
  await writeFile(outMd, md, "utf-8");
  console.log("Wrote", outMd);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
