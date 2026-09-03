/**
 * Helpers for the reusable "Content Card" promo section.
 *
 * Card `content` comes from a Tina `rich-text` field. Tina serializes rich-text
 * as a markdown string in `.md` collections (portfolio, tags, pages, about) but
 * as a rich-text AST object in the `home` `.json` collection, so `renderCardContent`
 * accepts either and returns an HTML string.
 */
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

export interface ContentCardData {
  content?: unknown;
  image?: string;
  ctaText?: string;
  ctaHref?: string;
  layout?: 'vertical' | 'horizontal';
  width?: 'contained' | 'full';
  backgroundColor?: 'none' | 'primary' | 'secondary' | 'brand-blue' | 'surface' | 'brand-beige';
  textSize?: 'sm' | 'base' | 'lg' | 'xl';
  imagePosition?: 'left' | 'right';
  matchImageHeight?: boolean;
}

/**
 * Background color utility classes keyed by the Tina `backgroundColor` option.
 * These are intentionally muted tints (not the full-saturation brand colors) so
 * text stays comfortable to read; dark text is used on all of them.
 */
export const BG_CLASS: Record<NonNullable<ContentCardData['backgroundColor']>, string> = {
  none: '',
  primary: 'bg-primary/10',
  secondary: 'bg-secondary/15',
  'brand-blue': 'bg-brand-blue/10',
  surface: 'bg-surface',
  'brand-beige': 'bg-brand-beige/20',
};

/** Background colors dark enough to require light text (none, now that tints are muted). */
export const DARK_BACKGROUNDS = new Set<string>([]);

/**
 * Root font-size (in rem) keyed by the Tina `textSize` option. Applied inline to
 * the prose container: Tailwind Typography sizes every child in `em`, so setting
 * the container font-size scales the whole card. This is used instead of the
 * `prose-*` size modifiers, which tie on specificity with the `prose-lg` that
 * `.prose-content` bakes in and so don't reliably override it.
 */
export const TEXT_SIZE_REM: Record<NonNullable<ContentCardData['textSize']>, string> = {
  sm: '1rem',
  base: '1.125rem',
  lg: '1.375rem',
  xl: '1.75rem',
};

let processorPromise: ReturnType<typeof createMarkdownProcessor> | null = null;
function getProcessor() {
  if (!processorPromise) {
    processorPromise = createMarkdownProcessor({ gfm: true, smartypants: true });
  }
  return processorPromise;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Serialize a Tina rich-text AST (used by JSON collections) to an HTML string. */
function serializeRichText(node: any): string {
  if (node == null) return '';
  if (Array.isArray(node)) return node.map(serializeRichText).join('');

  // Leaf text node with optional marks.
  if (typeof node.text === 'string') {
    let text = escapeHtml(node.text);
    if (node.code) text = `<code>${text}</code>`;
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.strikethrough) text = `<s>${text}</s>`;
    return text;
  }

  const children = serializeRichText(node.children);

  switch (node.type) {
    case 'root':
      return children;
    case 'h1':
      return `<h1>${children}</h1>`;
    case 'h2':
      return `<h2>${children}</h2>`;
    case 'h3':
      return `<h3>${children}</h3>`;
    case 'h4':
      return `<h4>${children}</h4>`;
    case 'h5':
      return `<h5>${children}</h5>`;
    case 'h6':
      return `<h6>${children}</h6>`;
    case 'p':
      return `<p>${children}</p>`;
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`;
    case 'ul':
      return `<ul>${children}</ul>`;
    case 'ol':
      return `<ol>${children}</ol>`;
    case 'li':
      return `<li>${children}</li>`;
    case 'lic':
      // "list item content" wrapper – render inline without an extra block.
      return children;
    case 'a':
      return `<a href="${escapeHtml(node.url ?? '#')}"${
        node.title ? ` title="${escapeHtml(node.title)}"` : ''
      }>${children}</a>`;
    case 'img':
      return `<img src="${escapeHtml(node.url ?? '')}" alt="${escapeHtml(node.alt ?? '')}" />`;
    case 'code_block':
      return `<pre><code>${escapeHtml(node.value ?? '')}</code></pre>`;
    case 'hr':
      return '<hr />';
    case 'break':
      return '<br />';
    default:
      return children;
  }
}

/**
 * Render card content (markdown string or Tina rich-text AST) to an HTML string.
 */
export async function renderCardContent(content: unknown): Promise<string> {
  if (content == null) return '';
  if (typeof content === 'string') {
    if (!content.trim()) return '';
    const processor = await getProcessor();
    const { code } = await processor.render(content);
    return code;
  }
  return serializeRichText(content);
}
