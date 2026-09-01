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
  date?: string;
  location?: string;
  client?: string;
  tags?: string[];
}

const ORG_ID = "#organization";
const WEBSITE_ID = "#website";
const SITE_NAME = "PH&C";
const LEGAL_NAME = "PH&C, LLC";

export const ORG_EMAIL = "info@phandc.net";
export const ORG_FOUNDING_DATE = "2010";
export const ORG_FOUNDER = "Paul Harris";

export const ORG_ADDRESS = {
  streetAddress: "998 Old Eagle School Road, Suite 1210",
  addressLocality: "Wayne",
  addressRegion: "PA",
  postalCode: "19087",
  addressCountry: "US",
};

export const ORG_SAME_AS = [
  "https://www.linkedin.com/company/ph-c-llc/",
  "https://www.youtube.com/@phcllc",
];

export const ORG_AREA_SERVED = [
  "Pennsylvania",
  "New Jersey",
  "Delaware",
  "Maryland",
  "New York",
  "Greater Philadelphia",
];

export const ORG_DESCRIPTION =
  "PH&C, LLC is an owner's-representation, construction management, and real estate development consulting firm based in Wayne, Pennsylvania. Since 2010, PH&C has helped land owners, developers, businesses, and government agencies plan, design, and build commercial, retail, healthcare, residential, self-storage, and institutional projects across the Greater Philadelphia region and the Mid-Atlantic.";

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
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${site}${ORG_ID}`,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: site,
    description: ORG_DESCRIPTION,
    email: ORG_EMAIL,
    foundingDate: ORG_FOUNDING_DATE,
    founder: {
      "@type": "Person",
      name: ORG_FOUNDER,
    },
    logo: {
      "@type": "ImageObject",
      url: logo,
    },
    image: logo,
    address: {
      "@type": "PostalAddress",
      ...ORG_ADDRESS,
    },
    areaServed: ORG_AREA_SERVED,
    knowsAbout: [
      "Owner's representation",
      "Construction management",
      "Real estate development",
      "Pre-construction services",
      "Site analysis and feasibility studies",
      "Property assessment and due diligence",
    ],
    sameAs: ORG_SAME_AS,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: ORG_EMAIL,
      areaServed: ORG_AREA_SERVED,
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
  datePublished?: string;
  dateModified?: string;
}): JsonLdNode {
  return compact({
    "@type": "WebPage",
    "@id": `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": `${input.site}${WEBSITE_ID}` },
    about: { "@id": `${input.site}${ORG_ID}` },
    datePublished: parseDateOrUndefined(input.datePublished),
    dateModified: parseDateOrUndefined(input.dateModified),
    primaryImageOfPage: input.image
      ? {
          "@type": "ImageObject",
          url: input.image,
        }
      : undefined,
  });
}

export interface PersonSchemaInput {
  name: string;
  jobTitle?: string;
  bio?: string;
  image?: string;
  url?: string;
}

export function createPersonSchema(site: string, input: PersonSchemaInput): JsonLdNode {
  return compact({
    "@type": "Person",
    name: input.name,
    jobTitle: input.jobTitle,
    description: input.bio,
    image: input.image,
    url: input.url,
    worksFor: { "@id": `${site}${ORG_ID}` },
  });
}

export interface ServiceInput {
  name: string;
  description?: string;
}

/**
 * The core services PH&C offers, authored from the Services page content.
 * Shared by the Services page JSON-LD and the llms.txt endpoints.
 */
export const CORE_SERVICES: ServiceInput[] = [
  {
    name: "Site Analysis, Property Assessment & Feasibility Studies",
    description:
      "Full site analysis, facility assessment, feasibility studies and due diligence - including geotechnical, environmental, hazardous material, title, survey, permitting and cost/budget review - so owners understand project risks and costs before committing funds.",
  },
  {
    name: "Pre-Construction Services",
    description:
      "Management of design, entitlement, constructability and cost processes prior to breaking ground: consultant selection, schematic and design development, value engineering, budgeting, land development and zoning approvals, permitting, and contractor procurement.",
  },
  {
    name: "Construction Management",
    description:
      "Management of all construction activities to completion - coordination, supervision and documentation, RFIs, government/utility/testing agency coordination, schedule and budget management, and bank billing and inspection coordination.",
  },
  {
    name: "Owner's Representation & Project Management Oversight",
    description:
      "Complete program management as the owner's agent and point of control, functioning as your in-house real estate construction department without the overhead of in-house personnel.",
  },
  {
    name: "Drone Technologies",
    description:
      "FAA-licensed drone pilots capture high-resolution aerial photos, video and 3D imaging to document site conditions and quantify materials throughout a project.",
  },
];

export function createServiceSchema(site: string, input: ServiceInput): JsonLdNode {
  return compact({
    "@type": "Service",
    name: input.name,
    description: input.description,
    serviceType: input.name,
    provider: { "@id": `${site}${ORG_ID}` },
    areaServed: ORG_AREA_SERVED,
  });
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function createFaqSchema(items: FaqItem[]): JsonLdNode | null {
  const mainEntity = items
    .filter((item) => item.question.trim() && item.answer.trim())
    .map((item) =>
      compact({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })
    );

  if (mainEntity.length === 0) return null;

  return compact({
    "@type": "FAQPage",
    mainEntity,
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
