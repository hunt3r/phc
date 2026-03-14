/**
 * Minimal image URL helper for hero and other assets.
 * Cloudinary URLs or public_ids are returned as delivery URLs; local paths are returned as-is.
 * For transform support (width, quality), add astro-cloudinary later.
 */

const CLOUDINARY_URL_PATTERN =
  /res\.cloudinary\.com|cloudinary\.com\/.+\/image\/upload/;

export function isCloudinarySrc(src: string | undefined): boolean {
  if (!src?.trim()) return false;
  const s = src.trim();
  if (s.startsWith('http') && CLOUDINARY_URL_PATTERN.test(s)) return true;
  return false;
}

export interface GetImageUrlOptions {
  width?: number;
  quality?: string;
}

/**
 * Returns a delivery URL for the given src.
 * - If src is already a Cloudinary URL, returns it as-is.
 * - If src looks like a Cloudinary public_id and CLOUDINARY_CLOUD_NAME is set, returns upload URL.
 * - Otherwise returns src (e.g. local path like /images/hero.jpg).
 */
export function getImageUrl(
  src: string | undefined,
  _options: GetImageUrlOptions = {}
): string {
  if (!src?.trim()) return '';
  const s = src.trim();

  if (s.startsWith('http')) return s;

  const cloudName =
    typeof import.meta.env !== 'undefined' &&
    import.meta.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName && s.length > 0) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${s}`;
  }

  return s;
}
