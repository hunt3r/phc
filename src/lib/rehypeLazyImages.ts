import { getImageSrcSet, getImageUrl } from './cloudinary';

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const CONTENT_WIDTHS = [640, 960, 1280, 1600];

/** Lazy-load markdown images, and deliver Cloudinary uploads compressed. */
export function rehypeLazyImages() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === 'element' && node.tagName === 'img' && node.properties) {
        const raw = node.properties.src;
        if (typeof raw === 'string' && raw.trim()) {
          node.properties.src = getImageUrl(raw, { width: 1600 });
          const srcset = getImageSrcSet(raw, CONTENT_WIDTHS);
          if (srcset) {
            node.properties.srcset = srcset;
            if (node.properties.sizes == null) node.properties.sizes = '(min-width: 90rem) 86rem, 100vw';
          }
        }
        if (node.properties.loading == null) node.properties.loading = 'lazy';
        if (node.properties.decoding == null) node.properties.decoding = 'async';
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
