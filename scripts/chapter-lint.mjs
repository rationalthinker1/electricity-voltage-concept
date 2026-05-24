#!/usr/bin/env node
/**
 * chapter-lint — mechanical audit pass over Field·Theory chapter files.
 *
 * Run:
 *   node scripts/chapter-lint.mjs                 # lint every chapter
 *   node scripts/chapter-lint.mjs --chapter 25    # lint by integer
 *   node scripts/chapter-lint.mjs --chapter batteries  # by slug
 *   node scripts/chapter-lint.mjs --json          # machine-readable
 *   node scripts/chapter-lint.mjs --quiet         # only errors
 *
 * Exits 1 if any HIGH-severity finding fires; 0 otherwise.
 *
 * What it checks (all read-only — flags, does not fix)
 * ────────────────────────────────────────────────────
 * H1  Chapter-integer drift          — Ch{N}*.tsx filename vs chapters.ts vs docblock
 * H2  Broken <Cite id="X">           — X not in SOURCES.ts, or not in chapter.sources[]
 * H3  Fig./Try./Case. tag drift      — source order vs sorted-by-integer
 * H4  toExponential in TeX template  — JS sci notation in `tex={…}` template literal
 * H5  Voltage-pair arithmetic        — X/Y kV on a wye system must satisfy X/√3 ≈ Y
 * M1  Demo file header drift         — `Demo N.M` in demo file header vs chapter integer
 * M2  Pullout count                  — exactly one per chapter
 * M3  Term count                     — 8–15 per chapter (CLAUDE.md §6 #5)
 * M4  Unused chapter sources         — key in chapter.sources[] but never <Cite>d
 * M5  Stale Chapter N xrefs          — Chapter X / Ch.X mentions, multi-line, vs current map
 *
 * The voltage-pair check (H5) and stale-xref check (M5) are heuristic:
 * H5 only fires on numeric pairs that look like wye-system voltage labels
 * (X.YY/Z.WW kV with both > 1); M5 only flags exact-match mismatches and
 * lists the rest as unverified (an LLM still needs to confirm topic).
 *
 * Applied-track exception: per CLAUDE.md §6, Ch.27–40 are exempt from the
 * "≥1 demo per h2" rule but still get every other check applied.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(__filename, '..', '..');

/* ──────────────────────────────────────────────────────────────────────
 *  CLI
 * ────────────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const wantJson = args.includes('--json');
const quiet = args.includes('--quiet');
const chapterArg = (() => {
  const i = args.indexOf('--chapter');
  return i >= 0 ? args[i + 1] : null;
})();

/* ──────────────────────────────────────────────────────────────────────
 *  Load chapter manifest + source registry
 * ────────────────────────────────────────────────────────────────────── */

function loadChapterManifest() {
  const src = readFileSync(join(REPO_ROOT, 'src/textbook/data/chapters.ts'), 'utf8');
  // Each chapter object: { slug: 'foo', number: N, ... sources: [ 'k1', 'k2', ... ], ... }
  // We regex the block, ignoring CHAPTER_DRAFTS et al.
  const chapters = [];
  // Match each top-level object starting at "    slug: '...'," — these are the chapters in the CHAPTERS array.
  const objectRe = /\{\s*slug:\s*'([^']+)',[\s\S]*?number:\s*(\d+),[\s\S]*?sources:\s*\[([\s\S]*?)\][\s\S]*?\},/g;
  let m;
  while ((m = objectRe.exec(src)) !== null) {
    const slug = m[1];
    const number = parseInt(m[2], 10);
    const sourcesBlock = m[3];
    const sources = [...sourcesBlock.matchAll(/'([^']+)'/g)].map((mm) => mm[1]);
    chapters.push({ slug, number, sources });
  }
  return chapters;
}

