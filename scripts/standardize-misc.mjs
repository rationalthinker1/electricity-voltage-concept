#!/usr/bin/env node
// Standardize the remaining arbitrary numeric utilities (leading, duration,
// p-/m- single-letter, top/right/bottom/left, translate, rounded, z-) into
// the named tokens defined in main.css. Idempotent.
//
// Categories covered (the 7 from the audit):
//
//   1. leading-[N]                   → leading-1..5   (5 tokens)
//   2. duration-[Nms]                → duration-fast  (1 token)
//   3. p-[Npx], m-[Npx]              → existing spacing tokens
//   4. top/right/bottom/left-[Npx]   → existing spacing tokens
//      translate-y-[Npx]             → existing spacing tokens
//   5. (border-l-[3px] left as-is — 10 uses of same literal value already
//       constitute standardization; Tailwind v4 border-width customization
//       through theme tokens isn't a clean path here.)
//   6. rounded-[Npx]                 → rounded-3 / rounded-7
//   7. z-[N]                         → z-1..3
//
// Parametric / intentional values are left untouched.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src', import.meta.url));

// leading-[N] → leading-{token}. Snap each unitless line-height to its
// nearest of the 5 leading-* tokens.
const LEADING = {
  '.95': '1', '0.95': '1',
  '1.05': '1', '1.08': '1', '1.1': '1',
  '1.15': '2', '1.18': '2', '1.2': '2', '1.25': '2',
  '1.3':  '3', '1.35': '3', '1.4': '3', '1.45': '3',
  '1.5':  '4', '1.55': '4', '1.6': '4',
  '1.65': '5', '1.7': '5', '1.72': '5',
};

// All duration values fall into the "fast" bucket (120-140ms).
const DURATION = { '120ms': 'fast', '140ms': 'fast' };

// p-/m- single-letter and positioning utilities → existing --spacing-*.
// Snap by nearest token: 2→xxs, 4-5→xs, 6-8→sm, 11-13→md, 14-16-18→lg,
// 22-26→xl, 28-32→2xl, 36-48→3xl, 70-80→4xl.
const PX_TO_SPACING = {
  '2':  'xxs',
  '4':  'xs',  '5':  'xs',
  '8':  'sm',
  '12': 'md',
  '18': 'lg',
  '28': '2xl',
  '72': '4xl',
};

// rounded-[Npx] → rounded-{existing radius step or new radius-7}
const RADIUS = { '4': '3', '12': '7' };

// z-[N] → z-{1..3}. 30→z-1, 998-999→z-2, 1000→z-3.
const Z = { '30': '1', '998': '2', '999': '2', '1000': '3' };

function transform(content) {
  // 1. leading-[N]
  content = content.replace(/\bleading-\[([\d.]+)\]/g, (m, v) => {
    return LEADING[v] ? `leading-${LEADING[v]}` : m;
  });

  // 2. duration-[Nms]
  content = content.replace(/\bduration-\[(\d+ms)\]/g, (m, v) => {
    return DURATION[v] ? `duration-${DURATION[v]}` : m;
  });

  // 3+4. p-[Npx], m-[Npx], top/right/bottom/left-[Npx], translate-y-[Npx]
  content = content.replace(
    /\b(p|m|top|right|bottom|left|translate-[xy])-\[(\d+)px\]/g,
    (m, prefix, v) => {
      return PX_TO_SPACING[v] ? `${prefix}-${PX_TO_SPACING[v]}` : m;
    }
  );

  // 6. rounded-[Npx]
  content = content.replace(/\brounded-\[(\d+)px\]/g, (m, v) => {
    return RADIUS[v] ? `rounded-${RADIUS[v]}` : m;
  });

  // 7. z-[N]
  content = content.replace(/\bz-\[(\d+)\]/g, (m, v) => {
    return Z[v] ? `z-${Z[v]}` : m;
  });

  return content;
}

function walk(dir, files = []) {
  // Skip the design-system source-of-truth file. Its @apply directives use
  // named tokens (text-2, mb-lg, …) that already match the scale; further
  // edits should be hand-reviewed, not auto-rewritten.
  if (dir.endsWith('/styles')) return files;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, files);
    else if (/\.(tsx|ts)$/.test(name) && name !== 'routeTree.gen.ts') {
      files.push(p);
    }
  }
  return files;
}

const files = walk(ROOT);
let touched = 0;
for (const f of files) {
  const before = readFileSync(f, 'utf8');
  const after = transform(before);
  if (after !== before) {
    writeFileSync(f, after, 'utf8');
    touched++;
    console.log('updated', relative(process.cwd(), f));
  }
}
console.log(`\nTouched ${touched} files of ${files.length} scanned.`);
