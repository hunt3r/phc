import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

export default defineConfig({
  site: 'https://phandc.net',
  trailingSlash: 'ignore',
  // Static output for production; the Tina per-island refresh endpoint
  // (`src/pages/tina-island/[name].ts`) opts into on-demand rendering via
  // `export const prerender = false`, so only that route runs at request time.
  // The Netlify adapter publishes the static assets and deploys that single
  // on-demand route as a Netlify Function.
  output: 'static',
  adapter: netlify(),
  integrations: [
    tina(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        if (path === '/') {
          item.priority = 1.0;
        } else if (path === '/portfolio' || path === '/about') {
          item.priority = 0.9;
        } else if (path.startsWith('/portfolio/')) {
          item.priority = 0.8;
        } else if (path.startsWith('/category/') || path.startsWith('/tags/')) {
          item.priority = 0.6;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss(), tinaAdminDevRedirect()],
  },
});
