/**
 * Fetch and parse sitemap index and child sitemaps.
 * Returns list of { type, url, lastmod } classified by sitemap source.
 */

import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

/**
 * Infer URL type from sitemap URL (e.g. post-sitemap.xml -> "post").
 * @param {string} sitemapUrl - Full URL of the sitemap
 * @returns {string} - "post" | "page" | "attachment" | "category" | "tag" | "author" | "unknown"
 */
function typeFromSitemapUrl(sitemapUrl) {
  const name = sitemapUrl.split("/").pop() || "";
  if (name.startsWith("post-sitemap")) return "post";
  if (name.startsWith("page-sitemap")) return "page";
  if (name.startsWith("attachment-sitemap")) return "attachment";
  if (name.startsWith("category-sitemap")) return "category";
  if (name.startsWith("post_tag-sitemap") || (name.includes("tag") && name.includes("sitemap"))) return "tag";
  if (name.startsWith("author-sitemap")) return "author";
  return "unknown";
}

/**
 * Fetch URL with optional delay, User-Agent, and timeout.
 * @param {string} url
 * @param {{ delayMs?: number, userAgent?: string, timeoutMs?: number }} options
 * @returns {Promise<{ text: string, ok: boolean }>}
 */
export async function fetchUrl(url, options = {}) {
  const { delayMs = 0, userAgent, timeoutMs = 30000 } = options;
  if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: userAgent ? { "User-Agent": userAgent } : {},
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await res.text();
    return { text, ok: res.ok };
  } finally {
    clearTimeout(timeout);
  }
}

function getText(node) {
  if (node == null) return "";
  if (typeof node === "string") return node;
  return node["#text"] ?? node["_"] ?? "";
}

/**
 * Parse sitemap index XML; returns array of child sitemap URLs.
 * @param {string} xml
 * @returns {{ loc: string, lastmod?: string }[]}
 */
export function parseSitemapIndex(xml) {
  const doc = parser.parse(xml);
  const index =
    doc.sitemapindex ||
    doc.sitemapIndex ||
    doc["sitemap index"];
  if (!index) return [];
  const raw = index.sitemap ?? index.Sitemap ?? [];
  const sitemaps = [].concat(raw);
  return sitemaps.map((s) => ({
    loc: (typeof s.loc === "string" ? s.loc : getText(s.loc)) || "",
    lastmod: (typeof s.lastmod === "string" ? s.lastmod : getText(s.lastmod)) || undefined,
  }));
}

/**
 * Parse URL set from a sitemap XML (child sitemap).
 * @param {string} xml
 * @returns {{ loc: string, lastmod?: string }[]}
 */
export function parseUrlSet(xml) {
  const doc = parser.parse(xml);
  const set = doc.urlset || doc.urlSet;
  if (!set) return [];
  const raw = set.url ?? set.Url ?? [];
  const urls = [].concat(raw);
  return urls.map((u) => ({
    loc: (typeof u.loc === "string" ? u.loc : getText(u.loc)) || "",
    lastmod: (typeof u.lastmod === "string" ? u.lastmod : getText(u.lastmod)) || undefined,
  }));
}

/**
 * Load sitemap index from url, then load each child sitemap and return all entries by type.
 * @param {string} sitemapIndexUrl
 * @param {{ delayMs?: number, userAgent?: string }} options
 * @returns {Promise<{ post: Array<{url:string,lastmod?:string}>, page: Array<...>, attachment: Array<...>, category: Array<...>, tag: Array<...>, author: Array<...> }>}
 */
export async function loadAllSitemaps(sitemapIndexUrl, options = {}) {
  const { delayMs = 0, userAgent } = options;
  const out = {
    post: [],
    page: [],
    attachment: [],
    category: [],
    tag: [],
    author: [],
    unknown: [],
  };

  const { text: indexXml, ok } = await fetchUrl(sitemapIndexUrl, {
    delayMs,
    userAgent,
  });
  if (!ok) {
    throw new Error(`Failed to fetch sitemap index: ${sitemapIndexUrl}`);
  }

  const childSitemaps = parseSitemapIndex(indexXml).filter((s) => s.loc);
  for (const { loc: childUrl, lastmod } of childSitemaps) {
    const type = typeFromSitemapUrl(childUrl);
    const { text: childXml, ok: childOk } = await fetchUrl(childUrl, {
      delayMs,
      userAgent,
    });
    if (!childOk) {
      console.warn(`[sitemap] Skip failed child sitemap: ${childUrl}`);
      continue;
    }
    const entries = parseUrlSet(childXml);
    const arr = out[type] ?? out.unknown;
    for (const e of entries) {
      if (e.loc) arr.push({ url: e.loc, lastmod: e.lastmod || lastmod });
    }
  }

  return out;
}

export { typeFromSitemapUrl };
