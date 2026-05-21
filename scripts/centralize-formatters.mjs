#!/usr/bin/env node
/**
 * AST codemod: replace per-demo `function fmt*` helpers with imports from
 * `@/lib/formatters`. The substitution table was built by reading every
 * existing local fmt function and mapping it to the closest centralised
 * export (sometimes a brand-new export — see formatters.ts additions).
 *
 * Per file we:
 *   1. Remove the local function declarations listed in `REWRITES`.
 *   2. Rename every reference to the local name → the centralised name.
 *      (Per-file traversal — won't touch unrelated identifiers in other
 *      files.)
 *   3. Add a single `import { … } from '@/lib/formatters'` covering the
 *      new symbols, merged with any existing import from that module.
 *
 * Exact decimal precision may differ slightly from the originals where the
 * centralised `fmt()` helper rounds to fewer digits than the local
 * hand-tuned conditionals. Acceptable per user direction; review the
 * canvases visually before committing.
 *
 * Run from repo root:
 *   node scripts/centralize-formatters.mjs           # dry run
 *   node scripts/centralize-formatters.mjs --write   # apply
 */

import { Project, SyntaxKind } from 'ts-morph';
import * as path from 'node:path';
import * as url from 'node:url';

const SCRIPT_DIR = path.dirname(url.fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const TSCONFIG = path.join(REPO_ROOT, 'tsconfig.json');

const WRITE_MODE = process.argv.includes('--write');

/**
 * file path → array of {local, replacement} renames.
 * `replacement` is the name to import from `@/lib/formatters`. If the
 * replacement equals the local name we still rewrite — just the function
 * declaration gets removed and the import gets added.
 */
const REWRITES = {
  // ─── Frequency ──────────────────────────────────────────────────────
  // fmtFreq returning "1.5k" without unit → fmtFreqShort
  'src/textbook/demos/RLCBandpass.tsx': [{ local: 'fmtFreq', replacement: 'fmtFreqShort' }],
  'src/textbook/demos/RCFilterBode.tsx': [{ local: 'fmtFreqShort', replacement: 'fmtFreqShort' }],
  'src/textbook/demos/SallenKeyFilter.tsx': [{ local: 'fmtFreqShort', replacement: 'fmtFreqShort' }],
  'src/textbook/demos/FilterDesigner.tsx': [{ local: 'fmtFreq', replacement: 'fmtFreqShort' }],
  // fmtFreq returning "1.50 MHz" with unit → fmtFrequency
  'src/textbook/demos/LCOscillation.tsx': [
    { local: 'fmtFreq', replacement: 'fmtFrequency' },
    { local: 'fmtT', replacement: 'fmtTime' },
    { local: 'fmtA', replacement: 'fmtCurrent' },
  ],
  'src/textbook/demos/TransformerDesigner.tsx': [{ local: 'fmtFreq', replacement: 'fmtFrequency' }],

  // ─── Resistance ─────────────────────────────────────────────────────
  'src/textbook/demos/BuildAResistor.tsx': [
    { local: 'fmtOhms', replacement: 'fmtResistance' },
    { local: 'fmtRho', replacement: 'fmtResistivity' },
  ],
  'src/textbook/demos/VariableResistors.tsx': [{ local: 'fmtOhms', replacement: 'fmtResistance' }],
  'src/textbook/demos/ColorCodeDecoder.tsx': [
    { local: 'fmtOhms', replacement: 'fmtResistance' },
    { local: 'fmtTol', replacement: 'fmtTolerance' },
  ],
  'src/textbook/demos/MultimeterProbe.tsx': [
    { local: 'fmtOhms', replacement: 'fmtResistance' },
    { local: 'fmtVolts', replacement: 'fmtVoltage' },
    { local: 'fmtAmps', replacement: 'fmtCurrent' },
  ],
  'src/textbook/demos/TheveninEquivalent.tsx': [{ local: 'fmtR', replacement: 'fmtResistance' }],
  'src/textbook/demos/ChargingCurve.tsx': [
    { local: 'fmtR', replacement: 'fmtResistance' },
    { local: 'fmtT', replacement: 'fmtTime' },
  ],
  'src/textbook/demos/RCTransient.tsx': [
    { local: 'fmtR', replacement: 'fmtResistance' },
    { local: 'fmtT', replacement: 'fmtTime' },
  ],
  // fmtRLog takes log10(R) — we leave its call sites untouched and just
  // export it locally for now (it's a one-off log-axis helper); not in this
  // codemod's scope. Skip OpAmpFollower.

  // ─── Current ────────────────────────────────────────────────────────
  'src/textbook/demos/NodalSolver.tsx': [{ local: 'fmtA', replacement: 'fmtCurrent' }],

  // ─── Time ───────────────────────────────────────────────────────────
  'src/textbook/demos/OpAmpIntegrator.tsx': [{ local: 'fmtT', replacement: 'fmtTime' }],

  // ─── Other ──────────────────────────────────────────────────────────
  'src/textbook/demos/RvsTemperature.tsx': [{ local: 'fmtRatio', replacement: 'fmtRatio' }],

  // ─── Labs ───────────────────────────────────────────────────────────
  'src/labs/EVBenchLab.tsx': [
    { local: 'fmt', replacement: 'fmtFloat' },
    { local: 'fmtTime', replacement: 'fmtClockTime' },
  ],
  'src/labs/RFLinkLab.tsx': [{ local: 'fmtDb', replacement: 'fmtDb' }],
};

const project = new Project({ tsConfigFilePath: TSCONFIG });

let filesTouched = 0;
let fnsRemoved = 0;
let refsRenamed = 0;
const reports = [];

for (const [relPath, renames] of Object.entries(REWRITES)) {
  const fp = path.join(REPO_ROOT, relPath);
  const sf = project.getSourceFile(fp);
  if (!sf) {
    reports.push(`MISS  ${relPath}: not in TS project`);
    continue;
  }

  const localNames = new Set(renames.map((r) => r.local));
  const localToReplacement = new Map(renames.map((r) => [r.local, r.replacement]));
  const needsImport = new Set(renames.map((r) => r.replacement));

  // 1. Remove local function declarations whose name matches.
  let fnsRemovedHere = 0;
  for (const fn of sf.getFunctions()) {
    const name = fn.getName();
    if (name && localNames.has(name)) {
      fn.remove();
      fnsRemovedHere++;
    }
  }

  // 2. Rename references. Walk identifiers and rewrite when the name matches
  //    AND it isn't a member-access tail (e.g. `obj.fmtFreq`) or a property
  //    name in an object literal.
  let refsRenamedHere = 0;
  for (const id of sf.getDescendantsOfKind(SyntaxKind.Identifier)) {
    const name = id.getText();
    if (!localNames.has(name)) continue;
    const replacement = localToReplacement.get(name);
    if (!replacement) continue;

    const parent = id.getParent();
    if (!parent) continue;
    const parentKind = parent.getKind();

    // Skip `something.fmtFreq` — the tail of a property access.
    if (parentKind === SyntaxKind.PropertyAccessExpression) {
      const pae = parent;
      if (pae.getNameNode && pae.getNameNode() === id) continue;
    }
    // Skip object-literal property names: `{ fmtFreq: x }`.
    if (parentKind === SyntaxKind.PropertyAssignment) {
      if (parent.getNameNode && parent.getNameNode() === id) continue;
    }
    // Skip import / export specifiers — those are handled separately.
    if (
      parentKind === SyntaxKind.ImportSpecifier ||
      parentKind === SyntaxKind.ExportSpecifier ||
      parentKind === SyntaxKind.ImportClause ||
      parentKind === SyntaxKind.NamespaceImport
    ) {
      continue;
    }

    if (replacement !== name) {
      id.replaceWithText(replacement);
    }
    refsRenamedHere++;
  }

  // 3. Add / merge the import from '@/lib/formatters'.
  let formattersImport = sf.getImportDeclaration((d) => {
    return d.getModuleSpecifierValue() === '@/lib/formatters';
  });
  if (!formattersImport) {
    const lastImport = sf.getImportDeclarations().slice(-1)[0];
    const insertPos = lastImport ? lastImport.getChildIndex() + 1 : 0;
    formattersImport = sf.insertImportDeclaration(insertPos, {
      moduleSpecifier: '@/lib/formatters',
      namedImports: [...needsImport].map((n) => ({ name: n })),
    });
  } else {
    const existing = new Set(formattersImport.getNamedImports().map((n) => n.getName()));
    for (const name of needsImport) {
      if (!existing.has(name)) {
        formattersImport.addNamedImport({ name });
      }
    }
  }

  if (fnsRemovedHere > 0 || refsRenamedHere > 0) {
    filesTouched++;
    fnsRemoved += fnsRemovedHere;
    refsRenamed += refsRenamedHere;
    reports.push(
      `OK    ${relPath}  (-${fnsRemovedHere} fn, ${refsRenamedHere} ref${refsRenamedHere === 1 ? '' : 's'})`,
    );
    if (WRITE_MODE) sf.saveSync();
  } else {
    reports.push(`SKIP  ${relPath}: nothing matched`);
  }
}

console.log(reports.join('\n'));
console.log('\n────────────────────────────────────────');
console.log(`Files touched: ${filesTouched} / ${Object.keys(REWRITES).length}`);
console.log(`Function declarations removed: ${fnsRemoved}`);
console.log(`References renamed: ${refsRenamed}`);
if (!WRITE_MODE) console.log('\nThis was a dry run. Pass --write to apply.');
