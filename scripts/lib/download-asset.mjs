/**
 * Download an attachment (image) URL to scraped/images/attachments/ and return the local path.
 * Uses slug or content hash for filename to avoid collisions.
 * If the URL returns HTML (e.g. WordPress attachment page), parses for real image URL and fetches that.
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { slugFromUrl } from "./slug.mjs";

/** @type {Set<string>} slugs already used in attachments dir */
const usedSlugs = new Set();

const IMAGE_MAGIC = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  gif: [0x47, 0x49, 0x46], // GIF87a or GIF89a
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF....WEBP
};

function isImageBuffer(buffer) {
  if (!buffer || buffer.length < 4) return false;
  const u = new Uint8Array(buffer);
  if (IMAGE_MAGIC.jpeg.every((b, i) => u[i] === b)) return "image/jpeg";
  if (IMAGE_MAGIC.png.every((b, i) => u[i] === b)) return "image/png";
  if (IMAGE_MAGIC.gif.every((b, i) => u[i] === b)) return "image/gif";
  if (IMAGE_MAGIC.webp.every((b, i) => u[i] === b) && buffer.length >= 12 && u[8] === 0x57 && u[9] === 0x45 && u[10] === 0x42 && u[11] === 0x50) return "image/webp";
  return false;
}

function isHtmlBuffer(buffer) {
  if (!buffer || buffer.length < 15) return false;
  const start = buffer.slice(0, 200).toString("utf8", 0, 200).trimStart().toLowerCase();
  return start.startsWith("<!") || start.startsWith("<html");
}

/** Extract direct image URL from WordPress attachment page HTML. */
function extractImageUrlFromHtml(html) {
  const og = /<meta\s+property="og:image"\s+content="([^"]+)"/i.exec(html);
  if (og?.[1]) return og[1];
  const contentUrl = /"contentUrl"\s*:\s*"([^"]+)"/.exec(html);
  if (contentUrl?.[1]) return contentUrl[1];
  const link = /<link\s+rel="image_src"\s+href="([^"]+)"/i.exec(html);
  if (link?.[1]) return link[1];
  return null;
}

/**
 * Get file extension from URL or Content-Type.
 * @param {string} url
 * @param {string} [contentType]
 * @returns {string}
 */
function getExtension(url, contentType) {
  const pathname = url.split("?")[0] || "";
  const ext = path.extname(pathname).toLowerCase();
  if (ext && /^\.[a-z0-9]+$/i.test(ext)) return ext;
  if (contentType) {
    const m = contentType.match(/image\/(\w+)/);
    if (m) {
      const e = m[1].toLowerCase();
      if (e === "jpeg") return ".jpg";
      return "." + e;
    }
  }
  return ".jpg";
}

/**
 * Download URL to outputDir/images/attachments/{slug}{ext}. Return relative path from outputDir.
 * If urlCache is provided and contains assetUrl, returns cached localPath without re-downloading.
 * @param {string} assetUrl - Full URL of the image/attachment
 * @param {string} outputDir - Root scraped dir (e.g. ./scraped)
 * @param {{ delayMs?: number, userAgent?: string, urlCache?: Map<string, string> }} options
 * @returns {Promise<{ localPath: string, url: string }>} - localPath is relative to outputDir
 */
async function fetchImageBuffer(assetUrl, userAgent) {
  const res = await fetch(assetUrl, {
    headers: userAgent ? { "User-Agent": userAgent } : {},
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Failed to download: ${assetUrl} (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();

  if (contentType.startsWith("image/") && isImageBuffer(buffer)) return { buffer, contentType, url: assetUrl };
  if (isImageBuffer(buffer)) return { buffer, contentType: isImageBuffer(buffer), url: assetUrl };
  if (contentType === "text/html" || isHtmlBuffer(buffer)) {
    const html = buffer.toString("utf8");
    const imageUrl = extractImageUrlFromHtml(html);
    if (imageUrl) return fetchImageBuffer(imageUrl, userAgent);
  }
  throw new Error(`Response is not an image (Content-Type: ${contentType})`);
}

export async function downloadAsset(assetUrl, outputDir, options = {}) {
  const { delayMs = 0, userAgent, urlCache } = options;
  const cached = urlCache?.get(assetUrl);
  if (cached) return { localPath: cached, url: assetUrl };

  const dir = path.join(outputDir, "images", "attachments");
  await mkdir(dir, { recursive: true });

  const { buffer, contentType } = await fetchImageBuffer(assetUrl, userAgent);
  const ext = getExtension(assetUrl, contentType);
  let slug = slugFromUrl(assetUrl, usedSlugs);
  const hash = createHash("md5").update(buffer).digest("hex").slice(0, 8);
  let filename = `${slug}${ext}`;
  let fullPath = path.join(dir, filename);
  let n = 0;
  const { access } = await import("fs/promises");
  while (true) {
    try {
      await access(fullPath);
      n += 1;
      filename = `${slug}-${hash}${n > 1 ? `-${n}` : ""}${ext}`;
      fullPath = path.join(dir, filename);
    } catch {
      break;
    }
  }

  await writeFile(fullPath, buffer);
  const localPath = path.relative(outputDir, fullPath).replace(/\\/g, "/");
  urlCache?.set(assetUrl, localPath);
  return { localPath, url: assetUrl };
}

/**
 * Download an image into a page/portfolio folder's images/ subdir.
 * Returns path relative to that folder (e.g. "images/foo.jpg").
 * @param {string} assetUrl
 * @param {string} folderAbsPath - Absolute path to the page/portfolio folder (e.g. .../scraped/pages/privacy-policy)
 * @param {{ userAgent?: string, urlCache?: Map<string, string>, usedSlugs?: Set<string> }} options - usedSlugs = per-folder set for unique filenames
 * @returns {Promise<{ localPath: string, url: string }>} - localPath e.g. images/foo.jpg (relative to folder)
 */
export async function downloadAssetToFolder(assetUrl, folderAbsPath, options = {}) {
  const { userAgent, urlCache, usedSlugs } = options;
  const cached = urlCache?.get(assetUrl);
  if (cached) return { localPath: cached, url: assetUrl };

  const imagesDir = path.join(folderAbsPath, "images");
  await mkdir(imagesDir, { recursive: true });

  const { buffer, contentType } = await fetchImageBuffer(assetUrl, userAgent);
  const ext = getExtension(assetUrl, contentType);
  const usedInFolder = usedSlugs || new Set();
  let slug = slugFromUrl(assetUrl, usedInFolder);
  const hash = createHash("md5").update(buffer).digest("hex").slice(0, 8);
  let filename = `${slug}${ext}`;
  let fullPath = path.join(imagesDir, filename);
  const { access } = await import("fs/promises");
  let n = 0;
  while (true) {
    try {
      await access(fullPath);
      n += 1;
      filename = `${slug}-${hash}${n > 1 ? `-${n}` : ""}${ext}`;
      fullPath = path.join(imagesDir, filename);
    } catch {
      break;
    }
  }

  await writeFile(fullPath, buffer);
  const localPath = `images/${filename}`;
  urlCache?.set(assetUrl, localPath);
  return { localPath, url: assetUrl };
}
