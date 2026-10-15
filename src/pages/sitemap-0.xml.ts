import type { APIRoute } from 'astro';
import { sitemapUrlset } from '@/lib/sitemap';

/**
 * Dev (and the prerender pass) serve this route. `astro build` then overwrites
 * the file from `@astrojs/sitemap`, which is what production publishes.
 */
export const GET: APIRoute = async () =>
  new Response(await sitemapUrlset(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
