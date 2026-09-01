import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '@/lib/llms';

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.href?.replace(/\/$/, '') ?? 'https://phandc.net';
  const body = await buildLlmsTxt(origin, { full: false });
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
