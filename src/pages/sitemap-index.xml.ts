import type { APIRoute } from 'astro';
import { sitemapIndex } from '@/lib/sitemap';

/**
 * Dev (and the prerender pass) serve this route. `astro build` then overwrites
 * the file from `@astrojs/sitemap`, which is what production publishes.
 */
export const GET: APIRoute = () =>
  new Response(sitemapIndex(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
