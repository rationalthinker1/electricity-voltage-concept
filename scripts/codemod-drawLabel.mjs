/* eslint-disable */
/**
 * One-shot codemod: migrate isolated canvas-label preambles to drawLabel().
 *
 * Run with:  node scripts/codemod-drawLabel.mjs
 * Optional:  node scripts/codemod-drawLabel.mjs --dry   (report only, no writes)
 *
 * What it migrates
 * ────────────────
 * The pattern:
 *
 *   ctx.fillStyle  = <expr>;
 *   ctx.font       = '<N>px "JetBrains Mono", monospace';
 *   ctx.textAlign  = '<align>';      // optional
 *   ctx.textBaseline = '<baseline>'; // optional
 *   ctx.fillText(<text>, <x>, <y>);
 *
 * into:
 *
 *   drawLabel(ctx, { x: <x>, y: <y>, text: <text>, color: <expr>,
 *                    size: <N>, align: '...', baseline: '...', weight: 'bold' });
 *
 * Safety rules (conservative — skip anything ambiguous)
 * ─────────────────────────────────────────────────────
 *  1. The 5 statements must appear contiguously in the same block, in any order
 *     of the canvas-state assignments but with the fillText last.
 *  2. font value must match `^(bold )?<N>px "JetBrains Mono", monospace$`.
 *     Any other font (STIX, DM Sans, italic, computed string) → skip.
 *  3. Both `ctx.fillStyle` and `ctx.font` must be present in the preamble.
 *  4. NO ctx.fillText / ctx.strokeText / ctx.measureText appears in the same
 *     block *after* this fillText. (Subsequent labels would rely on the state
 *     we're about to wipe with drawLabel's save/restore.)
 *  5. The block walk only looks at top-level statements of the enclosing
 *     block. Nested blocks aren't crossed.
 *
 * Output options-object compaction
 * ────────────────────────────────
 *  - omit `size` when it's 10 (drawLabel's default)
 *  - omit `align` when it's 'left'
 *  - omit `baseline` when it's 'alphabetic'
 *  - omit `weight` when font wasn't bold
 *
 * Also inserts `import { drawLabel } from '@/lib/canvasLayout';` if absent
 * (placed lexicographically with the other `@/lib/...` imports).
 */

import { Project, QuoteKind, SyntaxKind, Node } from 'ts-morph';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const DEMOS_GLOB = 'src/textbook/demos/*.tsx';
const DRY = process.argv.includes('--dry');

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
  const migrations = []; // { start, end, replacement }

  // Walk every Block / SourceFile and collect ranges to replace. We resolve
  // start/end into character offsets up front so later replaceText() calls
  // can't invalidate the node references we'd otherwise hold onto.
  sourceFile.forEachDescendant((node) => {
    if (!Node.isBlock(node) && !Node.isSourceFile(node)) return;
    const statements = node.getStatements();

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const fillText = matchFillText(stmt);
      if (!fillText) continue;

      // Rule 4: no fillText/strokeText/measureText after this one in the same block.
      let conflict = false;
      for (let j = i + 1; j < statements.length; j++) {
        if (isTextOp(statements[j])) {
          conflict = true;
          break;
        }
      }
      if (conflict) {
        skipped.push(`${filename}:${stmt.getStartLineNumber()} (follow-up text op)`);
        continue;
      }

      // Collect contiguous preamble of ctx.X = ... assignments immediately before.
      const preamble = {};
      let preambleStartStmt = stmt;
      for (let j = i - 1; j >= 0; j--) {
        const a = matchCtxAssignment(statements[j]);
        if (!a) break;
        if (preamble[a.prop]) break; // duplicate property — bail (likely a 2nd label's setup)
        preamble[a.prop] = a;
        preambleStartStmt = statements[j];
      }

      // Rule 3: need font + fillStyle.
      if (!preamble.font || !preamble.fillStyle) {
        skipped.push(`${filename}:${stmt.getStartLineNumber()} (missing font or fillStyle)`);
        continue;
      }

      // Rule 2: font must be plain JetBrains Mono.
      const fontStr = stripQuotes(preamble.font.valueText);
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

      // Build the drawLabel options object.
      const fields = [];
      fields.push(`x: ${fillText.x}`);
      fields.push(`y: ${fillText.y}`);
      fields.push(`text: ${fillText.text}`);
      fields.push(`color: ${preamble.fillStyle.valueText}`);
      if (size !== 10) fields.push(`size: ${size}`);
      // For align/baseline: if the assignment is a plain string literal we can
      // omit the field when it matches the helper's default. Otherwise the
      // value is a non-literal expression (e.g. ternary) and we must pass it
      // through verbatim — dropping it would silently change semantics.
      if (preamble.textAlign) {
        const lit = stripQuotes(preamble.textAlign.valueText);
        if (lit === null) fields.push(`align: ${preamble.textAlign.valueText}`);
        else if (lit !== 'left') fields.push(`align: '${lit}'`);
      }
      if (preamble.textBaseline) {
        const lit = stripQuotes(preamble.textBaseline.valueText);
        if (lit === null) fields.push(`baseline: ${preamble.textBaseline.valueText}`);
        else if (lit !== 'alphabetic') fields.push(`baseline: '${lit}'`);
      }
      if (isBold) fields.push(`weight: 'bold'`);

      // Preserve the original leading indent of the fillText line.
      const indent = getIndent(stmt);
      const innerIndent = indent + '  ';
      const replacement =
        'drawLabel(ctx, {\n' +
        fields.map((f) => innerIndent + f + ',').join('\n') +
        '\n' +
        indent +
        '})';

      // Resolve offsets now while nodes are still live.
      migrations.push({
        start: preambleStartStmt.getStart(),
        end: stmt.getEnd() - 1, // keep the trailing semicolon outside the range
        replacement,
      });
    }
  });

  if (migrations.length === 0) continue;

  // Apply in reverse-start order so earlier ranges stay valid as we mutate.
  migrations.sort((a, b) => b.start - a.start);
  for (const m of migrations) {
    sourceFile.replaceText([m.start, m.end], m.replacement);
  }

  // Insert the import if needed.
  ensureDrawLabelImport(sourceFile);

  filesTouched++;
  totalMigrations += migrations.length;
  console.log(`  ${filename}  ${migrations.length} migrations`);

  if (!DRY) sourceFile.saveSync();
}

