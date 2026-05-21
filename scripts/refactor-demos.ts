#!/usr/bin/env tsx
/**
 * AST-based codemod to migrate textbook demos from manual
 * useRef + useEffect + requestAnimationFrame to useSimState + useSimLoop.
 *
 * Usage:
 *   # Dry run (default) — shows what would change
 *   npx tsx scripts/refactor-demos.ts
 *
 *   # Apply changes
 *   npx tsx scripts/refactor-demos.ts --write
 *
 * The script is intentionally conservative. It only transforms "simple"
 * demos where the setup callback is a plain useCallback wrapping a
 * single draw() function driven by requestAnimationFrame.
 *
 * Demos with any of the following are skipped and logged:
 *   - orbit cameras (attachOrbit, createOrbitScene)
 *   - LayeredCanvas
 *   - static cacheRef patterns
 *   - mutable arrays/objects created inside setup and modified across frames
 *   - already-refactored demos (useSimState / useSimLoop already present)
 */

import { Project, SourceFile, SyntaxKind } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

/* ─── Configuration ───────────────────────────────────────────────────── */

const SCRIPT_DIR = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const DEMOS_DIR = path.resolve(SCRIPT_DIR, '../src/textbook/demos');
const TSCONFIG = path.resolve(SCRIPT_DIR, '../tsconfig.json');

const REACT_HOOKS_TO_REMOVE = ['useCallback', 'useEffect', 'useRef'];
const IMPORTS_TO_ADD = [
  `import { useSimLoop } from '@/lib/useSimLoop';`,
  `import { useSimState } from '@/lib/useSimState';`,
];

/* ─── CLI ─────────────────────────────────────────────────────────────── */

const WRITE_MODE = process.argv.includes('--write');

/* ─── Main ────────────────────────────────────────────────────────────── */

function main() {
  const project = new Project({ tsConfigFilePath: TSCONFIG });

  const files = fs
    .readdirSync(DEMOS_DIR)
    .filter((f) => f.endsWith('.tsx'))
    .sort();

  let transformed = 0;
  let skipped = 0;
  const reports: string[] = [];

  for (const filename of files) {
    const filepath = path.join(DEMOS_DIR, filename);
    const sourceFile = project.getSourceFile(filepath);
    if (!sourceFile) {
      reports.push(`SKIP ${filename}: not in TS project`);
      skipped++;
      continue;
    }

    const result = transformFile(sourceFile, filename);
    if (!result.ok) {
      reports.push(`SKIP ${filename}: ${result.reason}`);
      skipped++;
      continue;
    }
    if (WRITE_MODE) {
      sourceFile.saveSync();
    }
    reports.push(`OK   ${filename}`);
    transformed++;
  }

  console.log(reports.join('\n'));
  console.log(`\n────────────────────────────────────────`);
  console.log(`Transformed: ${transformed} | Skipped: ${skipped} | Total: ${files.length}`);
  if (!WRITE_MODE && transformed > 0) {
    console.log(`\nThis was a dry run. Pass --write to apply changes.`);
  }
}

/* ─── Per-file transform ──────────────────────────────────────────────── */

function transformFile(
  sourceFile: SourceFile,
  _filename: string,
): { ok: true } | { ok: false; reason: string } {
  const text = sourceFile.getText();

  // Already on the new library?
  if (/\buseSimState\b/.test(text) || /\buseSimLoop\b/.test(text)) {
    return { ok: false, reason: 'already refactored' };
  }

  // No rAF at all → not a canvas animation demo
  if (!/requestAnimationFrame/.test(text)) {
    return { ok: false, reason: 'no rAF loop' };
  }

  // Complex patterns we deliberately skip
  if (/\battachOrbit\b|\bcreateOrbitScene\b/.test(text)) {
    return { ok: false, reason: 'orbit camera' };
  }
  if (/\bLayeredCanvas\b/.test(text)) {
    return { ok: false, reason: 'LayeredCanvas' };
  }

  // Heuristic: does this file have a cacheRef or static-cache pattern?
  if (/\bcacheRef\b|\bStaticCache\b/.test(text)) {
    return { ok: false, reason: 'static cache pattern' };
  }

  // Heuristic: mutable state created inside the setup callback?
  if (hasMutableStateInSetup(sourceFile)) {
    return { ok: false, reason: 'mutable local state in setup' };
  }

  // ─── Start applying transforms ───
  try {
    transformImports(sourceFile);
    const stateResult = transformStateRef(sourceFile);
    if (!stateResult.ok) {
      return stateResult;
    }
    const loopResult = transformSetupLoop(sourceFile);
    if (!loopResult.ok) {
      return loopResult;
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, reason: `transform error: ${err.message}` };
  }
}

/* ─── Import rewriting ────────────────────────────────────────────────── */

