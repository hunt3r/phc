import { getCollection, getEntry } from 'astro:content';
import { getNavTree, getServicesNavTree, type NavNode } from '@/lib/tags';
import { creditNames, getEntityMap } from '@/lib/entities';
import {
  ORG_ADDRESS,
  ORG_AREA_SERVED,
  ORG_DESCRIPTION,
  ORG_EMAIL,
  ORG_FOUNDING_DATE,
} from '@/lib/seo/jsonld';

const TAGLINE =
  "PH&C, LLC is an owner's-representation, construction management, and real estate development consulting firm based in Wayne, PA, serving the Greater Philadelphia region and the Mid-Atlantic since " +
  ORG_FOUNDING_DATE +
  '.';

const byOrderThenTitle = (a: { data: Record<string, any> }, b: { data: Record<string, any> }) => {
  const orderA = a.data.order ?? 999;
  const orderB = b.data.order ?? 999;
  if (orderA !== orderB) return orderA - orderB;
  return (a.data.title ?? '').localeCompare(b.data.title ?? '');
};

function normalizeUrl(site: string, path: string): string {
  return new URL(path, site).href.replace(/\/$/, '');
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

/** Detail block for a top-level tag: heading, URL, body text, then its nested tags. */
function pushTagDetail(lines: string[], site: string, node: NavNode) {
  lines.push(`### ${node.entry.data.label}`);
  lines.push(`URL: ${normalizeUrl(site, node.href)}`);
  const description = node.entry.data.description?.trim();
  if (description) {
    lines.push('');
    lines.push(description);
  }
  if (node.entry.body?.trim()) {
    lines.push('');
    lines.push(node.entry.body.trim());
  }
  if (node.children.length) {
    lines.push('');
    pushTagTree(lines, site, node.children);
  }
  lines.push('');
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
  const portfolio = [...(await getCollection('portfolio'))].sort(byOrderThenTitle);
  const entityMap = await getEntityMap();
  const about = await getEntry('about', 'index');
  const serviceTree = await getServicesNavTree();
  const sectorTree = await getNavTree();

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

  // The short map links only the top level; the full file nests everything beneath.
  if (serviceTree.length) {
    lines.push('## Services');
    for (const node of serviceTree) lines.push(tagLink(site, node));
    lines.push('');
  }

  if (sectorTree.length) {
    lines.push('## Sectors');
    for (const node of sectorTree) lines.push(tagLink(site, node));
    lines.push('');
  }

  lines.push('## Portfolio');
  for (const entry of portfolio) {
    const data = entry.data as Record<string, any>;
    const url = `${site}/portfolio/${entry.id}`;
    const meta = [data.location, creditNames(data.client, entityMap), data.date].filter(Boolean).join(' - ');
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
      lines.push('');
      lines.push(about.body.trim());
      lines.push('');
    }
    if (serviceTree.length) {
      lines.push('## Services (detail)');
      lines.push('');
      for (const node of serviceTree) pushTagDetail(lines, site, node);
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
      if (data.date) facts.push(`Date: ${data.date}`);
      if (data.size) facts.push(`Size: ${data.size}`);
      if (data.projectCost) facts.push(`Project cost: ${data.projectCost}`);
      if (architect) facts.push(`Architect: ${architect}`);
      if (engineer) facts.push(`Engineer: ${engineer}`);
      if (contractor) facts.push(`Contractor: ${contractor}`);
      if (facts.length) lines.push(facts.join(' | '));
      if (data.description) {
        lines.push('');
        lines.push(data.description);
      }
      if (entry.body && entry.body.trim()) {
        lines.push('');
        lines.push(entry.body.trim());
      }
      lines.push('');
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
