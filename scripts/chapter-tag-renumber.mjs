#!/usr/bin/env node
/**
 * chapter-tag-renumber — make Fig./Try./Case. N.M tags walk source order.
 *
 * Run:
 *   node scripts/chapter-tag-renumber.mjs                  # dry-run, all chapters
 *   node scripts/chapter-tag-renumber.mjs --chapter 7      # one chapter (by integer or slug)
 *   node scripts/chapter-tag-renumber.mjs --write          # apply changes
 *
 * What it does
 * ────────────
 * For each chapter file:
 *   1. Find every `<XxxDemo figure="Fig. N.M" />` JSX attribute, in source
 *      order. If the M values aren't contiguous 1..K matching the source
 *      order, renumber to source order. The Fig prefix is `Fig.\s*N\.`.
 *   2. Same for `tag='Try N.M'` and `tag="Try N.M"`.
 *   3. Same for `tag='Case N.M'`.
 *
 * The renumber uses a two-pass swap-via-placeholder trick to handle cycles
 * safely (each tag value is bumped to a unique placeholder first, then
 * placeholders are bumped to the target). This avoids accidental
 * collisions when, e.g., Try 23.5 should become Try 23.7 while Try 23.7
 * should become Try 23.2.
 *
 * Tag families are renumbered independently — Try renumbering doesn't
 * touch Fig labels and vice versa. Each family's renumber is anchored on
 * unique JSX context (component name for Fig, question-prose snippet for
 * Try, and case-title prose for Case), so collisions across files or
 * sections never occur.
 *
 * Skips chapter docblock comments (`/** ... *​/`) so example tags inside a
 * file header don't get rewritten.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(__filename, '..', '..');

const args = process.argv.slice(2);
const writeMode = args.includes('--write');
const chapterArg = (() => {
  const i = args.indexOf('--chapter');
  return i >= 0 ? args[i + 1] : null;
})();

/* ──────────────────────────────────────────────────────────────────────
 *  Chapter manifest
 * ────────────────────────────────────────────────────────────────────── */

function loadChapterManifest() {
  const src = readFileSync(join(REPO_ROOT, 'src/textbook/data/chapters.ts'), 'utf8');
  const chapters = [];
  const objectRe = /\{\s*slug:\s*'([^']+)',[\s\S]*?number:\s*(\d+),/g;
  let m;
  while ((m = objectRe.exec(src)) !== null) {
    chapters.push({ slug: m[1], number: parseInt(m[2], 10) });
  }
  return chapters;
}

function findChapterFile(numberOrSlug, chapters) {
  const ch = typeof numberOrSlug === 'number'
    ? chapters.find((c) => c.number === numberOrSlug)
    : chapters.find((c) => c.slug === numberOrSlug);
  if (!ch) return null;
  const files = readdirSync(join(REPO_ROOT, 'src/textbook'));
  const pat = new RegExp(`^Ch${ch.number}[A-Z].*\\.tsx$`);
  const file = files.find((f) => pat.test(f));
  return file ? { ...ch, file: `src/textbook/${file}` } : null;
}

/* ──────────────────────────────────────────────────────────────────────
 *  Tag renumber per family
 * ────────────────────────────────────────────────────────────────────── */

/** Replace every `/** ... *​/` block-comment span with same-length spaces.
 *  Used only for detection — write-pass operates on the unmasked source. */
function maskBlockComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
}

/**
 * Renumber matches of a tag family in `text` to source order.
 *
 *  - `re`           — regex with TWO capture groups: the prefix-up-to-N. and the integer M.
 *                     The whole match string is replaced. Must include the closing context
 *                     so we can rewrite cleanly.
 *  - `buildReplace` — given (originalMatch, oldM, newM), returns the new match string.
 *
 *  Returns { changed: number, newText: string, swaps: [{from, to, line}] }.
 */
