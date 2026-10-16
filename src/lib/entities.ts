import { getCollection } from 'astro:content';

export type EntityKind = 'person' | 'company' | 'organization';

export type EntityCredit = {
  name: string;
  url?: string;
  logo?: string;
  kind?: string;
  /** Live-preview marker. Clicking the party opens that entity for editing. */
  field?: string;
};

const REF_FILE = /^src\/content\/entities\/([^/]+)\.(md|mdx|json)$/i;

function creditFromData(data: {
  name?: string | null;
  url?: string | null;
  logo?: string | null;
  kind?: string | null;
}): EntityCredit | null {
  const name = data.name?.trim();
  if (!name) return null;
  const url = data.url?.trim();
  const logo = data.logo?.trim();
  const kind = data.kind?.trim();
  return {
    name,
    ...(url ? { url } : {}),
    ...(logo ? { logo } : {}),
    ...(kind ? { kind } : {}),
  };
}

export async function getEntityMap(): Promise<Map<string, EntityCredit>> {
  const entries = await getCollection('entities');
  const map = new Map<string, EntityCredit>();
  for (const entry of entries) {
    const credit = creditFromData(entry.data);
    if (!credit) continue;
    map.set(entry.id, credit);
    map.set(`src/content/entities/${entry.id}.md`, credit);
  }
  return map;
}

function creditFromUnknown(value: unknown, byPath: Map<string, EntityCredit>): EntityCredit | null {
  if (typeof value === 'string') {
    const ref = value.trim();
    if (!ref) return null;
    return byPath.get(ref) ?? byPath.get(ref.match(REF_FILE)?.[1] ?? '') ?? null;
  }
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if ('entity' in record) return creditFromUnknown(record.entity, byPath);
  if ('node' in record) return creditFromUnknown(record.node, byPath);
  if (typeof record.name === 'string') {
    return creditFromData({
      name: record.name,
      url: typeof record.url === 'string' ? record.url : undefined,
      logo: typeof record.logo === 'string' ? record.logo : undefined,
      kind: typeof record.kind === 'string' ? record.kind : undefined,
    });
  }
  return null;
}

/**
 * Project role values arrive as Tina reference lists (`{ entity: path }`),
 * as resolved Tina query objects (`{ entity: { name, url, logo } }`), or as
 * the editor's unsaved overlay, which keeps the path. Resolve all of them
 * to the credits the project page shows.
 */
export function resolveCredits(value: unknown, byPath: Map<string, EntityCredit>): EntityCredit[] {
  if (!Array.isArray(value)) return [];
  const credits: EntityCredit[] = [];
  for (const item of value) {
    const credit = creditFromUnknown(item, byPath);
    if (credit) credits.push(credit);
  }
  return credits;
}

export function creditNames(value: unknown, byPath: Map<string, EntityCredit>): string {
  return resolveCredits(value, byPath)
    .map((credit) => credit.name)
    .join(', ');
}
