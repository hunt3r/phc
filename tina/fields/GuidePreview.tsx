import * as React from 'react';
import { MdxFieldPlugin } from 'tinacms';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

const guideStyles = `
.guide-screen {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  white-space: normal;
}
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
.guide-related {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--tina-color-grey-2, #e5e7eb);
}
.guide-related p {
  font-size: 13px;
  font-weight: 650;
  margin: 0 0 0.35rem;
}
.guide-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 0.75rem;
}
.guide-button {
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  white-space: normal;
  color: var(--tina-color-grey-8, #1f2937);
  background: #fff;
  border: 1px solid var(--tina-color-grey-2, #d1d5db);
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}
.guide-edit {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  white-space: normal;
}
.guide-title-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0 0 1rem;
  white-space: normal;
}
.guide-title-field span {
  font-size: 13px;
  font-weight: 600;
}
.guide-title-field input {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  font: inherit;
  font-size: 15px;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--tina-color-grey-2, #d1d5db);
  border-radius: 6px;
  background: #fff;
}
`;

const GUIDES = [
  { title: 'Start here', slug: '01-start-here' },
  { title: 'Home page', slug: '02-home-page' },
  { title: 'Portfolio projects', slug: '03-portfolio-projects' },
  { title: 'Sectors, services, and tags', slug: '04-sectors-services-and-tags' },
  { title: 'About, staff, and other pages', slug: '05-about-staff-and-pages' },
  { title: 'Contact, menus, and footer', slug: '06-contact-menus-and-footer' },
  { title: 'Photos, videos, and content cards', slug: '07-photos-videos-and-content-cards' },
  { title: 'Search engines and AI', slug: '08-search-engines-and-ai' },
];

const RELATED: Record<string, string[]> = {
  '01-start-here': GUIDES.slice(1).map((guide) => guide.slug),
  '02-home-page': ['03-portfolio-projects', '07-photos-videos-and-content-cards', '08-search-engines-and-ai'],
  '03-portfolio-projects': ['02-home-page', '04-sectors-services-and-tags', '07-photos-videos-and-content-cards', '08-search-engines-and-ai'],
  '04-sectors-services-and-tags': ['03-portfolio-projects', '07-photos-videos-and-content-cards', '08-search-engines-and-ai'],
  '05-about-staff-and-pages': ['06-contact-menus-and-footer', '07-photos-videos-and-content-cards', '08-search-engines-and-ai'],
  '06-contact-menus-and-footer': ['05-about-staff-and-pages', '07-photos-videos-and-content-cards', '08-search-engines-and-ai'],
  '07-photos-videos-and-content-cards': [
    '02-home-page',
    '03-portfolio-projects',
    '04-sectors-services-and-tags',
    '05-about-staff-and-pages',
    '06-contact-menus-and-footer',
    '08-search-engines-and-ai',
  ],
  '08-search-engines-and-ai': [
    '02-home-page',
    '03-portfolio-projects',
    '04-sectors-services-and-tags',
    '05-about-staff-and-pages',
    '06-contact-menus-and-footer',
    '07-photos-videos-and-content-cards',
  ],
};

function guideHref(slug: string) {
  return `#/collections/edit/guides/${slug}`;
}

function linkifyGuideTitles(text: string, currentSlug: string): React.ReactNode {
  const matches: { index: number; guide: (typeof GUIDES)[number] }[] = [];
  for (const guide of GUIDES) {
    if (guide.slug === currentSlug) continue;
    let from = 0;
    while (from <= text.length) {
      const index = text.indexOf(guide.title, from);
      if (index === -1) break;
      matches.push({ index, guide });
      from = index + guide.title.length;
    }
  }
  matches.sort((a, b) => a.index - b.index || b.guide.title.length - a.guide.title.length);

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.index < cursor) continue;
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <a key={`${match.guide.slug}-${match.index}`} href={guideHref(match.guide.slug)}>
        {match.guide.title}
      </a>,
    );
    cursor = match.index + match.guide.title.length;
  }
  if (cursor === 0) return text;
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function GuideText({ children }: { children?: React.ReactNode }) {
  const slug = React.useMemo(() => {
    const match = window.location.hash.match(/\/collections\/edit\/guides\/([^/?#]+)/);
    return match?.[1] ?? '';
  }, []);
  if (typeof children !== 'string' || !children) return children;
  return linkifyGuideTitles(children, slug);
}

type GuideForm = {
  change: (name: string, value?: unknown) => void;
  reset: () => Promise<void> | void;
  subscribe: (
    subscriber: (state: { values?: { title?: string }; submitSucceeded?: boolean }) => void,
    subscription: { values?: boolean; submitSucceeded?: boolean },
  ) => () => void;
};

function RelatedGuides({ title }: { title: string }) {
  const fromHash = window.location.hash.match(/\/collections\/edit\/guides\/([^/?#]+)/)?.[1];
  const current = GUIDES.find((guide) => guide.slug === fromHash) ?? GUIDES.find((guide) => guide.title === title);
  const slugs = current ? RELATED[current.slug] ?? [] : [];
  const guides = GUIDES.filter((guide) => slugs.includes(guide.slug));
  if (guides.length === 0) return null;

  return (
    <nav className="guide-related" aria-label="Also in this guide">
      <p>Also in this guide</p>
      <ul>
        {guides.map((guide) => (
          <li key={guide.slug}>
            <a href={guideHref(guide.slug)}>{guide.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const RichTextEditor = MdxFieldPlugin.Component;

export function GuidePreview(props: { input: { value: unknown }; form: GuideForm }) {
  const { input, form } = props;
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const sawSubmit = React.useRef(false);

  React.useEffect(() => {
    return form.subscribe(
      ({ values, submitSucceeded }) => {
        setTitle(values?.title ?? '');
        if (!submitSucceeded) {
          sawSubmit.current = false;
          return;
        }
        if (!sawSubmit.current) {
          sawSubmit.current = true;
          setEditing(false);
        }
      },
      { values: true, submitSucceeded: true },
    );
  }, [form]);

  const cancel = () => {
    void Promise.resolve(form.reset()).then(() => setEditing(false));
  };

  return (
    <div className="guide-screen">
      <style>{guideStyles}</style>
      {editing ? (
        <div className="guide-edit">
          <label className="guide-title-field">
            <span>Title</span>
            <input
              value={title}
              onChange={(event) => form.change('title', event.target.value)}
            />
          </label>
          <RichTextEditor {...(props as any)} />
          <div className="guide-toolbar">
            <button type="button" className="guide-button" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <article className="guide-preview">
          <div className="guide-toolbar">
            <button type="button" className="guide-button" onClick={() => setEditing(true)}>
              Edit
            </button>
          </div>
          {title ? <h1>{title}</h1> : null}
          {input.value ? (
            <TinaMarkdown content={input.value as any} components={{ text: GuideText } as any} />
          ) : null}
          <RelatedGuides title={title} />
        </article>
      )}
    </div>
  );
}
