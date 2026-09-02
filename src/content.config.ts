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
    about: z
      .object({
        heading: z.string().optional(),
        body: z.string().optional(),
      })
      .optional(),
    contactCta: z
      .object({
        heading: z.string().optional(),
        subtext: z.string().optional(),
      })
      .optional(),
  }),
});

const aboutHeroSchema = z
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
  .optional();

const tags = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tags' }),
  schema: () =>
    z.object({
      label: z.string(),
      description: z.string().optional(),
      image: z.string().optional(),
      hero: aboutHeroSchema,
      parent: z.string().optional(),
      order: z.number().optional(),
      showInNav: z.boolean().optional(),
      videos: z.array(inlineVideoSchema).optional(),
    }),
});

const about = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/about' }),
  schema: () =>
    z.object({
      title: z.string(),
      featuredImage: z.string().optional(),
      hero: aboutHeroSchema,
      videos: z.array(inlineVideoSchema).optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      featuredImage: z.string().optional(),
      hero: aboutHeroSchema,
      videos: z.array(inlineVideoSchema).optional(),
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
        inMemoriam: z.string().optional(),
      })
    ),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/site' }),
  schema: z.object({
    portfolioTitle: z.string().optional(),
    tagsTitle: z.string().optional(),
  }),
});

export const collections = { portfolio, tags, home, about, pages, staff, site };
