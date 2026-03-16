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
  if (s.includes("f_auto") || s.includes("q_auto")) return s;

  const transform = buildTransform({ quality: "auto:eco", ...options });
  return s.replace(/\/upload\//, `/upload/${transform}/`);
}