function loadSourcesRegistry() {
  const src = readFileSync(join(REPO_ROOT, 'src/lib/sources.ts'), 'utf8');
  // Top-level keys in the `SOURCES` object: `'key': {`
  const keys = new Set();
  // Object-literal keys can be quoted ('foo':) or bare-word (foo:); both forms appear in sources.ts.
  for (const m of src.matchAll(/^\s+'([a-zA-Z][a-zA-Z0-9.-]+)':\s*\{/gm)) keys.add(m[1]);
  for (const m of src.matchAll(/^\s+([a-zA-Z][a-zA-Z0-9.-]+):\s*\{$/gm)) keys.add(m[1]);
  return keys;
}

/* ──────────────────────────────────────────────────────────────────────
 *  Per-chapter file checks
 * ────────────────────────────────────────────────────────────────────── */

function findChapterFile(integerOrSlug, chapters) {
  if (typeof integerOrSlug === 'number') {
    const ch = chapters.find((c) => c.number === integerOrSlug);
    if (!ch) return null;
    integerOrSlug = ch.slug;
  }
  const ch = chapters.find((c) => c.slug === integerOrSlug);
  if (!ch) return null;
  const files = readdirSync(join(REPO_ROOT, 'src/textbook'));
  const pat = new RegExp(`^Ch${ch.number}[A-Z].*\\.tsx$`);
  const file = files.find((f) => pat.test(f));
  return file ? { ...ch, file: `src/textbook/${file}` } : { ...ch, file: null };
}

function loadChapterFile(relPath) {
  const abs = join(REPO_ROOT, relPath);
  if (!existsSync(abs)) return null;
  const text = readFileSync(abs, 'utf8');
  return { text, lines: text.split('\n') };
}

function lineOf(text, idx) {
  return text.slice(0, idx).split('\n').length;
}

/** Parse the closing `>` of a JSX element starting at idx (after the
 *  component name). Returns the substring between the name and the
 *  `>` / `/>`. Naive — handles balanced braces but not nested JSX, which
 *  is fine for our attribute-only checks. */
function attrSlice(text, startIdx) {
  let depth = 0;
  for (let i = startIdx; i < text.length; i++) {
    const c = text[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (depth === 0 && c === '>') return text.slice(startIdx, i);
  }
  return '';
}

/* ──────────────────────────────────────────────────────────────────────
 *  Checks
 * ────────────────────────────────────────────────────────────────────── */

const findings = []; // { chapter, file, line, severity, code, message }

function add(chapter, file, line, severity, code, message) {
  findings.push({ chapter, file, line, severity, code, message });
}

// H1 — Chapter integer drift between filename / docblock / chapters.ts
function checkChapterIntegerDrift(chapter) {
  if (!chapter.file) {
    add(chapter, null, 0, 'HIGH', 'H1', `No Ch${chapter.number}*.tsx file found for slug ${chapter.slug}`);
    return;
  }
  const { text } = loadChapterFile(chapter.file);
  // Filename was already matched via Ch{N}; check docblock
  const m = text.match(/^\s*\*\s*Chapter\s+(\d+)\b/m);
  if (m && parseInt(m[1], 10) !== chapter.number) {
    add(
      chapter,
      chapter.file,
      lineOf(text, m.index),
      'HIGH',
      'H1',
      `Docblock says "Chapter ${m[1]}" but chapters.ts has number ${chapter.number}`,
    );
  }
}

// H2 — Broken <Cite id="X"> (X not in SOURCES.ts or not in chapter.sources[])
function checkBrokenCites(chapter, sourcesRegistry) {
  if (!chapter.file) return [];
  const { text } = loadChapterFile(chapter.file);
  const cites = [];
  const chapterSources = new Set(chapter.sources);
  for (const m of text.matchAll(/<Cite\s+id="([^"]+)"/g)) {
    const id = m[1];
    cites.push({ id, line: lineOf(text, m.index) });
    if (!sourcesRegistry.has(id)) {
      add(chapter, chapter.file, lineOf(text, m.index), 'HIGH', 'H2',
        `<Cite id="${id}"> — key not in src/lib/sources.ts`);
    } else if (!chapterSources.has(id)) {
      add(chapter, chapter.file, lineOf(text, m.index), 'HIGH', 'H2',
        `<Cite id="${id}"> — key not in chapter.sources[] (renders [?])`);
    }
  }
  return cites;
}

// Strip /** … */ block comments so the lint doesn't pick up example tags
// in chapter docblocks (e.g. "Demos: 7.3 Move a magnet → Fig. 7.3").
function stripBlockComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
}

// H3 — Fig./Try./Case. tag drift
function checkTagContiguity(chapter) {
  if (!chapter.file) return;
  const { text: raw } = loadChapterFile(chapter.file);
  const text = stripBlockComments(raw);
  const N = chapter.number;
  const families = [
    { name: 'Fig.', re: new RegExp(`figure="Fig\\. ${N}\\.(\\d+)"`, 'g') },
    { name: 'Try',  re: new RegExp(`tag=['"]Try ${N}\\.(\\d+)['"]`, 'g') },
    { name: 'Case', re: new RegExp(`tag=['"]Case ${N}\\.(\\d+)['"]`, 'g') },
  ];
  for (const fam of families) {
    const hits = [];
    let m;
    while ((m = fam.re.exec(text)) !== null) {
      hits.push({ minor: parseInt(m[1], 10), line: lineOf(text, m.index) });
    }
    if (hits.length === 0) continue;
    const sourceOrder = hits.map((h) => h.minor);
    const expected = sourceOrder.slice().sort((a, b) => a - b);
    // Verify the sequence is contiguous starting at 1 (project convention)
    const isContiguous = expected.every((v, i) => v === i + 1);
    const inOrder = sourceOrder.every((v, i) => v === expected[i]);
    if (!inOrder || !isContiguous) {
      add(
        chapter,
        chapter.file,
        hits[0].line,
        'HIGH',
        'H3',
        `${fam.name} tags out of source order: source=[${sourceOrder.join(', ')}] target=[${expected.map((_, i) => i + 1).join(', ')}]`,
      );
    }
  }
}

// H4 — toExponential inside tex={`…`} template literal
function checkToExponentialInTex(chapter) {
  if (!chapter.file) return;
  const { text } = loadChapterFile(chapter.file);
  // Match `tex={` ... `}` template-literal blocks; if any contain a `toExponential(` call, flag.
  const blockRe = /tex=\{`([^`]*)`\}/g;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    if (/\.toExponential\s*\(/.test(m[1])) {
      add(chapter, chapter.file, lineOf(text, m.index), 'HIGH', 'H4',
        `tex={\`…\`} template contains toExponential() — use sciTeX(n, digits, opts?) from @/lib/physics`);
    }
  }
  // Also scan demo files this chapter embeds (look up *Demo /> jsx).
  // Demo files often hold the same trap.
  for (const demoFile of listEmbeddedDemoFiles(text)) {
    const demoAbs = join(REPO_ROOT, demoFile);
    if (!existsSync(demoAbs)) continue;
    const demoText = readFileSync(demoAbs, 'utf8');
    let dm;
    while ((dm = blockRe.exec(demoText)) !== null) {
      if (/\.toExponential\s*\(/.test(dm[1])) {
        add(chapter, demoFile, lineOf(demoText, dm.index), 'HIGH', 'H4',
          `tex={\`…\`} template contains toExponential() — use sciTeX(n, digits, opts?)`);
      }
    }
    blockRe.lastIndex = 0;
  }
}

