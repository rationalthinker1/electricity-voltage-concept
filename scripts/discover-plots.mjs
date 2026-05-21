#!/usr/bin/env node
/**
 * Discoverer for hand-rolled canvas plotting blocks that could be
 * replaced with drawAxes / drawGridLines / drawLinePlot / drawBarChart
 * from @/lib/drawPlot.
 *
 * NOT an auto-rewriter. The pattern variety across demos is too high to
 * AST-rewrite safely (log axes, dual y-axes, drawGlowPath calls,
 * interleaved reference lines and custom annotations all need bespoke
 * handling). This script just emits a punch list so you can convert by
 * hand, in order of how clean the conversion looks.
 *
 * For each demo it reports:
 *   - Frame  — line of ctx.strokeRect that draws a plot frame, plus the
 *              variable names that define the rect.
 *   - Mappers — inline arrow functions like
 *               `const yOf = (v) => plotY + plotH - ((v - yMin) / (yMax - yMin)) * plotH;`
 *               which expose the data-space ranges.
 *   - GridLoops — `for (...)` blocks that draw moveTo/lineTo grid lines
 *                 (candidates for drawGridLines).
 *   - PolyLines — `ctx.beginPath` + `moveTo/lineTo` over a point array
 *                 (candidates for drawLinePlot).
 *   - Bars — `ctx.fillRect(..., barW, ...)` loops (candidates for
 *            drawBarChart).
 *   - Flags — log axes, drawGlowPath, dashed reference lines that would
 *             need to stay as drawHLine/drawVLine.
 *
 * Run from repo root:
 *   node scripts/discover-plots.mjs
 *   node scripts/discover-plots.mjs --md > docs/plot-refactor-punchlist.md
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

const SCRIPT_DIR = path.dirname(url.fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEMOS_DIR = path.join(REPO_ROOT, 'src/textbook/demos');

const MD_MODE = process.argv.includes('--md');

const ALREADY = new Set(); // demos already using the helpers

function isAlreadyConverted(text) {
  return /\b(drawAxes|drawLinePlot|drawBarChart|drawGridLines)\b/.test(text);
}

function findFrame(lines) {
  // ctx.strokeRect(<X>, <Y>, <W>, <H>) — typically the plot frame
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(
      /ctx\.strokeRect\s*\(\s*([\w.]+)\s*,\s*([\w.]+)\s*,\s*([\w.]+)\s*,\s*([\w.]+)\s*\)/,
    );
    if (m) hits.push({ line: i + 1, x: m[1], y: m[2], w: m[3], h: m[4] });
  }
  return hits;
}

function findMappers(lines) {
  // `const yOf = (v) => plotY + plotH - ((v - yMin) / (yMax - yMin)) * plotH;`
  // or just `(v) => ... ((v - yMin) / (yMax - yMin)) ...` inline.
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(
      /\(\s*(\w+)\s*-\s*(\w+)\s*\)\s*\/\s*\(\s*(\w+)\s*-\s*(\w+)\s*\)/,
    );
    if (m) hits.push({ line: i + 1, snippet: lines[i].trim() });
  }
  return hits.slice(0, 4); // first 4 are usually enough to infer ranges
}

function findGridLoops(lines) {
  // for (...) { ctx.beginPath(); ctx.moveTo(...); ctx.lineTo(...); ctx.stroke(); }
  // We approximate: any `for (` that has moveTo+lineTo+stroke within the
  // next 10 lines.
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/\bfor\s*\(/.test(lines[i])) continue;
    const window = lines.slice(i, i + 10).join('\n');
    if (/ctx\.moveTo/.test(window) && /ctx\.lineTo/.test(window) && /ctx\.stroke/.test(window)) {
      hits.push({ line: i + 1, snippet: lines[i].trim() });
    }
  }
  return hits;
}

function findPolylines(lines) {
  // Look for points-array push followed by drawGlowPath or a ctx.stroke loop.
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (/\.push\s*\(\s*\{\s*x\s*:/.test(lines[i])) {
      hits.push({ line: i + 1, snippet: lines[i].trim() });
    }
  }
  return hits;
}

function findBars(lines) {
  // ctx.fillRect(..., barW, ...) — bar chart bars
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (/ctx\.fillRect\s*\([^)]*\bbar[WH]\b/.test(lines[i])) {
      hits.push({ line: i + 1, snippet: lines[i].trim() });
    }
  }
  return hits;
}

function findFlags(text) {
  const flags = [];
  if (/Math\.log10|Math\.pow\s*\(\s*10/.test(text)) flags.push('LOG-AXIS');
  if (/drawGlowPath/.test(text)) flags.push('drawGlowPath');
  if (/setLineDash/.test(text)) flags.push('dashed');
  if (/ctx\.clip\s*\(/.test(text)) flags.push('clip');
  if (/ctx\.rotate\s*\(/.test(text)) flags.push('rotate');
  // dual y-axes — multiple yOf/yDb/yV mappers
  const yMapperCount = (text.match(/\b(yOf|yDb|yV|yAxis|yPx)\b\s*=\s*\(/g) ?? []).length;
  if (yMapperCount >= 2) flags.push(`${yMapperCount}-y-axes`);
  return flags;
}

function suggestDrawAxesCall(frame, mappers) {
  if (!frame) return null;
  // Try to infer xMin / xMax / yMin / yMax from the first two mappers
  // (one for x, one for y — naming convention is usually xOf/yOf).
  // Just emit a placeholder if we can't be sure.
  const ranges = mappers
    .map((m) => m.snippet.match(/\(\s*(\w+)\s*-\s*(\w+)\s*\)\s*\/\s*\(\s*(\w+)\s*-\s*(\w+)\s*\)/))
    .filter(Boolean)
    .slice(0, 2);
  const r0 = ranges[0];
  const r1 = ranges[1];
  const fst = r0 ? `${r0[2]}, ${r1 ? r0[4] : '???'}` : '0, ?';
  const snd = r1 ? `${r1[2]}, ${r1[4]}` : '?, ?';
  return (
    `drawAxes(ctx, ` +
    `{ x: ${frame.x}, y: ${frame.y}, w: ${frame.w}, h: ${frame.h} }, ` +
    `{ xMin: ${fst.split(', ')[0]}, xMax: ${fst.split(', ')[1]}, ` +
    `yMin: ${snd.split(', ')[0]}, yMax: ${snd.split(', ')[1]}, xTicks: 5, yTicks: 5 });`
  );
}

const files = fs
  .readdirSync(DEMOS_DIR)
  .filter((f) => f.endsWith('.tsx'))
  .sort();

const report = [];
report.push(MD_MODE ? '# Plot refactor punch list\n' : '');

let candidateCount = 0;
let alreadyCount = 0;
let nonPlotCount = 0;

for (const filename of files) {
  const fp = path.join(DEMOS_DIR, filename);
  const text = fs.readFileSync(fp, 'utf8');
  if (isAlreadyConverted(text)) {
    ALREADY.add(filename);
    alreadyCount++;
    continue;
  }
  const lines = text.split('\n');
  const frames = findFrame(lines);
  if (frames.length === 0) {
    nonPlotCount++;
    continue;
  }
  candidateCount++;

  const mappers = findMappers(lines);
  const gridLoops = findGridLoops(lines);
  const polylines = findPolylines(lines);
  const bars = findBars(lines);
  const flags = findFlags(text);

  if (MD_MODE) {
    report.push(`## ${filename}\n`);
    if (flags.length) report.push(`**Flags:** ${flags.join(', ')}\n`);
    report.push('**Frames found:**\n');
    for (const f of frames) {
      report.push(
        `- L${f.line}: \`ctx.strokeRect(${f.x}, ${f.y}, ${f.w}, ${f.h})\``,
      );
    }
    report.push('');
    if (mappers.length) {
      report.push('**Range mappers (first 4):**\n');
      for (const m of mappers) report.push(`- L${m.line}: \`${m.snippet}\``);
      report.push('');
    }
    if (gridLoops.length) {
      report.push(`**Grid-line loops:** ${gridLoops.length}`);
      report.push('');
    }
    if (polylines.length) {
      report.push(`**Polyline point-pushes:** ${polylines.length}`);
      report.push('');
    }
    if (bars.length) {
      report.push(`**Bar fillRects:** ${bars.length}`);
      report.push('');
    }
    const suggestion = suggestDrawAxesCall(frames[0], mappers);
    if (suggestion) {
      report.push('**Suggested replacement for the frame block:**\n');
      report.push('```ts');
      report.push(suggestion);
      report.push('```\n');
    }
  } else {
    report.push(
      `${filename}` +
        `  frames=${frames.length}` +
        `  grids=${gridLoops.length}` +
        `  polys=${polylines.length}` +
        `  bars=${bars.length}` +
        (flags.length ? `  flags=[${flags.join(',')}]` : ''),
    );
  }
}

if (!MD_MODE) {
  report.push('');
  report.push('────────────────────────────────────────');
  report.push(`Total demos:           ${files.length}`);
  report.push(`Already using helpers: ${alreadyCount}  (skip)`);
  report.push(`No plot frame:         ${nonPlotCount}  (skip)`);
  report.push(`Candidates:            ${candidateCount}`);
  report.push('');
  report.push('Run with --md to emit a markdown punch list with suggested replacements.');
}

console.log(report.join('\n'));
