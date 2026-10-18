const MIN_LENGTH = 50;
/** Shortest run of whole sentences worth using on its own. */
const MIN_USEFUL = 70;
const MAX_LENGTH = 155;
/** Search snippets read best at 120 characters or more. */
const TARGET_MIN = 120;

/** Short firm line used when a page has no usable description of its own. */
export const FIRM_LINE =
  "PH&C is an owner's representative and construction management firm in Wayne, PA.";

const ABBREVIATIONS = /\b(?:Co|Inc|Corp|Ltd|St|Mt|Dr|Mr|Ms|Mrs|Jr|Sr|vs|No|U\.S|approx)\.$/i;

export function stripMarkdown(value: string): string {
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

function splitSentences(text: string): string[] {
  const pieces = text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'“(])/);
  const sentences: string[] = [];
  for (const piece of pieces) {
    const last = sentences[sentences.length - 1];
    if (last && ABBREVIATIONS.test(last)) sentences[sentences.length - 1] = `${last} ${piece}`;
    else sentences.push(piece);
  }
  return sentences.filter((s) => /[.!?]["'”)]*$/.test(s));
}

/** The leading whole sentences of `text` that fit in `max` characters. */
export function leadingSentences(text: string, max: number = MAX_LENGTH): string {
  let result = "";
  for (const sentence of splitSentences(stripMarkdown(text))) {
    const next = result ? `${result} ${sentence}` : sentence;
    if (next.length > max) break;
    result = next;
  }
  return result;
}

const PADDING: { text: string; skipIf: RegExp }[] = [
  { text: "PH&C is based in Wayne, PA, serving Greater Philadelphia.", skipIf: /Wayne|PH&C is/ },
  { text: "Serving Greater Philadelphia from Wayne, PA.", skipIf: /Wayne|Greater Philadelphia/ },
  { text: "Based in Wayne, PA.", skipIf: /Wayne/ },
  { text: "Serving Greater Philadelphia.", skipIf: /Greater Philadelphia/ },
];

/** Add one short location sentence to a complete description that falls under 120 characters. */
function padToTarget(text: string): string {
  if (text.length >= TARGET_MIN || /…$/.test(text)) return text;
  for (const { text: extra, skipIf } of PADDING) {
    if (skipIf.test(text)) continue;
    const next = `${text} ${extra}`;
    if (next.length >= TARGET_MIN && next.length <= MAX_LENGTH) return next;
  }
  return text;
}

function clampWords(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max).replace(/\s+\S*$/, "").replace(/[.,;:–—-]+$/u, "");
  return `${cut}…`;
}

/**
 * Meta and Open Graph description. Visible page copy is left alone.
 * Uses whole sentences from `source` when they fit. Otherwise it uses
 * `fallback` (a sentence written for that kind of page), then the page title
 * plus the firm line. Text is never cut mid-sentence unless the page has
 * nothing shorter to offer, and then it ends in an ellipsis.
 */
export function metaDescription(
  source: string | undefined,
  title: string,
  fallback?: string
): string {
  const stripped = stripMarkdown(source ?? "");
  const sentences = leadingSentences(stripped);
  if (sentences.length >= MIN_USEFUL) return padToTarget(sentences);

  const fallbackText = stripMarkdown(fallback ?? "");
  if (fallbackText.length >= MIN_USEFUL) return padToTarget(clampWords(fallbackText, MAX_LENGTH));

  if (stripped.length >= MIN_LENGTH && !fallbackText) {
    // One long sentence with no shorter option: cut on a word.
    return clampWords(stripped, MAX_LENGTH);
  }

  const pageTitle = title.replace(/^PH&C\s[-–]\s/u, "").trim() || "PH&C";
  return padToTarget(clampWords(`${pageTitle}. ${FIRM_LINE}`, MAX_LENGTH));
}
