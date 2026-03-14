/**
 * Tina Cloudinary media handler for Vercel (or other Node serverless).
 * Deploy this so Tina admin can upload/list/delete Cloudinary media.
 * Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in env.
 */
import {
  createMediaHandler,
  mediaHandlerConfig,
} from 'next-tinacms-cloudinary/dist/handlers';

export const config = mediaHandlerConfig;

export default createMediaHandler({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  authorized: async (req) => {
    if (process.env.NODE_ENV === 'development') return true;
    try {
      const { isAuthorized } = await import('@tinacms/auth');
      return await isAuthorized(req);
    } catch {
      return false;
    }
  },
});
