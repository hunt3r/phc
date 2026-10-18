import { getCollection, getEntry } from 'astro:content';
import { withStaffSlugs } from '@/data/staff';
import { sitemapOrigin } from '@/lib/sitemap-origin.mjs';
import { tagsWithRoot } from '@/lib/tags';

const SITE = sitemapOrigin();

const STATIC_PATHS = [
  '/',
  '/about',
  '/contact',
  '/portfolio',
  '/services',
  '/testimonials',
  '/videos',
];

/**
 * Public page paths, in the same shape the production sitemap lists them.
 * `/contact/success` is a form receipt and is omitted.
 */
export async function publicSitemapPaths(): Promise<string[]> {
  const [pages, portfolio, tags, staffEntry] = await Promise.all([
    getCollection('pages'),
    getCollection('portfolio'),
    getCollection('tags'),
    getEntry('staff', 'index'),
  ]);
  const tagMap = new Map(tags.map((entry) => [entry.id, entry]));
  const staff = withStaffSlugs(staffEntry?.data?.staff ?? []);

  const paths = [
    ...STATIC_PATHS,
    ...pages.map((entry) => `/${entry.id}`),
    ...staff.map((member) => `/about/${member.slug}`),
    ...portfolio.map((entry) => `/portfolio/${entry.id}`),
    ...tagsWithRoot('portfolio', tagMap).map((entry) => `/portfolio/${entry.id}`),
    ...tagsWithRoot('services', tagMap).map((entry) => `/services/${entry.id}`),
  ];

  return [...new Set(paths)];
}

function canonicalLoc(path: string): string {
  return path === '/' ? SITE : `${SITE}${path}`;
}

export async function sitemapUrlset(): Promise<string> {
  const locs = (await publicSitemapPaths())
    .map(canonicalLoc)
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const urls = locs.map((loc) => `<url><loc>${loc}</loc></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function sitemapIndex(): string {
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE}/sitemap-0.xml</loc></sitemap></sitemapindex>`;
}
