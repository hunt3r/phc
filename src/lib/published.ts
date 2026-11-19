import { getCollection, getEntry } from 'astro:content';
import { withStaffSlugs } from '@/data/staff';

/**
 * Public only when the editor checked Published.
 * A missing flag, false, or any other value stays off the site.
 */
export function isPublished(data: { published?: boolean | null } | null | undefined): boolean {
  return data?.published === true;
}

export function publishedOnly<T extends { published?: boolean | null }>(items: readonly T[]): T[] {
  return items.filter((item) => isPublished(item));
}

/**
 * Routes the visual editor can open. The dev server keeps an unpublished URL
 * so Tina can still load the form. The production build omits it, so visitors
 * get a 404.
 */
export function editorEntries<T>(entries: readonly T[], isPublic: (entry: T) => boolean): T[] {
  if (import.meta.env.DEV) return [...entries];
  return entries.filter(isPublic);
}

/** Pathname of an on-site link, without a query, hash, or trailing slash. */
export function siteLinkPath(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed.startsWith('/')) return null;
  const path = (trimmed.split(/[?#]/)[0] ?? trimmed).replace(/\/+$/, '');
  return path || '/';
}

let hiddenPaths: Promise<Set<string>> | undefined;

/**
 * Paths of projects, root pages, About, and staff profiles that are not published.
 * Header and footer links to these paths are left off the menus.
 */
export function unpublishedContentPaths(): Promise<Set<string>> {
  hiddenPaths ??= loadUnpublishedContentPaths();
  return hiddenPaths;
}

async function loadUnpublishedContentPaths(): Promise<Set<string>> {
  const [pages, portfolio, about, staffEntry] = await Promise.all([
    getCollection('pages'),
    getCollection('portfolio'),
    getEntry('about', 'index'),
    getEntry('staff', 'index'),
  ]);
  const hidden = new Set<string>();
  if (!isPublished(about?.data)) hidden.add('/about');
  for (const page of pages) {
    if (!isPublished(page.data)) hidden.add(`/${page.id}`);
  }
  for (const project of portfolio) {
    if (!isPublished(project.data)) hidden.add(`/portfolio/${project.id}`);
  }
  for (const member of withStaffSlugs(staffEntry?.data?.staff ?? [])) {
    if (!isPublished(member)) hidden.add(`/about/${member.slug}`);
  }
  return hidden;
}

/** Drop menu links that point at an unpublished project, page, About page, or staff profile. */
export async function omitUnpublishedLinks<T extends { href: string }>(links: readonly T[]): Promise<T[]> {
  const hidden = await unpublishedContentPaths();
  return links.filter((link) => {
    const path = siteLinkPath(link.href);
    return path == null || !hidden.has(path);
  });
}
