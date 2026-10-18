/**
 * Origin written into sitemap `<loc>` values.
 * Local builds and `astro dev` use localhost so a crawl of that server matches.
 * The production build sets `SITEMAP_SITE` (see netlify.toml).
 */
export function sitemapOrigin() {
  const raw = process.env.SITEMAP_SITE || 'http://localhost:4321';
  return raw.replace(/\/$/, '');
}
