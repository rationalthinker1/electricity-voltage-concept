/* eslint-disable */
/**
 * AST codemod: extract duplicated `drawCurrentDotsPath` helpers into the
 * centralised `drawCurrentDots` from `@/lib/canvasPrimitives`.
 *
 * Run with:  node scripts/codemod-drawCurrentDots.mjs
 * Optional:  node scripts/codemod-drawCurrentDots.mjs --dry --verbose
 *
 * What it migrates
 * ────────────────
 * Each file that declares its own `function drawCurrentDotsPath(...)` is
 * inspected. If the body matches the canonical shape (segment builder,
 * spacing/speed literals, blue-ish fillStyle) the local function is removed
 * and all call sites are rewritten to `drawCurrentDots`.
 *
 * The canonical helper signature is:
 *   drawCurrentDots(ctx, pts, { t, Iscale, spacing?, speed?, minIntensity? })
 *
 * Because the original copies vary slightly in their alpha curves and arc
 * radii, the visual output may shift imperceptibly. Review the canvases
 * before committing.
 *
 * Safety rules
 * ────────────
 *  1. The local function must be named exactly `drawCurrentDotsPath`.
 *  2. `spacing` and `speed` must be simple numeric literals.
 *  3. `fillStyle` must resolve to a blue theme token (hard-coded rgba(91,174,248)
 *     or `withAlpha(colors.blue, ...)` / `withAlpha(getCanvasColors().blue, ...)`).
 *  4. Call sites must pass four arguments: `(ctx, tExpr, ptsExpr, IscaleExpr)`.
 *  5. If the `t` expression contains `* 60` and the body divides by 60, the
 *     codemod strips the `* 60` to normalise to seconds.
 */

import { Project, QuoteKind, SyntaxKind, Node } from 'ts-morph';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const DEMOS_GLOB = 'src/textbook/demos/*.tsx';
const WRITE_MODE = process.argv.includes('--write');
const VERBOSE = process.argv.includes('--verbose');

