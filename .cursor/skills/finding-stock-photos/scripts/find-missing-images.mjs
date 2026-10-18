#!/usr/bin/env node
// List site content that has no image, grouped by where the image goes.
//
// Usage (from the repo root):
//   node .cursor/skills/finding-stock-photos/scripts/find-missing-images.mjs [--cards]
//
// Covers the places stock photos are appropriate: tag `image`, page/about/contact
// `featuredImage`, and home hero slide `image`. With --cards it also lists content
// cards without an image (many are text-only on purpose, so review before filling).
// Portfolio projects and staff are reported separately because they need real
// photos, not stock.
import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const content = join(root, 'src/content');
const withCards = process.argv.includes('--cards');

const mdFiles = (dir) =>
  readdirSync(join(content, dir)).filter((f) => f.endsWith('.md')).map((f) => join(content, dir, f));
const rel = (p) => p.slice(root.length + 1);
const groups = {};
const add = (group, line) => (groups[group] ??= []).push(line);

function checkCards(file, cards) {
  if (!withCards || !Array.isArray(cards)) return;
  cards.forEach((c, i) => {
    if (!c?.image && !c?.gallery?.length) add('Content cards without image (--cards)', `${rel(file)} card ${i + 1}: ${c?.title ?? '(untitled)'}`);
  });
}

for (const file of mdFiles('tags')) {
  const { data } = matter(readFileSync(file, 'utf8'));
  if (!data.image) add('Tags missing `image`', `${rel(file)}  (${data.label})${data.order == null ? '  [no order: legacy stub?]' : ''}`);
  checkCards(file, data.contentCards);
}

for (const dir of ['pages', 'about', 'contact']) {
  for (const file of mdFiles(dir)) {
    const { data } = matter(readFileSync(file, 'utf8'));
    if (!data.featuredImage) add('Pages missing `featuredImage`', `${rel(file)}  (${data.title})`);
    checkCards(file, data.contentCards);
  }
}

const homeFile = join(content, 'home/index.json');
const home = JSON.parse(readFileSync(homeFile, 'utf8'));
(home.hero?.slides ?? []).forEach((s, i) => {
  if (!s.image) add('Home hero slides missing `image`', `${rel(homeFile)} slide ${i + 1}: ${s.title ?? s.eyebrow ?? '(untitled)'}`);
});
checkCards(homeFile, home.contentCards);

for (const file of mdFiles('portfolio')) {
  const { data } = matter(readFileSync(file, 'utf8'));
  if (!data.image) add('Portfolio missing `image` (needs a real project photo, not stock)', `${rel(file)}  (${data.title})`);
  checkCards(file, data.contentCards);
}

const staffFile = join(content, 'staff/index.json');
try {
  for (const p of JSON.parse(readFileSync(staffFile, 'utf8')).staff ?? []) {
    if (!p.image) add('Staff missing `image` (needs a real headshot, not stock)', `${p.name}`);
  }
} catch {}

const names = Object.keys(groups);
if (!names.length) console.log('Every checked field has an image.');
for (const g of names) {
  console.log(`\n${g} (${groups[g].length})`);
  for (const line of groups[g]) console.log(`  ${line}`);
}
