#!/usr/bin/env node
/**
 * chapter-tag-bumper — AST-based mechanical renumber follow-up.
 *
 * Run:
 *   node scripts/chapter-tag-bumper.mjs           # dry run
 *   node scripts/chapter-tag-bumper.mjs --write   # apply
 *
 * What it does
 * ────────────
 * 1. Reads src/textbook/data/chapters.ts as source of truth (slug → number).
 * 2. For each chapter file (src/textbook/Ch*.tsx):
 *    - Header comment   : "Chapter N"  → current number
 *    - Function name    : export default function ChN… → ChN'…
 *    - TryIt tags       : tag="Try N.M" → tag="Try N'.M"
 *    - CaseStudy tags   : tag="Case N.M" → tag="Case N'.M"
 *    - Demo figure props: figure="Fig. N.M" → figure="Fig. N'.M"
 *    - id anchors       : id="ch.N.…" / id="N.M-…" → N'
 *    - Adds explicit `figure="Fig. N'.M"` to every `<XxxDemo />` that lacks one.
 * 3. For each embedded demo file (src/textbook/demos/*.tsx):
 *    - default figure string (figure = 'Fig. N.M' / figure ?? 'Fig. N.M') → N'
 *    - leading block comment referencing Ch.N → Ch.N'
 *    - Skips shared demos (used by >1 chapter) for figure-default bumps.
 */

