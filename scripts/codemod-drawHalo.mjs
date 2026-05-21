/* eslint-disable */
/**
 * One-shot codemod: migrate inline radial-gradient halos to drawHalo().
 *
 * Run with:  node scripts/codemod-drawHalo.mjs
 * Optional:  node scripts/codemod-drawHalo.mjs --dry   (report only, no writes)
 *
 * What it migrates
 * ────────────────
 * A 7-line halo block, with no other intervening statements:
 *
 *   const NAME = ctx.createRadialGradient(X, Y, 0, X, Y, R);
 *   NAME.addColorStop(0, <inner-color>);
 *   NAME.addColorStop(1, <outer-color>);   // must resolve to transparent
 *   ctx.fillStyle = NAME;
 *   ctx.beginPath();
 *   ctx.arc(X, Y, R, 0, Math.PI * 2);
 *   ctx.fill();
 *
 * into:
 *
 *   drawHalo(ctx, { x: X, y: Y, radius: R, color: <inner>, alpha?, extent? });
 *
 * Acceptance constraints (strict)
 * ────────────────────────────────
 *  1. The 7 statements appear contiguously in the same Block, in this order.
 *  2. The local gradient variable is *only* referenced by:
 *       - its own declaration
 *       - the fillStyle assignment
 *     anywhere within the source file. Any other reference → skip.
 *  3. Gradient inner radius (param 3) must be the literal `0`.
 *  4. Gradient center (params 1,2) and outer-circle center (4,5) must be the
 *     same expressions textually (so the gradient really is centred on the
 *     halo).
 *  5. arc(X, Y, ...) center must match the gradient center.
 *  6. arc start angle = 0, end angle = Math.PI * 2 (full circle).
 *  7. Outer color stop must be transparent. Accept either:
 *       - the literal string `'rgba(0,0,0,0)'`
 *       - `withAlpha(<color>, 0)`
 *       - `'rgba(R,G,B,0)'` (any RGB, alpha = 0)
 *
 * Color extraction from the inner stop
 * ────────────────────────────────────
 *  - Plain expression (e.g. `colors.blue`, `colors.accent`):
 *      color = expr,  alpha = 1
 *  - `withAlpha(<expr>, <A>)`:
 *      color = <expr>,  alpha = <A>
 *  - Hardcoded `'rgba(R,G,B,A)'` literal:  SKIP — leave for Phase 4.
 *
 * Extent extraction
 * ─────────────────
 *  - If arc radius == gradient outer radius → extent = 1
 *  - Otherwise extent = (arcRadius / gradientOuterRadius) — but only if both
 *    are number-literal expressions we can divide statically. If either is
 *    a non-literal expression, require textual equality; if textually equal,
 *    extent = 1; otherwise SKIP.
 *
 * Output omits fields at their helper defaults (alpha: 0.2, extent: 2.2).
 * All migrations here are alpha = 1 or some captured value; extent = 1 or
 * captured. Always emit alpha + extent so the call is unambiguous and the
 * visual stays identical.
 */

import { Project, QuoteKind, SyntaxKind, Node } from 'ts-morph';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const DEMOS_GLOB = 'src/textbook/demos/*.tsx';
const DRY = process.argv.includes('--dry');

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

    for (let i = 0; i <= statements.length - 7; i++) {
      const match = matchHalo(statements, i, sourceFile, filename);
      if (!match) continue;

      // Build the drawHalo options object.
      const fields = [
        `x: ${match.x}`,
        `y: ${match.y}`,
        `radius: ${match.radius}`,
        `color: ${match.color}`,
      ];
      // Always emit alpha + extent here. The drawHalo defaults (0.2, 2.2) are
      // tuned for the `drawCharge`-style ring, not the alpha=1, extent=1 case
      // that's dominant in these inline blocks.
      fields.push(`alpha: ${match.alpha}`);
      fields.push(`extent: ${match.extent}`);

      const indent = match.indent;
      const innerIndent = indent + '  ';
      const replacement =
        'drawHalo(ctx, {\n' +
        fields.map((f) => innerIndent + f + ',').join('\n') +
        '\n' +
        indent +
        '})';

      migrations.push({
        start: statements[i].getStart(),
        end: statements[i + 6].getEnd() - 1, // keep trailing semicolon
        replacement,
      });

      // Skip ahead past this block.
      i += 6;
    }
  });

  if (migrations.length === 0) continue;

  migrations.sort((a, b) => b.start - a.start);
  for (const m of migrations) {
    sourceFile.replaceText([m.start, m.end], m.replacement);
  }

  ensureDrawHaloImport(sourceFile);

  filesTouched++;
  totalMigrations += migrations.length;
  console.log(`  ${filename}  ${migrations.length} migrations`);

  if (!DRY) sourceFile.saveSync();
}

