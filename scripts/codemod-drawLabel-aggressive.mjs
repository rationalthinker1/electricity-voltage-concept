/* eslint-disable */
/**
 * Aggressive companion to codemod-drawLabel.mjs + codemod-drawLabel-shared.mjs.
 *
 * The existing codemods skip fillText calls whose preamble (fillStyle + font)
 * is separated by drawing code, control-flow blocks, or lives in a parent block.
 * This script walks up the ancestor chain and skips over non-text statements
 * to find the preamble, then converts the fillText to drawLabel.
 *
 * Safety: drawLabel uses save/restore, so it never leaks state. We do NOT
 * remove the original preamble — other drawing code may depend on it.
 *
 * Run with:  node scripts/codemod-drawLabel-aggressive.mjs
 * Optional:  node scripts/codemod-drawLabel-aggressive.mjs --write
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
    if (!Node.isCallExpression(node)) return;
    const callee = node.getExpression();
    if (!Node.isPropertyAccessExpression(callee)) return;
    if (callee.getName() !== 'fillText') return;
    if (callee.getExpression().getText() !== 'ctx') return;
    const args = node.getArguments();
    if (args.length !== 3) return;

    const stmt = node.getParent();
    if (!Node.isExpressionStatement(stmt)) return;

    // Skip if already handled by earlier codemods (drawLabel call).
    const grandParent = stmt.getParent();
    if (grandParent && Node.isObjectLiteralExpression(grandParent)) return;

    // Skip if this fillText has its own contiguous preamble.
    if (hasContiguousPreamble(stmt)) return;

    // Skip if this is inside a drawLabel call (object literal argument).
    if (isInsideDrawLabel(node)) return;

    // Walk up ancestor blocks to find text state.
    const state = findTextState(stmt);
    if (!state.fillStyle || !state.font) {
      skipped.push(`${filename}:${stmt.getStartLineNumber()} (no upstream fillStyle+font)`);
      return;
    }

    // Validate font.
    const fontStr = stripQuotes(state.font);
    if (!fontStr) {
      skipped.push(`${filename}:${stmt.getStartLineNumber()} (font not literal)`);
      return;
    }
    const fm = fontStr.match(FONT_RE);
    if (!fm) {
      skipped.push(`${filename}:${stmt.getStartLineNumber()} (font "${fontStr}")`);
      return;
    }
    const isBold = !!fm[1];
    const size = parseInt(fm[2], 10);

    const text = args[0].getText();
    const x = args[1].getText();
    const y = args[2].getText();

    const fields = [`x: ${x}`, `y: ${y}`, `text: ${text}`, `color: ${state.fillStyle}`];
    if (size !== 10) fields.push(`size: ${size}`);
    if (state.textAlign) {
      const lit = stripQuotes(state.textAlign);
      if (lit === null) fields.push(`align: ${state.textAlign}`);
      else if (lit !== 'left') fields.push(`align: '${lit}'`);
    }
    if (state.textBaseline) {
      const lit = stripQuotes(state.textBaseline);
      if (lit === null) fields.push(`baseline: ${state.textBaseline}`);
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

    migrations.push({ stmt, replacement });
  });

  if (migrations.length === 0) continue;

  if (WRITE_MODE) {
    // Apply bottom-to-top so earlier replacements don't shift later nodes.
    migrations.sort((a, b) => b.stmt.getStart() - a.stmt.getStart());
    for (const m of migrations) {
      m.stmt.replaceWithText(m.replacement);
    }
    ensureDrawLabelImport(sourceFile);
    sourceFile.saveSync();
  }

  filesTouched++;
  totalMigrations += migrations.length;
  console.log(`  ${filename}  ${migrations.length} migrations`);
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
if (!WRITE_MODE) console.log('(dry run — no files written)');

// ─── Helpers ────────────────────────────────────────────────────────────────

function matchFillText(stmt) {
  if (!Node.isExpressionStatement(stmt)) return null;
  const expr = stmt.getExpression();
  if (!Node.isCallExpression(expr)) return null;
  const callee = expr.getExpression();
  if (!Node.isPropertyAccessExpression(callee)) return null;
  if (callee.getName() !== 'fillText') return null;
  if (callee.getExpression().getText() !== 'ctx') return null;
  return expr;
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

function isTextOp(stmt) {
  if (!Node.isExpressionStatement(stmt)) return false;
  const expr = stmt.getExpression();
  if (!Node.isCallExpression(expr)) return false;
  const callee = expr.getExpression();
  if (!Node.isPropertyAccessExpression(callee)) return false;
  if (callee.getExpression().getText() !== 'ctx') return false;
  return ['fillText', 'strokeText', 'measureText'].includes(callee.getName());
}

function hasContiguousPreamble(fillTextStmt) {
  const block = fillTextStmt.getParent();
  if (!Node.isBlock(block) && !Node.isSourceFile(block)) return false;
  const statements = block.getStatements();
  const idx = statements.indexOf(fillTextStmt);
  if (idx < 0) return false;

  const preamble = {};
  for (let j = idx - 1; j >= 0; j--) {
    const a = matchCtxAssignment(statements[j]);
    if (!a) break;
    if (preamble[a.prop]) break;
    preamble[a.prop] = a;
  }
  return !!(preamble.fillStyle && preamble.font);
}

function isInsideDrawLabel(node) {
  let cur = node.getParent();
  while (cur) {
    if (Node.isCallExpression(cur)) {
      const callee = cur.getExpression();
      if (Node.isIdentifier(callee) && callee.getText() === 'drawLabel') return true;
    }
    cur = cur.getParent();
  }
  return false;
}

/**
 * Walk up ancestor blocks looking for the most recent fillStyle + font
 * assignments. Stop at each block boundary or when we hit another text op.
 */
function findTextState(fillTextStmt) {
  const state = { fillStyle: null, font: null, textAlign: null, textBaseline: null };
  let curBlock = fillTextStmt.getParent();

  while (curBlock) {
    if (Node.isBlock(curBlock) || Node.isSourceFile(curBlock)) {
      const statements = curBlock.getStatements();
      // Find where the child containing fillTextStmt sits in this block.
      let startIdx = -1;
      for (let i = statements.length - 1; i >= 0; i--) {
        const s = statements[i];
        if (s === fillTextStmt) {
          startIdx = i;
          break;
        }
        // If fillTextStmt is nested inside this statement (e.g. if-block),
        // check if this statement contains it.
        if (s.getStart() <= fillTextStmt.getStart() && s.getEnd() >= fillTextStmt.getEnd()) {
          startIdx = i;
          break;
        }
      }

      if (startIdx >= 0) {
        for (let j = startIdx - 1; j >= 0; j--) {
          const stmt = statements[j];
          if (isTextOp(stmt)) break; // another fillText consumes the state
          const assign = matchCtxAssignment(stmt);
          if (assign) {
            if (!state[assign.prop]) state[assign.prop] = assign.valueText;
            // If we found both fillStyle and font, we can stop scanning this block.
            if (state.fillStyle && state.font) break;
          }
        }
      }
    }
    if (state.fillStyle && state.font) break;
    curBlock = curBlock.getParent();
  }

  return state;
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
