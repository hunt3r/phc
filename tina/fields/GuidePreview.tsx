import * as React from 'react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

const guideStyles = `
.guide-preview {
  color: var(--tina-color-grey-8, #1f2937);
  font-size: 15px;
  line-height: 1.6;
  width: 100%;
  max-width: min(42rem, 100%);
  min-width: 0;
  white-space: normal;
  overflow-wrap: break-word;
}
.guide-preview * {
  white-space: normal;
  overflow-wrap: break-word;
  min-width: 0;
  max-width: 100%;
}
.guide-preview h1 {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 1rem;
}
.guide-preview h2 {
  font-size: 1.25rem;
  font-weight: 650;
  line-height: 1.3;
  margin: 1.75rem 0 0.5rem;
}
.guide-preview h3 {
  font-size: 1.05rem;
  font-weight: 650;
  line-height: 1.35;
  margin: 1.25rem 0 0.4rem;
}
.guide-preview p {
  margin: 0 0 0.85rem;
}
.guide-preview ul,
.guide-preview ol {
  margin: 0 0 0.85rem;
  padding-left: 1.35rem;
}
.guide-preview ul {
  list-style: disc;
}
.guide-preview ol {
  list-style: decimal;
}
.guide-preview li {
  margin: 0.2rem 0;
}
.guide-preview li > p {
  margin: 0;
}
.guide-preview strong {
  font-weight: 650;
}
.guide-preview a {
  color: var(--tina-color-primary, #2296fe);
  text-decoration: underline;
}
`;

export function GuidePreview({ input, form }: { input: { value: unknown }; form: { getState: () => { values?: { title?: string } } } }) {
  const title = form?.getState?.()?.values?.title;

  return (
    <article className="guide-preview">
      <style>{guideStyles}</style>
      {title ? <h1>{title}</h1> : null}
      {input.value ? <TinaMarkdown content={input.value as any} /> : null}
    </article>
  );
}
