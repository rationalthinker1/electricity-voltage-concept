#!/usr/bin/env node
// One-shot rgba standardizer. Converts arbitrary `[rgba(r,g,b,a)]` Tailwind
// values to slash-alpha utilities against the theme tokens defined in
// main.css (--color-blue / --color-pink / --color-teal / --color-text).
//
// Alpha buckets: 10%, 15%, 30%, 45%.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src', import.meta.url));

const COLOR_MAP = {
  '91,174,248': 'blue',
  '255,59,110': 'pink',
  '108,197,194': 'teal',
  '236,235,229': 'text',
};

function bucketAlpha(a) {
  const n = parseFloat(a);
  if (n <= 0.12) return 10;
  if (n <= 0.20) return 15;
  if (n <= 0.38) return 30;
  return 45;
}

function transform(content) {
  // {prefix}-[rgba(r,g,b,a)] → {prefix}-{name}/{bucket}
  return content.replace(
    /\b([a-z-]+)-\[rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\.\d+|\d+\.?\d*)\s*\)\]/g,
    (m, prefix, r, g, b, a) => {
      const key = `${r},${g},${b}`;
      const name = COLOR_MAP[key];
      if (!name) return m;
      return `${prefix}-${name}/${bucketAlpha(a)}`;
    }
  );
}

function walk(dir, files = []) {
  // Skip src/styles — main.css is the design-system source of truth.
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
