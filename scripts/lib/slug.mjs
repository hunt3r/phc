/**
 * Derive a filesystem-safe slug from a URL path.
 * Handles duplicates by appending a numeric suffix (caller can pass existing slugs).
 */

/**
 * @param {string} url - Full URL or path
 * @param {Set<string>} [existing] - Existing slugs to avoid collision
 * @returns {string}
 */
export function slugFromUrl(url, existing = new Set()) {
  try {
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    const segment = path.split("/").filter(Boolean).pop() || "index";
    let base = segment
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9_-]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "page";
    if (base.length > 80) base = base.slice(0, 80);
    let slug = base;
    let n = 0;
    while (existing.has(slug)) {
      n += 1;
      slug = `${base}-${n}`;
    }
    existing.add(slug);
    return slug;
  } catch {
    return "page";
  }
}

/**
 * Derive slug from URL for use in taxonomy (category/tag/author archive URL).
 * @param {string} url
 * @returns {string}
 */
export function slugFromTaxonomyUrl(url) {
  try {
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    const segment = path.split("/").filter(Boolean).pop() || "unknown";
    return segment
      .replace(/[^a-z0-9_-]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Mirror URL path to a folder path (no leading/trailing slashes, safe for fs).
 * e.g. https://phandc.net/privacy-policy/ -> privacy-policy
 *      https://phandc.net/portfolio/item-name/ -> portfolio/item-name (if basePath is empty)
 * We strip the domain and use the path; optionally strip a base path prefix.
 * @param {string} url - Full URL
 * @param {string} [baseHost] - e.g. https://phandc.net - path is taken relative to this
 * @returns {string} - path segments joined by /, sanitized
 */
export function urlPathToFolderPath(url, baseHost = "") {
  try {
    const u = new URL(url);
    let segs = u.pathname.split("/").filter(Boolean);
    if (baseHost) {
      const base = new URL(baseHost);
      const baseSegs = base.pathname.split("/").filter(Boolean);
      if (baseSegs.length && segs.length >= baseSegs.length) {
        const same = baseSegs.every((b, i) => segs[i] === b);
        if (same) segs = segs.slice(baseSegs.length);
      }
    }
    const sanitized = segs
      .map((s) =>
        s
          .replace(/[^a-z0-9._-]/gi, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      )
      .filter(Boolean);
    return sanitized.join("/") || "index";
  } catch {
    return "index";
  }
}
