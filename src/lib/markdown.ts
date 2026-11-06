import { Marked, type Tokens } from 'marked';
import { getImageSrcSet, getImageUrl } from '@/lib/cloudinary';

const CONTENT_WIDTHS = [640, 960, 1280, 1600];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const parser = new Marked();
parser.use({
  renderer: {
    image({ href, text, title }: Tokens.Image) {
      const src = getImageUrl(href, { width: 1600 });
      const srcset = getImageSrcSet(href, CONTENT_WIDTHS);
      const srcsetAttr = srcset
        ? ` srcset="${escapeHtml(srcset)}" sizes="(min-width: 90rem) 86rem, 100vw"`
        : '';
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(text)}"${titleAttr}${srcsetAttr} loading="lazy" decoding="async" />`;
    },
  },
});

/** Markdown HTML with inline images deferred until they are near the viewport. */
export function renderMarkdown(markdown: string): string {
  return parser.parse(markdown, { async: false }) as string;
}
