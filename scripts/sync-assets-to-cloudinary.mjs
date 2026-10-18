#!/usr/bin/env node
/**
 * Sync assets from public/images to Cloudinary and update site content
 * (all collections under src/content, both .md and .json) to use Cloudinary URLs.
 * Run: npm run sync:cloudinary
 * Optional: npm run sync:cloudinary -- --dry-run
 */

import { readdir, readFile, writeFile, stat, mkdtemp, rm } from "fs/promises";
import { join, relative, dirname } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import matter from "gray-matter";
import sharp from "sharp";

const CLOUDINARY_MAX_SIZE = 10 * 1024 * 1024; // 10MB

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const IMAGES_DIR = join(PUBLIC_DIR, "images");
const CONTENT_DIR = join(ROOT, "src", "content");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const dryRun = process.argv.includes("--dry-run");

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function checkEnv() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    fail(
      "Missing Cloudinary env. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
    );
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
}

function extname(p) {
  const i = p.lastIndexOf(".");
  return i === -1 ? "" : p.slice(i);
}

async function listImageFiles(dir, exts = IMAGE_EXT) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await listImageFiles(full, exts)));
    } else if (e.isFile()) {
      const ext = extname(e.name);
      if (exts.has(ext.toLowerCase())) files.push(full);
    }
  }
  return files;
}

/**
 * Public ID in Cloudinary (folder + filename without extension).
 */
function toPublicId(rel) {
  const normalized = rel.replace(/\\/g, "/");
  const lastDot = normalized.lastIndexOf(".");
  const withoutExt = lastDot > 0 ? normalized.slice(0, lastDot) : normalized;
  return withoutExt;
}

/**
 * Cloudinary's image upload cap is 10MB. Shrink the longest edge until the
 * JPEG fits, then upload that file. Delivery still uses f_auto,q_auto:eco.
 */
async function fileWithinUploadCap(filePath) {
  const fileStat = await stat(filePath);
  if (fileStat.size <= CLOUDINARY_MAX_SIZE) {
    return { uploadPath: filePath, cleanup: async () => {} };
  }

  const dir = await mkdtemp(join(tmpdir(), "phc-img-"));
  const out = join(dir, "upload.jpg");
  const cleanup = () => rm(dir, { recursive: true, force: true });
  let edge = 2500;
  let quality = 82;
  for (let attempt = 0; attempt < 4; attempt++) {
    await sharp(filePath)
      .rotate()
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toFile(out);
    const outStat = await stat(out);
    if (outStat.size <= CLOUDINARY_MAX_SIZE) {
      console.log(
        "Resized for upload:",
        filePath,
        `(${(fileStat.size / 1024 / 1024).toFixed(1)}MB -> ${(outStat.size / 1024 / 1024).toFixed(1)}MB)`
      );
      return { uploadPath: out, cleanup };
    }
    edge = Math.round(edge * 0.7);
    quality = 72;
  }
  await cleanup();
  return { uploadPath: null, cleanup: async () => {} };
}

async function uploadFile(filePath) {
  const rel = relative(PUBLIC_DIR, filePath);
  const contentPath = "/" + rel.replace(/\\/g, "/");
  const dir = dirname(rel);
  const folder = dir === "images" ? "images" : dir;
  const publicId = toPublicId(rel);

  let prepared;
  try {
    prepared = await fileWithinUploadCap(filePath);
  } catch (e) {
    console.warn("Skip (could not prepare):", filePath, e.message);
    return { contentPath, url: null };
  }
  if (!prepared.uploadPath) {
    console.warn("Skip (still over 10MB after resize):", contentPath);
    return { contentPath, url: null };
  }

  if (dryRun) {
    console.log("[dry-run] would upload:", prepared.uploadPath, "-> folder:", folder);
    await prepared.cleanup();
    return { contentPath, url: `https://res.cloudinary.com/placeholder${contentPath}` };
  }

  try {
    try {
      const existing = await cloudinary.api.resource(publicId, { resource_type: "image" });
      if (existing && existing.secure_url) {
        console.log("Exists:", contentPath, "->", existing.secure_url);
        return { contentPath, url: existing.secure_url };
      }
    } catch (e) {
      if (e.error?.http_code !== 404 && e.error?.message !== "Not Found") {
        console.warn("Exists check failed:", contentPath, e.message);
      }
    }

    try {
      const result = await cloudinary.uploader.upload(prepared.uploadPath, {
        public_id: publicId,
        use_filename: false,
        unique_filename: false,
        overwrite: true,
        resource_type: "image",
      });
      console.log("Uploaded:", contentPath, "->", result.secure_url);
      return { contentPath, url: result.secure_url };
    } catch (e) {
      console.warn("Upload failed:", contentPath, e.message || e.error?.message || e);
      return { contentPath, url: null };
    }
  } finally {
    await prepared.cleanup();
  }
}

