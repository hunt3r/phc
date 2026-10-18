import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
import { rehypeLazyImages } from './src/lib/rehypeLazyImages.ts';

const site = 'https://www.phandc.net';

/** Canonical path: no trailing slash. Homepage is `/`. */
function canonicalPath(page) {
  const path = new URL(page).pathname.replace(/\/$/, '') || '/';
  return path;
}

/**
 * Match `BaseLayout` canonicals: no trailing slash. The sitemap integration can
 * emit both slash forms; keep the first and drop the rest.
 * The homepage is rewritten after the file is written: `new URL` always
 * serializes the root as `https://www.phandc.net/`.
 */
function canonicalLoc(page) {
  const url = new URL(page);
  const path = canonicalPath(page);
  return path === '/' ? url.origin : `${url.origin}${path}`;
}

/** `sitemap` rewrites the root loc to include a slash. Put the canonical form back. */
function canonicalizeSitemapHome() {
  return {
    name: 'sitemap-canonical-home',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const path = fileURLToPath(new URL('sitemap-0.xml', dir));
        const xml = await readFile(path, 'utf8');
        const next = xml.replace(`<loc>${site}/</loc>`, `<loc>${site}</loc>`);
        if (next !== xml) await writeFile(path, next);
      },
    },
  };
}

const seenSitemapPaths = new Set();

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
        item.url = canonicalLoc(item.url);
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
    plugins: [tailwindcss(), tinaAdminDevRedirect()],
  },
});
