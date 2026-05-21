/* eslint-disable */
/**
 * Optional codemod: upgrade top-edge `drawLabel` calls to `drawCaption()`.
 *
 * Run with:  node scripts/codemod-drawCaption.mjs
 * Optional:  node scripts/codemod-drawCaption.mjs --dry --verbose
 *
 * drawCaption is a thin semantic wrapper around drawLabel that defaults to
 * baseline 'top' and align 'left'. It makes the intent explicit: this text
 * is a caption, not a plot label or tick mark.
 *
 * Because the visual difference is zero, this codemod is purely cosmetic.
 * It only targets drawLabel calls that sit at the very top of the canvas
 * (y ≤ 20) so we don't accidentally convert plot labels or mid-canvas
 * annotations.
 *
 * Safety rules
 * ────────────
 *  1. The drawLabel call must have `baseline: 'top'`.
 *  2. `y` must be a numeric literal ≤ 20.
 *  3. `align` must be 'left' or omitted.
 *  4. `size` must be 10 or omitted.
 *  5. `weight` must be omitted (captions are not bold by default).
 */

import { Project, QuoteKind, SyntaxKind, Node } from 'ts-morph';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const DEMOS_GLOB = 'src/textbook/demos/*.tsx';
const DRY = process.argv.includes('--dry');
const VERBOSE = process.argv.includes('--verbose');

const project = new Project({
  tsConfigFilePath: resolve(ROOT, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
  manipulationSettings: { quoteKind: QuoteKind.Single },
});

project.addSourceFilesAtPaths(resolve(ROOT, DEMOS_GLOB));

let totalMigrations = 0;
let filesTouched = 0;
const skipped = [];

for (const sourceFile of project.getSourceFiles()) {
  const filename = sourceFile.getBaseName();
  const migrations = [];

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const callee = call.getExpression();
    if (!Node.isIdentifier(callee) || callee.getText() !== 'drawLabel') continue;

    const args = call.getArguments();
    if (args.length !== 2) continue;

    const opts = args[1];
    if (!Node.isObjectLiteralExpression(opts)) continue;

    const props = {};
    for (const p of opts.getProperties()) {
      if (!Node.isPropertyAssignment(p)) continue;
      const name = p.getName();
      props[name] = p.getInitializer()?.getText() ?? '';
    }

    // Rule 1: must have baseline: 'top'
    if (props.baseline !== "'top'") {
      skipped.push(`${filename}:${call.getStartLineNumber()} (baseline != top)`);
      continue;
    }

    // Rule 2: y must be numeric literal ≤ 20
    const yVal = parseFloat(props.y ?? '');
    if (isNaN(yVal) || yVal > 20) {
      skipped.push(`${filename}:${call.getStartLineNumber()} (y = ${props.y})`);
      continue;
    }

    // Rule 3: align must be left or omitted
    if (props.align && props.align !== "'left'") {
      skipped.push(`${filename}:${call.getStartLineNumber()} (align = ${props.align})`);
      continue;
    }

    // Rule 4: size must be 10 or omitted
    if (props.size && props.size !== '10') {
      skipped.push(`${filename}:${call.getStartLineNumber()} (size = ${props.size})`);
      continue;
    }

    // Rule 5: no bold weight
    if (props.weight) {
      skipped.push(`${filename}:${call.getStartLineNumber()} (weight present)`);
      continue;
    }

    // Build drawCaption options — omit defaults.
    const outFields = [];
    outFields.push(`x: ${props.x}`);
    outFields.push(`y: ${props.y}`);
    outFields.push(`text: ${props.text}`);
    if (props.color) outFields.push(`color: ${props.color}`);

    const indent = getIndent(call.getParent());
    const innerIndent = indent + '  ';
    const replacement =
      'drawCaption(ctx, {\n' +
      outFields.map((f) => innerIndent + f + ',').join('\n') +
      '\n' +
      indent +
      '})';

    migrations.push({
      start: call.getStart(),
      end: call.getEnd(),
      replacement,
    });
  }

  if (migrations.length === 0) continue;

  migrations.sort((a, b) => b.start - a.start);
  for (const m of migrations) {
    sourceFile.replaceText([m.start, m.end], m.replacement);
  }

  ensureDrawCaptionImport(sourceFile);

  filesTouched++;
  totalMigrations += migrations.length;
  console.log(`  ${filename}  ${migrations.length} migrations`);

  if (!DRY) sourceFile.saveSync();
}

console.log('');
console.log(`Files touched: ${filesTouched}`);
console.log(`Total migrations: ${totalMigrations}`);
console.log(`Skipped sites: ${skipped.length}`);
if (VERBOSE && skipped.length) {
  console.log('');
  console.log('Skipped sites:');
  skipped.forEach((s) => console.log('  ' + s));
}
if (DRY) console.log('(dry run — no files written)');

// ─── Helpers ────────────────────────────────────────────────────────────────

function getIndent(node) {
  const fullText = node.getFullText();
  const leading = fullText.slice(0, fullText.length - fullText.trimStart().length);
  const lastNewline = leading.lastIndexOf('\n');
  return lastNewline >= 0 ? leading.slice(lastNewline + 1) : leading;
}

function ensureDrawCaptionImport(sourceFile) {
  const existing = sourceFile.getImportDeclaration((d) => {
    return d.getModuleSpecifierValue() === '@/lib/canvasLayout';
  });

  if (existing) {
    const named = existing.getNamedImports();
    if (!named.some((n) => n.getName() === 'drawCaption')) {
      existing.addNamedImport('drawCaption');
      const sorted = existing
        .getNamedImports()
        .map((n) => n.getName())
        .sort();
      existing.removeNamedImports();
      sorted.forEach((n) => existing.addNamedImport(n));
    }
    return;
  }

  const allImports = sourceFile.getImportDeclarations();
  let insertIdx = 0;
  for (let i = 0; i < allImports.length; i++) {
    const spec = allImports[i].getModuleSpecifierValue();
    if (spec.startsWith('@/lib/') && spec < '@/lib/canvasLayout') {
      insertIdx = i + 1;
    } else if (spec.startsWith('@/lib/') && spec > '@/lib/canvasLayout') {
      insertIdx = i;
      break;
    } else if (insertIdx === 0 && !spec.startsWith('@/lib/')) {
      insertIdx = i + 1;
    }
  }

  sourceFile.insertImportDeclaration(insertIdx, {
    moduleSpecifier: '@/lib/canvasLayout',
    namedImports: ['drawCaption'],
  });
}
