import LazyRichTextImage from '../components/LazyRichTextImage.astro';

/** Shared TinaMarkdown overrides so the live preview lazy-loads inline images. */
export const tinaMarkdownComponents = {
  img: LazyRichTextImage,
};
