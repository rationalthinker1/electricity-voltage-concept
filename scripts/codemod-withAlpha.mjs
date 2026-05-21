/* eslint-disable */
/**
 * One-shot codemod: migrate hardcoded `'rgba(R,G,B,A)'` literals to
 * `withAlpha(colors.X, A)` whenever the RGB matches a known theme token.
 *
 * Run with:  node scripts/codemod-withAlpha.mjs
 * Optional:  node scripts/codemod-withAlpha.mjs --dry --verbose
 *
 * Why this matters
 * ─────────────────
 * CLAUDE.md §9 forbids baking the dark-theme hex into draw loops — it breaks
 * the light-theme swap. `withAlpha(colors.X, a)` derives the translucent form
 * from the live token, so any future theme change re-paints correctly.
 *
 * Detection
 * ─────────
 * String literals matching `^rgba\(R,G,B,A\)$` (whitespace tolerated). The
 * RGB triple is looked up in TOKEN_MAP below — only matching theme tokens
 * are migrated. Off-palette colours (white, black, custom hex tints) are
 * left as inline rgba literals and reported in the skip log.
 *
 * `colors` vs `getCanvasColors()` prefix
 * ──────────────────────────────────────
 * Decided **per call site** by walking up the parent chain and checking each
 * enclosing function for a `colors` binding (parameter destructure or local
 * declaration). If one is found, the replacement uses `colors.X`. Otherwise
 * it falls back to `getCanvasColors().X` and ensures that named import is
 * present.
 *
 * Earlier file-level heuristic failed for module-top-level constants like
 *   `const ELECTRIC = [{ color: 'rgba(...)' }];`
 * where `colors` is in scope inside a draw callback elsewhere in the file
 * but NOT at the literal's actual location.
 *
 * Safety filter
 * ─────────────
 * String literals whose parent is a `+` BinaryExpression (string concatenation
 * like `color + '00'` for hex-alpha tricks) are skipped — we don't migrate
 * the inner string because the surrounding concat would no longer make sense.
 *
 * `withAlpha` import is added to any existing `@/lib/canvasTheme` import,
 * or a fresh one is inserted alphabetically into the `@/lib/` block.
 */

import { Project, QuoteKind, Node } from 'ts-morph';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const DEMOS_GLOB = 'src/textbook/demos/*.tsx';
const DRY = process.argv.includes('--dry');
const VERBOSE = process.argv.includes('--verbose');

/**
 * Canonical RGB → canvas-token name. Source: src/styles/main.css (definitions)
 * and src/lib/canvasTheme.ts (ThemeColors interface). Only tokens that map to
 * a *solid* base colour are included — `--accent-soft`, `--border-strong`,
 * etc. are themselves rgba and can't be derived from another token by alpha.
 */
const TOKEN_MAP = {
  '255,107,42': 'accent',
  '108,197,194': 'teal',
  '255,59,110': 'pink',
  '91,174,248': 'blue',
  '236,235,229': 'text',
  '160,158,149': 'textDim',
  '145,141,135': 'textMuted',
  '18,18,21': 'bg', // --bg-elevated (canvas bg)
  '22,22,26': 'cardBg',
  '28,28,34': 'cardBgHover',
  '13,13,16': 'canvasBg',
};

const RGBA_RE = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/;

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
  let anySiteNeedsGetCanvasColors = false;

  sourceFile.forEachDescendant((node) => {
    if (!Node.isStringLiteral(node)) return;
    const text = node.getLiteralValue();
    const m = text.replace(/\s+/g, '').match(/^rgba\((\d+),(\d+),(\d+),([0-9]*\.?[0-9]+)\)$/);
    if (!m) {
      // Also try the looser regex in case getLiteralValue() returned with whitespace.
      const m2 = text.match(RGBA_RE);
      if (!m2) return;
    }

    // Normalise into RGB triple + alpha number.
    const t = text.replace(/\s+/g, '');
    const mm = t.match(/^rgba\((\d+),(\d+),(\d+),([0-9]*\.?[0-9]+)\)$/);
    if (!mm) return;
    const r = parseInt(mm[1], 10);
    const g = parseInt(mm[2], 10);
    const b = parseInt(mm[3], 10);
    let alphaRaw = mm[4];

    const key = `${r},${g},${b}`;
    const token = TOKEN_MAP[key];
    if (!token) {
      if (VERBOSE) skipped.push(`${filename}:${node.getStartLineNumber()} (off-palette rgb ${key})`);
      return;
    }

    // Skip when parent is a `+` BinaryExpression — concatenation contexts
    // would break under the function-call replacement.
    const parent = node.getParent();
    if (
      parent &&
      Node.isBinaryExpression(parent) &&
      parent.getOperatorToken().getText() === '+'
    ) {
      skipped.push(`${filename}:${node.getStartLineNumber()} (parent is string concat)`);
      return;
    }

    // Normalise leading-dot alphas (`.45` → `0.45`) for readability in source.
    if (alphaRaw.startsWith('.')) alphaRaw = '0' + alphaRaw;

    // Decide prefix per-site: is `colors` actually in scope here?
    const hasColorsInScope = colorsInScope(node);
    if (!hasColorsInScope) anySiteNeedsGetCanvasColors = true;
    const colorExpr = hasColorsInScope ? `colors.${token}` : `getCanvasColors().${token}`;
    const replacement = `withAlpha(${colorExpr}, ${alphaRaw})`;

    migrations.push({
      start: node.getStart(),
      end: node.getEnd(),
      replacement,
    });
  });

  if (migrations.length === 0) continue;

  // Apply in reverse start order.
  migrations.sort((a, b) => b.start - a.start);
  for (const m of migrations) {
    sourceFile.replaceText([m.start, m.end], m.replacement);
  }

  ensureImports(sourceFile, anySiteNeedsGetCanvasColors);

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

