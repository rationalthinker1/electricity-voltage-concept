/* eslint-disable */
/**
 * Companion codemod to codemod-drawLabel.mjs.
 *
 * The original codemod only migrates fillText calls whose `fillStyle` and
 * `font` assignments appear *immediately* before them in the same block.
 * It skips two common patterns:
 *
 *   A. "Follow-up text op" — a shared preamble feeds multiple fillTexts.
 *   B. "Missing font/fillStyle" — the preamble was set earlier and reused.
 *
 * This script handles both by walking each block top-to-bottom, tracking the
 * most recent canvas text-state assignments, and converting every fillText
 * that can be resolved to a `drawLabel` call.
 *
 * Safety rules
 * ────────────
 *  1. We NEVER remove the original preamble assignments — other drawing
 *     primitives (fillRect, arc, etc.) may depend on fillStyle. We only
 *     *add* drawLabel calls, which are self-contained thanks to save/restore.
 *  2. If a fillText already has a contiguous preamble (the original codemod's
 *     territory) we skip it to avoid duplicating work.
 *  3. font must match `^(bold )?<N>px "JetBrains Mono", monospace$`.
 *  4. We skip fillText calls inside helper functions that are called from draw
 *     loops when the preamble lives in the draw loop — cross-scope tracking
 *     is out of scope.
 *
 * Run with:  node scripts/codemod-drawLabel-shared.mjs
 * Optional:  node scripts/codemod-drawLabel-shared.mjs --dry --verbose
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

const FONT_RE = /^(bold\s+)?(\d+)px\s+"JetBrains Mono",\s*monospace$/;

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

  sourceFile.forEachDescendant((node) => {
    if (!Node.isBlock(node) && !Node.isSourceFile(node)) return;
    const statements = node.getStatements();

    // Running map of the most recent text-state assignments in this block.
    const state = {
      fillStyle: null, // { stmt, valueText }
      font: null,
      textAlign: null,
      textBaseline: null,
    };

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      // Update running state for canvas property assignments.
      const assign = matchCtxAssignment(stmt);
      if (assign) {
        if (assign.prop === 'fillStyle') state.fillStyle = assign;
        if (assign.prop === 'font') state.font = assign;
        if (assign.prop === 'textAlign') state.textAlign = assign;
        if (assign.prop === 'textBaseline') state.textBaseline = assign;
        continue;
      }

      const ft = matchFillText(stmt);
      if (!ft) continue;

      // Rule 2: skip if this fillText has its own contiguous preamble.
      if (hasContiguousPreamble(statements, i)) {
        // Reset state after a fully-preambled fillText so we don't leak
        // its assignments forward to unrelated fillTexts.
        state.fillStyle = null;
        state.font = null;
        state.textAlign = null;
        state.textBaseline = null;
        continue;
      }

      // Rule 3b: need at least fillStyle + font from earlier in the block.
      if (!state.fillStyle || !state.font) {
        skipped.push(`${filename}:${stmt.getStartLineNumber()} (no upstream fillStyle+font)`);
        continue;
      }

      // Rule 3a: font must be plain JetBrains Mono.
      const fontStr = stripQuotes(state.font.valueText);
      if (!fontStr) {
        skipped.push(`${filename}:${stmt.getStartLineNumber()} (font is not a string literal)`);
        continue;
      }
      const fm = fontStr.match(FONT_RE);
      if (!fm) {
        skipped.push(`${filename}:${stmt.getStartLineNumber()} (font "${fontStr}")`);
        continue;
      }
      const isBold = !!fm[1];
      const size = parseInt(fm[2], 10);

      // Build drawLabel options.
      const fields = [];
      fields.push(`x: ${ft.x}`);
      fields.push(`y: ${ft.y}`);
      fields.push(`text: ${ft.text}`);
      fields.push(`color: ${state.fillStyle.valueText}`);
      if (size !== 10) fields.push(`size: ${size}`);

      if (state.textAlign) {
        const lit = stripQuotes(state.textAlign.valueText);
        if (lit === null) fields.push(`align: ${state.textAlign.valueText}`);
        else if (lit !== 'left') fields.push(`align: '${lit}'`);
      }
      if (state.textBaseline) {
        const lit = stripQuotes(state.textBaseline.valueText);
        if (lit === null) fields.push(`baseline: ${state.textBaseline.valueText}`);
        else if (lit !== 'alphabetic') fields.push(`baseline: '${lit}'`);
      }
      if (isBold) fields.push(`weight: 'bold'`);

      const indent = getIndent(stmt);
      const innerIndent = indent + '  ';
      const replacement =
        'drawLabel(ctx, {\n' +
        fields.map((f) => innerIndent + f + ',').join('\n') +
        '\n' +
        indent +
        '})';

      migrations.push({
        start: stmt.getStart(),
        end: stmt.getEnd() - 1,
        replacement,
      });

      // After converting a shared-preamble fillText, we do NOT clear the
      // running state — subsequent fillTexts may share the same preamble.
    }
  });

  if (migrations.length === 0) continue;

  migrations.sort((a, b) => b.start - a.start);
  for (const m of migrations) {
    sourceFile.replaceText([m.start, m.end], m.replacement);
  }

  ensureDrawLabelImport(sourceFile);

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

function matchFillText(stmt) {
  if (!Node.isExpressionStatement(stmt)) return null;
  const expr = stmt.getExpression();
  if (!Node.isCallExpression(expr)) return null;
  const callee = expr.getExpression();
  if (!Node.isPropertyAccessExpression(callee)) return null;
  if (callee.getName() !== 'fillText') return null;
  if (callee.getExpression().getText() !== 'ctx') return null;
  const args = expr.getArguments();
  if (args.length !== 3) return null;
  return { text: args[0].getText(), x: args[1].getText(), y: args[2].getText() };
}

function matchCtxAssignment(stmt) {
  if (!Node.isExpressionStatement(stmt)) return null;
  const expr = stmt.getExpression();
  if (!Node.isBinaryExpression(expr)) return null;
  if (expr.getOperatorToken().getKind() !== SyntaxKind.EqualsToken) return null;
  const lhs = expr.getLeft();
  if (!Node.isPropertyAccessExpression(lhs)) return null;
  if (lhs.getExpression().getText() !== 'ctx') return null;
  const prop = lhs.getName();
  if (!['fillStyle', 'font', 'textAlign', 'textBaseline'].includes(prop)) return null;
  return { prop, valueText: expr.getRight().getText() };
}

/**
 * Does the fillText at statements[i] have a contiguous preamble of
 * fillStyle + font immediately before it (possibly with textAlign/
 * textBaseline in between)? If so, the original codemod already owns
 * this site.
 */