const project = new Project({
  tsConfigFilePath: resolve(ROOT, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
  manipulationSettings: { quoteKind: QuoteKind.Single },
});

project.addSourceFilesAtPaths(resolve(ROOT, DEMOS_GLOB));

let totalFiles = 0;
let totalMigrations = 0;
let totalFunctionsRemoved = 0;
const skipped = [];

for (const sourceFile of project.getSourceFiles()) {
  const filename = sourceFile.getBaseName();

  // ── 1. Find local drawCurrentDotsPath declarations ───────────────────────
  const localFns = sourceFile
    .getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
    .filter((fn) => fn.getName() === 'drawCurrentDotsPath');

  if (localFns.length === 0) continue;

  const migrations = []; // call-site replacements
  let functionsRemovedHere = 0;

  for (const fn of localFns) {
    const bodyText = fn.getBody()?.getText() ?? '';

    // Extract spacing literal.
    const spacingMatch = bodyText.match(/const\s+spacing\s*=\s*(\d+);?/);
    const spacing = spacingMatch ? parseInt(spacingMatch[1], 10) : 26;

    // Extract speed literal.
    const speedMatch = bodyText.match(/const\s+speed\s*=\s*(\d+);?/);
    const speed = speedMatch ? parseInt(speedMatch[1], 10) : 60;

    // Extract minIntensity from Math.max(<N>, Math.min(1, Iscale)).
    const minIntMatch = bodyText.match(/Math\.max\(\s*([0-9.]+)\s*,\s*Math\.min\s*\(\s*1\s*,\s*Iscale\s*\)\s*\)/);
    const minIntensity = minIntMatch ? parseFloat(minIntMatch[1]) : 0.15;

    // Check colour is blue-ish.
    const fillStyleMatch = bodyText.match(/ctx\.fillStyle\s*=\s*([^;]+);/);
    if (!fillStyleMatch) {
      skipped.push(`${filename}:${fn.getStartLineNumber()} (no ctx.fillStyle)`);
      continue;
    }
    const fillStyleExpr = fillStyleMatch[1].trim();
    const isBlue =
      /\bblue\b/.test(fillStyleExpr) ||
      /rgba\(\s*91\s*,\s*174\s*,\s*248/.test(fillStyleExpr) ||
      /'#5baef8'/.test(fillStyleExpr);
    if (!isBlue) {
      skipped.push(`${filename}:${fn.getStartLineNumber()} (fillStyle not blue: ${fillStyleExpr})`);
      continue;
    }

    // Check offset formula to know whether callers multiply t by 60.
    const dividesBy60 = /\/\s*60/.test(bodyText);

    // Mark function for removal.
    migrations.push({
      kind: 'remove-function',
      fn,
    });
    functionsRemovedHere++;

    // ── 2. Rewrite call sites ─────────────────────────────────────────────
    for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      const callee = call.getExpression();
      if (!Node.isIdentifier(callee)) continue;
      if (callee.getText() !== 'drawCurrentDotsPath') continue;

      const args = call.getArguments();
      if (args.length !== 4) {
        skipped.push(`${filename}:${call.getStartLineNumber()} (arity != 4)`);
        continue;
      }

      const ctxArg = args[0].getText();
      const tArgRaw = args[1].getText();
      const ptsArg = args[2].getText();
      const iArg = args[3].getText();

      // Normalise t when the body divides by 60 and the caller multiplies by 60.
      let tArg = tArgRaw;
      if (dividesBy60) {
        tArg = tArgRaw.replace(/\*\s*60\b/, '').trim();
        // If stripping *60 leaves a trailing operator (e.g. "simT * "), keep original.
        if (tArg.endsWith('*') || tArg.endsWith('/')) tArg = tArgRaw;
      }

      const optsFields = [`t: ${tArg}`, `Iscale: ${iArg}`];
      if (spacing !== 26) optsFields.push(`spacing: ${spacing}`);
      if (speed !== 60) optsFields.push(`speed: ${speed}`);
      if (minIntensity !== 0.15) optsFields.push(`minIntensity: ${minIntensity}`);

      const indent = getIndent(call.getParent());
      const innerIndent = indent + '  ';
      let replacement;
      if (optsFields.length === 2) {
        // Compact single-line when only t + Iscale.
        replacement = `drawCurrentDots(${ctxArg}, ${ptsArg}, { ${optsFields.join(', ')} })`;
      } else {
        replacement =
          `drawCurrentDots(${ctxArg}, ${ptsArg}, {\n` +
          optsFields.map((f) => innerIndent + f + ',').join('\n') +
          '\n' +
          indent +
          '})';
      }

      migrations.push({
        kind: 'replace-call',
        call,
        replacement,
      });
    }
  }

  if (functionsRemovedHere === 0) continue;

  totalFiles++;
  totalFunctionsRemoved += functionsRemovedHere;

  const textMigrations = migrations.filter((m) => m.kind === 'replace-call');
  totalMigrations += textMigrations.length;
  console.log(`  ${filename}  +${textMigrations.length} call sites, -${functionsRemovedHere} fn`);

  if (!WRITE_MODE) continue;

  // Apply call-site replacements using AST-level replaceWithText so
  // ts-morph keeps sibling positions valid. Process bottom-to-top.
  const callMigrations = migrations.filter((m) => m.kind === 'replace-call');
  callMigrations.sort((a, b) => b.call.getStart() - a.call.getStart());
  for (const m of callMigrations) {
    m.call.replaceWithText(m.replacement);
  }

  // Remove functions after call sites are stable.
  const fnMigrations = migrations.filter((m) => m.kind === 'remove-function');
  for (const m of fnMigrations) {
    m.fn.replaceWithText('');
  }

  ensureDrawCurrentDotsImport(sourceFile);
  sourceFile.saveSync();
}

console.log('');
console.log(`Files touched: ${totalFiles}`);
console.log(`Functions removed: ${totalFunctionsRemoved}`);
console.log(`Call sites migrated: ${totalMigrations}`);
console.log(`Skipped sites: ${skipped.length}`);
if (VERBOSE && skipped.length) {
  console.log('');
  console.log('Skipped sites:');
  skipped.forEach((s) => console.log('  ' + s));
}
if (!WRITE_MODE) console.log('(dry run — no files written)');

// ─── Helpers ────────────────────────────────────────────────────────────────

function getIndent(node) {
  const fullText = node.getFullText();
  const leading = fullText.slice(0, fullText.length - fullText.trimStart().length);
  const lastNewline = leading.lastIndexOf('\n');
  return lastNewline >= 0 ? leading.slice(lastNewline + 1) : leading;
}

function ensureDrawCurrentDotsImport(sourceFile) {
  const existing = sourceFile.getImportDeclaration((d) => {
    return d.getModuleSpecifierValue() === '@/lib/canvasPrimitives';
  });

  if (existing) {
    const named = existing.getNamedImports();
    if (!named.some((n) => n.getName() === 'drawCurrentDots')) {
      existing.addNamedImport('drawCurrentDots');
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
    if (spec.startsWith('@/lib/') && spec < '@/lib/canvasPrimitives') {
      insertIdx = i + 1;
    } else if (spec.startsWith('@/lib/') && spec > '@/lib/canvasPrimitives') {
      insertIdx = i;
      break;
    } else if (insertIdx === 0 && !spec.startsWith('@/lib/')) {
      insertIdx = i + 1;
    }
  }

  sourceFile.insertImportDeclaration(insertIdx, {
    moduleSpecifier: '@/lib/canvasPrimitives',
    namedImports: ['drawCurrentDots'],
  });
}
