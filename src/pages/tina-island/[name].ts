/**
 * Per-island refresh endpoint for Tina visual editing.
 *
 * The in-iframe bridge POSTs to `/tina-island/<name>` on every keystroke. This
 * single dynamic route renders the matching island component (from the registry
 * in `src/lib/islands.ts`) against the editor's overlay data and returns an HTML
 * fragment the bridge swaps into the live DOM.
 *
 * `prerender = false` keeps this route on-demand even under `output: 'static'`,
 * which is what makes static-site visual editing work.
 */
import type { APIRoute } from 'astro';
import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { islands } from '../../lib/islands';

export const prerender = false;

export const ALL: APIRoute = experimental_createIslandRoute(islands);
