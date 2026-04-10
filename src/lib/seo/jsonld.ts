type Maybe<T> = T | null | undefined;

export type JsonLdNode = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  path?: string;
  url?: string;
}

export interface PortfolioSchemaInput {
  url: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  date?: string;
  location?: string;
  client?: string;
  tags?: string[];
}

const ORG_ID = "#organization";
const WEBSITE_ID = "#website";
const SITE_NAME = "PH&C";

function compact<T extends JsonLdNode>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => {
      if (v === undefined || v === null) return false;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim().length > 0;
      return true;
    })
  ) as T;
}

export function toAbsoluteUrl(value: string, site: string): string {
  if (!value) return value;
  if (/^https?:\/\//.test(value)) return value;
  return new URL(value, site).href;
}

export function createOrganizationSchema(site: string, options?: { logoPath?: string }): JsonLdNode {
  const logo = toAbsoluteUrl(options?.logoPath ?? "/images/logo-light.png", site);
  return compact({
    "@type": "Organization",
    "@id": `${site}${ORG_ID}`,
    name: SITE_NAME,
    url: site,
    logo: {
      "@type": "ImageObject",
      url: logo,
    },
  });
}

export function createWebSiteSchema(site: string): JsonLdNode {
  return compact({
    "@type": "WebSite",
    "@id": `${site}${WEBSITE_ID}`,
    url: site,
    name: SITE_NAME,
    publisher: {
      "@id": `${site}${ORG_ID}`,
    },
  });
}

export function createWebPageSchema(input: {
  site: string;
  url: string;
  name: string;
  description?: string;
  image?: string;
}): JsonLdNode {
  return compact({
    "@type": "WebPage",
    "@id": `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": `${input.site}${WEBSITE_ID}` },
    about: { "@id": `${input.site}${ORG_ID}` },
    primaryImageOfPage: input.image
      ? {
          "@type": "ImageObject",
          url: input.image,
        }
      : undefined,
  });
}

export function createBreadcrumbListSchema(site: string, items: BreadcrumbItem[]): JsonLdNode {
  const itemListElement = items
    .map((item, index) => {
      const resolvedUrl = item.url ?? (item.path ? toAbsoluteUrl(item.path, site) : undefined);
      if (!resolvedUrl) return null;
      return compact({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: resolvedUrl,
      });
    })
    .filter((item): item is JsonLdNode => Boolean(item));

  return compact({
    "@type": "BreadcrumbList",
    itemListElement,
  });
}

function parseDateOrUndefined(value: Maybe<string>): string | undefined {
  if (!value) return undefined;
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) return undefined;
  return asDate.toISOString();
}

export function createPortfolioCreativeWorkSchema(site: string, input: PortfolioSchemaInput): JsonLdNode {
  const datePublished = parseDateOrUndefined(input.date);
  return compact({
    "@type": "CreativeWork",
    "@id": `${input.url}#creativework`,
    url: input.url,
    name: input.name,
    headline: input.name,
    description: input.description,
    image: input.image ? [input.image] : undefined,
    datePublished,
    keywords: input.tags,
    genre: input.category,
    contentLocation: input.location
      ? {
          "@type": "Place",
          name: input.location,
        }
      : undefined,
    sourceOrganization: input.client
      ? {
          "@type": "Organization",
          name: input.client,
        }
      : undefined,
    author: {
      "@id": `${site}${ORG_ID}`,
    },
    publisher: {
      "@id": `${site}${ORG_ID}`,
    },
    isPartOf: {
      "@id": `${site}${WEBSITE_ID}`,
    },
  });
}

export function createGraphSchema(nodes: Array<Maybe<JsonLdNode>>): JsonLdNode | null {
  const graph = nodes.filter((node): node is JsonLdNode => Boolean(node));
  if (graph.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
