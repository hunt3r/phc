/**
 * Tina visual-editing data loaders.
 *
 * Each loader calls the generated Tina GraphQL client and pipes the result
 * through `requestWithMetadata()`, which:
 *   - hashes `{ query, variables }` into a stable form id the bridge addresses,
 *   - swaps `data` for the editor's unsaved overlay when rendered in the admin
 *     iframe,
 *   - stamps the result with the metadata `tinaField()` needs for click-to-edit.
 *
 * These are the fetchers behind the island registry (`src/lib/islands.ts`) and
 * the `<TinaIsland>` wrappers on each page. They are only exercised inside the
 * admin iframe / the `/tina-island/[name]` endpoint — the public build keeps
 * rendering from `astro:content`.
 */
import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../tina/__generated__/client';

export const getPortfolio = (slug: string) =>
  requestWithMetadata(
    client.queries.portfolio({ relativePath: `${slug}.md` }),
    { priority: 'primary' },
  );

export const getTag = (slug: string) =>
  requestWithMetadata(
    client.queries.tags({ relativePath: `${slug}.md` }),
    { priority: 'primary' },
  );

export const getAbout = () =>
  requestWithMetadata(
    client.queries.about({ relativePath: 'index.md' }),
    { priority: 'primary' },
  );

export const getPage = (slug: string) =>
  requestWithMetadata(
    client.queries.pages({ relativePath: `${slug}.md` }),
    { priority: 'primary' },
  );

export const getHome = () =>
  requestWithMetadata(
    client.queries.home({ relativePath: 'index.json' }),
    { priority: 'primary' },
  );

export const getStaff = () =>
  requestWithMetadata(client.queries.staff({ relativePath: 'index.json' }));
