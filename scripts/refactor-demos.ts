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
 * What the script handles:
 *   - useRef + useEffect state-ref bridge  →  useSimState
 *   - useCallback + rAF setup              →  useSimLoop
 *   - `const colors = getCanvasColors();` outside draw is dropped (useSimLoop
 *     destructures `colors` from CanvasInfo and re-reads it every frame, which
 *     is also the theme-correct pattern — see CLAUDE.md §9).
 *   - setup-scope `createOrbitScene(canvas, ...)` orbit cameras are moved to
 *     the `useSimLoop` init callback, with `scene.dispose()` cleanup.
 *   - `let phase = 0; phase += DELTA;`-style accumulators outside draw are
 *     persisted across frames via useSimLoop's `init` context callback.
 *   - `let t0 = performance.now(); ... (now - t0) / 1000` patterns are folded
 *     to use the `simTime` argument that useSimLoop already provides; the
 *     `t0` declaration is dropped when fully substituted.
 *   - Manual `let lastT = performance.now(); ... let dt = (now - lastT)/1000;
 *     lastT = now; if (dt > 0.1) dt = 0.1;` boilerplate is dropped — useSimLoop
 *     hands the draw callback `dt` directly.
 *
 * Demos that are still skipped (with reason logged):
 *   - component-scope orbit hooks (`useOrbitScene`) and `attachOrbit`
 *   - LayeredCanvas
 *   - static cacheRef / StaticCache patterns
 *   - mutable arrays/objects created inside setup and modified across frames
 *   - setup callbacks that add event listeners outside draw (need init context)
 *   - setup callbacks that declare helper functions outside draw (need init
 *     context — usually paired with event listeners)
 *   - already-refactored demos
 */

import {
  Project,
  SourceFile,
  SyntaxKind,
  type VariableStatement,
  type FunctionDeclaration,
  type Block,
  type VariableDeclaration,
} from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

/* ─── Configuration ───────────────────────────────────────────────────── */

const SCRIPT_DIR = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const DEMOS_DIR = path.resolve(SCRIPT_DIR, '../src/textbook/demos');
const TSCONFIG = path.resolve(SCRIPT_DIR, '../tsconfig.json');

const IMPORTS_TO_ADD = [
  `import { useSimLoop } from '@/lib/useSimLoop';`,
  `import { useSimState } from '@/lib/useSimState';`,
];

