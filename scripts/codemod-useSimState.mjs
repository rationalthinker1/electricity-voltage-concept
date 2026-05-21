/* eslint-disable */
/**
 * AST codemod: replace manual useRef + useEffect state-ref bridges with
 * the centralised useSimState hook.
 *
 * Run with:  node scripts/codemod-useSimState.mjs
 * Optional:  node scripts/codemod-useSimState.mjs --write
 *
 * What it migrates
 * ────────────────
 *   const stateRef = useRef({ a, b, c });
 *   useEffect(() => { stateRef.current = { a, b, c }; }, [a, b, c]);
 *
 * into:
 *   const stateRef = useSimState({ a, b, c });
 *
 * Safety rules
 * ────────────
 *  1. The useRef initializer and the useEffect RHS must be structurally
 *     identical (same property names in the same order).
 *  2. The useEffect must have exactly one statement in its body.
 *  3. If the useEffect updates other refs or has side effects, we skip.
 *  4. We only match when the useRef variable is named `stateRef`.
 */

import { Project, SyntaxKind, Node } from 'ts-morph';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const DEMOS_GLOB = 'src/textbook/demos/*.tsx';
const WRITE_MODE = process.argv.includes('--write');
const VERBOSE = process.argv.includes('--verbose');

const project = new Project({
  tsConfigFilePath: resolve(ROOT, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

project.addSourceFilesAtPaths(resolve(ROOT, DEMOS_GLOB));

let totalFiles = 0;
let totalMigrations = 0;
const skipped = [];

for (const sourceFile of project.getSourceFiles()) {
  const filename = sourceFile.getBaseName();
  let migratedHere = 0;

  // Find all useRef declarations named 'stateRef'.
  for (const decl of sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
    if (decl.getName() !== 'stateRef') continue;

    const init = decl.getInitializer();
    if (!init || !Node.isCallExpression(init)) continue;
    if (init.getExpression().getText() !== 'useRef') continue;

    const refArgs = init.getArguments();
    if (refArgs.length !== 1) continue;
    const initObject = refArgs[0].getText();

    // Find the matching useEffect that updates stateRef.current.
    const effectStmt = findMatchingUseEffect(sourceFile, decl);
    if (!effectStmt) {
      skipped.push(`${filename}:${decl.getStartLineNumber()} (no matching useEffect)`);
      continue;
    }

    // Validate the useEffect body is a single assignment to stateRef.current.
    const effectCall = effectStmt.getExpression();
    if (!Node.isCallExpression(effectCall)) continue;
    const effectArgs = effectCall.getArguments();
    if (effectArgs.length < 1) continue;

    const callback = effectArgs[0];
    const callbackBody = Node.isArrowFunction(callback)
      ? callback.getBody()
      : Node.isFunctionExpression(callback)
        ? callback.getBody()
        : null;
    if (!callbackBody) continue;

    const block = callbackBody.asKind(SyntaxKind.Block);
    if (!block) continue;

    const stmts = block.getStatements();
    if (stmts.length !== 1) {
      skipped.push(`${filename}:${decl.getStartLineNumber()} (useEffect body has ${stmts.length} stmts)`);
      continue;
    }

    const innerStmt = stmts[0];
    if (!Node.isExpressionStatement(innerStmt)) continue;
    const innerExpr = innerStmt.getExpression();
    if (!Node.isBinaryExpression(innerExpr)) continue;
    if (innerExpr.getOperatorToken().getKind() !== SyntaxKind.EqualsToken) continue;

    const lhs = innerExpr.getLeft();
    if (!Node.isPropertyAccessExpression(lhs)) continue;
    if (lhs.getExpression().getText() !== 'stateRef') continue;
    if (lhs.getName() !== 'current') continue;

    const rhs = innerExpr.getRight().getText();
    // Accept either direct replacement or spread-merge.
    const isMatch = rhs === initObject || rhs.includes('stateRef.current');
    if (!isMatch) {
      skipped.push(`${filename}:${decl.getStartLineNumber()} (rhs mismatch)`);
      continue;
    }

    if (WRITE_MODE) {
      // Remove the useEffect statement.
      effectStmt.remove();
      // Replace the useRef call with useSimState.
      decl.setInitializer(`useSimState(${initObject})`);
      ensureUseSimStateImport(sourceFile);
      sourceFile.saveSync();
    }

    migratedHere++;
  }

  if (migratedHere > 0) {
    totalFiles++;
    totalMigrations += migratedHere;
    console.log(`  ${filename}  ${migratedHere} migrations`);
  }
}

console.log('');
console.log(`Files touched: ${totalFiles}`);
console.log(`Total migrations: ${totalMigrations}`);
console.log(`Skipped sites: ${skipped.length}`);
if (VERBOSE && skipped.length) {
  console.log('');
  console.log('Skipped sites:');
  skipped.forEach((s) => console.log('  ' + s));
}
if (!WRITE_MODE) console.log('(dry run — no files written)');

// ─── Helpers ────────────────────────────────────────────────────────────────

function findMatchingUseEffect(sourceFile, stateRefDecl) {
  const varStmt = stateRefDecl.getVariableStatement();
  if (!varStmt) return null;

  // Look for a useEffect call in the same block that references stateRef.current.
  const block = varStmt.getParent();
  if (!Node.isBlock(block) && !Node.isSourceFile(block)) return null;

  const statements = block.getStatements();
  const varIdx = statements.indexOf(varStmt);
  if (varIdx < 0) return null;

  for (let i = varIdx + 1; i < statements.length; i++) {
    const stmt = statements[i];
    if (!Node.isExpressionStatement(stmt)) continue;
    const expr = stmt.getExpression();
    if (!Node.isCallExpression(expr)) continue;
    if (expr.getExpression().getText() !== 'useEffect') continue;
    const text = expr.getText();
    if (text.includes('stateRef.current')) return stmt;
  }
  return null;
}

function ensureUseSimStateImport(sourceFile) {
  const existing = sourceFile.getImportDeclaration((d) => {
    return d.getModuleSpecifierValue() === '@/lib/useSimState';
  });
  if (existing) return;

  const allImports = sourceFile.getImportDeclarations();
  let insertIdx = allImports.length;
  for (let i = 0; i < allImports.length; i++) {
    const spec = allImports[i].getModuleSpecifierValue();
    if (spec.startsWith('@/lib/') && spec > '@/lib/useSimState') {
      insertIdx = i;
      break;
    } else if (spec.startsWith('@/lib/')) {
      insertIdx = i + 1;
    }
  }

  sourceFile.insertImportDeclaration(insertIdx, {
    moduleSpecifier: '@/lib/useSimState',
    namedImports: ['useSimState'],
  });
}
