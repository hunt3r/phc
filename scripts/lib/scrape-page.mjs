/**
 * Fetch HTML and extract structured content + taxonomy (categories, tags, author).
 * Returns object suitable for pages/*.json and posts/*.json.
 */

import * as cheerio from "cheerio";
import { fetchUrl } from "./sitemap.mjs";

const CONTENT_SELECTORS = [
  ".entry-content",
  ".post-content",
  "article .content",
  ".post .content",
  "article .entry-body",
  "[class*='post'] [class*='content']",
  "article",
  "main",
];

/**
 * Resolve url against base (absolute URL).
 * @param {string} baseUrl - e.g. https://phandc.net
 * @param {string} href - possibly relative
 * @returns {string}
 */
function resolveUrl(baseUrl, href) {
  if (!href || !href.trim()) return "";
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = baseUrl.replace(/\/$/, "");
  if (trimmed.startsWith("//")) return new URL(trimmed, base).href;
  if (trimmed.startsWith("/")) return `${base}${trimmed}`;
  return `${base}/${trimmed}`;
}

/**
 * Extract taxonomy from WordPress-style HTML.
 * @param {cheerio.CheerioAPI} $
 * @param {string} baseUrl
 * @returns {{ categories: Array<{name:string,slug:string,url:string}>, tags: Array<{name:string,slug:string,url:string}>, author: { name: string, slug: string, url: string } | null }}
 */
function extractTaxonomy($, baseUrl) {
  const categories = [];
  const tags = [];
  let author = null;

  const slugFromHref = (href) => {
    try {
      const path = new URL(resolveUrl(baseUrl, href)).pathname;
      return path.split("/").filter(Boolean).pop() || "unknown";
    } catch {
      return "unknown";
    }
  };

  // Categories: .cat-links a, a[rel="category tag"], .posted-in a
  $('.cat-links a, a[rel="category tag"], .posted-in a, .entry-categories a').each(
    function () {
      const el = $(this);
      const href = el.attr("href");
      const name = (el.text() || "").trim();
      if (href && name) {
        const url = resolveUrl(baseUrl, href);
        if (!categories.some((c) => c.url === url))
          categories.push({ name, slug: slugFromHref(href), url });
      }
    }
  );

  // Tags: .tag-links a, a[rel="tag"], .tags-links a
  $('.tag-links a, a[rel="tag"], .tags-links a, .entry-tags a').each(
    function () {
      const el = $(this);
      const href = el.attr("href");
      const name = (el.text() || "").trim();
      if (href && name) {
        const url = resolveUrl(baseUrl, href);
        if (!tags.some((t) => t.url === url))
          tags.push({ name, slug: slugFromHref(href), url });
      }
    }
  );

  // Author: .author a, .byline a, [rel="author"]
  const authorEl =
    $('.author a, .byline a, [rel="author"]').first() ||
    $(".vcard .fn a").first();
  if (authorEl.length) {
    const href = authorEl.attr("href");
    const name = (authorEl.text() || "").trim();
    if (href) {
      const url = resolveUrl(baseUrl, href);
      author = { name: name || "Unknown", slug: slugFromHref(href), url };
    }
  }

  // JSON-LD fallbacks
  try {
    $('script[type="application/ld+json"]').each(function () {
      const raw = $(this).html();
      if (!raw) return;
      const data = JSON.parse(raw);
      const item = Array.isArray(data) ? data[0] : data;
      if (item["@type"] === "Article" || item["@type"] === "BlogPosting") {
        if (item.articleSection && categories.length === 0) {
          const name = typeof item.articleSection === "string" ? item.articleSection : item.articleSection?.name;
          if (name) categories.push({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), url: "" });
        }
        if (item.author && !author) {
          const a = item.author;
          const name = a.name || (typeof a === "string" ? a : "");
          const url = a.url || (typeof a === "object" && a["@id"]) || "";
          if (name) author = { name, slug: slugFromHref(url), url };
        }
      }
    });
  } catch (_) {}

  return { categories, tags, author };
}

/**
 * Find main content element and return its HTML and text.
 * @param {cheerio.CheerioAPI} $
 * @returns {{ html: string, text: string }}
 */