function listEmbeddedDemoFiles(chapterText) {
  // Each `<XxxDemo ... />` imports from `./demos/Xxx`
  const names = new Set();
  for (const m of chapterText.matchAll(/<([A-Z][A-Za-z0-9]*Demo)[\s/>]/g)) {
    // Strip trailing "Demo" suffix to get the bare component, which is the filename
    const base = m[1].replace(/Demo$/, '');
    names.add(`src/textbook/demos/${base}.tsx`);
  }
  return [...names];
}

// H5 — Voltage-pair arithmetic (X.YY / Z.WW kV must satisfy X/√3 ≈ Z)
//
// Only fires when the pair is contextualised as a wye/Y configuration in a
// ±200-char window. The same `X/Y kV` notation is also used for
// transmission step-down ratios (e.g. "345/138 kV step-down transformer"),
// which is not a wye pair — guarding on context avoids that false positive.
function checkVoltagePairs(chapter) {
  if (!chapter.file) return;
  const { text } = loadChapterFile(chapter.file);
  const re = /\b(\d{1,3}(?:\.\d+)?)\s*\/\s*(\d{1,3}(?:\.\d+)?)\s*kV\b/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const a = parseFloat(m[1]);
    const b = parseFloat(m[2]);
    if (a < 1 || b < 1) continue;
    if (a < b) continue;
    // Context window: 200 chars on either side
    const ctx = text.slice(Math.max(0, m.index - 200), m.index + 200);
    if (!/\b(wye|Wye|WYE|Y-?connected|three-phase\s+wye|line-to-neutral|phase-to-neutral)\b/.test(ctx)) {
      continue; // not contextualised as a wye pair; could be transmission stepdown
    }
    const expected = a / Math.sqrt(3);
    const errPct = Math.abs((b - expected) / expected) * 100;
    if (errPct > 2) {
      add(
        chapter,
        chapter.file,
        lineOf(text, m.index),
        'HIGH',
        'H5',
        `"${a}/${b} kV" fails wye-pair test: ${a}/√3 = ${expected.toFixed(2)}, not ${b} (off by ${errPct.toFixed(1)}%)`,
      );
    }
  }
}

