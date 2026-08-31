import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify, titleize } from '@/lib/slug';

export interface ResolvedTag {
  slug: string;
  label: string;
  href: string;
}

/**
 * Convert a Tina reference value (a file path like
 * `src/content/tags/retail.md`) into a bare tag slug (`retail`).
 */
export function refToSlug(ref: string): string {
  if (!ref || typeof ref !== 'string') return '';
  const base = ref.split('/').pop() ?? ref;
  return base.replace(/\.(md|mdx|json)$/i, '');
}

/**
 * The tag slugs referenced by a portfolio entry, in order.
 */
export function getPortfolioTagSlugs(entry: CollectionEntry<'portfolio'>): string[] {
  const refs = (entry.data as { tags?: { tag: string }[] }).tags ?? [];
  return refs.map((t) => refToSlug(t.tag)).filter(Boolean);
}

/**
 * Map of tag slug -> tag collection entry.
 */
export async function getTagMap(): Promise<Map<string, CollectionEntry<'tags'>>> {
  const tags = await getCollection('tags');
  return new Map(tags.map((t) => [t.id, t]));
}

/**
 * Tag entries flagged for the portfolio navigation, sorted by order then label.
 */
export async function getNavTags(): Promise<CollectionEntry<'tags'>[]> {
  const tags = await getCollection('tags');
  return tags
    .filter((t) => t.data.showInNav)
    .sort((a, b) => {
      const orderA = a.data.order ?? 999;
      const orderB = b.data.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.data.label ?? '').localeCompare(b.data.label ?? '');
    });
}

/**
 * Resolve a portfolio entry's tags into display-ready { slug, label, href }.
 * Falls back to a titleized slug when a tag doc is missing.
 */
export function resolveTags(
  entry: CollectionEntry<'portfolio'>,
  tagMap: Map<string, CollectionEntry<'tags'>>
): ResolvedTag[] {
  return getPortfolioTagSlugs(entry).map((slug) => ({
    slug,
    label: tagMap.get(slug)?.data.label ?? titleize(slug),
    href: `/tags/${slug}`,
  }));
}

/**
 * Portfolio entries that reference a given tag slug.
 */
export function portfolioEntriesForTag(
  slug: string,
  portfolio: CollectionEntry<'portfolio'>[]
): CollectionEntry<'portfolio'>[] {
  return portfolio.filter((entry) => getPortfolioTagSlugs(entry).includes(slug));
}

export { slugify };