console.log(``);
console.log(`Files touched: ${filesTouched}`);
console.log(`Total migrations: ${totalMigrations}`);
console.log(`Skipped sites: ${skipped.length}`);
if (process.argv.includes('--verbose')) {
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
  const rhs = expr.getRight();
  return { prop, valueText: rhs.getText() };
}

function isTextOp(stmt) {
  if (!Node.isExpressionStatement(stmt)) return false;
  const expr = stmt.getExpression();
  if (!Node.isCallExpression(expr)) return false;
  const callee = expr.getExpression();
  if (!Node.isPropertyAccessExpression(callee)) return false;
  if (callee.getExpression().getText() !== 'ctx') return false;
  return ['fillText', 'strokeText', 'measureText'].includes(callee.getName());
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
    const spec = d.getModuleSpecifierValue();
    return spec === '@/lib/canvasLayout';
  });

  if (existing) {
    const namedImports = existing.getNamedImports();
    if (!namedImports.some((n) => n.getName() === 'drawLabel')) {
      existing.addNamedImport('drawLabel');
      // Re-sort the named imports alphabetically to match the file's style.
      const sorted = existing
        .getNamedImports()
        .map((n) => n.getName())
        .sort();
      existing.removeNamedImports();
      sorted.forEach((n) => existing.addNamedImport(n));
    }
    return;
  }

  // Insert a fresh import. Place it after the last existing `@/lib/...` import,
  // or before any `@/...` import as a fallback.
  const allImports = sourceFile.getImportDeclarations();
  let insertIdx = 0;
  for (let i = 0; i < allImports.length; i++) {
    const spec = allImports[i].getModuleSpecifierValue();
    if (spec.startsWith('@/lib/') && spec < '@/lib/canvasLayout') {
      insertIdx = i + 1;
    } else if (spec === '@/lib/canvasLayout') {
      // Shouldn't happen (we'd have hit `existing` above) but defensive.
      return;
    } else if (spec.startsWith('@/lib/') && spec > '@/lib/canvasLayout') {
      insertIdx = i;
      break;
    } else if (insertIdx === 0 && !spec.startsWith('@/lib/')) {
      // Walk past non-lib imports until we find the @/lib block.
      insertIdx = i + 1;
    }
  }

  sourceFile.insertImportDeclaration(insertIdx, {
    moduleSpecifier: '@/lib/canvasLayout',
    namedImports: ['drawLabel'],
  });
}
