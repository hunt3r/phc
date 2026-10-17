/**
 * Shared delivery settings for full-bleed page heroes (`HeroPage`).
 * The `<picture>` and the document-head preload must use the same srcset.
 */
import { getImageSrcSet, getImageUrl } from "@/lib/cloudinary";

export const HERO_WIDTHS = [640, 768, 960, 1280, 1600, 1920, 2560];
export const HERO_QUALITY = "auto:low" as const;
export const HERO_SIZES = "100vw";

export interface HeroImageSources {
  /** WebP fallback `src` at the largest candidate width. */
  src: string;
  avifSrcSet?: string;
  webpSrcSet?: string;
}

export function resolveHeroImage(src: string | undefined): HeroImageSources | undefined {
  const trimmed = src?.trim();
  if (!trimmed) return undefined;

  const options = { quality: HERO_QUALITY } as const;
  return {
    src: getImageUrl(trimmed, { ...options, width: 1920, format: "webp" }),
    avifSrcSet: getImageSrcSet(trimmed, HERO_WIDTHS, { ...options, format: "avif" }),
    webpSrcSet: getImageSrcSet(trimmed, HERO_WIDTHS, { ...options, format: "webp" }),
  };
}
