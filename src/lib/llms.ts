import { getCollection, getEntry } from 'astro:content';
import { childrenOf, getNavTree, getServicesNavTree, getTagMap, tagHref, type NavNode } from '@/lib/tags';
import { creditNames, getEntityMap } from '@/lib/entities';
import {
  ORG_ADDRESS,
  ORG_AREA_SERVED,
  ORG_DESCRIPTION,
  ORG_EMAIL,
  ORG_FOUNDING_DATE,
} from '@/lib/seo/jsonld';
import { formatProjectDate, sortPortfolioEntries } from '@/lib/project-date';
import { getAllQuotes } from '@/lib/quotes';
import { withStaffSlugs } from '@/data/staff';

const TAGLINE =
  "PH&C, LLC is an owner's-representation, construction management, and real estate development consulting firm based in Wayne, PA, serving the Greater Philadelphia region and the Mid-Atlantic since " +
  ORG_FOUNDING_DATE +
  '.';

function normalizeUrl(site: string, path: string): string {
  return new URL(path, site).href.replace(/\/$/, '');
}

/** Query parameters added by ad and analytics tools; they mean nothing to a reader. */
const TRACKING_PARAM = /^(utm_\w+|gclid|gbraid|wbraid|fbclid|msclkid|cmp)$/i;

function stripTracking(href: string): string {
  if (!/^https?:/i.test(href)) return href;
  try {
    const url = new URL(href);
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAM.test(key)) url.searchParams.delete(key);
    }
    return url.href;
  } catch {
    return href;
  }
}

/**
 * Prepare stored markdown for the text file: drop Tina's `\&` escapes, make
 * site-relative links absolute, and remove tracking parameters from links.
 */
function cleanMarkdown(site: string, text: string): string {
  return text
    .replace(/\\&/g, '&')
    .replace(/\]\(([^)\s]+)\)/g, (_, href: string) => {
      const target = href.startsWith('/') && !href.startsWith('//') ? normalizeUrl(site, href) : stripTracking(href);
      return `](${target})`;
    });
}

/** Lowercase words only, so an excerpt can be matched against the body it came from. */
function plainWords(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[^\p{L}\p{N}$%]+/gu, ' ')
    .trim()
    .toLowerCase();
}

/** True when the description is just the opening of the body, as with imported WordPress excerpts. */
function descriptionRepeatsBody(description: string, body: string): boolean {
  const lead = plainWords(description).slice(0, 80);
  return lead.length > 0 && plainWords(body).includes(lead);
}

/** `- [Label](url): description` for a tag, omitting the description when blank. */
function tagLink(site: string, node: NavNode): string {
  const description = node.entry.data.description?.trim();
  return `- [${node.entry.data.label}](${normalizeUrl(site, node.href)})${description ? `: ${description}` : ''}`;
}

/** Nested bullet list of a tag's descendants, each linked to its own page. */
function pushTagTree(lines: string[], site: string, nodes: NavNode[], depth = 0) {
  for (const node of nodes) {
    lines.push(`${'  '.repeat(depth)}${tagLink(site, node)}`);
    pushTagTree(lines, site, node.children, depth + 1);
  }
}

/**
 * Detail block for a tag (heading, URL, parent tags, description, body),
 * then one block per nested tag. Every tag gets an H3 so headings stay
 * shallow; the "Part of" line carries the nesting instead.
 */
function pushTagDetail(lines: string[], site: string, node: NavNode, trail: string[] = []) {
  lines.push(`### ${node.entry.data.label}`);
  lines.push(`URL: ${normalizeUrl(site, node.href)}`);
  if (trail.length) lines.push(`Part of: ${trail.join(' > ')}`);
  const description = node.entry.data.description?.trim();
  if (description) {
    lines.push('');
    lines.push(cleanMarkdown(site, description));
  }
  if (node.entry.body?.trim()) {
    lines.push('');
    lines.push(demoteHeadings(cleanMarkdown(site, node.entry.body.trim())));
  }
  lines.push('');
  for (const child of node.children) pushTagDetail(lines, site, child, [...trail, node.entry.data.label]);
}