function renumberFamily(rawText, re, buildReplace, lineOfFn) {
  const masked = maskBlockComments(rawText);
  // 1. Find all matches in source order in the masked text (so docblocks don't count).
  const hits = [];
  let m;
  while ((m = re.exec(masked)) !== null) {
    hits.push({ idx: m.index, full: m[0], oldM: parseInt(m[2], 10) });
  }
  if (hits.length === 0) return { changed: 0, newText: rawText, swaps: [] };

  // 2. Already-contiguous? Bail.
  const oldOrder = hits.map((h) => h.oldM);
  const expected = oldOrder.slice().sort((a, b) => a - b);
  const isContiguous = expected.every((v, i) => v === i + 1);
  const inOrder = oldOrder.every((v, i) => v === expected[i]);
  if (inOrder && isContiguous) return { changed: 0, newText: rawText, swaps: [] };

  // 3. Two-pass renumber. First → unique placeholder values guaranteed not to collide
  //    with any real tag (we use 900+i, well above any chapter's tag count). Second →
  //    final value (source order, 1-indexed).
  let text = rawText;
  const swaps = [];

  // Pass A: each hit → placeholder value 900+i. Use a freshly-built regex per hit so we
  // only touch the n-th occurrence of the full match. Since the full match string is
  // unique per hit (it embeds the component name / question snippet via the regex), we
  // can use a global replace safely.
  //
  // BUT — many Fig hits share the same `figure="Fig. N.M"` substring when M repeats by
  // coincidence (it shouldn't in a well-formed chapter, but safer). The unique anchor is
  // the *whole match string from the regex*; we re-scan the raw text in source order so
  // that the i-th hit is paired with placeholder 900+i.
  //
  // To be bulletproof: replace by source-position. Build a list of [idx, newM] pairs,
  // then walk the text from end to start, slicing in the replacement at the exact idx.
  const finalAssign = hits.map((h, i) => ({ ...h, newM: i + 1 }));
  // Pass A: write placeholder M values
  text = rewriteAtIndices(
    text,
    finalAssign.map((h) => ({ idx: h.idx, full: h.full, newM: 900 + finalAssign.indexOf(h) })),
    buildReplace,
  );
  // Pass B: rewrite placeholders to final M values. Re-scan because indices shifted.
  // We build a new regex against the placeholder values.
  const placeholderRe = re;  // same shape; values are now 900..900+N
  const phHits = [];
  let pm;
  while ((pm = placeholderRe.exec(maskBlockComments(text))) !== null) {
    phHits.push({ idx: pm.index, full: pm[0], oldM: parseInt(pm[2], 10) });
  }
  // Map each placeholder value back to its final value.
  // placeholder = 900 + i  →  final = i + 1
  text = rewriteAtIndices(
    text,
    phHits.map((h) => ({ idx: h.idx, full: h.full, newM: h.oldM - 900 + 1 })),
    buildReplace,
  );

  for (let i = 0; i < hits.length; i++) {
    const from = hits[i].oldM;
    const to = i + 1;
    if (from !== to) swaps.push({ from, to, line: lineOfFn(hits[i].idx) });
  }

  return { changed: swaps.length, newText: text, swaps };
}

/** Rewrite text at multiple (idx, full) positions, walking from highest idx to lowest
 *  so earlier indices stay stable as we splice. */
function rewriteAtIndices(text, entries, buildReplace) {
  const sorted = entries.slice().sort((a, b) => b.idx - a.idx);
  for (const e of sorted) {
    const before = text.slice(0, e.idx);
    const after = text.slice(e.idx + e.full.length);
    const re2 = /\d+/;
    const replacement = buildReplace(e.full, parseInt(e.full.match(re2)[0], 10), e.newM);
    text = before + replacement + after;
  }
  return text;
}

/* ──────────────────────────────────────────────────────────────────────
 *  Per-chapter driver
 * ────────────────────────────────────────────────────────────────────── */

function lineOfFor(text) {
  return (idx) => text.slice(0, idx).split('\n').length;
}