function extractContent($) {
  for (const sel of CONTENT_SELECTORS) {
    const el = $(sel).first();
    if (el.length) {
      const html = el.html() || "";
      const text = el.text().replace(/\s+/g, " ").trim();
      if (html.length > 20) return { html, text };
    }
  }
  return { html: "", text: "" };
}

/**
 * Extract featured image URL from page (og:image or first article image).
 * @param {cheerio.CheerioAPI} $
 * @param {string} baseUrl
 * @returns {string}
 */
function extractFeaturedImage($, baseUrl) {
  const og = $('meta[property="og:image"]').attr("content");
  if (og) return resolveUrl(baseUrl, og);
  const img = $("article figure img, .post-thumbnail img, .featured-image img").first();
  if (img.length) return resolveUrl(baseUrl, img.attr("src") || "");
  return "";
}

/**
 * Collect all img src URLs from a fragment (e.g. content HTML).
 * @param {cheerio.CheerioAPI} $
 * @param {cheerio.Cheerio} container
 * @param {string} baseUrl
 * @returns {string[]}
 */
function extractInlineImageUrls($, container, baseUrl) {
  const urls = [];
  container.find("img").each(function () {
    const src = $(this).attr("src");
    if (src) {
      const abs = resolveUrl(baseUrl, src);
      if (abs && !urls.includes(abs)) urls.push(abs);
    }
  });
  return urls;
}

/**
 * Extract all <img src> URLs from the entire document (for downloading into page folder).
 * @param {cheerio.CheerioAPI} $
 * @param {string} baseUrl
 * @returns {string[]} Absolute URLs, deduplicated
 */
function extractAllImageUrls($, baseUrl) {
  const urls = [];
  $("img").each(function () {
    const src = $(this).attr("src");
    if (src) {
      const abs = resolveUrl(baseUrl, src);
      if (abs && !urls.includes(abs)) urls.push(abs);
    }
  });
  return urls;
}

/**
 * Scrape a single page/post URL and return structured data.
 * @param {string} pageUrl - Full URL of the page/post
 * @param {{ baseUrl: string, delayMs?: number, userAgent?: string }} options
 * @returns {Promise<{ url: string, title: string, date: string, excerpt: string, contentHtml: string, contentText: string, featuredImageUrl: string, inlineImageUrls: string[], categories: Array<{name,slug,url}>, tags: Array<{name,slug,url}>, author: {name,slug,url}|null }>}
 */
export async function scrapePage(pageUrl, options = {}) {
  const { baseUrl, delayMs = 0, userAgent } = options;
  const { text: html, ok } = await fetchUrl(pageUrl, { delayMs, userAgent });
  if (!ok) {
    throw new Error(`Failed to fetch: ${pageUrl}`);
  }

  const $ = cheerio.load(html);
  const title = $("title").text().replace(/\s+/g, " ").trim() || "";
  const excerpt =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  // Date: article time, .date, meta article:published_time
  let date = "";
  const dateEl =
    $('article time[datetime], .posted-on time[datetime], .date.published time').first() ||
    $('meta[property="article:published_time"]').first();
  if (dateEl.length) {
    date = dateEl.attr("datetime") || dateEl.attr("content") || "";
  }
  if (!date) date = $(".date").first().text().trim() || "";

  const { html: contentHtml, text: contentText } = extractContent($);
  const featuredImageUrl = extractFeaturedImage($, baseUrl);
  const contentEl = $(CONTENT_SELECTORS.map((s) => s).join(", ")).first();
  const inlineImageUrls = contentEl.length
    ? extractInlineImageUrls($, contentEl, baseUrl)
    : [];

  const { categories, tags, author } = extractTaxonomy($, baseUrl);
  const allImageUrls = extractAllImageUrls($, baseUrl);

  return {
    url: pageUrl,
    title,
    date,
    excerpt,
    rawHtml: html,
    contentHtml,
    contentText,
    featuredImageUrl,
    featuredImageLocalPath: "",
    inlineImageUrls,
    inlineImageLocalPaths: [],
    allImageUrls,
    allImageLocalPaths: [],
    categories,
    tags,
    author,
  };
}
