type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/** Add loading="lazy" to markdown images so below-the-fold photos wait to download. */
export function rehypeLazyImages() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === 'element' && node.tagName === 'img' && node.properties) {
        if (node.properties.loading == null) node.properties.loading = 'lazy';
        if (node.properties.decoding == null) node.properties.decoding = 'async';
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
