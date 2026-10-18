const MIN_LENGTH = 50;
const TARGET_MIN = 120;
const MAX_LENGTH = 155;

/** Short firm line used when a page has no usable description of its own. */
const FIRM_LINE =
  "PH&C is an owner's representative and construction management firm based in Wayne, Pennsylvania, serving Greater Philadelphia.";

function stripMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_~`>#]+/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const slice = text.slice(0, max + 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = (lastSpace >= TARGET_MIN ? slice.slice(0, lastSpace) : text.slice(0, max)).trim();
  return cut.replace(/[.,;:–—-]+$/u, "");
}

/**
 * Meta and Open Graph description. Visible page copy is left alone.
 * Long text is cut on a word. Missing or very short text becomes the page
 * title plus the firm line, then clamped to the same limit.
 */
export function metaDescription(source: string | undefined, title: string): string {
  const stripped = stripMarkdown(source ?? "");
  const pageTitle = title.replace(/^PH&C\s[-–]\s/u, "").trim() || "PH&C";
  let text = stripped;
  if (text.length < MIN_LENGTH) {
    text = `${pageTitle}. ${FIRM_LINE}`;
  } else if (text.length < TARGET_MIN) {
    text = `${text} ${FIRM_LINE}`;
  }
  return clamp(text, MAX_LENGTH);
}
