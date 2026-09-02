import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify, titleize } from '@/lib/slug';

export interface ResolvedTag {
  slug: string;
  label: string;
  href: string;
}

export interface TagGroup {
  root: string;
  label: string;
  tags: ResolvedTag[];
}

export interface RootRoute {
  /** The bespoke hub page for this root type. */
  hub: string;
  /** URL prefix for leaf landing pages under this root. */
  leafBase: string;
  /** Heading used when grouping a project's tags by this root. */
  groupLabel: string;
}

/**
 * Maps a root tag slug to its bespoke hub page and the URL namespace used for
 * its leaf landing pages. Adding a new top-level tag type is a matter of adding
 * an entry here plus the corresponding hub / [slug] pages.
 */
export const ROOT_ROUTES: Record<string, RootRoute> = {
  portfolio: { hub: '/portfolio', leafBase: '/portfolio', groupLabel: 'Categories' },
  services: { hub: '/services', leafBase: '/services', groupLabel: 'Services' },
};

/** Fallback namespace for tags whose root has no registered route. */
const DEFAULT_LEAF_BASE = '/tags';

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
 * The parent tag slug of a tag entry, or '' if it is a root.
 */
export function getParentSlug(entry: CollectionEntry<'tags'>): string {
  return refToSlug((entry.data as { parent?: string }).parent ?? '');
}

function sortByOrderThenLabel(
  a: CollectionEntry<'tags'>,
  b: CollectionEntry<'tags'>
): number {
  const orderA = a.data.order ?? 999;
  const orderB = b.data.order ?? 999;
  if (orderA !== orderB) return orderA - orderB;
  return (a.data.label ?? '').localeCompare(b.data.label ?? '');
}

/**
 * The chain of ancestor slugs for a tag, from immediate parent up to the root.
 * Cycle-guarded, so malformed data can never loop forever.
 */
export function ancestorChain(
  slug: string,
  tagMap: Map<string, CollectionEntry<'tags'>>
): string[] {
  const chain: string[] = [];
  const visited = new Set<string>([slug]);
  let current = tagMap.get(slug);
  while (current) {
    const parentSlug = getParentSlug(current);
    if (!parentSlug || visited.has(parentSlug)) break;
    visited.add(parentSlug);
    chain.push(parentSlug);
    current = tagMap.get(parentSlug);
  }
  return chain;
}

/**
 * The topmost ancestor of a tag (its root type). Returns the slug itself when
 * the tag has no parent.
 */
export function rootAncestor(
  slug: string,
  tagMap: Map<string, CollectionEntry<'tags'>>
): string {
  const chain = ancestorChain(slug, tagMap);
  return chain.length ? chain[chain.length - 1] : slug;
}

/**
 * Direct children of a tag, sorted by order then label.
 */
export function childrenOf(
  slug: string,
  tagMap: Map<string, CollectionEntry<'tags'>>
): CollectionEntry<'tags'>[] {
  return [...tagMap.values()]
    .filter((t) => getParentSlug(t) === slug)
    .sort(sortByOrderThenLabel);
}

/**
 * All descendant slugs beneath a tag (children, grandchildren, ...).
 * Cycle-guarded.
 */
export function descendantSlugs(
  slug: string,
  tagMap: Map<string, CollectionEntry<'tags'>>
): string[] {
  const result: string[] = [];
  const visited = new Set<string>([slug]);
  const queue = [slug];
  while (queue.length) {
    const current = queue.shift() as string;
    for (const child of childrenOf(current, tagMap)) {
      if (visited.has(child.id)) continue;
      visited.add(child.id);
      result.push(child.id);
      queue.push(child.id);
    }
  }
  return result;
}

/**
 * Every tag that lives under a given root type (excluding the root itself).
 */
export function tagsWithRoot(
  rootSlug: string,
  tagMap: Map<string, CollectionEntry<'tags'>>
): CollectionEntry<'tags'>[] {
  return [...tagMap.values()]
    .filter((t) => t.id !== rootSlug && rootAncestor(t.id, tagMap) === rootSlug)
    .sort(sortByOrderThenLabel);
}

/**
 * The public URL for a tag's landing page, namespaced by its root type.
 * Root tags resolve to their bespoke hub page.
 */
export function tagHref(
  slug: string,
  tagMap: Map<string, CollectionEntry<'tags'>>
): string {
  if (ROOT_ROUTES[slug]) return ROOT_ROUTES[slug].hub;
  const root = rootAncestor(slug, tagMap);
  const base = ROOT_ROUTES[root]?.leafBase ?? DEFAULT_LEAF_BASE;
  return `${base}/${slug}`;
}

