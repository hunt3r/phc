import { getCollection } from 'astro:content';
import { getImageUrl } from '@/lib/cloudinary';

/**
 * The raw inline video shape as stored on a portfolio item, tag, or page.
 */
export interface InlineVideo {
  title?: string;
  youtube: string;
  description?: string;
  thumbnail?: string;
  featured?: boolean;
}

/**
 * A serializable, render-ready shape for a video card + lightbox.
 */
export interface VideoView {
  id: string;
  title: string;
  description?: string;
  featured?: boolean;
  embedUrl?: string;
  thumbUrl?: string;
}

/**
 * Extract a YouTube video ID from a full URL or a bare 11-character ID.
 * Supports youtu.be, youtube.com (watch/embed/shorts/v/live), and youtube-nocookie.com.
 */
export function getYouTubeId(input?: string): string | undefined {
  if (!input) return undefined;
  const raw = input.trim();
  if (!raw) return undefined;

  // Bare 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : undefined;
    }

    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;

      const segments = parsed.pathname.split('/').filter(Boolean);
      const idx = segments.findIndex((s) => s === 'embed' || s === 'shorts' || s === 'v' || s === 'live');
      const id = idx >= 0 ? segments[idx + 1] : undefined;
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

/**
 * The privacy-friendly embed URL for a YouTube video ID.
 */
export function getEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/**
 * The thumbnail URL for a video: a Cloudinary override when set, otherwise the
 * auto YouTube thumbnail (served directly from i.ytimg.com).
 */
export function getThumbUrl(
  youtube: string | undefined,
  thumbnailOverride: string | undefined,
  width = 640
): string | undefined {
  if (thumbnailOverride) return getImageUrl(thumbnailOverride, { width, quality: 'auto:eco' });
  const id = getYouTubeId(youtube);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}

/**
 * Build a render-ready view from an inline video. Returns undefined when the
 * video has no usable YouTube URL.
 */
export function toVideoView(video: InlineVideo, id: string): VideoView | undefined {
  const ytId = getYouTubeId(video.youtube);
  if (!ytId) return undefined;
  return {
    id,
    title: video.title ?? '',
    description: video.description,
    featured: video.featured,
    embedUrl: getEmbedUrl(ytId),
    thumbUrl: getThumbUrl(video.youtube, video.thumbnail),
  };
}

/**
 * Map an entry's inline `videos` list into ordered, render-ready views,
 * skipping any without a usable YouTube URL.
 */
export function toVideoViews(
  list: InlineVideo[] | undefined,
  keyPrefix = 'video'
): VideoView[] {
  if (!Array.isArray(list)) return [];
  const views: VideoView[] = [];
  list.forEach((video, index) => {
    const view = toVideoView(video, `${keyPrefix}-${index}`);
    if (view) views.push(view);
  });
  return views;
}

const VIDEO_COLLECTIONS = ['portfolio', 'tags', 'about', 'pages', 'contact'] as const;

/**
 * Every inline video across portfolio items, tags, and pages, flattened into a
 * single list of render-ready views. De-duplicated by YouTube video ID.
 */
export async function getAllVideos(): Promise<VideoView[]> {
  const seen = new Set<string>();
  const result: VideoView[] = [];

  for (const name of VIDEO_COLLECTIONS) {
    const entries = await getCollection(name);
    for (const entry of entries) {
      const list = (entry.data as { videos?: InlineVideo[] }).videos;
      if (!Array.isArray(list)) continue;
      list.forEach((video, index) => {
        const view = toVideoView(video, `${name}-${entry.id}-${index}`);
        if (!view?.embedUrl) return;
        const key = getYouTubeId(view.embedUrl) ?? view.embedUrl;
        if (seen.has(key)) return;
        seen.add(key);
        result.push(view);
      });
    }
  }

  return result;
}

/**
 * Videos flagged `featured: true`, for promotion on the home page.
 */
export async function getFeaturedVideos(): Promise<VideoView[]> {
  const videos = await getAllVideos();
  return videos.filter((v) => v.featured);
}
