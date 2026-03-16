#!/usr/bin/env node
/**
 * Sync assets from public/images to Cloudinary and update portfolio markdown
 * to use Cloudinary URLs. Run: npm run sync:cloudinary
 * Optional: npm run sync:cloudinary -- --dry-run
 */

import { readdir, readFile, writeFile, stat } from "fs/promises";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import matter from "gray-matter";

const CLOUDINARY_MAX_SIZE = 10 * 1024 * 1024; // 10MB

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const IMAGES_DIR = join(PUBLIC_DIR, "images");
const PORTFOLIO_CONTENT = join(ROOT, "src", "content", "portfolio");

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

async function uploadFile(filePath) {
  const rel = relative(PUBLIC_DIR, filePath);
  const contentPath = "/" + rel.replace(/\\/g, "/");
  const dir = dirname(rel);
  const folder = dir === "images" ? "images" : dir;
  const publicId = toPublicId(rel);

  if (dryRun) {
    console.log("[dry-run] would upload:", filePath, "-> folder:", folder);
    return { contentPath, url: `https://res.cloudinary.com/placeholder${contentPath}` };
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.size > CLOUDINARY_MAX_SIZE) {
      console.warn("Skip (file too large, max 10MB):", contentPath, `(${(fileStat.size / 1024 / 1024).toFixed(2)}MB)`);
      return { contentPath, url: null };
    }
  } catch (e) {
    console.warn("Skip (stat failed):", filePath, e.message);
    return { contentPath, url: null };
  }

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
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      use_filename: true,
      unique_filename: false,
      resource_type: "auto",
    });
    console.log("Uploaded:", contentPath, "->", result.secure_url);
    return { contentPath, url: result.secure_url };
  } catch (e) {
    console.warn("Upload failed:", contentPath, e.message || e.error?.message || e);
    return { contentPath, url: null };
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

async function listMdFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await listMdFiles(full)));
    } else if (e.isFile() && e.name.endsWith(".md")) {
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

  let mdFiles = [];
  try {
    mdFiles = await listMdFiles(PORTFOLIO_CONTENT);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (mdFiles.length === 0) {
    console.log("No markdown files found under src/content/portfolio");
    return;
  }

  for (const mdPath of mdFiles) {
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

  if (dryRun) console.log("\n--- Dry run complete ---");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