function replacePathsInObject(obj, pathToUrl, applyReplacements = true) {
  let count = 0;
  function walk(value) {
    if (typeof value === "string") {
      if (pathToUrl.has(value)) {
        const url = pathToUrl.get(value);
        count++;
        if (applyReplacements && url && !url.includes("placeholder")) return url;
        return value;
      }
      return value;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) value[i] = walk(value[i]);
      return value;
    }
    if (value !== null && typeof value === "object") {
      for (const k of Object.keys(value)) value[k] = walk(value[k]);
      return value;
    }
    return value;
  }
  for (const k of Object.keys(obj)) obj[k] = walk(obj[k]);
  return count;
}

async function listContentFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await listContentFiles(full)));
    } else if (e.isFile() && (e.name.endsWith(".md") || e.name.endsWith(".json"))) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  if (dryRun) console.log("--- Dry run: no uploads, no file writes ---\n");

  checkEnv();

  const imageFiles = await listImageFiles(IMAGES_DIR);
  if (imageFiles.length === 0) {
    console.log("No image files found under public/images");
    return;
  }
  console.log("Found", imageFiles.length, "image(s) under public/images\n");

  const pathToUrl = new Map();
  for (const filePath of imageFiles) {
    const { contentPath, url } = await uploadFile(filePath);
    if (url) pathToUrl.set(contentPath, url);
  }

  let contentFiles = [];
  try {
    contentFiles = await listContentFiles(CONTENT_DIR);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (contentFiles.length === 0) {
    console.log("No content files found under src/content");
    return;
  }

  for (const filePath of contentFiles) {
    if (filePath.endsWith(".json")) {
      await updateJsonFile(filePath, pathToUrl);
    } else {
      await updateMarkdownFile(filePath, pathToUrl);
    }
  }

  if (dryRun) console.log("\n--- Dry run complete ---");
}

async function updateMarkdownFile(mdPath, pathToUrl) {
  const raw = await readFile(mdPath, "utf-8");
  const { data, content } = matter(raw);
  const countFront = replacePathsInObject(data, pathToUrl, !dryRun);
  let countBody = 0;
  let newContent = content;
  if (pathToUrl.size > 0) {
    for (const [path, url] of pathToUrl) {
      if (content.includes(path) && url && !url.includes("placeholder")) {
        countBody += (content.match(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
        if (!dryRun) newContent = newContent.split(path).join(url);
      }
    }
  }
  const total = countFront + countBody;
  if (total > 0) {
    if (dryRun) {
      console.log("[dry-run] would update", relative(ROOT, mdPath), "(", total, "replacement(s))");
    } else {
      const out = matter.stringify(newContent, data, { lineWidth: -1 });
      await writeFile(mdPath, out, "utf-8");
      console.log("Updated", relative(ROOT, mdPath), "(", total, "replacement(s))");
    }
  }
}

async function updateJsonFile(jsonPath, pathToUrl) {
  const raw = await readFile(jsonPath, "utf-8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.warn("Skip (invalid JSON):", relative(ROOT, jsonPath), e.message);
    return;
  }
  const count = replacePathsInObject(parsed, pathToUrl, !dryRun);
  if (count > 0) {
    if (dryRun) {
      console.log("[dry-run] would update", relative(ROOT, jsonPath), "(", count, "replacement(s))");
    } else {
      await writeFile(jsonPath, JSON.stringify(parsed, null, 2) + "\n", "utf-8");
      console.log("Updated", relative(ROOT, jsonPath), "(", count, "replacement(s))");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
