#!/usr/bin/env node
// One-shot: replace arbitrary text/tracking/spacing/breakpoint values with
// the named tokens defined in main.css. Run via `node scripts/_to_tokens.mjs`,
// then delete this file.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src', import.meta.url));

// text-[Nrem] → text-N
const TEXT = {
  '0.625rem':  '1',  '0.6875rem': '2', '0.75rem':   '3',
  '0.8125rem': '4',  '0.875rem':  '5', '0.9375rem': '6',
  '1.125rem':  '7',  '1.5rem':    '8', '2.25rem':   '9',
  '3.25rem':   '10',
};

// tracking-[Vem] → tracking-N (tracking-normal stays as-is)
const TRACKING = {
  '-.025em': '1', '-0.025em': '1',
  '.05em':   '2', '0.05em':   '2',
  '.12em':   '3', '0.12em':   '3',
  '.22em':   '4', '0.22em':   '4',
};

// {prefix}-[Nrem] → {prefix}-{token}
// Spacing scale maps from the standardized 10 rem values to the 10 named
// tokens. Two values (0.875rem and 1.125rem) both collapse to lg because
// the existing scale has no step between 16px and 24px.
const SPACING = {
  '0.125rem':  'xxs',   // 2px
  '0.375rem':  'sm',    // 6px → 8px (lift; existing scale has no 6px step)
  '0.625rem':  'md',    // 10px → 12px (lift; no 10px step)
  '0.875rem':  'lg',    // 14px → 16px (lift)
  '1.125rem':  'lg',    // 18px → 16px (drop to nearest token)
  '1.5rem':    'xl',    // 24px
  '2rem':      '2xl',   // 32px
  '3rem':      '3xl',   // 48px
  '5rem':      '4xl',   // 80px
  '8.125rem':  '5xl',   // 130px
};

// max-[Npx] / min-[Npx] → max-{token} / min-{token}
const BREAKPOINT = {
  '540px':  'xs',
  '600px':  'sm',
  '700px':  'md',  // snaps up to 760px (md) — +60px boundary shift
  '720px':  'md',
  '760px':  'md',
  '900px':  'lg',
  '1100px': 'xl',
};

function transform(content) {
  // text-[Nrem] → text-N
  content = content.replace(/text-\[([\d.]+rem)\]/g, (m, v) => {
    return TEXT[v] ? `text-${TEXT[v]}` : m;
  });

  // tracking-[Vem] → tracking-N (skip the documentation string)
  content = content.replace(/tracking-\[(-?[\d.]+em)\]/g, (m, v) => {
    return TRACKING[v] ? `tracking-${TRACKING[v]}` : m;
  });

  // m/p {tblrxy}-[Nrem] → m/p {tblrxy}-{token}
  content = content.replace(/\b([mp][tblrxy])-\[([\d.]+rem)\]/g, (m, prefix, v) => {
    return SPACING[v] ? `${prefix}-${SPACING[v]}` : m;
  });

  // max-[Npx] and min-[Npx] (responsive variants like max-[760px]:text-…)
  content = content.replace(/\b(max|min)-\[(\d+px)\]/g, (m, dir, v) => {
    return BREAKPOINT[v] ? `${dir}-${BREAKPOINT[v]}` : m;
  });

  return content;
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
