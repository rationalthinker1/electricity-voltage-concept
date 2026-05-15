#!/usr/bin/env node
// Rename numbered color utilities (bg-color-N, border-color-N) to the
// semantic names already exposed by @theme in main.css. Idempotent.
//
// Mapping (matches --color-N → underlying var in main.css):
//   color-1 → bg              (page background)
//   color-2 → bg-elevated     (elevated surface)
//   color-3 → bg-card         (card surface)
//   color-4 → text            (primary foreground)  [already done earlier]
//   color-5 → text-dim        (secondary foreground)
//   color-6 → accent          (brand)
//
// Skips src/styles — main.css owns the --color-N definitions themselves.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src', import.meta.url));

const COLOR_NAME = {
  '1': 'bg',
  '2': 'bg-elevated',
  '3': 'bg-card',
  '4': 'text',
  '5': 'text-dim',
  '6': 'accent',
};

function transform(content) {
  // {prefix}-color-N → {prefix}-{name}. Word boundary on both sides so we
  // don't touch CSS custom properties like --color-1 or partial matches
  // like "bg-color-color-2" (none exist but be safe).
  return content.replace(/\b([a-z]+)-color-([1-6])\b/g, (m, prefix, n) => {
    const name = COLOR_NAME[n];
    return name ? `${prefix}-${name}` : m;
  });
}

function walk(dir, files = []) {
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
