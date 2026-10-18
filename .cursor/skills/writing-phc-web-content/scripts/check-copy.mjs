#!/usr/bin/env node
// Flags AI-trope words, stock patterns, and length problems in PH&C web copy.
// Usage: node check-copy.mjs <file...>   or   echo "text" | node check-copy.mjs
// Exits 1 when anything is flagged.

import { readFileSync } from 'node:fs';

const WORDS = [
  ['leverag(e|es|ed|ing)', 'use'],
  ['utiliz(e|es|ed|ing)', 'use'],
  ['delv(e|es|ed|ing)', null],
  ['elevat(e|es|ed|ing)', 'unless literal grade'],
  ['unlock(s|ed|ing)?', null],
  ['empower(s|ed|ing)?', null],
  ['foster(s|ed|ing)?', null],
  ['streamlin(e|es|ed|ing)', 'say what got shorter'],
  ['revolutioniz(e|es|ed|ing)', null],
  ['transform(s|ed|ing|ative)?', 'say what it became'],
  ['spearhead(s|ed|ing)?', 'led'],
  ['harness(es|ed|ing)?', null],
  ['navigat(e|es|ed|ing)', 'handle, get through'],
  ['ensur(e|es|ed|ing)', 'state the result'],
  ['seamless(ly)?', null],
  ['robust', null],
  ['comprehensive', 'list what is included'],
  ['holistic', null],
  ['innovative', 'name the method'],
  ['cutting[- ]edge', null],
  ['state[- ]of[- ]the[- ]art', null],
  ['world[- ]class', null],
  ['best[- ]in[- ]class', null],
  ['top[- ]notch', null],
  ['unparalleled', null],
  ['second to none', null],
  ['meticulous(ly)?', null],
  ['pivotal', null],
  ['crucial', null],
  ['vital', null],
  ['invaluable', null],
  ['bespoke', null],
  ['tailored', null],
  ['dynamic', null],
  ['vibrant', null],
  ['solutions?', 'name the thing'],
  ['landscape', 'OK only if it means plantings'],
  ['realm', null],
  ['journey', null],
  ['tapestry', null],
  ['testament', null],
  ['synerg(y|ies|istic)', null],
  ['excellence', null],
  ['peace of mind', null],
  ['game[- ]changer', null],
  ['a (wide|broad) (range|array|variety) of', 'give the list or number'],
  ['a variety of', 'give the list or number'],
  ['numerous', 'give the number'],
  ['countless', 'give the number'],
  ['myriad', null],
  ['plethora', null],
  ['various', 'name them'],
  ["in today's", null],
  ['fast[- ]paced', null],
  ['ever[- ](evolving|changing)', null],
  ['when it comes to', null],
  ['in the (world|realm) of', null],
  ["it'?s (important|worth) (to note|noting)", null],
  ['look no further', null],
  ['rest assured', null],
  ['in (conclusion|summary)', null],
  ['ultimately', null],
  ['at the end of the day', null],
  ['every step of the way', null],
  ['from (start|concept|beginning) (to|through) (finish|completion|end)', null],
  ['from the ground up', 'OK only if literal'],
  ['trusted (partner|advisor|authority)', null],
  ['one[- ]stop[- ]shop', null],
  ['dedicated to', null],
  ['committed to', null],
  ['passionate', null],
  ['(at|in) the heart of', null],
  ['plays? an? (key|crucial|vital|pivotal|critical|important) role', null],
  ['bring(s|ing)? (your|their|the) vision to life', null],
  ['exactly as intended', null],
  ['in good hands', null],
  ['nestled', null],
  ['boasts?', null],
  ['click (on )?(here|the)', 'link text should name the destination'],
];

