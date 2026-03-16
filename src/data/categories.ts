/**
 * Single source of truth for portfolio categories (1:1 per item).
 * Used for getStaticPaths, left nav, and Tina select options.
 */
export interface CategoryItem {
  slug: string;
  label: string;
}

export const CATEGORIES: CategoryItem[] = [
  { slug: 'retail', label: 'Retail' },
  { slug: 'healthcare', label: 'Healthcare' },
  { slug: 'government', label: 'Government' },
  { slug: 'residential', label: 'Residential' },
  { slug: 'office', label: 'Office' },
  { slug: 'institutional', label: 'Institutional' },
  { slug: 'self-storage', label: 'Self-Storage' },
  { slug: 'uncategorized', label: 'Uncategorized' },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryLabel(slug: string): string {
  return getCategoryBySlug(slug)?.label ?? slug;
}
