/**
 * Cloudinary delivery URL helper with dynamic compression (f_auto, q_auto:eco).
 * For Cloudinary URLs we insert transforms; local paths and non-Cloudinary URLs are returned as-is.
 */

const CLOUDINARY_URL_PATTERN =
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//;

export function isCloudinarySrc(src: string | undefined): boolean {
  if (!src?.trim()) return false;
  const s = src.trim();
  if (s.startsWith("http") && CLOUDINARY_URL_PATTERN.test(s)) return true;
  return false;
}

export interface GetImageUrlOptions {
  width?: number;
  height?: number;
  /** Crop mode, e.g. "fill" | "limit" | "scale". Default "limit" for responsive. */
  crop?: "fill" | "limit" | "scale" | "fit" | "thumb";
  /** Cloudinary quality: "auto" or "auto:eco" (best compression). Default "auto:eco". */
  quality?: "auto" | "auto:eco";
}

/**
 * Build Cloudinary transform segment: f_auto (best format), q_auto:eco (best compression), optional size.
 */
function buildTransform(options: GetImageUrlOptions): string {
  const parts = ["f_auto", options.quality === "auto" ? "q_auto" : "q_auto:eco"];
  const crop = options.crop ?? "limit";
  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) {
    parts.push(`c_${crop}`, `h_${options.height}`);
  } else if (options.width) {
    parts.push("c_limit");
  }
  return parts.join(",");
}

/**
 * Returns a delivery URL for the given src with optional transforms.
 * - Cloudinary URLs: insert f_auto,q_auto:eco (and width/crop) for performant compression.
 * - Local paths or other URLs: return as-is.
 */
export function getImageUrl(
  src: string | undefined,
  options: GetImageUrlOptions = {}
): string {
  if (!src?.trim()) return "";
  const s = src.trim();

  if (!isCloudinarySrc(s)) return s;
  // Respect a width that was baked into the stored URL, but otherwise still
  // inject our transforms even if a bare f_auto/q_auto is already present.
  if (/[/,]w_\d/.test(s)) return s;

  const transform = buildTransform({ quality: "auto:eco", ...options });
  return s.replace(/\/upload\//, `/upload/${transform}/`);
}

/**
 * Build a responsive `srcset` string for a Cloudinary source, one candidate per
 * width using `w` descriptors (which lets the browser account for DPR).
 * Returns undefined for empty/non-Cloudinary sources so callers can omit the attribute.
 */
export function getImageSrcSet(
  src: string | undefined,
  widths: number[],
  options: GetImageUrlOptions = {}
): string | undefined {
  if (!src?.trim() || !isCloudinarySrc(src) || !widths.length) return undefined;
  return widths
    .map((width) => `${getImageUrl(src, { ...options, width })} ${width}w`)
    .join(", ");
}

/**
 * Build a CSS `image-set(...)` value for background images, mapping each width
 * to a DPR descriptor (first width = 1x, second = 2x, ...). For CSS backgrounds
 * that cannot use `srcset`. Returns undefined for empty/non-Cloudinary sources.
 */
export function getImageSet(
  src: string | undefined,
  widths: number[],
  options: GetImageUrlOptions = {}
): string | undefined {
  if (!src?.trim() || !isCloudinarySrc(src) || !widths.length) return undefined;
  const candidates = widths
    .map((width, i) => `url("${getImageUrl(src, { ...options, width })}") ${i + 1}x`)
    .join(", ");
  return `image-set(${candidates})`;
}

export interface ResponsiveImageOptions extends GetImageUrlOptions {
  /** Candidate widths for the srcset. */
  widths: number[];
  /** Width used for the plain `src` fallback. Defaults to the largest width. */
  fallbackWidth?: number;
}

/**
 * Convenience helper returning both `src` and `srcset` for an `<img>`.
 */
export function responsiveImage(
  src: string | undefined,
  { widths, fallbackWidth, ...options }: ResponsiveImageOptions
): { src: string; srcset: string | undefined } {
  const fallback = fallbackWidth ?? Math.max(...widths);
  return {
    src: getImageUrl(src, { ...options, width: fallback }),
    srcset: getImageSrcSet(src, widths, options),
  };
}
