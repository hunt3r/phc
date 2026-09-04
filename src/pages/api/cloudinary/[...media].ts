import type { APIRoute } from 'astro';
import { PassThrough } from 'node:stream';
import { createMediaHandler } from 'next-tinacms-cloudinary/dist/handlers.js';
import { isAuthorized } from '@tinacms/auth';

// On-demand route: the Cloudinary media handler (multer/busboy) must run at
// request time. Serving it natively in Astro avoids proxying multipart uploads
// through the Vite dev server (which truncates the body -> "Unexpected end of
// form") and deploys as a single Netlify Function in production.
export const prerender = false;

const mediaHandler = createMediaHandler({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: process.env.CLOUDINARY_API_KEY ?? '',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
  authorized: async (req: any, _res: any) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      const user = await isAuthorized(req);
      return Boolean(user?.verified);
    } catch (e) {
      console.error(e);
      return false;
    }
  },
});

export const ALL: APIRoute = async ({ request, params, url }) => {
  // Fully buffer the Web request body, then feed it to the Node-style handler
  // as a complete stream so busboy always sees the closing multipart boundary.
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD' && request.body != null;
  const bodyBuffer = hasBody ? Buffer.from(await request.arrayBuffer()) : Buffer.alloc(0);

  const req: any = new PassThrough();
  req.headers = Object.fromEntries(request.headers.entries());
  req.method = request.method;
  req.url = url.pathname + url.search;
  req.query = Object.fromEntries(url.searchParams.entries());

  // DELETE hits /api/cloudinary/media/<publicId>; the handler expects
  // req.query.media = ['media', publicId].
  if (request.method === 'DELETE') {
    const publicId = (params.media ?? '').replace(/^media\/?/, '');
    req.query.media = ['media', publicId];
  }

  req.end(bodyBuffer);

  return await new Promise<Response>((resolve) => {
    let statusCode = 200;
    const headers = new Headers();
    let settled = false;

    const finish = (body: BodyInit | null) => {
      if (settled) return;
      settled = true;
      resolve(new Response(body, { status: statusCode, headers }));
    };

    const res: any = {
      status(code: number) {
        statusCode = code;
        return res;
      },
      setHeader(key: string, value: string) {
        headers.set(key, value);
        return res;
      },
      json(payload: unknown) {
        headers.set('content-type', 'application/json');
        finish(JSON.stringify(payload));
      },
      end(payload?: unknown) {
        finish(payload == null ? null : String(payload));
      },
    };

    Promise.resolve(mediaHandler(req, res)).catch((err) => {
      console.error('[cloudinary-media]', err);
      if (!settled) {
        statusCode = 500;
        headers.set('content-type', 'application/json');
        finish(JSON.stringify({ message: 'media handler error' }));
      }
    });
  });
};
