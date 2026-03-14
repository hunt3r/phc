#!/usr/bin/env node
/**
 * phandc.net sitemap spider: fetch each HTML page from the sitemap, create a folder per page
 * (folder name = URL path), save the HTML, crawl the page for <img> tags, download those
 * images into that folder. Output: scraped/pages/{path}/ and scraped/portfolio/{path}/
 * with index.html, index.json, and images/.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.mjs";
import { loadAllSitemaps } from "./lib/sitemap.mjs";
import { scrapePage } from "./lib/scrape-page.mjs";
import { downloadAssetToFolder } from "./lib/download-asset.mjs";
import { urlPathToFolderPath, slugFromTaxonomyUrl } from "./lib/slug.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, config.outputDir);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function titleCase(slug) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Build taxonomy arrays from sitemap URLs and optional name overrides from scraped content. */
function buildTaxonomyEntries(urls, nameByUrl = {}) {
  return urls.map(({ url, lastmod }) => {
    const slug = slugFromTaxonomyUrl(url);
    const name = nameByUrl[url] ?? titleCase(slug);
    return { name, slug, url, ...(lastmod && { lastmod }) };
  });
}

async function main() {
  console.log("Sitemap URL:", config.sitemapUrl);
  console.log("Output dir:", OUTPUT);
  console.log("Delay (ms):", config.delayMs);

  await mkdir(path.join(OUTPUT, "taxonomy"), { recursive: true });
  await mkdir(path.join(OUTPUT, "pages"), { recursive: true });
  await mkdir(path.join(OUTPUT, "portfolio"), { recursive: true });

  console.log("\nLoading sitemaps...");
  const sitemaps = await loadAllSitemaps(config.sitemapUrl, {
    delayMs: config.delayMs,
    userAgent: config.userAgent,
  });

  const manifest = [];
  const taxonomyNames = { category: {}, tag: {}, author: {} };

  // 1) Write taxonomy (enriched after scraping posts)
  const categories = buildTaxonomyEntries(sitemaps.category);
  const tags = buildTaxonomyEntries(sitemaps.tag);
  const authors = buildTaxonomyEntries(sitemaps.author);
  await writeFile(
    path.join(OUTPUT, "taxonomy", "categories.json"),
    JSON.stringify(categories, null, 2)
  );
  await writeFile(
    path.join(OUTPUT, "taxonomy", "tags.json"),
    JSON.stringify(tags, null, 2)
  );
  await writeFile(
    path.join(OUTPUT, "taxonomy", "authors.json"),
    JSON.stringify(authors, null, 2)
  );
  console.log("Taxonomy files written.");

  const baseHost = config.baseUrl;

  // 2) Fetch each HTML page from page sitemap -> folder per page (name = URL path), save HTML, crawl <img>, download images into folder
  for (const { url, lastmod } of sitemaps.page) {
    await delay(config.delayMs);
    try {
      const data = await scrapePage(url, {
        baseUrl: config.baseUrl,
        delayMs: 0,
        userAgent: config.userAgent,
      });

      const folderPath = urlPathToFolderPath(url, baseHost);
      const folderAbs = path.join(OUTPUT, "pages", folderPath);
      await mkdir(path.join(folderAbs, "images"), { recursive: true });

      const rawHtml = data.rawHtml ?? "";
      if (!rawHtml) console.warn("Page has no HTML:", url);
      await writeFile(path.join(folderAbs, "index.html"), rawHtml, "utf8");

      const pageUrlCache = new Map();
      const usedSlugs = new Set();
      data.allImageLocalPaths = [];
      for (const imgUrl of data.allImageUrls || []) {
        try {
          await delay(config.delayMs);
          const { localPath } = await downloadAssetToFolder(
            imgUrl,
            folderAbs,
            { userAgent: config.userAgent, urlCache: pageUrlCache, usedSlugs }
          );
          data.allImageLocalPaths.push(localPath);
        } catch (err) {
          console.warn("Image skip:", imgUrl, err.message);
        }
      }

      const { rawHtml: _, ...dataForJson } = data;
      await writeFile(
        path.join(folderAbs, "index.json"),
        JSON.stringify(dataForJson, null, 2),
        "utf8"
      );

      manifest.push({
        type: "page",
        url,
        localPath: `pages/${folderPath}/`,
        slug: folderPath.split("/").pop() || folderPath,
        ...(lastmod && { lastmod }),
      });
    } catch (err) {
      console.warn("Page skip:", url, err.message);
    }
  }
  console.log("Pages scraped:", sitemaps.page.length);

  // 3) Fetch each HTML page from post sitemap -> folder per page (name = URL path), save HTML, crawl <img>, download images into folder
  for (const { url, lastmod } of sitemaps.post) {
    await delay(config.delayMs);
    try {
      const data = await scrapePage(url, {
        baseUrl: config.baseUrl,
        delayMs: 0,
        userAgent: config.userAgent,
      });

      data.categories = data.categories || [];
      data.tags = data.tags || [];
      for (const c of data.categories) taxonomyNames.category[c.url] = c.name;
      for (const t of data.tags) taxonomyNames.tag[t.url] = t.name;
      if (data.author) taxonomyNames.author[data.author.url] = data.author.name;

      const folderPath = urlPathToFolderPath(url, baseHost);
      const folderAbs = path.join(OUTPUT, "portfolio", folderPath);
      await mkdir(path.join(folderAbs, "images"), { recursive: true });

      const rawHtml = data.rawHtml ?? "";
      if (!rawHtml) console.warn("Post has no HTML:", url);
      await writeFile(path.join(folderAbs, "index.html"), rawHtml, "utf8");

      const pageUrlCache = new Map();
      const usedSlugs = new Set();
      data.allImageLocalPaths = [];
      for (const imgUrl of data.allImageUrls || []) {
        try {
          await delay(config.delayMs);
          const { localPath } = await downloadAssetToFolder(
            imgUrl,
            folderAbs,
            { userAgent: config.userAgent, urlCache: pageUrlCache, usedSlugs }
          );
          data.allImageLocalPaths.push(localPath);
        } catch (err) {
          console.warn("Image skip:", imgUrl, err.message);
        }
      }

      const { rawHtml: __, ...dataForJson } = data;
      await writeFile(
        path.join(folderAbs, "index.json"),
        JSON.stringify(dataForJson, null, 2),
        "utf8"
      );

      manifest.push({
        type: "post",
        url,
        localPath: `portfolio/${folderPath}/`,
        slug: folderPath.split("/").pop() || folderPath,
        ...(lastmod && { lastmod }),
      });
    } catch (err) {
      console.warn("Post skip:", url, err.message);
    }
  }
  console.log("Posts scraped:", sitemaps.post.length);

  // 4) Re-write taxonomy with names from scraped content
  const categoriesEnriched = buildTaxonomyEntries(
    sitemaps.category.map((u) => ({ url: u.url, lastmod: u.lastmod })),
    taxonomyNames.category
  );
  const tagsEnriched = buildTaxonomyEntries(
    sitemaps.tag.map((u) => ({ url: u.url, lastmod: u.lastmod })),
    taxonomyNames.tag
  );
  const authorsEnriched = buildTaxonomyEntries(
    sitemaps.author.map((u) => ({ url: u.url, lastmod: u.lastmod })),
    taxonomyNames.author
  );
  await writeFile(
    path.join(OUTPUT, "taxonomy", "categories.json"),
    JSON.stringify(categoriesEnriched, null, 2)
  );
  await writeFile(
    path.join(OUTPUT, "taxonomy", "tags.json"),
    JSON.stringify(tagsEnriched, null, 2)
  );
  await writeFile(
    path.join(OUTPUT, "taxonomy", "authors.json"),
    JSON.stringify(authorsEnriched, null, 2)
  );

  await writeFile(
    path.join(OUTPUT, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log("Manifest written:", manifest.length, "entries.");
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