/**
 * Walk up the parent chain from `node` and return true if any enclosing
 * function or block declares a `colors` binding — either as a parameter
 * (including destructured-from-object) or as a local `const`/`let`. Walking
 * stops at the source file boundary.
 */
function colorsInScope(node) {
  let cur = node.getParent();
  while (cur) {
    // Variable / lexical declarations in any enclosing block.
    if (Node.isBlock(cur) || Node.isSourceFile(cur)) {
      for (const stmt of cur.getStatements()) {
        if (Node.isVariableStatement(stmt)) {
          for (const decl of stmt.getDeclarationList().getDeclarations()) {
            if (bindingDeclaresColors(decl.getNameNode())) return true;
          }
        }
      }
    }
    // Function parameters (arrow, function expression, function declaration, method).
    if (
      Node.isArrowFunction(cur) ||
      Node.isFunctionExpression(cur) ||
      Node.isFunctionDeclaration(cur) ||
      Node.isMethodDeclaration(cur)
    ) {
      for (const param of cur.getParameters()) {
        if (bindingDeclaresColors(param.getNameNode())) return true;
      }
    }
    cur = cur.getParent();
  }
  return false;
}

/**
 * Does a binding name node introduce `colors`? Handles:
 *   - identifier:               `colors`
 *   - object destructure:       `{ colors }` or `{ colors: foo }` or `{ ...colors }`
 *   - nested object destructure:`{ info: { colors } }`
 *   - array destructure:        `[colors]`  (very unlikely but cheap to check)
 */
function bindingDeclaresColors(nameNode) {
  if (!nameNode) return false;
  if (Node.isIdentifier(nameNode)) return nameNode.getText() === 'colors';
  if (Node.isObjectBindingPattern(nameNode)) {
    for (const el of nameNode.getElements()) {
      const propName = el.getPropertyNameNode()?.getText();
      const elemName = el.getNameNode();
      // `{ colors }` — propName is undefined, elemName is identifier 'colors'.
      // `{ x: colors }` — propName is 'x', elemName is identifier 'colors'.
      // `{ colors: y }` — propName is 'colors', elemName is identifier 'y' (renamed away).
      if (propName === 'colors') {
        // Renamed away — `colors` is no longer the binding name. Skip.
        if (Node.isIdentifier(elemName) && elemName.getText() !== 'colors') continue;
        return true;
      }
      if (!propName && Node.isIdentifier(elemName) && elemName.getText() === 'colors') {
        return true;
      }
      // Recurse into nested destructure: `{ info: { colors } }`.
      if (!Node.isIdentifier(elemName) && bindingDeclaresColors(elemName)) return true;
    }
    return false;
  }
  if (Node.isArrayBindingPattern(nameNode)) {
    for (const el of nameNode.getElements()) {
      if (Node.isBindingElement(el) && bindingDeclaresColors(el.getNameNode())) return true;
    }
    return false;
  }
  return false;
}

function ensureImports(sourceFile, needsGetCanvasColors) {
  const themeImport = sourceFile.getImportDeclaration(
    (d) => d.getModuleSpecifierValue() === '@/lib/canvasTheme',
  );

  const needed = new Set(['withAlpha']);
  if (needsGetCanvasColors) needed.add('getCanvasColors');

  if (themeImport) {
    const existing = new Set(themeImport.getNamedImports().map((n) => n.getName()));
    for (const name of needed) existing.add(name);
    const sorted = [...existing].sort();
    themeImport.removeNamedImports();
    sorted.forEach((n) => themeImport.addNamedImport(n));
    return;
  }

  // No existing canvasTheme import — insert one in the @/lib/ block,
  // alphabetically by module specifier.
  const allImports = sourceFile.getImportDeclarations();
  let insertIdx = allImports.length;
  for (let i = 0; i < allImports.length; i++) {
    const spec = allImports[i].getModuleSpecifierValue();
    if (spec.startsWith('@/lib/') && spec > '@/lib/canvasTheme') {
      insertIdx = i;
      break;
    } else if (spec.startsWith('@/lib/')) {
      insertIdx = i + 1;
    } else if (insertIdx === allImports.length && !spec.startsWith('@/lib/')) {
      insertIdx = i + 1;
    }
  }

  sourceFile.insertImportDeclaration(insertIdx, {
    moduleSpecifier: '@/lib/canvasTheme',
    namedImports: [...needed].sort(),
  });
}
