import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * An inline video, embedded on a portfolio item, tag, or page. Rendered as a
 * card that opens a lightbox player and aggregated onto the /videos page.
 */
const inlineVideoSchema = z.object({
  title: z.string().optional(),
  youtube: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  featured: z.boolean().optional(),
});

/**
 * An optional enum that also tolerates the empty strings Tina writes for
 * unset `select` fields (coerced to `undefined`).
 */
const optionalEnum = <T extends [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (v === '' || v == null ? undefined : v), z.enum(values).optional());

/**
 * A reusable "Content Card" promo section. `content` is `z.any()` because Tina
 * serializes rich-text as a markdown string in `.md` collections but as a
 * rich-text AST object in the `home` `.json` collection.
 */
const contentCardSchema = z.object({
  title: z.string().optional(),
  content: z.any().optional(),
  image: z.string().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  layout: optionalEnum(['vertical', 'horizontal']),
  width: optionalEnum(['contained', 'full']),
  backgroundColor: optionalEnum(['none', 'primary', 'secondary', 'brand-blue', 'surface', 'brand-beige']),
  textSize: optionalEnum(['sm', 'base', 'lg', 'xl']),
  imagePosition: optionalEnum(['left', 'right']),
  matchImageHeight: z.boolean().optional(),
  gallery: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string().optional(),
        href: z.string().optional(),
        ctaText: z.string().optional(),
      })
    )
    .optional(),
});

const contentCardsSchema = z.array(contentCardSchema).optional();

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      location: z.string().optional(),
      client: z.string().optional(),
      date: z.string().optional(),
      projectCost: z.string().optional(),
      size: z.string().optional(),
      architect: z.string().optional(),
      contractor: z.string().optional(),
      image: z.string().optional(),
      sectors: z.array(z.string()).optional(),
      services: z.array(z.string()).optional(),
      tags: z.array(z.object({ tag: z.string() })).optional(),
      gallery: z
        .array(
          z.object({
            src: z.string(),
            alt: z.string().optional(),
            href: z.string().optional(),
            ctaText: z.string().optional(),
          })
        )
        .optional(),
      quotes: z
        .array(
          z.object({
            quote: z.string(),
            author: z.string().optional(),
            role: z.string().optional(),
            featured: z.boolean().optional(),
          })
        )
        .optional(),
      order: z.number().optional(),
      featured: z.boolean().optional(),
      videos: z.array(inlineVideoSchema).optional(),
      contentCards: contentCardsSchema,
    }),
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/home' }),
  schema: z.object({
    title: z.string().optional(),
    maxProjects: z.number().optional(),
    maxTestimonials: z.number().optional(),
    maxVideos: z.number().optional(),
    hero: z
      .object({
        size: z.enum(['full', 'compact']).optional(),
        eyebrow: z.string().optional(),
        tagline: z.string().optional(),
        subtitle: z.string().optional(),
        ctaPrimaryText: z.string().optional(),
        ctaPrimaryHref: z.string().optional(),
        ctaSecondaryText: z.string().optional(),
        ctaSecondaryHref: z.string().optional(),
        backgroundImage: z.string().optional(),
        overlayOpacity: z.number().optional(),
        overlayColor: z.enum(['dark', 'light']).optional(),
      })
      .optional(),
    contentCards: contentCardsSchema,
  }),
});

const tags = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tags' }),
  schema: () =>
    z.object({
      label: z.string(),
      description: z.string().optional(),
      image: z.string().optional(),
      parent: z.string().optional(),
      order: z.number().optional(),
      videos: z.array(inlineVideoSchema).optional(),
      contentCards: contentCardsSchema,
    }),
});

const about = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/about' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      featuredImage: z.string().optional(),
      videos: z.array(inlineVideoSchema).optional(),
      contentCards: contentCardsSchema,
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      featuredImage: z.string().optional(),
      videos: z.array(inlineVideoSchema).optional(),
      contentCards: contentCardsSchema,
    }),
});

// The Contact page is its own singleton collection so its bespoke `contactInfo`
// field (rendered in the footer + aside card) is not attached to every generic
// page. Otherwise it mirrors the `pages` shape.
const contact = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/contact' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      featuredImage: z.string().optional(),
      // Named rich-text field; Tina stores it as a markdown string in frontmatter.
      contactInfo: z.string().optional(),
      videos: z.array(inlineVideoSchema).optional(),
      contentCards: contentCardsSchema,
    }),
});

const staff = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/staff' }),
  schema: z.object({
    staff: z.array(
      z.object({
        name: z.string(),
        title: z.string(),
        bio: z.string(),
        image: z.string().optional(),
        note: z.string().optional(),
      })
    ),
  }),
});

const navLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  newTab: z.boolean().optional(),
});

const site = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/site' }),
  schema: z.object({
    footerDescription: z.string().optional(),
    headerLinks: z.array(navLinkSchema).optional(),
    footerLinks: z.array(navLinkSchema).optional(),
  }),
});

export const collections = { portfolio, tags, home, about, pages, contact, staff, site };
