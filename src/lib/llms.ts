import { getCollection, getEntry } from 'astro:content';
import { childrenOf, getTagMap } from '@/lib/tags';
import {
  CORE_SERVICES,
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
  const about = await getEntry('about', 'index');
  const tagMap = await getTagMap();
  const serviceTags = childrenOf('services', tagMap).filter((t) => t.data.order != null);

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

  lines.push('## Services');
  for (const service of CORE_SERVICES) {
    lines.push(`- ${service.name}: ${service.description}`);
  }
  lines.push('');

  lines.push('## Portfolio');
  for (const entry of portfolio) {
    const data = entry.data as Record<string, any>;
    const url = `${site}/portfolio/${entry.id}`;
    const meta = [data.location, data.client, data.date].filter(Boolean).join(' - ');
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
    if (serviceTags.length) {
      lines.push('## Services (detail)');
      lines.push('');
      for (const service of serviceTags) {
        lines.push(`### ${service.data.label}`);
        lines.push(`URL: ${normalizeUrl(site, `/services/${service.id}`)}`);
        if (service.body?.trim()) {
          lines.push('');
          lines.push(service.body.trim());
        }
        const children = childrenOf(service.id, tagMap);
        if (children.length) {
          lines.push('');
          for (const child of children) {
            const grandchildren = childrenOf(child.id, tagMap);
            if (grandchildren.length) {
              lines.push(
                `- ${child.data.label}: ${grandchildren.map((g) => g.data.label).join(', ')}`
              );
            } else {
              lines.push(
                `- ${child.data.label}${child.data.description ? `: ${child.data.description}` : ''}`
              );
            }
          }
        }
        lines.push('');
      }
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
      if (data.client) facts.push(`Client: ${data.client}`);
      if (data.date) facts.push(`Date: ${data.date}`);
      if (data.size) facts.push(`Size: ${data.size}`);
      if (data.projectCost) facts.push(`Project cost: ${data.projectCost}`);
      if (data.architect) facts.push(`Architect: ${data.architect}`);
      if (data.contractor) facts.push(`Contractor: ${data.contractor}`);
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
