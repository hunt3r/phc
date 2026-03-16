import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

const portfolioCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    client: z.string().optional(),
    date: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),

    image: z.string().optional(),

    coverImage: z
      .object({
        src: z.string(),
        alt: z.string().optional(),
      })
      .optional(),

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

export const collections = {
  post: postCollection,
  portfolio: portfolioCollection,
};