function transformImports(sourceFile: SourceFile) {
  // 1. Trim React imports
  const reactImport = sourceFile.getImportDeclaration('react');
  if (reactImport) {
    const named = reactImport.getNamedImports();
    for (const n of named) {
      if (REACT_HOOKS_TO_REMOVE.includes(n.getName())) {
        n.remove();
      }
    }
    if (named.length === 0) {
      reactImport.remove();
    }
  }

  // 2. Trim AutoResizeCanvas import (remove `type CanvasInfo`)
  const arcImport = sourceFile.getImportDeclarations().find((d) => {
    const spec = d.getModuleSpecifierValue();
    return spec === '@/components/AutoResizeCanvas';
  });
  if (arcImport) {
    for (const n of arcImport.getNamedImports()) {
      const name = n.getName();
      if (name === 'CanvasInfo' || n.getText().includes('CanvasInfo')) {
        n.remove();
      }
    }
  }

  // 3. Add new imports after the last existing import
  const allImports = sourceFile.getImportDeclarations();
  const lastImport = allImports.length > 0 ? allImports[allImports.length - 1] : undefined;
  const insertPos = lastImport ? lastImport.getEnd() : 0;

  const linesToAdd: string[] = [];
  const existingSpecs = new Set(
    sourceFile.getImportDeclarations().map((d) => d.getModuleSpecifierValue()),
  );

  for (const line of IMPORTS_TO_ADD) {
    const spec = line.match(/from\s+['"]([^'"]+)['"]/)?.[1];
    if (spec && !existingSpecs.has(spec)) {
      linesToAdd.push(line);
    }
  }

  if (linesToAdd.length) {
    sourceFile.insertText(insertPos, '\n' + linesToAdd.join('\n') + '\n');
  }
}

/* ─── State ref bridging ──────────────────────────────────────────────── */

function transformStateRef(
  sourceFile: SourceFile,
): { ok: true } | { ok: false; reason: string } {
  const stateRefDecl = sourceFile
    .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .find((d) => d.getName() === 'stateRef');
  if (!stateRefDecl) {
    return { ok: false, reason: 'no stateRef declaration' };
  }

  const init = stateRefDecl.getInitializer();
  if (!init) {
    return { ok: false, reason: 'stateRef has no initializer' };
  }

  const callExpr = init.asKind(SyntaxKind.CallExpression);
  if (!callExpr || callExpr.getExpression().getText() !== 'useRef') {
    return { ok: false, reason: 'not useRef' };
  }

  const args = callExpr.getArguments();
  if (args.length < 1) {
    return { ok: false, reason: 'useRef has no arguments' };
  }
  const initObject = args[0].getText();

  // Find and remove useEffect(() => { stateRef.current = ... }, [...])
  const useEffectStmt = findStateRefEffect(sourceFile);
  if (useEffectStmt) {
    useEffectStmt.remove();
  }

  const varStmt = stateRefDecl.getVariableStatement();
  if (!varStmt) {
    return { ok: false, reason: 'no variable statement' };
  }
  varStmt.replaceWithText(`const stateRef = useSimState(${initObject});`);
  return { ok: true };
}

function findStateRefEffect(
  sourceFile: SourceFile,
): import('ts-morph').ExpressionStatement | undefined {
  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (call.getExpression().getText() !== 'useEffect') continue;
    if (call.getText().includes('stateRef.current')) {
      const parent = call.getParent();
      if (parent?.getKind() === SyntaxKind.ExpressionStatement) {
        return parent.asKind(SyntaxKind.ExpressionStatement)!;
      }
    }
  }
  return undefined;
}

/* ─── Setup callback (useCallback + rAF → useSimLoop) ─────────────────── */