// Declarations we silently drop from the pre-draw block because they're pure
// rAF boilerplate that useSimLoop owns now.
const RAF_BOILERPLATE_NAMES = new Set(['raf', 'lastT', 'lastTime']);

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

  // Already on the new library? Still allow the narrow non-canvas rAF timer
  // cleanup pass, because those sometimes coexist with a migrated canvas loop.
  if (/\buseSimState\b/.test(text) || /\buseSimLoop\b/.test(text)) {
    if (/requestAnimationFrame/.test(text) && transformSimpleRafTimerEffects(sourceFile)) {
      transformImports(sourceFile);
      return { ok: true };
    }
    return { ok: false, reason: 'already refactored' };
  }

  // No rAF at all → not a canvas animation demo
  if (!/requestAnimationFrame/.test(text)) {
    return { ok: false, reason: 'no rAF loop' };
  }

  // Complex patterns we deliberately skip
  if (/\buseOrbitScene\b/.test(text)) {
    return { ok: false, reason: 'component-scope useOrbitScene' };
  }
  if (/\battachOrbit\b/.test(text)) {
    return { ok: false, reason: 'attachOrbit camera' };
  }
  if (/\bLayeredCanvas\b/.test(text)) {
    return { ok: false, reason: 'LayeredCanvas' };
  }

  // Heuristic: does this file have a cacheRef or static-cache pattern?
  if (/\bcacheRef\b|\bStaticCache\b/.test(text)) {
    return { ok: false, reason: 'static cache pattern' };
  }

  // ─── Start applying transforms ───
  try {
    if (transformSimpleRafTimerEffects(sourceFile)) {
      transformImports(sourceFile);
      return { ok: true };
    }
    const stateResult = transformStateRef(sourceFile);
    if (!stateResult.ok) {
      return stateResult;
    }
    const loopResult = transformSetupLoop(sourceFile);
    if (!loopResult.ok) {
      return loopResult;
    }
    // Imports last so we know which legacy symbols (CanvasInfo,
    // getCanvasColors) are still referenced after the body rewrite.
    transformImports(sourceFile);
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, reason: `transform error: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}

/* ─── Import rewriting ────────────────────────────────────────────────── */

function transformImports(sourceFile: SourceFile) {
  const allImports = sourceFile.getImportDeclarations();
  const lastImport = allImports.length > 0 ? allImports[allImports.length - 1] : undefined;
  const insertPos = lastImport ? lastImport.getEnd() : 0;

  const linesToAdd: string[] = [];
  const existingSpecs = new Set(allImports.map((d) => d.getModuleSpecifierValue()));
  const text = sourceFile.getText();

  for (const line of IMPORTS_TO_ADD) {
    const spec = line.match(/from\s+['"]([^'"]+)['"]/)?.[1];
    const importedName = line.match(/import\s+\{\s*([^}\s]+)\s*\}/)?.[1];
    if (spec && importedName && new RegExp(`\\b${importedName}\\b`).test(text) && !existingSpecs.has(spec)) {
      linesToAdd.push(line);
    }
  }

  if (linesToAdd.length) {
    sourceFile.insertText(insertPos, '\n' + linesToAdd.join('\n') + '\n');
  }

  if (/\bOrbitScene\b/.test(sourceFile.getText())) {
    ensureNamedImport(sourceFile, '@/lib/useOrbitScene', 'OrbitScene', true);
  }

  pruneUnusedNamedImports(sourceFile, [
    'useCallback',
    'useEffect',
    'useRef',
    'CanvasInfo',
    'getCanvasColors',
  ]);
}

function ensureNamedImport(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  name: string,
  isTypeOnly = false,
) {
  const existing = sourceFile
    .getImportDeclarations()
    .find((d) => d.getModuleSpecifierValue() === moduleSpecifier);
  if (existing) {
    const hasName = existing.getNamedImports().some((n) => n.getName() === name);
    if (!hasName) {
      existing.addNamedImport({ name, isTypeOnly });
    }
    return;
  }
  sourceFile.addImportDeclaration({
    moduleSpecifier,
    namedImports: [{ name, isTypeOnly }],
  });
}

function pruneUnusedNamedImports(sourceFile: SourceFile, names: string[]) {
  const importDecls = sourceFile.getImportDeclarations();
  const importRanges = importDecls.map((decl) => [decl.getStart(), decl.getEnd()] as const);
  const fullText = sourceFile.getFullText();
  const nonImportText: string[] = [];
  let cursor = 0;
  for (const [start, end] of importRanges) {
    nonImportText.push(fullText.slice(cursor, start));
    cursor = end;
  }
  nonImportText.push(fullText.slice(cursor));
  const searchable = stripStringsAndComments(nonImportText.join('\n'));

  for (const decl of importDecls) {
    for (const named of [...decl.getNamedImports()]) {
      const name = named.getName();
      if (!names.includes(name)) continue;
      if (new RegExp(`\\b${escapeRegex(name)}\\b`).test(searchable)) continue;
      named.remove();
    }
    if (!decl.getDefaultImport() && decl.getNamedImports().length === 0 && !decl.getNamespaceImport()) {
      decl.remove();
    }
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

function transformSimpleRafTimerEffects(sourceFile: SourceFile): boolean {
  let changed = false;
  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (call.getExpression().getText() !== 'useEffect') continue;
    const parent = call.getParent();
    if (parent?.getKind() !== SyntaxKind.ExpressionStatement) continue;
    const text = parent.getText();
    if (!/requestAnimationFrame\s*\(/.test(text) || !/cancelAnimationFrame\s*\(/.test(text)) {
      continue;
    }
    const guard = text.match(/if\s*\(\s*(\w+)\s*===\s*0\s*\)\s*return\s*;/);
    const setter = text.match(/(set[A-Z]\w*)\s*\(\s*0\s*\)/);
    const duration = text.match(/\/\s*(\d+)\s*;/)?.[1] ?? text.match(/>=\s*1[\s\S]*?\/\s*(\d+)/)?.[1];
    const deps = text.match(/\},\s*\[([^\]]+)\]\s*\)\s*;?$/)?.[1]?.trim();
    if (!guard || !setter || !duration || !deps || !deps.split(',').map((d) => d.trim()).includes(guard[1])) {
      continue;
    }
    parent.replaceWithText(`useEffect(() => {
  if (${guard[1]} === 0) return;
  const id = window.setTimeout(() => ${setter[1]}(0), ${duration});
  return () => window.clearTimeout(id);
}, [${deps}]);`);
    changed = true;
  }
  return changed;
}

/* ─── Setup callback (useCallback + rAF → useSimLoop) ─────────────────── */

interface PersistedVar {
  name: string;
  init: string;
  type: string;
}

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

  // Find function draw() — by NAME, not just the first nested function
  // declaration. Many demos have helper functions (setKFromY, onPointerDown,
  // etc.) declared before draw().
  const drawFn = findDrawFunction(block);
  if (!drawFn) {
    return { ok: false, reason: 'no function draw() inside setup' };
  }

  const drawBody = drawFn.getBody();
  const drawBlock = drawBody?.asKind(SyntaxKind.Block);
  if (!drawBlock) {
    return { ok: false, reason: 'draw has no block body' };
  }

  const drawParams = drawFn.getParameters();
  if (drawParams.length > 1) {
    return { ok: false, reason: 'draw() has multiple parameters' };
  }
  const drawTimestampParam = drawParams[0]?.getName() ?? null;

  const blockStatements = block.getStatements();
  const drawFnIndex = blockStatements.findIndex((s) => s === drawFn);
  const preStatements = blockStatements.slice(0, drawFnIndex);
  const drawBodyTextOriginal = drawBlock.getText();

  const initStatements: string[] = [];
  const cleanupStatements: string[] = [];
  for (const stmt of preStatements) {
    const t = stmt.getText();
    if (/\bremoveEventListener\b/.test(t)) {
      return { ok: false, reason: 'setup removes event listeners before cleanup' };
    }
    if (/\baddEventListener\b/.test(t)) {
      const initStmt = t.replace(/\binfo\.canvas\./g, 'canvas.');
      initStatements.push(initStmt);
      cleanupStatements.push(initStmt.replace(/\baddEventListener\b/g, 'removeEventListener'));
    }
  }

  // Collect helper function declarations (other than draw itself). These
  // need to be inlined inside the new useSimLoop draw callback so they
  // remain in scope. Only safe when the helpers don't reference variables
  // we're dropping from the pre-block — checked implicitly because we
  // also collect persisted vars and bail on anything else.
  const helperFunctions: string[] = [];
  const initHelperFunctions: string[] = [];

  // Tracks non-default aliases used in the original `const { ctx, w: W, ... } = info;`
  // destructure, so we can reproduce them in the new useSimLoop signature.
  const destructureAliases = new Map<string, string>();

  for (const stmt of preStatements) {
    if (stmt.getKind() !== SyntaxKind.FunctionDeclaration) continue;
    const fn = stmt as FunctionDeclaration;
    const fnName = fn.getName();
    if (!fnName || fnName === 'draw') continue;
    // We can carry the helper through verbatim, but only if it doesn't
    // touch any rAF / animation-loop boilerplate names that we'll be
    // dropping (rare, but bail to be safe).
    const helperText = fn.getText();
    if (/\brequestAnimationFrame\s*\(/.test(helperText)) {
      return { ok: false, reason: `helper '${fnName}' contains rAF — manual migration needed` };
    }
    const usedInDraw = referencedInside(fnName, drawBodyTextOriginal);
    const usedInInit = initStatements.some((stmt) => referencedInside(fnName, stmt));
    if (usedInDraw && usedInInit) {
      return {
        ok: false,
        reason: `helper '${fnName}' used by both draw and init — manual context needed`,
      };
    }
    if (usedInInit) {
      initHelperFunctions.push(helperText);
    } else {
      helperFunctions.push(helperText);
    }
  }

  // Classify pre-block variable declarations
  const persistedVars: PersistedVar[] = [];
  for (const stmt of preStatements) {
    if (stmt.getKind() !== SyntaxKind.VariableStatement) continue;
    const decls = (stmt as VariableStatement).getDeclarations();
    for (const decl of decls) {
      const nameNode = decl.getNameNode();
      const nameKind = nameNode.getKind();

      // Object-binding pattern, e.g. `const { ctx, w, h, colors } = info;`
      // or `const { ctx, w: W, h: H } = info;`. useSimLoop already destructures
      // these (we synthesise the destructure ourselves below), so we just drop
      // them — BUT we have to record any local aliases (W, H, etc.) so we can
      // wire them up in the new signature.
      if (nameKind === SyntaxKind.ObjectBindingPattern) {
        const initText = (decl.getInitializer()?.getText() ?? '').trim();
        // Only safe to drop if the source is `info` (the AutoResizeCanvas arg).
        if (initText !== 'info') {
          return {
            ok: false,
            reason: `unsupported destructure source '${truncate(initText, 30)}'`,
          };
        }
        const obp = nameNode.asKindOrThrow(SyntaxKind.ObjectBindingPattern);
        for (const el of obp.getElements()) {
          const propName = el.getPropertyNameNode()?.getText() ?? el.getName();
          const localName = el.getName();
          // Only known CanvasInfo keys may pass through.
          if (!['ctx', 'w', 'h', 'dpr', 'colors', 'canvas'].includes(propName)) {
            return {
              ok: false,
              reason: `unexpected destructured key '${propName}' from info`,
            };
          }
          // If the alias is non-standard (e.g. `w: W`), surface that so the
          // new signature can keep the same alias.
          if (localName !== propName) {
            destructureAliases.set(propName, localName);
          }
        }
        continue;
      }

      // Array-binding pattern — too rare to bother with; bail.
      if (nameKind === SyntaxKind.ArrayBindingPattern) {
        return { ok: false, reason: 'array binding pattern in setup' };
      }

      const name = decl.getName();
      const initText = (decl.getInitializer()?.getText() ?? '').trim();

      if (RAF_BOILERPLATE_NAMES.has(name)) continue;

      const usedInDraw = referencedInside(name, drawBodyTextOriginal);
      const usedInInit = initStatements.some((stmt) => referencedInside(name, stmt));
      if (!usedInDraw) {
        if (usedInInit && isSimpleInitializer(initText)) {
          persistedVars.push({ name, init: initText, type: inferContextType(decl, initText) });
          continue;
        }
        // Declared but not used in draw — would be lost after collapse.
        // Conservatively bail unless this is the well-known `colors` cache.
        if (name === 'colors' && /getCanvasColors\s*\(/.test(initText)) {
          continue; // drop
        }
        return { ok: false, reason: `variable '${name}' declared in setup but unused in draw` };
      }

      // colors cache — drop; useSimLoop destructures colors from info per
      // frame, which is also the theme-correct pattern (see CLAUDE.md §9).
      if (name === 'colors' && /getCanvasColors\s*\(/.test(initText)) {
        continue;
      }

      // Persist literal-initialised, performance.now()-initialised, or simple
      // setup-scope orbit-scene vars via useSimLoop's init context.
      if (isSimpleInitializer(initText)) {
        persistedVars.push({ name, init: initText, type: inferContextType(decl, initText) });
        continue;
      }

      if (isMutableInitializer(initText)) {
        persistedVars.push({
          name,
          init: contextInitializerForMutable(decl, initText),
          type: inferContextType(decl, initText),
        });
        continue;
      }

      return {
        ok: false,
        reason: `variable '${name}' declared outside draw() but used inside (init '${truncate(initText, 40)}')`,
      };
    }
  }

  // Collect draw statements as text
  let drawBodyText = drawBlock.getStatements().map((s) => s.getText()).join('\n');

  // ─── Sanitise draw body ───

  // Remove `const colors = getCanvasColors();` (if it was inlined inside draw)
  drawBodyText = drawBodyText.replace(
    /(?:const|let|var)\s+colors\s*=\s*getCanvasColors\s*\(\s*\)\s*;?\n?/g,
    '',
  );

  // Replace inline `getCanvasColors().X` references with `colors.X`, since
  // useSimLoop now provides destructured `colors` to draw.
  drawBodyText = drawBodyText.replace(/getCanvasColors\s*\(\s*\)/g, 'colors');

  // Drop the recursive rAF call that lives at the tail of draw()
  drawBodyText = drawBodyText.replace(
    /\b\w+\s*=\s*requestAnimationFrame\s*\(\s*draw\s*\)\s*;?\n?/g,
    '',
  );

  // Substitute (performance.now() - X) / 1000 → simTime for any persisted
  // performance.now() marker (t0 / tStart / etc.).
  for (const v of persistedVars) {
    if (v.init === 'performance.now()') {
      const escaped = escapeRegex(v.name);
      drawBodyText = drawBodyText.replace(
        new RegExp(`\\(\\s*performance\\.now\\(\\)\\s*-\\s*${escaped}\\s*\\)\\s*\\/\\s*1000`, 'g'),
        'simTime',
      );
      // Bare diff (no /1000): yields milliseconds since t0 ≡ simTime * 1000.
      drawBodyText = drawBodyText.replace(
        new RegExp(`performance\\.now\\(\\)\\s*-\\s*${escaped}\\b`, 'g'),
        '(simTime * 1000)',
      );
    } else if (/^performance\.now\(\)\s*\/\s*1000$/.test(v.init)) {
      // Pattern: `const tStart = performance.now() / 1000;` then
      //          `const t = performance.now() / 1000 - tStart;`
      const escaped = escapeRegex(v.name);
      drawBodyText = drawBodyText.replace(
        new RegExp(
          `performance\\.now\\(\\)\\s*\\/\\s*1000\\s*-\\s*${escaped}\\b`,
          'g',
        ),
        'simTime',
      );
      // Also the parenthesised form
      drawBodyText = drawBodyText.replace(
        new RegExp(
          `\\(\\s*performance\\.now\\(\\)\\s*\\/\\s*1000\\s*\\)\\s*-\\s*${escaped}\\b`,
          'g',
        ),
        'simTime',
      );
    }
  }

  // Bail on demos that track dt via a state property (e.g. `s.lastT`,
  // `state.lastT`). useSimLoop hands draw its own `dt` — folding the state-
  // based version away would either lose the demo's intent (custom scaling)
  // or leave dangling state writes. Best migrated by hand.
  if (/\b\w+\.(?:lastT|lastTime|last)\b/.test(drawBodyText)) {
    return { ok: false, reason: 'manual dt tracking via state property' };
  }

  // Drop manual dt / simTime tracking boilerplate — but only as an atomic
  // block. All three pieces must be present in their bare-name form;
  // otherwise we risk stripping `now` or `if (dt > ...)` while the dt-calc
  // line survives and leaves `now` undefined.
  const hasNowDecl = /(?:const|let|var)\s+now\s*=\s*performance\.now\(\)\s*;?/.test(
    drawBodyText,
  );
  const hasDrawTimestampParam = drawTimestampParam != null;
  const timestampName = drawTimestampParam ? escapeRegex(drawTimestampParam) : 'now';
  const hasBareDtCalc =
    new RegExp(
      `(?:let|const|var)\\s+dt\\s*=\\s*\\(\\s*${timestampName}\\s*-\\s*(?:lastT|lastTime|last)\\s*\\)\\s*\\/\\s*1000`,
    ).test(
      drawBodyText,
    );
  const hasBareLastWrite = new RegExp(
    `(?<![.\\w])(?:lastT|lastTime|last)\\s*=\\s*${timestampName}\\b`,
  ).test(
    drawBodyText,
  );

  if ((hasNowDecl || hasDrawTimestampParam) && hasBareDtCalc && hasBareLastWrite) {
    //   const now = performance.now();
    drawBodyText = drawBodyText.replace(
      /(?:const|let|var)\s+now\s*=\s*performance\.now\(\)\s*;?\n?/g,
      '',
    );
    //   let dt = (now - lastT) / 1000;
    drawBodyText = drawBodyText.replace(
      new RegExp(
        `(?:let|const|var)\\s+dt\\s*=\\s*\\(\\s*${timestampName}\\s*-\\s*(?:lastT|lastTime|last)\\s*\\)\\s*\\/\\s*1000\\s*;?\\n?`,
        'g',
      ),
      '',
    );
    //   lastT = now;   (bare-name form only — never `s.lastT = now;`)
    drawBodyText = drawBodyText.replace(
      new RegExp(
        `(?<![.\\w])(?:lastT|lastTime|last)\\s*=\\s*${timestampName}\\s*;?\\n?`,
        'g',
      ),
      '',
    );
    //   if (dt > 0.1) dt = 0.1;
    drawBodyText = drawBodyText.replace(
      /if\s*\(\s*dt\s*>\s*0?\.\d+\s*\)\s*\{?\s*dt\s*=\s*0?\.\d+\s*;?\s*\}?\s*\n?/g,
      '',
    );
  }

  if (drawTimestampParam && referencedInside(drawTimestampParam, drawBodyText)) {
    return { ok: false, reason: `rAF timestamp '${drawTimestampParam}' still used after dt rewrite` };
  }

  // After substitution, drop persisted-performance.now() vars that are no
  // longer referenced in the body — they were just simTime markers.
  const stillReferenced = persistedVars.filter((v) =>
    referencedInside(v.name, drawBodyText),
  );
  const finalPersisted = stillReferenced;

  // If anyone still references performance.now() in a non-substituted shape,
  // we don't try to be clever — but it's fine, just leave it alone.

  // Guard: bail if there's still a stray rAF call in the body.
  if (/requestAnimationFrame\s*\(/.test(drawBodyText)) {
    return { ok: false, reason: 'unexpected rAF in draw body' };
  }

  // Build the destructure pattern + draw signature. Honour any aliases the
  // original demo used (`const { w: W, h: H } = info;` → `{ w: W, h: H }`).
  const wantsCtx = referencedInside('ctx', drawBodyText);
  const wantsCanvas = referencedInside('canvas', drawBodyText);
  const wantsDpr = referencedInside('dpr', drawBodyText);
  const aliasOf = (key: string) => destructureAliases.get(key) ?? key;
  const wAlias = aliasOf('w');
  const hAlias = aliasOf('h');
  const wantsW = referencedInside(wAlias, drawBodyText);
  const wantsH = referencedInside(hAlias, drawBodyText);
  const wantsColors = referencedInside('colors', drawBodyText);

  const destructureKeys: string[] = [];
  if (wantsCtx) destructureKeys.push('ctx');
  if (wantsW) destructureKeys.push(wAlias === 'w' ? 'w' : `w: ${wAlias}`);
  if (wantsH) destructureKeys.push(hAlias === 'h' ? 'h' : `h: ${hAlias}`);
  if (wantsDpr) destructureKeys.push('dpr');
  if (wantsCanvas) destructureKeys.push('canvas');
  if (wantsColors) destructureKeys.push('colors');
  // useSimLoop always passes a CanvasInfo; if nothing is referenced (very
  // rare) keep `ctx` so the signature isn't an empty `{}`.
  if (destructureKeys.length === 0) destructureKeys.push('ctx');
  const destructure = `({ ${destructureKeys.join(', ')} }`;

  // Only expose useSimLoop's dt / simTime as named parameters if the body
  // both uses them AND doesn't shadow them with its own declaration (e.g.
  // `const dt = (now - t0) / 1000;`). Otherwise use the underscore name so
  // the body's local can coexist without a duplicate-identifier clash.
  const usesSimTime = referencedInside('simTime', drawBodyText);
  const shadowsSimTime = bodyDeclares('simTime', drawBodyText);
  const usesDt = referencedInside('dt', drawBodyText);
  const shadowsDt = bodyDeclares('dt', drawBodyText);
  const dtParam = usesDt && !shadowsDt ? 'dt' : '_dt';
  const simTimeParam = usesSimTime && !shadowsSimTime ? 'simTime' : '_simTime';
  const hasInit = finalPersisted.length > 0 || initStatements.length > 0 || initHelperFunctions.length > 0;
  const ctxParam = hasInit ? `, ${finalPersisted.length > 0 ? 'ctx0' : '_ctx0'}` : '';

  // Inject persisted-var read/write
  let injectTop = '';
  let injectBottom = '';
  for (const v of finalPersisted) {
    injectTop += `let ${v.name} = ctx0.${v.name};\n`;
    if (!isDisposableOrbitSceneInitializer(v.init)) {
      injectBottom += `ctx0.${v.name} = ${v.name};\n`;
    }
  }

  const bodyParts: string[] = [];
  if (helperFunctions.length > 0) bodyParts.push(helperFunctions.join('\n\n'));
  if (injectTop) bodyParts.push(injectTop.trimEnd());
  bodyParts.push(drawBodyText.trim());
  if (injectBottom) bodyParts.push(injectBottom.trimEnd());
  const indentedBody = bodyParts
    .filter((p) => p.length > 0)
    .join('\n')
    .replace(/\n/g, '\n    ');

  const lines: string[] = [];
  const useSimLoopTypeArgs = hasInit
    ? `<typeof stateRef.current, ${buildContextType(finalPersisted)}>`
    : '';
  lines.push(`const setup = useSimLoop${useSimLoopTypeArgs}(`);
  lines.push('  stateRef,');
  lines.push(`  ${destructure}, _state, ${dtParam}, ${simTimeParam}${ctxParam}) => {`);
  lines.push(`    ${indentedBody}`);
  lines.push('  },');
  lines.push('  [],');
  if (hasInit) {
    lines.push(buildInitCallback(finalPersisted, initStatements, cleanupStatements, initHelperFunctions));
  }
  lines.push(');');

  const newSetup = lines.join('\n');

  const varStmt = setupDecl.getVariableStatement();
  if (!varStmt) {
    return { ok: false, reason: 'no variable statement' };
  }
  varStmt.replaceWithText(newSetup);
  return { ok: true };
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function findDrawFunction(block: Block): FunctionDeclaration | undefined {
  // Prefer a direct-child function declaration named 'draw'.
  for (const stmt of block.getStatements()) {
    if (stmt.getKind() === SyntaxKind.FunctionDeclaration) {
      const fn = stmt as FunctionDeclaration;
      if (fn.getName() === 'draw') return fn;
    }
  }
  // Fallback: any descendant named 'draw'.
  return block
    .getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
    .find((fn) => fn.getName() === 'draw');
}

function referencedInside(name: string, body: string): boolean {
  // (?<![.\w]) — don't match `sim.dt`'s trailing `dt` or `foodt`.
  return new RegExp(`(?<![.\\w])${escapeRegex(name)}\\b`).test(stripStringsAndComments(body));
}

function bodyDeclares(name: string, body: string): boolean {
  return new RegExp(
    `(?:const|let|var)\\s+${escapeRegex(name)}\\b`,
  ).test(stripStringsAndComments(body));
}

/**
 * Crude pass that blanks out string literals (single/double/backtick) and
 * single-line + block comments, so `referencedInside('dt', body)` doesn't
 * fire for a label like '∮B·dℓ = μ₀ ε₀ dΦ_E/dt' or a comment like
 * `// the canvas`. We never reinsert this text — it's only used for
 * substring searches.
 */
function stripStringsAndComments(text: string): string {
  let out = '';
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    const next = text[i + 1];
    // Line comment
    if (c === '/' && next === '/') {
      while (i < n && text[i] !== '\n') i++;
      continue;
    }
    // Block comment
    if (c === '/' && next === '*') {
      i += 2;
      while (i < n - 1 && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // String literal
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      out += ' ';
      i++;
      while (i < n) {
        const ch = text[i];
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === quote) {
          i++;
          break;
        }
        // Template literal ${...} — keep contents (they're real code)
        if (quote === '`' && ch === '$' && text[i + 1] === '{') {
          let depth = 1;
          i += 2;
          out += ' ';
          while (i < n && depth > 0) {
            if (text[i] === '{') depth++;
            else if (text[i] === '}') depth--;
            if (depth > 0) out += text[i];
            i++;
          }
          continue;
        }
        i++;
      }
      out += ' ';
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function isSimpleInitializer(text: string): boolean {
  if (!text) return false;
  if (isDisposableOrbitSceneInitializer(text)) return true;
  if (/^\w+\.cam$/.test(text)) return true;
  // Numeric literal, optionally signed / decimal / exponent
  if (/^-?\d+(\.\d+)?(e-?\d+)?$/.test(text)) return true;
  // Math constant, optionally preceded by a unary minus, optionally followed
  // by one binary operation against a numeric literal (e.g. `-Math.PI / 2`)
  if (/^-?Math\.(PI|E|LN2|LN10|LOG2E|LOG10E|SQRT2|SQRT1_2)(\s*[*/+-]\s*\d+(\.\d+)?)?$/.test(text))
    return true;
  if (text === 'performance.now()') return true;
  // Time marker scaled to seconds: `performance.now() / 1000`
  if (/^performance\.now\(\)\s*\/\s*1000$/.test(text)) return true;
  if (text === 'true' || text === 'false') return true;
  if (text === 'null' || text === 'undefined') return true;
  // Bare quoted string literal
  if (/^(['"`])[^'"`]*\1$/.test(text)) return true;
  return false;
}

function isDisposableOrbitSceneInitializer(text: string): boolean {
  return /^createOrbitScene\s*\(\s*canvas\s*,/.test(text);
}

function buildContextType(persistedVars: PersistedVar[]): string {
  if (persistedVars.length === 0) return 'Record<string, never>';
  return `{ ${persistedVars.map((v) => `${v.name}: ${v.type}`).join('; ')} }`;
}

function buildInitCallback(
  persistedVars: PersistedVar[],
  initStatements: string[],
  cleanupStatements: string[],
  initHelperFunctions: string[],
): string {
  const disposableOrbitScenes = persistedVars.filter((v) =>
    isDisposableOrbitSceneInitializer(v.init),
  );
  const needsCanvas =
    disposableOrbitScenes.length > 0 ||
    [...initStatements, ...cleanupStatements].some((stmt) => /\bcanvas\b/.test(stmt));

  if (
    disposableOrbitScenes.length === 0 &&
    initStatements.length === 0 &&
    cleanupStatements.length === 0 &&
    initHelperFunctions.length === 0
  ) {
    const initObj = persistedVars.map((v) => `${v.name}: ${v.init}`).join(', ');
    return `  () => ({ context: { ${initObj} } }),`;
  }

  const lines: string[] = [];
  lines.push(`  (${needsCanvas ? '{ canvas }' : ''}) => {`);
  for (const helper of initHelperFunctions) {
    lines.push(indentBlock(helper, 4));
  }
  for (const v of persistedVars) {
    if (isDisposableOrbitSceneInitializer(v.init)) {
      lines.push(`    const ${v.name} = ${v.init};`);
    }
  }
  for (const stmt of initStatements) {
    lines.push(`    ${stmt}`);
  }
  const contextEntries = persistedVars
    .map((v) => `${v.name}: ${isDisposableOrbitSceneInitializer(v.init) ? v.name : v.init}`)
    .join(', ');
  const cleanupCalls = [
    ...cleanupStatements,
    ...disposableOrbitScenes.map((v) => `${v.name}.dispose();`),
  ];
  const cleanup =
    cleanupCalls.length > 0
      ? `, cleanup: () => { ${cleanupCalls.join(' ')} }`
      : '';
  lines.push(`    return { context: { ${contextEntries} }${cleanup} };`);
  lines.push('  },');
  return lines.join('\n');
}

function inferContextType(decl: VariableDeclaration, initText: string): string {
  const explicit = decl.getTypeNode()?.getText();
  if (explicit) return explicit;
  if (isDisposableOrbitSceneInitializer(initText)) return 'OrbitScene';
  if (/^\w+\.cam$/.test(initText)) return "OrbitScene['cam']";
  if (/^\[/.test(initText) || /Array\.from|new\s+Array/.test(initText)) return 'unknown[]';
  if (/^\{/.test(initText)) return 'Record<string, unknown>';
  if (initText === 'true' || initText === 'false') return 'boolean';
  if (initText === 'null') return 'null';
  if (initText === 'undefined') return 'undefined';
  if (/^(['"`])/.test(initText)) return 'string';
  return 'number';
}

function isMutableInitializer(text: string): boolean {
  return /^\[|Array\.from|new\s+Array|^\{/.test(text);
}

function contextInitializerForMutable(decl: VariableDeclaration, initText: string): string {
  const explicit = decl.getTypeNode()?.getText();
  if (explicit && initText === '[]') return `[] as ${explicit}`;
  if (explicit && initText === '{}') return `{} as ${explicit}`;
  return initText;
}

function indentBlock(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => `${pad}${line}`)
    .join('\n');
}

/* ─── Run ─────────────────────────────────────────────────────────────── */

main();
