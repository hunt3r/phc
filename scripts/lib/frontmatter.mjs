/**
 * Minimal, format-preserving frontmatter editing.
 *
 * gray-matter is great for READING frontmatter, but `matter.stringify` re-dumps
 * the entire YAML block and drops the repo's "quote every scalar" style, which
 * creates noisy diffs on untouched fields (and can reformat nested arrays like
 * `gallery`/`quotes`). These helpers instead do targeted, single-line edits so
 * only the fields we intend to change actually change.
 *
 * Scope: top-level, single-line scalar fields only (title, location, client,
 * date, size, projectCost, architect, contractor, description). That covers
 * every field the CSV workflow and description cleanup touch.
 */

/**
 * Split a markdown file into its frontmatter fence and body, preserving the
 * exact original text of each part.
 * @param {string} raw
 * @returns {{ open: string, fm: string, close: string, body: string } | null}
 */
export function splitFrontmatter(raw) {
  const m = raw.match(/^(---\r?\n)([\s\S]*?)(\r?\n---[ \t]*\r?\n?)([\s\S]*)$/);
  if (!m) return null;
  return { open: m[1], fm: m[2], close: m[3], body: m[4] };
}

/**
 * Serialize a string as a single-quoted YAML scalar (repo convention).
 * @param {string} value
 * @returns {string}
 */
export function yamlSingleQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Detect the newline style used in a text block.
 * @param {string} text
 * @returns {string}
 */
function detectEol(text) {
  return /\r\n/.test(text) ? "\r\n" : "\n";
}

/**
 * Set (replace or insert) a top-level single-line scalar field in a frontmatter
 * text block. Returns the updated frontmatter text.
 *
 * @param {string} fm - frontmatter text (between the --- fences, no fences)
 * @param {string} key
 * @param {string} value - serialized as a single-quoted scalar
 * @param {{ after?: string[] }} [opts] - preferred keys to insert after when the key is new
 * @returns {string}
 */
export function setScalarField(fm, key, value, opts = {}) {
  const eol = detectEol(fm);
  const lines = fm.split(/\r?\n/);
  const line = `${key}: ${yamlSingleQuote(value)}`;
  const keyRe = new RegExp(`^${key}:(?:\\s|$)`);

  const idx = lines.findIndex((l) => keyRe.test(l));
  if (idx !== -1) {
    lines[idx] = line;
    return lines.join(eol);
  }

  // New key: insert right after the last matching "after" anchor, else at top.
  const after = opts.after ?? [];
  let insertAt = 0;
  for (const anchor of after) {
    const anchorRe = new RegExp(`^${anchor}:(?:\\s|$)`);
    const aIdx = lines.findIndex((l) => anchorRe.test(l));
    if (aIdx !== -1) insertAt = Math.max(insertAt, aIdx + 1);
  }
  lines.splice(insertAt, 0, line);
  return lines.join(eol);
}