/** Move body headings below the H3 that introduces each page (`##` becomes `####`). */
function demoteHeadings(markdown: string): string {
  return markdown.replace(/^(#{1,6})(?=\s)/gm, (hashes) => '#'.repeat(Math.min(Math.max(hashes.length, 2) + 2, 6)));
}

/**
 * Build the contents of /llms.txt (curated map) or /llms-full.txt (map plus
 * inlined page and project text) from the site's content collections.
 *
 * Follows the llms.txt convention: an H1 title, a one-line blockquote summary,
 * and H2 sections of links so an LLM can navigate or ingest the site quickly.
 */
export async function buildLlmsTxt(site: string, opts: { full: boolean }): Promise<string> {
  const { full } = opts;
  const portfolio = sortPortfolioEntries(await getCollection('portfolio'));
  const entityMap = await getEntityMap();
  const about = await getEntry('about', 'index');
  const contact = await getEntry('contact', 'contact');
  const staff = withStaffSlugs((await getEntry('staff', 'index'))?.data?.staff ?? []);
  const quotes = await getAllQuotes();
  const serviceTree = await getServicesNavTree();
  const sectorTree = await getNavTree();
  // Service pages left out of the services menu (no Order) still have public pages.
  const tagMap = await getTagMap();
  const otherServices: NavNode[] = childrenOf('services', tagMap)
    .filter((entry) => entry.data.order == null)
    .map((entry) => ({ entry, href: tagHref(entry.id, tagMap), children: [] }));

  const lines: string[] = [];

  lines.push('# PH&C, LLC');
  lines.push('');
  lines.push(`> ${TAGLINE}`);
  lines.push('');
  lines.push(ORG_DESCRIPTION);
  lines.push('');
  lines.push(
    `Location: ${ORG_ADDRESS.streetAddress}, ${ORG_ADDRESS.addressLocality}, ${ORG_ADDRESS.addressRegion} ${ORG_ADDRESS.postalCode}`
  );
  lines.push(`Contact: ${ORG_EMAIL}`);
  lines.push(`Founded: ${ORG_FOUNDING_DATE}`);
  lines.push(`Areas served: ${ORG_AREA_SERVED.join(', ')}`);
  lines.push('');

  lines.push('## Key pages');
  lines.push(`- [About](${normalizeUrl(site, '/about')}): Company history, mission, values, and key personnel.`);
  lines.push(`- [Services](${normalizeUrl(site, '/services')}): Full range of consulting and construction management services.`);
  lines.push(`- [Portfolio](${normalizeUrl(site, '/portfolio')}): Completed and in-progress projects.`);
  lines.push(`- [Testimonials](${normalizeUrl(site, '/testimonials')}): Client feedback.`);
  lines.push(`- [Contact](${normalizeUrl(site, '/contact')}): Get in touch with PH&C.`);
  lines.push('');

  if (serviceTree.length) {
    lines.push('## Services');
    pushTagTree(lines, site, serviceTree);
    lines.push('');
  }

  if (otherServices.length) {
    lines.push('## Other services');
    pushTagTree(lines, site, otherServices);
    lines.push('');
  }

  if (sectorTree.length) {
    lines.push('## Sectors');
    pushTagTree(lines, site, sectorTree);
    lines.push('');
  }

  lines.push('## Portfolio');
  for (const entry of portfolio) {
    const data = entry.data as Record<string, any>;
    const url = `${site}/portfolio/${entry.id}`;
    const meta = [data.location, creditNames(data.client, entityMap), formatProjectDate(data.date)].filter(Boolean).join(' - ');
    const summary = [meta, data.description].filter(Boolean).join(' - ');
    lines.push(`- [${data.title}](${url})${summary ? `: ${summary}` : ''}`);
  }
  lines.push('');

  if (full) {
    lines.push('---');
    lines.push('');
    lines.push('# Full content');
    lines.push('');

    if (about?.body) {
      lines.push('## About PH&C');
      lines.push(`URL: ${normalizeUrl(site, '/about')}`);
      lines.push('');
      lines.push(cleanMarkdown(site, about.body.trim()));
      lines.push('');
    }
    if (staff.length) {
      lines.push('## Team');
      lines.push('');
      for (const member of staff) {
        lines.push(`### ${member.name.trim()}, ${member.title.trim()}`);
        lines.push(`URL: ${normalizeUrl(site, `/about/${member.slug}`)}`);
        const credentials = (member.credentials ?? []).map((c) => c.trim()).filter(Boolean);
        if (credentials.length) lines.push(`Credentials: ${credentials.join('; ')}`);
        if (member.note?.trim()) lines.push(member.note.trim());
        if (member.bio?.trim()) {
          lines.push('');
          lines.push(cleanMarkdown(site, member.bio.trim()));
        }
        lines.push('');
      }
    }
    if (quotes.length) {
      lines.push('## Testimonials');
      lines.push(`URL: ${normalizeUrl(site, '/testimonials')}`);
      lines.push('');
      for (const q of quotes) {
        const who = [q.author, q.role].filter(Boolean).join(', ');
        const source = `[${q.projectTitle}](${normalizeUrl(site, q.projectHref)})`;
        lines.push(`> ${q.quote.trim().replace(/\s*\n\s*/g, ' ')}`);
        lines.push(`> — ${who ? `${who}, on ` : ''}${source}`);
        lines.push('');
      }
    }
    if (contact) {
      lines.push('## Contact');
      lines.push(`URL: ${normalizeUrl(site, '/contact')}`);
      const contactInfo = (contact.data as { contactInfo?: string }).contactInfo?.trim();
      if (contactInfo) {
        lines.push('');
        lines.push(cleanMarkdown(site, contactInfo));
      }
      lines.push('');
    }
    if (serviceTree.length) {
      lines.push('## Services (detail)');
      lines.push('');
      for (const node of serviceTree) pushTagDetail(lines, site, node);
      for (const node of otherServices) pushTagDetail(lines, site, node);
    }
    if (sectorTree.length) {
      lines.push('## Sectors (detail)');
      lines.push('');
      for (const node of sectorTree) pushTagDetail(lines, site, node);
    }
    lines.push('## Projects (detail)');
    lines.push('');
    for (const entry of portfolio) {
      const data = entry.data as Record<string, any>;
      const url = `${site}/portfolio/${entry.id}`;
      lines.push(`### ${data.title}`);
      lines.push(`URL: ${url}`);
      const facts: string[] = [];
      if (data.location) facts.push(`Location: ${data.location}`);
      const client = creditNames(data.client, entityMap);
      const architect = creditNames(data.architect, entityMap);
      const engineer = creditNames(data.engineer, entityMap);
      const contractor = creditNames(data.contractor, entityMap);
      if (client) facts.push(`Client: ${client}`);
      const projectDate = formatProjectDate(data.date);
      if (projectDate) facts.push(`Date: ${projectDate}`);
      if (data.size) facts.push(`Size: ${data.size}`);
      if (data.projectCost) facts.push(`Project cost: ${data.projectCost}`);
      if (architect) facts.push(`Architect: ${architect}`);
      if (engineer) facts.push(`Engineer: ${engineer}`);
      if (contractor) facts.push(`Contractor: ${contractor}`);
      if (facts.length) lines.push(facts.join(' | '));
      const body = entry.body?.trim() ?? '';
      if (data.description && !descriptionRepeatsBody(data.description, body)) {
        lines.push('');
        lines.push(cleanMarkdown(site, data.description));
      }
      if (body) {
        lines.push('');
        lines.push(demoteHeadings(cleanMarkdown(site, body)));
      }
      lines.push('');
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