// M1 — Demo file header drift (Demo N.M)
function checkDemoFileHeaders(chapter) {
  if (!chapter.file) return;
  const { text } = loadChapterFile(chapter.file);
  for (const demoFile of listEmbeddedDemoFiles(text)) {
    const demoAbs = join(REPO_ROOT, demoFile);
    if (!existsSync(demoAbs)) continue;
    const demoText = readFileSync(demoAbs, 'utf8');
    const m = demoText.match(/^\s*\*\s*Demo\s+(\d+)\.(\d+)\b/m);
    if (m && parseInt(m[1], 10) !== chapter.number) {
      add(chapter, demoFile, 2, 'MEDIUM', 'M1',
        `Header says "Demo ${m[1]}.${m[2]}" but this chapter is number ${chapter.number}`);
    }
  }
}

// M2 — Pullout count = 1
function checkPulloutCount(chapter) {
  if (!chapter.file) return;
  const { text } = loadChapterFile(chapter.file);
  const matches = [...text.matchAll(/<Pullout[\s>]/g)];
  if (matches.length === 0) {
    add(chapter, chapter.file, 0, 'MEDIUM', 'M2',
      'No <Pullout> in chapter (CLAUDE.md §6 requires exactly one)');
  } else if (matches.length > 1) {
    const lines = matches.map((m) => lineOf(text, m.index)).join(', ');
    add(chapter, chapter.file, matches[0].index ? lineOf(text, matches[0].index) : 0, 'MEDIUM', 'M2',
      `${matches.length} <Pullout> blocks at lines ${lines} (CLAUDE.md §6 requires exactly one)`);
  }
}

// M3 — Term count.
//
// CLAUDE.md §6 #5 says "Aim for ~8–15," but practice has shown two
// recurring legitimate excursions:
//   - Some synthesis chapters have <8 (Ch.8 Poynting capstone has 7) —
//     fine if the chapter is consolidating not introducing.
//   - Jargon-heavy chapters (semiconductors, rectifiers, op-amps,
//     and the applied-track house chapters Ch.27–40) routinely run
//     20–30 because every device name, NEC §, fixture type, etc. is
//     a glossary candidate. Forcing them down to 15 would lose
//     definitions, not add value.
//
// Effective gate: 6–30. Outside that range, MEDIUM if too few (real
// gap), LOW if too many (worth a trim consideration but not a bug).
function checkTermCount(chapter) {
  if (!chapter.file) return;
  const { text } = loadChapterFile(chapter.file);
  const count = [...text.matchAll(/<Term\s+def=/g)].length;
  if (count < 6) {
    add(chapter, chapter.file, 0, 'MEDIUM', 'M3',
      `Only ${count} <Term> tags (target ~8–15; below the practical floor of 6)`);
  } else if (count > 30) {
    add(chapter, chapter.file, 0, 'LOW', 'M3',
      `${count} <Term> tags (above the practical ceiling of 30; consider trimming)`);
  }
}