import { Project, SyntaxKind, Node } from 'ts-morph';
import { readFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const TEXTBOOK_DIR = join(ROOT, 'src/textbook');
const DEMOS_DIR = join(ROOT, 'src/textbook/demos');
const CHAPTERS_FILE = join(ROOT, 'src/textbook/data/chapters.ts');
const WRITE_MODE = process.argv.includes('--write');
const DRY_NOTE = WRITE_MODE ? '' : ' (dry run)';

/* ── parse manifest ─────────────────────────────────────────────────────── */

const chaptersSrc = readFileSync(CHAPTERS_FILE, 'utf-8');
const slugToNumber = {};
const numberToSlug = {};

const slugMatches = [...chaptersSrc.matchAll(/slug:\s*'([^']+)'/g)];
const numberMatches = [...chaptersSrc.matchAll(/number:\s*(\d+)/g)];

for (let i = 0; i < slugMatches.length; i++) {
  const slug = slugMatches[i][1];
  const num = parseInt(numberMatches[i][1], 10);
  slugToNumber[slug] = num;
  numberToSlug[num] = slug;
}

/* ── build ts-morph project ─────────────────────────────────────────────── */

const project = new Project({
  tsConfigFilePath: join(ROOT, 'tsconfig.json'),
});

/* ── helpers ────────────────────────────────────────────────────────────── */

function findSlug(content) {
  const m = content.match(/getChapter\('([^']+)'\)/);
  return m ? m[1] : null;
}

function resolveDemoPath(demoName) {
  const baseName = demoName.endsWith('Demo') ? demoName.slice(0, -4) : demoName;
  let p = join(DEMOS_DIR, `${baseName}.tsx`);
  try {
    readFileSync(p, 'utf-8');
    return p;
  } catch {
    p = join(DEMOS_DIR, `${demoName}.tsx`);
    try {
      readFileSync(p, 'utf-8');
      return p;
    } catch {
      return null;
    }
  }
}

function getDemoDefaultFigure(demoPath) {
  if (!demoPath) return null;
  const content = readFileSync(demoPath, 'utf-8');
  const m = content.match(/\?\?\s*['"]Fig\.\s*(\d+)\.(\d+)['"]/);
  if (m) {
    const idx = parseInt(m[2], 10);
    if (idx > 0) return { n: parseInt(m[1], 10), m: m[2] };
  }
  const m2 = content.match(/figure\s*=\s*['"]Fig\.\s*(\d+)\.(\d+)['"]/);
  if (m2) {
    const idx = parseInt(m2[2], 10);
    if (idx > 0) return { n: parseInt(m2[1], 10), m: m2[2] };
  }
  return null;
}

/* ── pre-compute demo sharing ───────────────────────────────────────────── */

const chapterFiles = readdirSync(TEXTBOOK_DIR)
  .filter((f) => f.startsWith('Ch') && f.endsWith('.tsx'))
  .map((f) => join(TEXTBOOK_DIR, f));

const demoToChapters = {};
for (const chPath of chapterFiles) {
  const content = readFileSync(chPath, 'utf-8');
  const slug = findSlug(content);
  if (!slug) continue;
  const num = slugToNumber[slug];
  if (!num) continue;
  const re = /<([A-Z][A-Za-z0-9]*Demo)\b/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const name = m[1];
    if (!demoToChapters[name]) demoToChapters[name] = new Set();
    demoToChapters[name].add(num);
  }
}

/* ── main ───────────────────────────────────────────────────────────────── */

const log = [];
let chaptersTouched = 0;
let demosTouched = 0;

for (const chPath of chapterFiles.sort()) {
  const chName = basename(chPath);
  const sf = project.getSourceFile(chPath);
  if (!sf) {
    log.push(`SKIP ${chName}: not in ts-morph project`);
    continue;
  }

  const rawText = sf.getFullText();
  const slug = findSlug(rawText);
  if (!slug) {
    log.push(`SKIP ${chName}: no getChapter() call`);
    continue;
  }
  const expectedNum = slugToNumber[slug];
  if (!expectedNum) {
    log.push(`SKIP ${chName}: slug "${slug}" not in manifest`);
    continue;
  }

  let changed = false;

  /* 1. Header comment (first ~10 lines, only the actual header line) */
  const lines = rawText.split('\n');
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const m = lines[i].match(/^(\s*(?:\/\/|\*)?\s*Chapter\s+)(\d+)(\s*[—\-])/);
    if (m) {
      const oldNum = parseInt(m[2], 10);
      if (oldNum !== expectedNum) {
        const oldLine = lines[i];
        const newLine = oldLine.replace(m[0], m[1] + expectedNum + m[3]);
        // Replace exact line text in the source file via ts-morph
        const lineStart = rawText.split('\n').slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
        const lineEnd = lineStart + oldLine.length;
        sf.replaceText([lineStart, lineEnd], newLine);
        log.push(`${chName}: header ${oldNum} → ${expectedNum}`);
        changed = true;
      }
    }
  }

  /* 2. Function name */
  const funcDecls = sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
  for (const fn of funcDecls) {
    if (fn.isDefaultExport()) {
      const name = fn.getName();
      const m = name && name.match(/^Ch(\d+)/);
      if (m) {
        const oldNum = parseInt(m[1], 10);
        if (oldNum !== expectedNum) {
          const newName = name.replace(/^Ch\d+/, `Ch${expectedNum}`);
          fn.rename(newName);
          log.push(`${chName}: function ${name} → ${fn.getName()}`);
          changed = true;
        }
      }
    }
  }

  /* 3. TryIt / CaseStudy tags (JSX attributes) */
  const jsxAttrs = sf.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  for (const attr of jsxAttrs) {
    const attrName = attr.getNameNode().getText();
    if (attrName !== 'tag') continue;
    const init = attr.getInitializer();
    if (!init || !Node.isStringLiteral(init)) continue;
    const val = init.getLiteralValue();
    const tryMatch = val.match(/^Try\s+(\d+)\./);
    const caseMatch = val.match(/^Case\s+(\d+)\./);
    if (tryMatch || caseMatch) {
      const oldNum = parseInt((tryMatch || caseMatch)[1], 10);
      if (oldNum !== expectedNum) {
        const next = val.replace(/^((?:Try|Case)\s+)\d+\./, `$1${expectedNum}.`);
        init.replaceWithText(`'${next}'`);
        log.push(`${chName}: ${tryMatch ? 'TryIt' : 'CaseStudy'} ${val} → ${next}`);
        changed = true;
      }
    }
  }

  /* 4. Demo figure props on <Demo> or demo wrappers */
  const jsxSelf = sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
  for (const el of jsxSelf) {
    const tag = el.getTagNameNode().getText();
    if (tag.endsWith('Demo')) {
      const figAttr = el.getAttribute('figure');
      if (figAttr && Node.isJsxAttribute(figAttr)) {
        const init = figAttr.getInitializer();
        if (init && Node.isStringLiteral(init)) {
          const val = init.getLiteralValue();
          const fm = val.match(/^Fig\.\s*(\d+)\.(\d+)$/);
          if (fm) {
            const oldNum = parseInt(fm[1], 10);
            if (oldNum !== expectedNum) {
              const next = `Fig. ${expectedNum}.${fm[2]}`;
              init.replaceWithText(`'${next}'`);
              log.push(`${chName}: <${tag} figure="${val}" → "${next}"`);
              changed = true;
            }
          }
        }
      }
    }
  }

  /* 5. id anchors */
  const jsxAll = sf.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  for (const attr of jsxAll) {
    if (attr.getNameNode().getText() !== 'id') continue;
    const init = attr.getInitializer();
    if (!init || !Node.isStringLiteral(init)) continue;
    const val = init.getLiteralValue();
    const chMatch = val.match(/^ch\.(\d+)\./);
    const numMatch = val.match(/^(\d+)\.(\d+)-/);
    if (chMatch || numMatch) {
      const oldNum = parseInt((chMatch || numMatch)[1], 10);
      if (oldNum !== expectedNum) {
        const next = val.replace(/^(ch\.)?\d+/, `$1${expectedNum}`);
        init.replaceWithText(`'${next}'`);
        log.push(`${chName}: id="${val}" → "${next}"`);
        changed = true;
      }
    }
  }

  /* 6. Add explicit figure props to demo usages that lack them */
  const currentText = sf.getFullText();
  const usedIndices = new Set();

  // First pass: collect existing figure indices from usages that already have them
  for (const el of jsxSelf) {
    const tag = el.getTagNameNode().getText();
    if (!tag.endsWith('Demo')) continue;
    const figAttr = el.getAttribute('figure');
    if (figAttr && Node.isJsxAttribute(figAttr)) {
      const init = figAttr.getInitializer();
      if (init && Node.isStringLiteral(init)) {
        const val = init.getLiteralValue();
        const fm = val.match(/^Fig\.\s*\d+\.(\d+)$/);
        if (fm) usedIndices.add(parseInt(fm[1], 10));
      }
    }
  }

  // Second pass: assign to demos without figure props
  const toAdd = [];
  for (const el of jsxSelf) {
    const tag = el.getTagNameNode().getText();
    if (!tag.endsWith('Demo')) continue;
    if (el.getAttribute('figure')) continue;

    const demoPath = resolveDemoPath(tag);
    const def = getDemoDefaultFigure(demoPath);
    let idx = def ? parseInt(def.m, 10) : null;

    // If no default or index already used, find next free
    if (idx === null || usedIndices.has(idx)) {
      idx = 1;
      while (usedIndices.has(idx)) idx++;
    }
    usedIndices.add(idx);

    const figVal = `Fig. ${expectedNum}.${idx}`;
    toAdd.push({ el, tag, figVal });
  }

  for (const { el, tag, figVal } of toAdd) {
    el.addAttribute({ name: 'figure', initializer: `"${figVal}"` });
    log.push(`${chName}: <${tag} /> + figure="${figVal}"`);
    changed = true;
  }

  if (WRITE_MODE && changed) {
    sf.saveSync();
  }
  if (changed) chaptersTouched++;
}

/* ── fix demo files ─────────────────────────────────────────────────────── */

for (const chPath of chapterFiles) {
  const rawText = readFileSync(chPath, 'utf-8');
  const slug = findSlug(rawText);
  if (!slug) continue;
  const expectedNum = slugToNumber[slug];
  if (!expectedNum) continue;

  const re = /<([A-Z][A-Za-z0-9]*Demo)\b/g;
  let m;
  const seen = new Set();
  while ((m = re.exec(rawText)) !== null) {
    const demoName = m[1];
    if (seen.has(demoName)) continue;
    seen.add(demoName);

    const demoPath = resolveDemoPath(demoName);
    if (!demoPath) continue;
    const sf = project.getSourceFile(demoPath);
    if (!sf) continue;

    const sharedBy = demoToChapters[demoName];
    const isShared = sharedBy && sharedBy.size > 1;

    let changed = false;

    /* a) Bump default figure strings in demo file */
    const strLits = sf.getDescendantsOfKind(SyntaxKind.StringLiteral);
    for (const lit of strLits) {
      const val = lit.getLiteralValue();
      const fm = val.match(/^Fig\.\s*(\d+)\.(\d+)$/);
      if (fm) {
        const oldNum = parseInt(fm[1], 10);
        if (oldNum !== expectedNum) {
          if (isShared) {
            log.push(`SKIP ${basename(demoPath)}: shared demo, default ${val}`);
            continue;
          }
          const next = `Fig. ${expectedNum}.${fm[2]}`;
          lit.replaceWithText(`'${next}'`);
          log.push(`${basename(demoPath)}: default ${val} → ${next}`);
          changed = true;
        }
      }
    }

    /* b) Bump leading comment Ch.N references */
    const demoText = sf.getFullText();
    const lines = demoText.split('\n');
    let demoChanged = false;
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const line = lines[i];
      const cm = line.match(/(Ch\.)(\d+)/);
      if (cm) {
        const oldNum = parseInt(cm[2], 10);
        if (oldNum !== expectedNum) {
          lines[i] = line.replace(cm[0], `Ch.${expectedNum}`);
          log.push(`${basename(demoPath)}: comment ${cm[0]} → Ch.${expectedNum}`);
          demoChanged = true;
        }
      }
    }
    if (demoChanged) {
      const newText = lines.join('\n');
      sf.replaceText([0, demoText.length], newText);
      changed = true;
    }

    if (WRITE_MODE && changed) {
      sf.saveSync();
    }
    if (changed) demosTouched++;
  }
}

/* ── report ─────────────────────────────────────────────────────────────── */

console.log(log.join('\n'));
console.log(`\nChapters touched: ${chaptersTouched}`);
console.log(`Demos touched: ${demosTouched}${DRY_NOTE}`);