console.log('');
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

function matchHalo(statements, i, sourceFile, filename) {
  // 0. const NAME = ctx.createRadialGradient(X, Y, 0, X, Y, R);
  const s0 = statements[i];
  if (!Node.isVariableStatement(s0)) return null;
  const declList = s0.getDeclarationList();
  if (declList.getDeclarations().length !== 1) return null;
  const decl = declList.getDeclarations()[0];
  const varName = decl.getName();
  const init = decl.getInitializer();
  if (!init || !Node.isCallExpression(init)) return null;
  const initCallee = init.getExpression();
  if (!Node.isPropertyAccessExpression(initCallee)) return null;
  if (initCallee.getName() !== 'createRadialGradient') return null;
  if (initCallee.getExpression().getText() !== 'ctx') return null;
  const initArgs = init.getArguments();
  if (initArgs.length !== 6) return null;
  const [x0, y0, r0, x1, y1, r1] = initArgs.map((a) => a.getText());
  // Inner radius must be literal 0.
  if (r0.trim() !== '0') return null;
  // Center coords must match between inner and outer.
  if (x0 !== x1 || y0 !== y1) return null;
  const gradX = x0;
  const gradY = y0;
  const gradR = r1;

  // 1. NAME.addColorStop(0, <inner>);
  const stopInner = matchAddColorStop(statements[i + 1], varName);
  if (!stopInner || stopInner.offset !== '0') return null;

  // 2. NAME.addColorStop(1, <outer>);
  const stopOuter = matchAddColorStop(statements[i + 2], varName);
  if (!stopOuter || stopOuter.offset !== '1') return null;

  // Outer must resolve to transparent.
  if (!isTransparentExpr(stopOuter.colorText)) {
    skipped.push(`${filename}:${statements[i].getStartLineNumber()} (outer stop not transparent: ${stopOuter.colorText})`);
    return null;
  }

  // 3. ctx.fillStyle = NAME;
  const fs = matchFillStyleAssign(statements[i + 3]);
  if (!fs || fs !== varName) return null;

  // 4. ctx.beginPath();
  if (!matchSimpleCtxCall(statements[i + 4], 'beginPath', 0)) return null;

  // 5. ctx.arc(X, Y, ARC_R, 0, Math.PI * 2);
  const arc = matchArc(statements[i + 5]);
  if (!arc) return null;
  if (arc.x !== gradX || arc.y !== gradY) return null;
  if (arc.start.trim() !== '0') return null;
  if (arc.end.replace(/\s+/g, '') !== 'Math.PI*2') return null;
  const arcR = arc.r;

  // 6. ctx.fill();
  if (!matchSimpleCtxCall(statements[i + 6], 'fill', 0)) return null;

  // Reference check: the gradient var should be used by exactly 3 expressions —
  // the two `addColorStop` calls and the one `ctx.fillStyle = NAME` assignment.
  // `findReferencesAsNodes` returns usages only (not the declaration site).
  const refCount = countReferences(decl);
  if (refCount > 3) {
    skipped.push(`${filename}:${statements[i].getStartLineNumber()} (gradient var "${varName}" referenced ${refCount}x)`);
    return null;
  }

  // Extract color + alpha from the inner stop.
  const innerInfo = parseInnerColor(stopInner.colorText);
  if (!innerInfo) {
    skipped.push(`${filename}:${statements[i].getStartLineNumber()} (inner stop unparseable: ${stopInner.colorText})`);
    return null;
  }

  // Extract extent from arc radius vs gradient outer radius.
  let extent;
  if (arcR.trim() === gradR.trim()) {
    extent = 1;
  } else {
    const arcNum = parseFloat(arcR);
    const gradNum = parseFloat(gradR);
    if (!isNaN(arcNum) && !isNaN(gradNum) && gradNum !== 0) {
      const ratio = arcNum / gradNum;
      // Snap to 1 d.p. for readability if close.
      extent = Math.round(ratio * 10) / 10;
    } else {
      skipped.push(`${filename}:${statements[i].getStartLineNumber()} (arc radius ≠ gradient radius and not numerical)`);
      return null;
    }
  }

  return {
    x: gradX,
    y: gradY,
    radius: gradR,
    color: innerInfo.color,
    alpha: innerInfo.alpha,
    extent,
    indent: getIndent(statements[i]),
  };
}

function matchAddColorStop(stmt, expectedVar) {
  if (!Node.isExpressionStatement(stmt)) return null;
  const expr = stmt.getExpression();
  if (!Node.isCallExpression(expr)) return null;
  const callee = expr.getExpression();
  if (!Node.isPropertyAccessExpression(callee)) return null;
  if (callee.getName() !== 'addColorStop') return null;
  if (callee.getExpression().getText() !== expectedVar) return null;
  const args = expr.getArguments();
  if (args.length !== 2) return null;
  return { offset: args[0].getText().trim(), colorText: args[1].getText() };
}

