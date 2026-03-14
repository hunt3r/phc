import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      image: image().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      order: z.number(),
    }),
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/home' }),
  schema: z.object({
    hero: z
      .object({
        tagline: z.string().optional(),
        subtitle: z.string().optional(),
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
