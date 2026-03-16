/**
 * Normalize a string for use in URLs (tags, category slugs).
 * Lowercase, replace spaces/slashes with hyphens, collapse multiple hyphens.
 */
export function slugify(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Titleize a slug or tag for display: "project-management" → "Project Management".
 */
export function titleize(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .trim()
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
