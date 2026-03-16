import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      location: z.string().optional(),
      client: z.string().optional(),
      date: z.string().optional(),
      image: image().or(z.string()).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      gallery: z
        .array(
          z.object({
            src: z.string(),
            alt: z.string().optional(),
          })
        )
        .optional(),
      order: z.number().optional(),
      featured: z.boolean().optional(),
    }),
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/home' }),
  schema: z.object({
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

export const collections = { portfolio, home };