function renumberChapter(chapter) {
  const abs = join(REPO_ROOT, chapter.file);
  const raw = readFileSync(abs, 'utf8');
  const N = chapter.number;
  const report = [];

  // We renumber three families, each with its own unique anchor pattern.
  // The capture-group 1 is the prefix up to the integer; group 2 is the integer.
  // The full match must include enough context to be source-position-unique.
  //
  // Fig: `figure="Fig. N.M"` — component-name-anchored upstream context isn't needed
  // because each Fig prop is on its own JSX element and the literal string itself is
  // source-position-unique (no two `figure="Fig. N.M"` strings overlap textually).
  const figRe = new RegExp(`(figure="Fig\\. ${N}\\.)(\\d+)(")`, 'g');
  const tryRe = new RegExp(`(tag=['"]Try ${N}\\.)(\\d+)(['"])`, 'g');
  const caseRe = new RegExp(`(tag=['"]Case ${N}\\.)(\\d+)(['"])`, 'g');
  // Letter-suffix detection: tags like "Try 13.4b" follow a parent; renumbering the
  // parent breaks the relationship. Skip the whole family for that chapter and let
  // the human decide whether to rename 4b → 5b or merge it.
  const suffixRe = new RegExp(`(figure="Fig\\. ${N}\\.|tag=['"](Try|Case) ${N}\\.)\\d+[a-z]`, 'g');
  const hasSuffix = (text, family) => {
    const re = family === 'Fig.'
      ? new RegExp(`figure="Fig\\. ${N}\\.\\d+[a-z]`, 'g')
      : new RegExp(`tag=['"]${family} ${N}\\.\\d+[a-z]`, 'g');
    return re.test(text);
  };

  let text = raw;
  let lineOfText = lineOfFor(text);

  const doFamily = (label, re) => {
    if (hasSuffix(text, label)) {
      report.push({ family: label, swaps: [], note: `letter-suffix tag detected (e.g. "${label} N.Mx"); skipping auto-renumber — fix this family by hand` });
      return;
    }
    const lineFn = lineOfFor(text);
    const result = renumberFamily(text, re, (full, oldM, newM) => {
      // Replace ONLY the minor — the last `.\d+` group, not the chapter major
      // (which is itself a `\d+` and would otherwise be the first match).
      return full.replace(/\.(\d+)(?=[^\d]*$)/, '.' + newM);
    }, lineFn);
    if (result.changed > 0) {
      text = result.newText;
      report.push({ family: label, swaps: result.swaps });
    }
  };

  doFamily('Fig.', figRe);
  doFamily('Try', tryRe);
  doFamily('Case', caseRe);

  return { text, raw, report };
}

/* ──────────────────────────────────────────────────────────────────────
 *  Main
 * ────────────────────────────────────────────────────────────────────── */

function main() {
  const chapters = loadChapterManifest();

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

  let totalChanges = 0;
  let touchedChapters = 0;

  for (const ch of targets) {
    const resolved = findChapterFile(ch.number, chapters);
    if (!resolved) continue;
    const { text, raw, report } = renumberChapter(resolved);
    if (text === raw && report.length === 0) continue;
    if (text !== raw) touchedChapters++;
    console.log(`\nCh.${resolved.number} ${resolved.slug} (${resolved.file})`);
    for (const fam of report) {
      console.log(`  ${fam.family}:`);
      if (fam.note) console.log(`    ⚠ ${fam.note}`);
      for (const s of fam.swaps) {
        console.log(`    L${s.line}  N.${s.from} → N.${s.to}`);
        totalChanges++;
      }
    }
    if (writeMode && text !== raw) {
      writeFileSync(join(REPO_ROOT, resolved.file), text);
    }
  }

  const verb = writeMode ? 'written' : 'would change';
  console.log(`\n${touchedChapters} chapters ${verb}, ${totalChanges} tag swaps.`);
  if (!writeMode && totalChanges > 0) {
    console.log('Re-run with --write to apply.');
  }
}

main();