const PATTERNS = [
  [/\bnot (just|only|merely|simply)\b[^.]{0,80}\bbut\b/i, '"not just X but Y": say Y'],
  [/\b(isn'?t|is not|aren'?t|are not)\b (just |simply )?(about )?[^.]{0,50}[.;,] (it'?s|it is|they'?re|they are)\b/i, '"X isn\'t A, it\'s B": say B'],
  [/\bwhether (you|you'?re|your)\b/i, '"Whether you..." opener'],
  [/(^|[.!?]\s+)From [^.,]{3,60} (to|through) /, '"From X to Y" sweep'],
  [/, (ensuring|allowing|enabling|making|helping|providing|giving|keeping|creating|delivering|saving|reducing|fostering|empowering)\b/i, 'participle tail: end at the fact'],
  [/\b(the result|the outcome|the bottom line|the best part|the difference|here'?s the thing)\s*[?:]/i, 'reveal setup: just say it'],
  [/\bthe PH\\?&C (difference|way|advantage|promise)\b/i, 'slogan closer'],
  [/(^|[.!?]\s+)Imagine\b/, '"Imagine..." opener'],
  [/\bevery (decision|detail|issue|cost|step|time)\b/i, '"every" claim: say what is checked'],
  [/\?(\s|$)/, 'question in body copy: state the answer'],
  [/!/, 'exclamation point'],
  [/—|–| -- | - /, 'dash: use a comma, period, or parentheses'],
  [/\[(here|click here|learn more|read more|more)\]/i, 'vague link text'],
  [/\p{Extended_Pictographic}/u, 'emoji'],
];

const LIMITS = {
  title: { max: 55 },
  description: { min: 70, max: 155 },
};

const SKIP_KEYS = /^\s*-?\s*(image|src|href|youtube|thumbnail|parent|featuredImage|ctaHref|slug|order|sectors|services|featured)\s*:/;

function stripUrls(line) {
  return line.replace(/\]\([^)]*\)/g, ']').replace(/https?:\/\/\S+/g, '');
}

function frontmatterFields(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return [];
  const lines = match[1].split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(title|description):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (/^[>|][-+]?$/.test(value)) {
      const parts = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) parts.push(lines[++i].trim());
      value = parts.join(' ');
    }
    value = value.replace(/^'(.*)'$/, '$1').replace(/''/g, "'").replace(/^"(.*)"$/, '$1');
    out.push({ key: m[1], value, line: i + 1 });
  }
  return out;
}

function check(name, text) {
  const hits = [];
  const lines = text.split('\n');
  let inCode = false;
  lines.forEach((raw, idx) => {
    if (/^```/.test(raw)) inCode = !inCode;
    if (inCode || raw.trim() === '---' || SKIP_KEYS.test(raw)) return;
    const line = stripUrls(raw).replace(/^\s*([-*+]|\d+\.)\s+/, '');
    if (/^\s*-?\s*alt\s*:/.test(raw) && /\b(image|photo|picture) (\d+|of)\b/i.test(raw)) {
      hits.push([idx + 1, 'alt text: describe what the photo shows']);
    }
    for (const [word, hint] of WORDS) {
      const re = new RegExp(`\\b${word}\\b`, 'i');
      const m = line.match(re);
      if (m) hits.push([idx + 1, `"${m[0]}"${hint ? ` (${hint})` : ''}`]);
    }
    for (const [re, msg] of PATTERNS) {
      if (re.test(line)) hits.push([idx + 1, msg]);
    }
  });
  for (const { key, value, line } of frontmatterFields(text)) {
    const { min, max } = LIMITS[key];
    const len = value.length;
    if (max && len > max) hits.push([line, `${key} is ${len} chars (max ${max})`]);
    if (min && len < min) hits.push([line, `${key} is ${len} chars (min ${min})`]);
  }
  hits.sort((a, b) => a[0] - b[0]);
  for (const [line, msg] of hits) console.log(`${name}:${line}: ${msg}`);
  return hits.length;
}

const files = process.argv.slice(2);
let total = 0;
if (files.length) {
  for (const f of files) total += check(f, readFileSync(f, 'utf8'));
} else {
  total = check('stdin', readFileSync(0, 'utf8'));
}
console.log(total ? `\n${total} flag(s).` : 'No flags.');
process.exit(total ? 1 : 0);