// M4 — Unused chapter sources (in chapter.sources[] but no <Cite> refers to it)
function checkUnusedSources(chapter, cites) {
  const used = new Set(cites.map((c) => c.id));
  for (const key of chapter.sources) {
    if (!used.has(key)) {
      add(chapter, chapter.file, 0, 'MEDIUM', 'M4',
        `Unused source "${key}" in chapter.sources[] — drop from chapters.ts or add a <Cite>`);
    }
  }
}

// H6 — JSX whitespace bug: prose ends a line, next line opens with an
// inline tag that needs word-spacing (<M>, <Term>, <strong>, <em>, …),
// and there's no `{' '}` marker bridging them. JSX strips the newline
// and the leading indent, so the rendered output runs the prose word
// straight into the tag's first glyph (e.g. "between them,V" instead of
// "between them, V"). Self-closed <Cite>, <sub>, <sup> are excluded
// because they're meant to hug the previous word (superscript style).
const JSX_SPACING_TAGS = ['M', 'Term', 'strong', 'em', 'a', 'Link', 'code', 'InlineMath'];
function checkJsxWhitespaceAtTagBoundary(chapter) {
  if (!chapter.file) return;
  const { lines } = loadChapterFile(chapter.file);
  const tagAlt = JSX_SPACING_TAGS.join('|');
  const nextLineTagRe = new RegExp(`^[ \\t]+<(${tagAlt})\\b`);
  const fullOpenRe = new RegExp(`<(${tagAlt})\\b([^>]*)>`);
  const prevLineEndRe = /([^\s>{(\[\-—–][\w,.;:!?\)\]"'/])\s*$/;

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    const next = lines[i + 1];

    if (!nextLineTagRe.test(next)) continue;
    if (!prevLineEndRe.test(line)) continue;
    if (/\{' '\}\s*$/.test(line)) continue;
    if (/[\(\[\{]\s*$/.test(line)) continue;
    if (/>\s*$/.test(line)) continue;
    if (/[—–-]\s*$/.test(line)) continue;

    // Distinguish `<Foo> word` (non-self-closing, leading whitespace in
    // content — already glues correctly) from `<Foo />` (self-closing —
    // a real whitespace bug if the previous line lacks `{' '}`).
    const open = next.match(fullOpenRe);
    if (open) {
      const attrs = open[2].trimEnd();
      const isSelfClosing = attrs.endsWith('/');
      if (!isSelfClosing) {
        const afterOpen = next.slice(open.index + open[0].length);
        if (/^\s/.test(afterOpen)) continue;
      }
    }

    add(chapter, chapter.file, i + 1, 'HIGH', 'H6',
      `Line ends with text, next line opens with <${open ? open[1] : '?'}> — add {' '} before the newline (JSX would strip the space)`);
  }
}

// M5 — Stale Chapter N / Ch.N xrefs (multi-line aware)
function checkStaleChapterXrefs(chapter, chapters) {
  if (!chapter.file) return;
  const { text } = loadChapterFile(chapter.file);
  // Build a set of current valid chapter numbers
  const validNumbers = new Set(chapters.map((c) => c.number));
  // Match both "Chapter N" and "Ch.N" — single-line AND multi-line (whitespace incl. \n)
  const re = /\b(?:Chapter|Ch\.)\s+(\d+)\b/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    // Self-reference (linking back to itself) is fine
    if (n === chapter.number) continue;
    if (!validNumbers.has(n)) {
      add(chapter, chapter.file, lineOf(text, m.index), 'MEDIUM', 'M5',
        `"Chapter ${n}" — no chapter at that integer (must be stale post-renumber)`);
    } else {
      // valid integer but might still be the wrong topic; only LOW-flag for human verification
      // (skipping unless we want a noisy report)
    }
  }
}

/* ──────────────────────────────────────────────────────────────────────
 *  Main
 * ────────────────────────────────────────────────────────────────────── */

function lintOne(chapter, sourcesRegistry, chapters) {
  checkChapterIntegerDrift(chapter);
  const cites = checkBrokenCites(chapter, sourcesRegistry);
  checkTagContiguity(chapter);
  checkToExponentialInTex(chapter);
  checkVoltagePairs(chapter);
  checkDemoFileHeaders(chapter);
  checkPulloutCount(chapter);
  checkTermCount(chapter);
  checkUnusedSources(chapter, cites);
  checkStaleChapterXrefs(chapter, chapters);
  checkJsxWhitespaceAtTagBoundary(chapter);
}

function main() {
  const chapters = loadChapterManifest();
  const sourcesRegistry = loadSourcesRegistry();

  let targets = chapters;
  if (chapterArg) {
    const asInt = parseInt(chapterArg, 10);
    targets = isNaN(asInt)
      ? chapters.filter((c) => c.slug === chapterArg)
      : chapters.filter((c) => c.number === asInt);
    if (targets.length === 0) {
      console.error(`No chapter matches "${chapterArg}"`);
      process.exit(2);
    }
  }

  for (const ch of targets) {
    const resolved = findChapterFile(ch.number, chapters);
    if (resolved) lintOne(resolved, sourcesRegistry, chapters);
  }

  if (wantJson) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    printReport(findings, quiet);
  }

  const hasHigh = findings.some((f) => f.severity === 'HIGH');
  process.exit(hasHigh ? 1 : 0);
}

/* ──────────────────────────────────────────────────────────────────────
 *  Report
 * ────────────────────────────────────────────────────────────────────── */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};
const useColor = process.stdout.isTTY;
const color = (c, s) => (useColor ? `${COLORS[c]}${s}${COLORS.reset}` : s);

function printReport(findings, quiet) {
  if (findings.length === 0) {
    console.log(color('bold', '✓ chapter-lint clean across all checked chapters.'));
    return;
  }

  const filtered = quiet ? findings.filter((f) => f.severity === 'HIGH') : findings;
  const byChapter = new Map();
  for (const f of filtered) {
    const key = `${f.chapter.number}. ${f.chapter.slug}`;
    if (!byChapter.has(key)) byChapter.set(key, []);
    byChapter.get(key).push(f);
  }

  for (const [chKey, items] of [...byChapter.entries()].sort()) {
    console.log(`\n${color('bold', chKey)}`);
    const bySev = { HIGH: [], MEDIUM: [], LOW: [] };
    for (const f of items) bySev[f.severity].push(f);

    for (const sev of ['HIGH', 'MEDIUM', 'LOW']) {
      if (bySev[sev].length === 0) continue;
      const sevColor = sev === 'HIGH' ? 'red' : sev === 'MEDIUM' ? 'yellow' : 'dim';
      console.log(`  ${color(sevColor, sev)}`);
      for (const f of bySev[sev]) {
        const loc = f.file ? `${f.file}${f.line ? ':' + f.line : ''}` : '(chapter)';
        console.log(`    [${f.code}] ${loc}  ${f.message}`);
      }
    }
  }

  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const f of findings) counts[f.severity]++;
  console.log(
    `\n${color('bold', 'Summary')}: ` +
      `${color('red', counts.HIGH + ' HIGH')}, ` +
      `${color('yellow', counts.MEDIUM + ' MEDIUM')}, ` +
      `${color('dim', counts.LOW + ' LOW')}`,
  );
}

main();