function transformSetupLoop(
  sourceFile: SourceFile,
): { ok: true } | { ok: false; reason: string } {
  const setupDecl = sourceFile
    .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .find((d) => d.getName() === 'setup');
  if (!setupDecl) {
    return { ok: false, reason: 'no setup declaration' };
  }

  const init = setupDecl.getInitializer();
  if (!init) {
    return { ok: false, reason: 'setup has no initializer' };
  }

  const callExpr = init.asKind(SyntaxKind.CallExpression);
  if (!callExpr || callExpr.getExpression().getText() !== 'useCallback') {
    return { ok: false, reason: 'not useCallback' };
  }

  const args = callExpr.getArguments();
  if (args.length !== 2) {
    return { ok: false, reason: 'useCallback arity != 2' };
  }

  const arrowFn = args[0].asKind(SyntaxKind.ArrowFunction);
  if (!arrowFn) {
    return { ok: false, reason: 'not an arrow function' };
  }

  const body = arrowFn.getBody();
  const block = body.asKind(SyntaxKind.Block);
  if (!block) {
    return { ok: false, reason: 'not a block body' };
  }

  // Find function draw() inside the block
  const drawFn = block.getFirstDescendantByKind(SyntaxKind.FunctionDeclaration);
  if (!drawFn || drawFn.getName() !== 'draw') {
    return { ok: false, reason: 'no function draw() inside setup' };
  }

  const drawBody = drawFn.getBody();
  const drawBlock = drawBody?.asKind(SyntaxKind.Block);
  if (!drawBlock) {
    return { ok: false, reason: 'draw has no block body' };
  }

  // Safety: skip if there are let/const declarations outside draw()
  // that are referenced inside draw() (e.g. `let phase = 0;`).
  // We only allow the well-known rAF boilerplate variables through.
  const blockStatements = block.getStatements();
  const drawFnIndex = blockStatements.findIndex((s) => s === drawFn);
  for (let i = 0; i < drawFnIndex; i++) {
    const stmt = blockStatements[i];
    if (stmt.getKind() !== SyntaxKind.VariableStatement) continue;
    for (const decl of stmt.asKindOrThrow(SyntaxKind.VariableStatement).getDeclarations()) {
      const name = decl.getName();
      if (name === 'raf' || name === 'lastT') continue;
      if (new RegExp(`\\b${name}\\b`).test(drawBlock.getText())) {
        return { ok: false, reason: `variable '${name}' declared outside draw() but used inside` };
      }
    }
  }

  // Collect draw statements as text
  const drawStatements = drawBlock.getStatements();
  let drawBodyText = drawStatements.map((s) => s.getText()).join('\n');

  // ─── Sanitise draw body ───

  // Remove `const colors = getCanvasColors();` — useSimLoop provides colors
  drawBodyText = drawBodyText.replace(/const\s+colors\s*=\s*getCanvasColors\(\)\s*;?\n?/g, '');

  // Remove any `let t = 0;` or `let time = 0;` time accumulators
  drawBodyText = drawBodyText.replace(/let\s+(t|time|simTime)\s*=\s*[^;]+;?\n?/g, '');
  // Remove `st.t += 0.016;` or similar manual time steps
  drawBodyText = drawBodyText.replace(/\b\w+\.(t|time)\s*\+=\s*[^;]+;?\n?/g, '');

  // Remove the recursive rAF call that lives inside draw() in many demos
  drawBodyText = drawBodyText.replace(/\b\w+\s*=\s*requestAnimationFrame\s*\(\s*draw\s*\)\s*;?\n?/g, '');

  // Guard against genuinely weird nested rAF patterns we can't handle
  if (/requestAnimationFrame\s*\(/.test(drawBodyText)) {
    return { ok: false, reason: 'unexpected rAF in draw body' };
  }

  // Does the draw body reference `dpr`? If so we destructure it too.
  const needsDpr = /\bdpr\b/.test(drawBodyText);
  const destructure = needsDpr
    ? '({ ctx, w, h, dpr, colors }'
    : '({ ctx, w, h, colors }';

  const newSetup = [
    'const setup = useSimLoop(',
    '  stateRef,',
    `  ${destructure}, _state, _dt, simTime) => {`,
    '',
    `    ${drawBodyText.replace(/\n/g, '\n    ')}`,
    '  },',
    '  [],',
    ');',
  ].join('\n');

  const varStmt = setupDecl.getVariableStatement();
  if (!varStmt) {
    return { ok: false, reason: 'no variable statement' };
  }
  varStmt.replaceWithText(newSetup);
  return { ok: true };
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

/**
 * Heuristic: does the setup callback create arrays/objects that are mutated
 * across frames? We look for const/let declarations inside the useCallback
 * whose initialiser is an array literal, Array.from, new Array, or object
 * literal.
 */
function hasMutableStateInSetup(sourceFile: SourceFile): boolean {
  const setupDecl = sourceFile
    .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .find((d) => d.getName() === 'setup');
  if (!setupDecl) return false;

  const init = setupDecl.getInitializer()?.asKind(SyntaxKind.CallExpression);
  if (!init || init.getExpression().getText() !== 'useCallback') return false;

  const args = init.getArguments();
  const arrowFn = args[0]?.asKind(SyntaxKind.ArrowFunction);
  if (!arrowFn) return false;

  const block = arrowFn.getBody().asKind(SyntaxKind.Block);
  if (!block) return false;

  for (const stmt of block.getStatements()) {
    if (stmt.getKind() !== SyntaxKind.VariableStatement) continue;
    const decls = stmt.asKindOrThrow(SyntaxKind.VariableStatement).getDeclarations();
    for (const decl of decls) {
      const initText = decl.getInitializer()?.getText() ?? '';
      if (/^\[|Array\.from|new\s+Array|^\{/.test(initText)) {
        return true;
      }
    }
  }
  return false;
}

/* ─── Run ─────────────────────────────────────────────────────────────── */

main();
