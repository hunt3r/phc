/**
 * Attributes for a below-the-fold photo that waits until the visitor scrolls
 * near it. `DeferredImages.astro` swaps the real `src`/`srcset` in. The
 * placeholder has the photo's aspect ratio so the box keeps its size, which
 * matches how the browser sizes an unloaded image from `width`/`height`.
 */
export function deferredImageAttrs(
  src: string | undefined,
  srcset: string | undefined,
  width: number,
  height: number,
) {
  return {
    src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3C/svg%3E`,
    'data-defer-src': src,
    'data-defer-srcset': srcset,
  };
}
