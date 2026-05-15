#!/usr/bin/env node
// One-shot standardizer: collapses arbitrary text/tracking/gap/spacing
// classes to a fixed scale. Run via `node scripts/_standardize.mjs`,
// then delete this file.
//
// Scales:
//   text-[Npx]       → 10 rem values
//   tracking-[Vem]   → 5 em values (+ tracking-normal for near-0)
//   gap-[Npx], gap-{x,y}-[Npx] → 5 named tokens (xs/sm/md/lg/xl)
//   m{xytblr}-[Npx], p{xytblr}-[Npx] → 10 rem values

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src', import.meta.url));

const TEXT_MAP = {
  '10': '0.625rem', '10.5': '0.625rem',
  '11': '0.6875rem', '11.5': '0.6875rem',
  '12': '0.75rem', '12.5': '0.75rem',
  '13': '0.8125rem', '13.5': '0.8125rem',
  '14': '0.875rem', '14.5': '0.875rem',
  '15': '0.9375rem', '15.5': '0.9375rem',
  '16': '0.9375rem', '17': '0.9375rem', '17.5': '0.9375rem',
  '18': '1.125rem', '19': '1.125rem', '20': '1.125rem',
  '22': '1.5rem', '24': '1.5rem', '26': '1.5rem', '28': '1.5rem',
  '32': '2.25rem', '34': '2.25rem', '36': '2.25rem',
  '38': '2.25rem', '42': '2.25rem',
  '48': '3.25rem', '52': '3.25rem',
};

const TRACKING_MAP = {
  '-.035em': '-.025em', '-.025em': '-.025em',
  '-.02em': '-.025em', '-.015em': '-.025em',
  '.005em': 'normal', '.02em': 'normal',
  '.03em': '.05em', '.04em': '.05em',
  '.05em': '.05em', '.06em': '.05em', '.07em': '.05em',
  '.08em': '.12em', '.1em': '.12em',
  '.12em': '.12em', '.14em': '.12em', '.15em': '.12em',
  '.18em': '.22em', '.2em': '.22em',
  '.22em': '.22em', '.25em': '.22em',
};

const GAP_MAP = {
  '2': 'xs', '3': 'xs', '4': 'xs', '5': 'xs',
  '6': 'sm', '8': 'sm', '9': 'sm',
  '10': 'md', '12': 'md', '14': 'md',
  '16': 'lg', '18': 'lg', '20': 'lg',
  '22': 'xl', '24': 'xl', '26': 'xl', '28': 'xl', '30': 'xl', '32': 'xl', '36': 'xl',
};

const SPACING_MAP = {
  '2': '0.125rem', '3': '0.125rem',
  '4': '0.375rem', '5': '0.375rem', '6': '0.375rem',
  '8': '0.625rem', '9': '0.625rem', '10': '0.625rem',
  '12': '0.875rem', '13': '0.875rem', '14': '0.875rem', '15': '0.875rem',
  '16': '1.125rem', '17': '1.125rem', '18': '1.125rem',
  '19': '1.125rem', '20': '1.125rem',
  '22': '1.5rem', '24': '1.5rem', '25': '1.5rem', '26': '1.5rem',
  '28': '2rem', '30': '2rem', '32': '2rem', '34': '2rem', '36': '2rem',
  '38': '3rem', '40': '3rem', '42': '3rem', '44': '3rem',
  '48': '3rem', '50': '3rem',
  '60': '5rem', '70': '5rem', '80': '5rem', '96': '5rem',
  '100': '8.125rem', '120': '8.125rem', '130': '8.125rem',
  '140': '8.125rem', '150': '8.125rem',
};

const SPACING_REM_MAP = {
  '.05rem': '0.125rem',
  '.4rem': '0.375rem',
};

function transform(content) {
  // text-[Npx] → text-[rem]
  content = content.replace(/text-\[(\d+(?:\.\d+)?)px\]/g, (m, v) => {
    return TEXT_MAP[v] ? `text-[${TEXT_MAP[v]}]` : m;
  });

  // tracking-[Vem] → tracking-[std] or tracking-normal
  content = content.replace(/tracking-\[(-?\.\d+em)\]/g, (m, v) => {
    const t = TRACKING_MAP[v];
    if (!t) return m;
    return t === 'normal' ? 'tracking-normal' : `tracking-[${t}]`;
  });

  // gap-[Npx] → gap-{token}
  content = content.replace(/(?<![a-z-])gap-\[(\d+)px\]/g, (m, v) => {
    return GAP_MAP[v] ? `gap-${GAP_MAP[v]}` : m;
  });
  // gap-{x|y}-[Npx] → gap-{x|y}-{token}
  content = content.replace(/gap-([xy])-\[(\d+)px\]/g, (m, axis, v) => {
    return GAP_MAP[v] ? `gap-${axis}-${GAP_MAP[v]}` : m;
  });

  // {m|p}{tblrxy}-[Npx] → {m|p}{tblrxy}-[rem]
  content = content.replace(/\b([mp][tblrxy])-\[(\d+(?:\.\d+)?)px\]/g, (m, prefix, v) => {
    return SPACING_MAP[v] ? `${prefix}-[${SPACING_MAP[v]}]` : m;
  });
  // {m|p}{tblrxy}-[Nrem] → normalize the two outliers
  content = content.replace(/\b([mp][tblrxy])-\[(\.\d+rem)\]/g, (m, prefix, v) => {
    return SPACING_REM_MAP[v] ? `${prefix}-[${SPACING_REM_MAP[v]}]` : m;
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
