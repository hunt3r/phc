/**
 * Spider configuration. Override via env: BASE_URL, OUTPUT_DIR, DELAY_MS, SITEMAP_URL.
 */
const baseUrl = process.env.BASE_URL || "https://phandc.net";
const outputDir = process.env.OUTPUT_DIR || "scraped";
const delayMs = Number(process.env.DELAY_MS) || 800;
const sitemapUrl =
  process.env.SITEMAP_URL || `${baseUrl.replace(/\/$/, "")}/sitemap_index.xml`;

export const config = {
  baseUrl: baseUrl.replace(/\/$/, ""),
  outputDir,
  delayMs,
  sitemapUrl,
  userAgent:
    "phc-content-spider/1.0 (content migration; +https://github.com)",
};

export default config;