function matchFillStyleAssign(stmt) {
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

function matchArc(stmt) {
  if (!Node.isExpressionStatement(stmt)) return null;
  const expr = stmt.getExpression();
  if (!Node.isCallExpression(expr)) return null;
  const callee = expr.getExpression();
  if (!Node.isPropertyAccessExpression(callee)) return null;
  if (callee.getName() !== 'arc') return null;
  if (callee.getExpression().getText() !== 'ctx') return null;
  const args = expr.getArguments();
  if (args.length !== 5) return null;
  return {
    x: args[0].getText(),
    y: args[1].getText(),
    r: args[2].getText(),
    start: args[3].getText(),
    end: args[4].getText(),
  };
}

function isTransparentExpr(text) {
  const t = text.replace(/\s+/g, '');
  // 'rgba(0,0,0,0)' or 'rgba(N,N,N,0)' — any colour with alpha 0.
  if (/^['"]rgba\(\d+,\d+,\d+,0(?:\.0+)?\)['"]$/.test(t)) return true;
  // withAlpha(<expr>, 0) — second arg literal 0.
  if (/^withAlpha\(.+,0(?:\.0+)?\)$/.test(t)) return true;
  // <hex-or-token> + '00' — appending hex alpha 00 makes it transparent.
  if (/\+['"]00['"]$/.test(t)) return true;
  // Template literal `rgba(${anything},0)` — alpha 0 at the end.
  if (/^`rgba\(.+,0(?:\.0+)?\)`$/.test(t)) return true;
  // Ternary where both branches are transparent rgba/hex+00 forms.
  // Crude but safe: split on '?' and ':' and recurse if structure is simple.
  const ternaryMatch = text.match(/^[^?]+\?\s*(.+?)\s*:\s*(.+)$/s);
  if (ternaryMatch && isTransparentExpr(ternaryMatch[1]) && isTransparentExpr(ternaryMatch[2])) {
    return true;
  }
  return false;
}

function parseInnerColor(text) {
  const t = text.trim();
  // withAlpha(<expr>, <A>)
  const waMatch = t.match(/^withAlpha\(\s*(.+?)\s*,\s*([0-9.]+)\s*\)$/);
  if (waMatch) {
    const inner = waMatch[1];
    // The captured `inner` may itself contain commas if nested — but withAlpha
    // is a 2-arg function and we matched non-greedily on the comma, so this is
    // only safe if `inner` has no top-level comma. ts-morph would be better;
    // for robustness, fall through to verbatim if anything looks off.
    if (!inner.includes(',') || balancedParens(inner)) {
      const alpha = parseFloat(waMatch[2]);
      return { color: inner, alpha };
    }
  }
  // Hardcoded rgba literals → skip (Phase 4 territory).
  if (/^['"]rgba?\(/.test(t)) return null;
  // Anything else: a plain color expression. Treat as opaque (alpha = 1).
  return { color: t, alpha: 1 };
}

function balancedParens(s) {
  let depth = 0;
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function countReferences(decl) {
  // Use ts-morph's symbol-based reference finder so we count references to
  // THIS declaration's binding only — not other identifiers that happen to
  // share the same name (e.g. several independent `const halo = ...` in
  // sibling blocks).
  const nameNode = decl.getNameNode();
  if (!nameNode || typeof nameNode.findReferencesAsNodes !== 'function') {
    return Infinity; // conservative — never migrate if we can't check.
  }
  return nameNode.findReferencesAsNodes().length;
}

function getIndent(stmt) {
  const fullText = stmt.getFullText();
  const leading = fullText.slice(0, fullText.length - fullText.trimStart().length);
  const lastNewline = leading.lastIndexOf('\n');
  return lastNewline >= 0 ? leading.slice(lastNewline + 1) : leading;
}

function ensureDrawHaloImport(sourceFile) {
  const existing = sourceFile.getImportDeclaration(
    (d) => d.getModuleSpecifierValue() === '@/lib/canvasPrimitives',
  );

  if (existing) {
    const named = existing.getNamedImports().map((n) => n.getName());
    if (!named.includes('drawHalo')) {
      existing.addNamedImport('drawHalo');
      const sorted = existing
        .getNamedImports()
        .map((n) => n.getName())
        .sort();
      existing.removeNamedImports();
      sorted.forEach((n) => existing.addNamedImport(n));
    }
    return;
  }

  // Insert a fresh import in the @/lib/ block.
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
    namedImports: ['drawHalo'],
  });
}