/**
 * Tag entries that form the portfolio (sector) navigation: the direct children
 * of the `portfolio` root, sorted by order then label.
 */
export async function getNavTags(): Promise<CollectionEntry<'tags'>[]> {
  const tagMap = await getTagMap();
  return childrenOf('portfolio', tagMap);
}

export interface NavNode {
  entry: CollectionEntry<'tags'>;
  href: string;
  children: NavNode[];
}

/**
 * The nested portfolio navigation tree: every descendant of the `portfolio`
 * root, in order, with children attached. Cycle-guarded against malformed data.
 */
export async function getNavTree(): Promise<NavNode[]> {
  const tagMap = await getTagMap();
  const seen = new Set<string>();
  const build = (slug: string): NavNode[] =>
    childrenOf(slug, tagMap)
      .filter((entry) => !seen.has(entry.id) && seen.add(entry.id))
      .map((entry) => ({
        entry,
        href: tagHref(entry.id, tagMap),
        children: build(entry.id),
      }));
  return build('portfolio');
}

/**
 * The nested services navigation tree: every descendant of the `services` root,
 * in order, with children attached. The top level is limited to curated
 * services (those carrying an `order`), so legacy portfolio-tag stubs that also
 * live under `services` (e.g. `landscaping`, `signage`) are excluded.
 */
export async function getServicesNavTree(): Promise<NavNode[]> {
  const tagMap = await getTagMap();
  const seen = new Set<string>();
  const build = (slug: string): NavNode[] =>
    childrenOf(slug, tagMap)
      .filter((entry) => !seen.has(entry.id) && seen.add(entry.id))
      .map((entry) => ({
        entry,
        href: tagHref(entry.id, tagMap),
        children: build(entry.id),
      }));
  return build('services').filter((node) => node.entry.data.order != null);
}

/**
 * Flatten a nav tree into a depth-annotated list in tree order, for rendering
 * the mobile dropdown where nesting is conveyed via indentation.
 */
export function flattenNavTree(
  nodes: NavNode[],
  depth = 0
): { node: NavNode; depth: number }[] {
  const result: { node: NavNode; depth: number }[] = [];
  for (const node of nodes) {
    result.push({ node, depth });
    if (node.children.length) {
      result.push(...flattenNavTree(node.children, depth + 1));
    }
  }
  return result;
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
    href: tagHref(slug, tagMap),
  }));
}

/**
 * Resolve a portfolio entry's tags grouped by root type, so a project page can
 * render e.g. "Categories" and "Services" as separate rows. Groups are ordered
 * by the ROOT_ROUTES registry, with any unregistered roots appended.
 */
export function resolveTagsGrouped(
  entry: CollectionEntry<'portfolio'>,
  tagMap: Map<string, CollectionEntry<'tags'>>
): TagGroup[] {
  const resolved = resolveTags(entry, tagMap);
  const groupsBySlug = new Map<string, ResolvedTag[]>();
  for (const tag of resolved) {
    const root = rootAncestor(tag.slug, tagMap);
    if (!groupsBySlug.has(root)) groupsBySlug.set(root, []);
    (groupsBySlug.get(root) as ResolvedTag[]).push(tag);
  }
  const orderedRoots = [
    ...Object.keys(ROOT_ROUTES).filter((r) => groupsBySlug.has(r)),
    ...[...groupsBySlug.keys()].filter((r) => !ROOT_ROUTES[r]),
  ];
  return orderedRoots.map((root) => ({
    root,
    label: ROOT_ROUTES[root]?.groupLabel ?? tagMap.get(root)?.data.label ?? titleize(root),
    tags: groupsBySlug.get(root) as ResolvedTag[],
  }));
}

/**
 * Portfolio entries that reference a given tag slug (exact match).
 */
export function portfolioEntriesForTag(
  slug: string,
  portfolio: CollectionEntry<'portfolio'>[]
): CollectionEntry<'portfolio'>[] {
  return portfolio.filter((entry) => getPortfolioTagSlugs(entry).includes(slug));
}

/**
 * Portfolio entries that reference a tag or any of its descendants, so a
 * parent landing page rolls up the work done across its whole subtree.
 */
export function portfolioEntriesForTagTree(
  slug: string,
  portfolio: CollectionEntry<'portfolio'>[],
  tagMap: Map<string, CollectionEntry<'tags'>>
): CollectionEntry<'portfolio'>[] {
  const slugs = new Set<string>([slug, ...descendantSlugs(slug, tagMap)]);
  return portfolio.filter((entry) =>
    getPortfolioTagSlugs(entry).some((s) => slugs.has(s))
  );
}

export { slugify };
