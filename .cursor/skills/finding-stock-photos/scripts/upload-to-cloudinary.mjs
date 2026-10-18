#!/usr/bin/env node
// Upload one image to the PH&C Cloudinary account and print its secure URL.
//
// Usage (from the repo root, with full network access):
//   node .cursor/skills/finding-stock-photos/scripts/upload-to-cloudinary.mjs <source> <public-id> [folder]
//
// <source> is one of:
//   - an Unsplash photo id suffix, e.g. 1591588582259-e675bd2e6088
//   - a full https URL (Pexels, Pixabay, Wikimedia upload.wikimedia.org)
//   - an absolute local file path (use for Wikimedia, which rejects Cloudinary fetches)
// [folder] defaults to "tags".
//
// Never overwrites an existing public id; pick a new one instead.
import { v2 as cloudinary } from 'cloudinary';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const envFile = join(repoRoot, '.env');
if (!existsSync(envFile)) {
  console.error(`Missing ${envFile}; it must define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.`);
  process.exit(1);
}
for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^['"]|['"]$/g, '');
}

const [source, publicId, folder = 'tags'] = process.argv.slice(2);
if (!source || !publicId) {
  console.error('Usage: upload-to-cloudinary.mjs <unsplash-id | url | /local/path> <public-id> [folder]');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const file = /^(https?:|\/)/.test(source)
  ? source
  : `https://images.unsplash.com/photo-${source}?fm=jpg&w=2400&q=85`;

try {
  const r = await cloudinary.uploader.upload(file, { folder, public_id: publicId, overwrite: false });
  if (r.existing) console.error(`Note: ${folder}/${publicId} already existed; returning the existing asset.`);
  console.log(r.secure_url, `${r.width}x${r.height}`, `${Math.round(r.bytes / 1024)}KB`);
} catch (err) {
  console.error('Upload failed:', err?.message ?? err);
  console.error('Wikimedia URLs often fail here; download with curl first and pass the local path.');
  process.exit(1);
}
