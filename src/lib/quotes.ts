import { getCollection } from 'astro:content';

export interface Quote {
  quote: string;
  author?: string;
  role?: string;
  featured?: boolean;
  projectTitle: string;
  projectHref: string;
}

/**
 * Load every portfolio item and flatten its quotes into a single list,
 * attaching the source project's title and link to each quote.
 */
export async function getAllQuotes(): Promise<Quote[]> {
  const portfolio = await getCollection('portfolio');
  const quotes: Quote[] = [];

  for (const entry of portfolio) {
    const entryQuotes = (entry.data as { quotes?: Omit<Quote, 'projectTitle' | 'projectHref'>[] }).quotes;
    if (!Array.isArray(entryQuotes)) continue;

    for (const q of entryQuotes) {
      if (!q?.quote) continue;
      quotes.push({
        quote: q.quote,
        author: q.author,
        role: q.role,
        featured: q.featured,
        projectTitle: (entry.data as { title?: string }).title ?? '',
        projectHref: `/portfolio/${entry.id}`,
      });
    }
  }

  return quotes;
}

/**
 * Quotes flagged with `featured: true`, for promotion on the home page.
 */
export async function getFeaturedQuotes(): Promise<Quote[]> {
  const quotes = await getAllQuotes();
  return quotes.filter((q) => q.featured);
}
