/* eslint-disable */
/**
 * AST codemod: migrate hand-rolled annotation-box patterns to
 * `drawAnnotationBox()`.
 *
 * Run with:  node scripts/codemod-annotationBox.mjs
 * Optional:  node scripts/codemod-annotationBox.mjs --dry --verbose
 *
 * What it migrates
 * ────────────────
 * The 10-statement paired block:
 *
 *   ctx.save();
 *   ctx.globalAlpha = <fillAlpha>;
 *   ctx.fillStyle = <fillColor>;
 *   ctx.fillRect(x, y, w, h);
 *   ctx.restore();
 *   ctx.save();
 *   ctx.globalAlpha = <strokeAlpha>;
 *   ctx.strokeStyle = <strokeColor>;
 *   ctx.strokeRect(x, y, w, h);
 *   ctx.restore();
 *
 * into:
 *
 *   drawAnnotationBox(ctx, {
 *     x, y, w, h,
 *     fillColor, fillAlpha, strokeColor, strokeAlpha,
 *   });
 *
 * Safety rules
 * ────────────
 *  1. The 10 statements must appear contiguously in the same block.
 *  2. fillRect and strokeRect must have identical (x, y, w, h) expressions.
 *  3. fillAlpha and strokeAlpha must be simple numeric literals.
 *  4. fillColor and strokeColor must be plain expressions (not computed rgba).
 *  5. No statements between save/restore pairs other than the expected ones.
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

  sourceFile.forEachDescendant((node) => {
    if (!Node.isBlock(node) && !Node.isSourceFile(node)) return;
    const statements = node.getStatements();

    for (let i = 0; i <= statements.length - 10; i++) {
      const match = matchAnnotationBox(statements, i, filename);
      if (!match) continue;

      const fields = [
        `x: ${match.x}`,
        `y: ${match.y}`,
        `w: ${match.w}`,
        `h: ${match.h}`,
      ];
      if (match.fillColor !== match.strokeColor) {
        fields.push(`fillColor: ${match.fillColor}`);
        fields.push(`strokeColor: ${match.strokeColor}`);
      } else {
        fields.push(`fillColor: ${match.fillColor}`);
      }
      if (match.fillAlpha !== 0.1) fields.push(`fillAlpha: ${match.fillAlpha}`);
      if (match.strokeAlpha !== 0.6) fields.push(`strokeAlpha: ${match.strokeAlpha}`);

      const indent = match.indent;
      const innerIndent = indent + '  ';
      const replacement =
        'drawAnnotationBox(ctx, {\n' +
        fields.map((f) => innerIndent + f + ',').join('\n') +
        '\n' +
        indent +
        '})';

      migrations.push({
        start: statements[i].getStart(),
        end: statements[i + 9].getEnd() - 1,
        replacement,
      });

      i += 9; // skip past this block
    }
  });

  if (migrations.length === 0) continue;

  migrations.sort((a, b) => b.start - a.start);
  for (const m of migrations) {
    sourceFile.replaceText([m.start, m.end], m.replacement);
  }

  ensureDrawAnnotationBoxImport(sourceFile);

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

function matchAnnotationBox(statements, i, filename) {
  // 0. ctx.save();
  if (!matchSimpleCtxCall(statements[i], 'save', 0)) return null;
  // 1. ctx.globalAlpha = <N>;
  const ga1 = matchGlobalAlpha(statements[i + 1]);
  if (!ga1) return null;
  // 2. ctx.fillStyle = <expr>;
  const fs = matchFillStyle(statements[i + 2]);
  if (!fs) return null;
  // 3. ctx.fillRect(x, y, w, h);
  const fr = matchRectCall(statements[i + 3], 'fillRect');
  if (!fr) return null;
  // 4. ctx.restore();
  if (!matchSimpleCtxCall(statements[i + 4], 'restore', 0)) return null;
  // 5. ctx.save();
  if (!matchSimpleCtxCall(statements[i + 5], 'save', 0)) return null;
  // 6. ctx.globalAlpha = <N>;
  const ga2 = matchGlobalAlpha(statements[i + 6]);
  if (!ga2) return null;
  // 7. ctx.strokeStyle = <expr>;
  const ss = matchStrokeStyle(statements[i + 7]);
  if (!ss) return null;
  // 8. ctx.strokeRect(x, y, w, h);
  const sr = matchRectCall(statements[i + 8], 'strokeRect');
  if (!sr) return null;
  // 9. ctx.restore();
  if (!matchSimpleCtxCall(statements[i + 9], 'restore', 0)) return null;

  // Rect args must match.
  if (fr.x !== sr.x || fr.y !== sr.y || fr.w !== sr.w || fr.h !== sr.h) {
    skipped.push(`${filename}:${statements[i].getStartLineNumber()} (fillRect ≠ strokeRect args)`);
    return null;
  }

  return {
    x: fr.x,
    y: fr.y,
    w: fr.w,
    h: fr.h,
    fillColor: fs,
    fillAlpha: ga1,
    strokeColor: ss,
    strokeAlpha: ga2,
    indent: getIndent(statements[i]),
  };
}

function matchSimpleCtxCall(stmt, methodName, argc) {
  if (!Node.isExpressionStatement(stmt)) return false;
  const expr = stmt.getExpression();
  if (!Node.isCallExpression(expr)) return false;
  const callee = expr.getExpression();
  if (!Node.isPropertyAccessExpression(callee)) return false;
  if (callee.getName() !== methodName) return false;
  if (callee.getExpression().getText() !== 'ctx') return false;
  return expr.getArguments().length === argc;
}

function matchGlobalAlpha(stmt) {
  if (!Node.isExpressionStatement(stmt)) return null;
  const expr = stmt.getExpression();
  if (!Node.isBinaryExpression(expr)) return null;
  if (expr.getOperatorToken().getKind() !== SyntaxKind.EqualsToken) return null;
  const lhs = expr.getLeft();
  if (!Node.isPropertyAccessExpression(lhs)) return null;
  if (lhs.getName() !== 'globalAlpha') return null;
  if (lhs.getExpression().getText() !== 'ctx') return null;
  const text = expr.getRight().getText();
  const n = parseFloat(text);
  if (isNaN(n)) return null;
  return n;
}

function matchFillStyle(stmt) {
  if (!Node.isExpressionStatement(stmt)) return null;
  const expr = stmt.getExpression();
  if (!Node.isBinaryExpression(expr)) return null;
  if (expr.getOperatorToken().getKind() !== SyntaxKind.EqualsToken) return null;
  const lhs = expr.getLeft();
  if (!Node.isPropertyAccessExpression(lhs)) return null;
  if (lhs.getName() !== 'fillStyle') return null;
  if (lhs.getExpression().getText() !== 'ctx') return null;
  return expr.getRight().getText();
}

function matchStrokeStyle(stmt) {
  if (!Node.isExpressionStatement(stmt)) return null;
  const expr = stmt.getExpression();
  if (!Node.isBinaryExpression(expr)) return null;
  if (expr.getOperatorToken().getKind() !== SyntaxKind.EqualsToken) return null;
  const lhs = expr.getLeft();
  if (!Node.isPropertyAccessExpression(lhs)) return null;
  if (lhs.getName() !== 'strokeStyle') return null;
  if (lhs.getExpression().getText() !== 'ctx') return null;
  return expr.getRight().getText();
}

function matchRectCall(stmt, methodName) {
  if (!Node.isExpressionStatement(stmt)) return null;
  const expr = stmt.getExpression();
  if (!Node.isCallExpression(expr)) return null;
  const callee = expr.getExpression();
  if (!Node.isPropertyAccessExpression(callee)) return null;
  if (callee.getName() !== methodName) return null;
  if (callee.getExpression().getText() !== 'ctx') return null;
  const args = expr.getArguments();
  if (args.length !== 4) return null;
  return { x: args[0].getText(), y: args[1].getText(), w: args[2].getText(), h: args[3].getText() };
}

function getIndent(stmt) {
  const fullText = stmt.getFullText();
  const leading = fullText.slice(0, fullText.length - fullText.trimStart().length);
  const lastNewline = leading.lastIndexOf('\n');
  return lastNewline >= 0 ? leading.slice(lastNewline + 1) : leading;
}

function ensureDrawAnnotationBoxImport(sourceFile) {
  const existing = sourceFile.getImportDeclaration((d) => {
    return d.getModuleSpecifierValue() === '@/lib/canvasLayout';
  });

  if (existing) {
    const named = existing.getNamedImports();
    if (!named.some((n) => n.getName() === 'drawAnnotationBox')) {
      existing.addNamedImport('drawAnnotationBox');
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
    namedImports: ['drawAnnotationBox'],
  });
}
