#!/usr/bin/env node
// Replace border-[Npx], border-{tblr}-[Npx] arbitrary border widths
// with the named utilities registered via @utility in main.css.
// Idempotent. Skips src/styles.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src', import.meta.url));

const WIDTHS = new Set(['3', '6']);

function transform(content) {
  // border-[Npx] or border-{t,r,b,l}-[Npx]
  return content.replace(
    /\bborder(?:-([tblr]))?-\[(\d+)px\]/g,
    (m, dir, n) => {
      if (!WIDTHS.has(n)) return m;
      return dir ? `border-${dir}-${n}` : `border-${n}`;
    }
  );
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
