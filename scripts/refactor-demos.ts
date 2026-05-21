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

const DEMOS_DIR = path.resolve(__dirname, '../src/textbook/demos');
const TSCONFIG = path.resolve(__dirname, '../tsconfig.json');

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
    if (result.ok) {
      if (WRITE_MODE) {
        sourceFile.saveSync();
      }
      reports.push(`OK   ${filename}`);
      transformed++;
    } else {
      reports.push(`SKIP ${filename}: ${result.reason}`);
      skipped++;
    }
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
  filename: string,
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
  // We look for arrays/objects instantiated inside useCallback that are
  // later mutated (push/pop/splice, or property assignment on a let).
  const setupBlock = extractSetupBlock(text);
  if (setupBlock && hasMutableStateInSetup(setupBlock)) {
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
  const lastImport = sourceFile.getImportDeclarations().at(-1);
  const insertPos = lastImport ? lastImport.getEnd() : 0;

  const linesToAdd: string[] = [];
  const existingSpecs = new Set(
    sourceFile
      .getImportDeclarations()
      .map((d) => d.getModuleSpecifierValue()),
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
  const text = sourceFile.getText();

  // Pattern: const stateRef = useRef({ ... });
  const useRefRegex =
    /const\s+stateRef\s*=\s*useRef\s*\(\s*(\{[\s\S]*?\})\s*\)\s*;?/;
  const refMatch = text.match(useRefRegex);
  if (!refMatch) {
    return { ok: false, reason: 'no stateRef = useRef pattern' };
  }
  const initObject = refMatch[1];

  // Pattern: useEffect(() => { stateRef.current = { ... }; }, [deps]);
  const useEffectRegex =
    /useEffect\s*\(\s*\(\)\s*=>\s*\{\s*stateRef\.current\s*=\s*\{[\s\S]*?\}\s*;?\s*\}\s*,\s*\[[\s\S]*?\]\s*\)\s*;?/;
  const effectMatch = text.match(useEffectRegex);

  const fullText = sourceFile.getText();
  let newText = fullText;

  // Remove the useEffect if found
  if (effectMatch) {
    newText = newText.replace(effectMatch[0], '');
  }

  // Replace the useRef declaration with useSimState
  newText = newText.replace(refMatch[0], `const stateRef = useSimState(${initObject});`);

  sourceFile.replaceText([0, fullText.length], newText);
  return { ok: true };
}

/* ─── Setup callback (useCallback + rAF → useSimLoop) ─────────────────── */

function transformSetupLoop(
  sourceFile: SourceFile,
): { ok: true } | { ok: false; reason: string } {
  const text = sourceFile.getText();

  // Find: const setup = useCallback((info: CanvasInfo) => { ... }, []);
  // We use a regex that balances braces carefully enough for the common case.
  const setupRegex =
    /const\s+setup\s*=\s*useCallback\s*\(\s*(\([^)]*\)\s*=>\s*\{)/;
  const match = text.match(setupRegex);
  if (!match) {
    return { ok: false, reason: 'no useCallback setup pattern' };
  }

  const arrowStartIndex = match.index! + match[0].indexOf(match[1]);
  const blockStart = arrowStartIndex + match[1].length - 1; // position of '{'

  // Extract the full callback block by brace counting
  const blockEnd = findMatchingBrace(text, blockStart);
  if (blockEnd === -1) {
    return { ok: false, reason: 'could not parse setup callback body' };
  }

  const callbackBody = text.slice(blockStart + 1, blockEnd); // inside the outer {}

  // ─── Disqualify if body has patterns we don't handle ───
  if (/\bdispose\b|\bcleanup\b/.test(callbackBody)) {
    return { ok: false, reason: 'cleanup/dispose inside setup' };
  }

  // ─── Find the nested draw() function ───
  const drawFnRegex = /function\s+draw\s*\(\s*\)\s*\{/;
  const drawMatch = callbackBody.match(drawFnRegex);
  if (!drawMatch) {
    return { ok: false, reason: 'no function draw() inside setup' };
  }

  const drawBlockStart = callbackBody.indexOf(drawMatch[0]) + drawMatch[0].length - 1;
  const drawBlockEnd = findMatchingBrace(callbackBody, drawBlockStart);
  if (drawBlockEnd === -1) {
    return { ok: false, reason: 'could not parse draw() body' };
  }

  let drawBody = callbackBody.slice(drawBlockStart + 1, drawBlockEnd).trim();

  // ─── Sanitise draw body ───

  // Remove `const colors = getCanvasColors();` — useSimLoop provides colors
  drawBody = drawBody.replace(/const\s+colors\s*=\s*getCanvasColors\(\)\s*;?\n?/g, '');

  // Remove any `let t = 0;` or `let time = 0;` time accumulators
  drawBody = drawBody.replace(/let\s+(t|time|simTime)\s*=\s*[^;]+;\n?/g, '');
  // Remove `st.t += 0.016;` or similar manual time steps
  drawBody = drawBody.replace(/\b\w+\.(t|time)\s*\+=[^;]+;\n?/g, '');

  // ─── Build the useSimLoop call ───

  // Does the draw body reference `dpr`? If so we destructure it too.
  const needsDpr = /\bdpr\b/.test(drawBody);
  const destructure = needsDpr
    ? '({ ctx, w, h, dpr, colors }'
    : '({ ctx, w, h, colors }';

  const newSetup = [
    'const setup = useSimLoop(',
    '  stateRef,',
    `  ${destructure}, _state, _dt, simTime) => {`,
    '',
    `    ${drawBody.replace(/\n/g, '\n    ')}`,
    '  },',
    '  [],',
    ');',
  ].join('\n');

  const fullText = sourceFile.getText();
  const oldSetup = text.slice(match.index!, blockEnd + 1);
  const newFullText = fullText.replace(oldSetup, newSetup);

  sourceFile.replaceText([0, fullText.length], newFullText);
  return { ok: true };
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

/**
 * Naïve brace matcher. Returns the index of the brace that matches `openIdx`,
 * or -1 if not found.
 */
function findMatchingBrace(text: string, openIdx: number): number {
  let depth = 1;
  let inString: string | null = null;
  let escape = false;

  for (let i = openIdx + 1; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }

    if (inString) {
      if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    if (ch === '/' && text[i + 1] === '/') {
      // Single-line comment — skip to EOL
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      // Multi-line comment — skip to */
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i++;
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

/** Extract the raw text of the useCallback body for heuristic analysis. */
function extractSetupBlock(text: string): string | null {
  const match = text.match(/const\s+setup\s*=\s*useCallback\s*\(/);
  if (!match) return null;
  const start = text.indexOf(match[0]) + match[0].length - 1; // position of '('
  const end = findMatchingBrace(text, start);
  if (end === -1) return null;
  return text.slice(start, end + 1);
}

/**
 * Heuristic: does the setup callback create arrays/objects that are mutated
 * across frames? We look for let/const declarations of arrays/objects that
 * appear *before* the draw() function and are referenced *inside* draw().
 */
function hasMutableStateInSetup(setupText: string): boolean {
  // Simple regex heuristics
  const createsArray =
    /\b(?:const|let)\s+\w+\s*=\s*(?:\[|Array\.from|new\s+Array|\{)/.test(setupText);
  const mutatesInsideDraw =
    /function\s+draw\s*\(\)[\s\S]*\b\w+\.(?:push|pop|shift|unshift|splice|sort)\s*\(/.test(
      setupText,
    );
  const assignsInsideDraw =
    /function\s+draw\s*\(\)[\s\S]*\b\w+\s*=[^=]/.test(setupText);

  return createsArray && (mutatesInsideDraw || assignsInsideDraw);
}

/* ─── Run ─────────────────────────────────────────────────────────────── */

main();
