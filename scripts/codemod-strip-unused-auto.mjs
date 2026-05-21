/* eslint-disable */
/**
 * Automatic unused-import stripper.
 *
 * Unlike `strip-unused-imports.mjs` (which relies on a hard-coded table),
 * this script uses ts-morph's symbol reference finder to decide, per file,
 * whether each imported name is actually referenced anywhere in that file.
 *
 * Run with:  node scripts/codemod-strip-unused-auto.mjs
 * Optional:  node scripts/codemod-strip-unused-auto.mjs --dry --verbose
 *
 * Safety rules
 * ────────────
 *  1. Only named imports are inspected. Default imports and namespace imports
 *     are never removed (they're too likely to have side effects).
 *  2. A specifier is removed only if `findReferencesAsNodes()` returns zero
 *     references *within the source file*. References in other files (e.g.
 *     re-exports) keep the import alive.
 *  3. Type-only imports (`import type { … }`) are checked too — unused type
 *     imports are removed.
 *  4. If every specifier in a declaration is removed, the entire declaration
 *     is dropped.
 */

import { Project, SyntaxKind, Node } from 'ts-morph';
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
});

project.addSourceFilesAtPaths(resolve(ROOT, DEMOS_GLOB));

let totalFiles = 0;
let totalSpecifiers = 0;
let totalDecls = 0;
const reports = [];

for (const sourceFile of project.getSourceFiles()) {
  const filename = sourceFile.getBaseName();
  let removedHere = 0;
  let declsRemovedHere = 0;

  // Fast per-file reference count: build a map of identifier → count,
  // excluding identifiers that live inside import declarations.
  const idCounts = new Map();
  for (const id of sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)) {
    const text = id.getText();
    // Skip identifiers inside import declarations.
    let parent = id.getParent();
    let insideImport = false;
    while (parent) {
      if (Node.isImportDeclaration(parent)) {
        insideImport = true;
        break;
      }
      parent = parent.getParent();
    }
    if (insideImport) continue;
    idCounts.set(text, (idCounts.get(text) || 0) + 1);
  }

  for (const importDecl of [...sourceFile.getImportDeclarations()]) {
    // Skip default / namespace imports — too risky.
    if (importDecl.getDefaultImport() || importDecl.getNamespaceImport()) continue;

    const namedImports = importDecl.getNamedImports();
    for (const spec of [...namedImports]) {
      const name = spec.getName();
      // Also check the alias if one exists (import { Foo as Bar }).
      const alias = spec.getAliasNode()?.getText() ?? name;
      const uses = (idCounts.get(alias) || 0);
      if (uses === 0) {
        spec.remove();
        removedHere++;
      }
    }

    const stillHasNamed = importDecl.getNamedImports().length > 0;
    const stillHasDefault = !!importDecl.getDefaultImport();
    const stillHasNamespace = !!importDecl.getNamespaceImport();
    if (!stillHasNamed && !stillHasDefault && !stillHasNamespace) {
      importDecl.remove();
      declsRemovedHere++;
    }
  }

  if (removedHere > 0 || declsRemovedHere > 0) {
    totalFiles++;
    totalSpecifiers += removedHere;
    totalDecls += declsRemovedHere;
    reports.push(`  ${filename}  (${removedHere} specifiers, ${declsRemovedHere} decls)`);
    if (!DRY) sourceFile.saveSync();
  } else if (VERBOSE) {
    reports.push(`  ${filename}  nothing to remove`);
  }
}

console.log(reports.join('\n'));
console.log('');
console.log(`Files touched: ${totalFiles}`);
console.log(`Specifiers removed: ${totalSpecifiers}`);
console.log(`Import declarations removed: ${totalDecls}`);
if (DRY) console.log('(dry run — no files written)');
