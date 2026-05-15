#!/usr/bin/env node
// Standardize w-[…] and h-[…] arbitrary values into the named --spacing-*
// tokens defined in main.css. Idempotent: re-running is a no-op once the
// codebase is clean.
//
// Snap rules (px → named token):
//   1-3  → xxs (2px)        220-260 → panel-sm (220px)
//   6-8  → sm  (8px)        280-360 → panel    (320px)
//   11   → md  (12px)       640-720 → page-sm  (720px)
//   14   → lg  (16px)       920-1200→ page     (1100px)
//   16-18→ lg               1300-1480 → page-lg (1300px)
//   22   → icon (22px)
//   28-32→ 2xl (32px)
//   36   → icon-lg
//   48-56→ 3xl (48px)
//
// ch → token:
//   36ch → col-sm,  55-60ch → col,  70ch → col-lg
//
// Parametric values (calc(), min(), 80vh, 11ch) are left untouched —
// they encode dimensions that can't collapse to a fixed ladder.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src', import.meta.url));

const PX_MAP = {
  '1': 'xxs', '2': 'xxs', '3': 'xxs',
  '6': 'sm', '8': 'sm',
  '11': 'md',
  '14': 'lg', '16': 'lg', '18': 'lg',
  '22': 'icon',
  '28': '2xl', '30': '2xl', '32': '2xl',
  '36': 'icon-lg',
  '48': '3xl', '52': '3xl', '56': '3xl',
  '220': 'panel-sm', '240': 'panel-sm', '260': 'panel-sm',
  '280': 'panel', '320': 'panel', '360': 'panel',
  '640': 'page-sm', '680': 'page-sm', '720': 'page-sm',
  '920': 'page', '940': 'page', '1100': 'page', '1200': 'page',
  '1300': 'page-lg', '1480': 'page-lg',
};

const CH_MAP = {
  '36': 'col-sm',
  '55': 'col', '56': 'col', '60': 'col',
  '70': 'col-lg',
};

function transform(content) {
  // w-[Npx], h-[Npx]
  content = content.replace(/\b([wh])-\[(\d+)px\]/g, (m, axis, v) => {
    return PX_MAP[v] ? `${axis}-${PX_MAP[v]}` : m;
  });
  // w-[Nch], h-[Nch]
  content = content.replace(/\b([wh])-\[(\d+)ch\]/g, (m, axis, v) => {
    return CH_MAP[v] ? `${axis}-${CH_MAP[v]}` : m;
  });
  return content;
}

function walk(dir, files = []) {
  // Skip src/styles — main.css is the design-system source of truth and
  // should be edited by hand, not auto-rewritten.
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