function hasContiguousPreamble(statements, i) {
  const preamble = {};
  for (let j = i - 1; j >= 0; j--) {
    const a = matchCtxAssignment(statements[j]);
    if (!a) break;
    if (preamble[a.prop]) break; // duplicate — end of preamble
    preamble[a.prop] = a;
  }
  return !!(preamble.fillStyle && preamble.font);
}

function stripQuotes(text) {
  if (!text) return null;
  if (
    (text.startsWith("'") && text.endsWith("'")) ||
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith('`') && text.endsWith('`'))
  ) {
    return text.slice(1, -1);
  }
  return null;
}

function getIndent(stmt) {
  const fullText = stmt.getFullText();
  const leading = fullText.slice(0, fullText.length - fullText.trimStart().length);
  const lastNewline = leading.lastIndexOf('\n');
  return lastNewline >= 0 ? leading.slice(lastNewline + 1) : leading;
}

function ensureDrawLabelImport(sourceFile) {
  const existing = sourceFile.getImportDeclaration((d) => {
    return d.getModuleSpecifierValue() === '@/lib/canvasLayout';
  });

  if (existing) {
    const named = existing.getNamedImports();
    if (!named.some((n) => n.getName() === 'drawLabel')) {
      existing.addNamedImport('drawLabel');
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
    namedImports: ['drawLabel'],
  });
}
