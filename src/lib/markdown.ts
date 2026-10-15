import { Marked, type Tokens } from 'marked';

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
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" decoding="async" />`;
    },
  },
});

/** Markdown HTML with inline images deferred until they are near the viewport. */
export function renderMarkdown(markdown: string): string {
  return parser.parse(markdown, { async: false }) as string;
}
