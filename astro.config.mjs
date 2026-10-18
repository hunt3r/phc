import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
import { rehypeLazyImages } from './src/lib/rehypeLazyImages.ts';
import { sitemapOrigin } from './src/lib/sitemap-origin.mjs';

/** Canonicals, Open Graph, and JSON-LD stay on the public site. */
const site = 'https://www.phandc.net';
/** Sitemap locs. Defaults to localhost so a local crawl matches the server. */
const sitemapSite = sitemapOrigin();

/** Canonical path: no trailing slash. Homepage is `/`. */
function canonicalPath(page) {
  const path = new URL(page).pathname.replace(/\/$/, '') || '/';
  return path;
}

/**
 * Match `BaseLayout` canonicals: no trailing slash. The sitemap integration can
 * emit both slash forms; keep the first and drop the rest.
 * The homepage is rewritten after the file is written: `new URL` always
 * serializes the root with a trailing slash.
 */
function sitemapLoc(page) {
  const path = canonicalPath(page);
  return path === '/' ? sitemapSite : `${sitemapSite}${path}`;
}

/** Point sitemap locs at `sitemapSite`, and drop the trailing slash on the homepage. */
function canonicalizeSitemapHome() {
  return {
    name: 'sitemap-canonical-home',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        for (const name of ['sitemap-0.xml', 'sitemap-index.xml']) {
          const path = fileURLToPath(new URL(name, dir));
          const xml = await readFile(path, 'utf8');
          const next = xml
            .replace(/<loc>https?:\/\/[^/<]+/g, `<loc>${sitemapSite}`)
            .replace(`<loc>${sitemapSite}/</loc>`, `<loc>${sitemapSite}</loc>`);
          if (next !== xml) await writeFile(path, next);
        }
        const robotsPath = fileURLToPath(new URL('robots.txt', dir));
        const robots = await readFile(robotsPath, 'utf8');
        const nextRobots = robots.replace(
          /^Sitemap:.*$/m,
          `Sitemap: ${sitemapSite}/sitemap-index.xml`,
        );
        if (nextRobots !== robots) await writeFile(robotsPath, nextRobots);
      },
    },
  };
}

const seenSitemapPaths = new Set();

/** `astro dev` serves `public/robots.txt` as-is. Rewrite that response so the Sitemap line matches the dev server. */
function devRobotsSitemap() {
  return {
    name: 'dev-robots-sitemap',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (pathname !== '/robots.txt') {
          next();
          return;
        }
        try {
          const robots = await readFile(new URL('./public/robots.txt', import.meta.url), 'utf8');
          const body = robots.replace(
            /^Sitemap:.*$/m,
            `Sitemap: ${sitemapSite}/sitemap-index.xml`,
          );
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(body);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  site,
  // Pages are HTML files (`about.html`). Netlify Pretty URLs then serve `/about`
  // and 301 `/about/` to it, matching the slashless canonicals and internal links.
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  server: {
    host: true,
  },
  // Static output for production; the Tina per-island refresh endpoint
  // (`src/pages/tina-island/[name].ts`) opts into on-demand rendering via
  // `export const prerender = false`, so only that route runs at request time.
  // The Netlify adapter publishes the static assets and deploys that single
  // on-demand route as a Netlify Function.
  output: 'static',
  adapter: netlify(),
  markdown: {
    rehypePlugins: [rehypeLazyImages],
  },
  integrations: [
    tina(),
    sitemap({
      filter(page) {
        const path = canonicalPath(page);
        if (path === '/contact/success') return false;
        if (seenSitemapPaths.has(path)) return false;
        seenSitemapPaths.add(path);
        return true;
      },
      serialize(item) {
        item.url = sitemapLoc(item.url);
        return item;
      },
      namespaces: {
        news: false,
        xhtml: false,
        image: false,
        video: false,
      },
    }),
    canonicalizeSitemapHome(),
  ],
  vite: {
    plugins: [tailwindcss(), tinaAdminDevRedirect(), devRobotsSitemap()],
  },
});
