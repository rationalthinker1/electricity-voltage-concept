#!/usr/bin/env node
/**
 * Codemod: fillText → helpers (catch-all)
 *
 * The existing drawLabel/drawCaption/drawLegend codemods only handle
 * contiguous preambles.  This script does a wider backward search:
 *
 *   1. For each ctx.fillText(…), walk backward through sibling statements
 *      in the same block looking for the most recent fillStyle/font/
 *      textAlign/textBaseline assignments.
 *   2. Stop at save/restore, another fillText, loop boundaries, or a
 *      configurable look-back limit (default 25 statements).
 *   3. If all four properties are resolved to simple expressions,
 *      convert the fillText + its preamble into a single drawLabel(…)
 *      call and remove the now-redundant style setters.
 *   4. Detects top-left corner captions (x≈12, y≈12, baseline='top')
 *      and routes them to drawCaption instead.
 *
 * Safety rules (skip):
 *   – fillText inside a loop (likely axis ticks).
 *   – font string contains template literal with embedded expressions.
 *   – font uses non-standard families (STIX Two Text, etc.).
 *   – fillStyle is a method call or complex expression we can't inline.
 *   – The style setters are referenced by other statements we don't remove.
 *   – Styles are set inside a conditional block that doesn't contain the
 *     fillText (control-flow scoping).
 *
 * Run with --write to mutate files.
 */

import { Project, SyntaxKind } from 'ts-morph';
import { globSync } from 'node:fs';
import { resolve } from 'node:path';

const WRITE_MODE = process.argv.includes('--write');
const DRY_FLAG = WRITE_MODE ? '' : ' (dry run)';

const PROJECT_ROOT = resolve(process.cwd());
const DEMO_GLOB = 'src/textbook/demos/**/*.tsx';

/* ── helpers ─────────────────────────────────────────────────────────── */

const NON_STD_FONTS = /STIX Two Text|Times New Roman|serif(?!.*monospace)/i;
const FONT_SIZE_RE = /^(bold\s+)?(\d+)px\s+["']?(.+?)["']?$/;
const DEFAULT_FAMILY = '"JetBrains Mono", monospace';

function getPropertyName(node) {
  if (node.getKind() === SyntaxKind.PropertyAccessExpression) {
    return node.getName();
  }
  if (node.getKind() === SyntaxKind.ElementAccessExpression) {
    const arg = node.getArgumentExpressionOrThrow();
    if (arg.getKind() === SyntaxKind.StringLiteral) {
      return arg.getLiteralValue();
    }
  }
  return null;
}

function isCtxPropAssignment(stmt, propName) {
  if (stmt.getKind() !== SyntaxKind.ExpressionStatement) return null;
  const expr = stmt.getExpression();
  if (expr.getKind() !== SyntaxKind.BinaryExpression) return null;
  const op = expr.getOperatorToken().getText();
  if (op !== '=') return null;
  const left = expr.getLeft();
  if (left.getKind() !== SyntaxKind.PropertyAccessExpression &&
      left.getKind() !== SyntaxKind.ElementAccessExpression) return null;
  const obj = left.getExpression();
  if (!obj || obj.getText() !== 'ctx') return null;
  const name = getPropertyName(left);
  if (name !== propName) return null;
  return expr.getRight();
}

function isFillTextCall(stmt) {
  if (stmt.getKind() !== SyntaxKind.ExpressionStatement) return null;
  const expr = stmt.getExpression();
  if (expr.getKind() !== SyntaxKind.CallExpression) return null;
  const callee = expr.getExpression();
  if (callee.getKind() !== SyntaxKind.PropertyAccessExpression) return null;
  if (callee.getExpression().getText() !== 'ctx') return null;
  if (callee.getName() !== 'fillText') return null;
  const args = expr.getArguments();
  if (args.length < 3) return null;
  return { expr, args };
}

function isSaveOrRestore(stmt) {
  if (stmt.getKind() !== SyntaxKind.ExpressionStatement) return false;
  const expr = stmt.getExpression();
  if (expr.getKind() !== SyntaxKind.CallExpression) return false;
  const callee = expr.getExpression();
  if (callee.getKind() !== SyntaxKind.PropertyAccessExpression) return false;
  if (callee.getExpression().getText() !== 'ctx') return false;
  const name = callee.getName();
  return name === 'save' || name === 'restore';
}

function isLoop(node) {
  const kind = node.getKind();
  return kind === SyntaxKind.ForStatement ||
         kind === SyntaxKind.ForInStatement ||
         kind === SyntaxKind.ForOfStatement ||
         kind === SyntaxKind.WhileStatement ||
         kind === SyntaxKind.DoStatement;
}

function isSimpleExpression(node) {
  const kind = node.getKind();
  if ([
    SyntaxKind.Identifier,
    SyntaxKind.StringLiteral,
    SyntaxKind.NumericLiteral,
    SyntaxKind.TrueKeyword,
    SyntaxKind.FalseKeyword,
    SyntaxKind.NullKeyword,
    SyntaxKind.UndefinedKeyword,
  ].includes(kind)) return true;

  if (kind === SyntaxKind.PropertyAccessExpression) {
    return isSimpleExpression(node.getExpression());
  }

  if (kind === SyntaxKind.ElementAccessExpression) {
    return isSimpleExpression(node.getExpression()) &&
           isSimpleExpression(node.getArgumentExpressionOrThrow());
  }

  if (kind === SyntaxKind.NoSubstitutionTemplateLiteral) {
    return true;
  }

  if (kind === SyntaxKind.ConditionalExpression) {
    return isSimpleExpression(node.getCondition()) &&
           isSimpleExpression(node.getWhenTrue()) &&
           isSimpleExpression(node.getWhenFalse());
  }

  return false;
}

function isTopLeftCaption(args, baselineExpr, alignExpr) {
  const xArg = args[1];
  const yArg = args[2];
  if (!xArg || !yArg) return false;
  const xText = xArg.getText().trim();
  const yText = yArg.getText().trim();
  const baseline = baselineExpr ? baselineExpr.getText().replace(/['"]/g, '') : 'alphabetic';
  const align = alignExpr ? alignExpr.getText().replace(/['"]/g, '') : 'left';
  return align === 'left' && baseline === 'top' &&
         (xText === '12' || xText === '10' || xText === '14') &&
         (yText === '12' || yText === '10' || yText === '14' || yText === '8');
}

function parseFont(fontExpr) {
  if (!fontExpr) return null;
  const text = fontExpr.getText().replace(/['"]/g, '');
  const m = text.match(FONT_SIZE_RE);
  if (!m) return null;
  return {
    weight: m[1] ? 'bold' : undefined,
    size: parseInt(m[2], 10),
    family: m[3].trim(),
  };
}

function isInsideLoop(node) {
  let p = node.getParent();
  while (p) {
    if (isLoop(p)) return true;
    p = p.getParent();
  }
  return false;
}

/* ── main processing ─────────────────────────────────────────────────── */

const files = globSync(DEMO_GLOB, { cwd: PROJECT_ROOT, absolute: true });
let totalMigrations = 0;
let totalSkipped = 0;
const touchedFiles = new Set();

const project = new Project({ tsConfigFilePath: resolve(PROJECT_ROOT, 'tsconfig.json') });

for (const filePath of files) {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) continue;

  let fileMigrations = 0;
  let fileSkipped = 0;

  // Find ALL functions — nested draw() functions inside React components
  // are where the fillText calls live.
  const funcs = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
    .concat(sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction))
    .concat(sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression));

  for (const func of funcs) {
    const body = func.getBody();
    if (!body || body.getKind() !== SyntaxKind.Block) continue;

    // Collect all fillText calls in this function's body,
    // but NOT inside nested functions (those will be handled when we
    // iterate to the nested function itself).
    const fillTextCalls = [];
    const descendants = body.getDescendantsOfKind(SyntaxKind.CallExpression);
    for (const ce of descendants) {
      const callee = ce.getExpression();
      if (callee.getKind() !== SyntaxKind.PropertyAccessExpression) continue;
      if (callee.getExpression().getText() !== 'ctx') continue;
      if (callee.getName() !== 'fillText') continue;

      // Skip if inside a nested function — it will be processed when we
      // reach that nested function in the outer loop.
      let p = ce.getParent();
      let nested = false;
      while (p && p !== body) {
        if ([SyntaxKind.FunctionDeclaration, SyntaxKind.ArrowFunction, SyntaxKind.FunctionExpression].includes(p.getKind())) {
          nested = true;
          break;
        }
        p = p.getParent();
      }
      if (nested) continue;

      // Skip if inside a loop
      if (isInsideLoop(ce)) { fileSkipped++; continue; }

      // Find the containing ExpressionStatement
      let stmt = ce.getParent();
      while (stmt && stmt.getKind() !== SyntaxKind.ExpressionStatement) {
        stmt = stmt.getParent();
      }
      if (!stmt) continue;

      // Find the containing Block
      let block = stmt.getParent();
      while (block && block.getKind() !== SyntaxKind.Block) {
        block = block.getParent();
      }
      if (!block) continue;

      const stmts = block.getStatements();
      const ftIdx = stmts.findIndex(s => s === stmt);
      if (ftIdx < 0) continue;

      fillTextCalls.push({
        ftExpr: ce,
        stmt,
        block,
        stmts,
        ftIdx,
        args: ce.getArguments(),
      });
    }

    if (fillTextCalls.length === 0) continue;

    // Group by block so we can process in reverse index order per block
    const byBlock = new Map();
    for (const ft of fillTextCalls) {
      if (!byBlock.has(ft.block)) byBlock.set(ft.block, []);
      byBlock.get(ft.block).push(ft);
    }

    const migrations = []; // { stmt, replacement, sameBlockSetters: [{stmt}] }

    for (const [block, fts] of byBlock) {
      const stmts = block.getStatements();

      // ── Phase 1: trace styles for every fillText in this block ─────────
      // Don't stop at fillText calls — they don't mutate canvas state, so
      // styles above them are still active for later fillText calls.
      const traced = []; // { ftExpr, stmt, ftIdx, args, styles, sameBlockSetters }

      for (const { ftExpr, stmt, ftIdx, args } of fts) {
        const styles = { fillStyle: null, font: null, textAlign: null, textBaseline: null };
        const sameBlockSetters = [];
        const LOOKBACK_LIMIT = 30;

        for (let j = ftIdx - 1; j >= 0 && j >= ftIdx - LOOKBACK_LIMIT; j--) {
          const s = stmts[j];

          // Stop at save/restore (style scoping boundary)
          if (isSaveOrRestore(s)) break;

          // Stop at control-flow boundaries
          const sk = s.getKind();
          if ([SyntaxKind.IfStatement, SyntaxKind.ForStatement, SyntaxKind.WhileStatement,
               SyntaxKind.SwitchStatement, SyntaxKind.TryStatement, SyntaxKind.WithStatement].includes(sk)) {
            break;
          }

          for (const prop of Object.keys(styles)) {
            if (styles[prop] !== null) continue;
            const val = isCtxPropAssignment(s, prop);
            if (val) {
              if (!isSimpleExpression(val)) {
                styles[prop] = 'COMPLEX';
              } else {
                styles[prop] = val;
                sameBlockSetters.push({ index: j, stmt: s, prop, expr: val });
              }
            }
          }
        }

        // Also check parent blocks for missing styles
        let currentBlock = block;
        while (currentBlock.getParent()) {
          const parentNode = currentBlock.getParent();
          if (parentNode.getKind() === SyntaxKind.Block) {
            const parentStmts = parentNode.getStatements();
            const blockIndex = parentStmts.findIndex(s => {
              if (s === currentBlock) return true;
              return s.getDescendants().some(d => d === currentBlock);
            });
            if (blockIndex >= 0) {
              for (let j = blockIndex - 1; j >= 0 && j >= blockIndex - LOOKBACK_LIMIT; j--) {
                const s = parentStmts[j];
                if (isFillTextCall(s)) break;
                if (isSaveOrRestore(s)) break;
                const sk = s.getKind();
                if ([SyntaxKind.IfStatement, SyntaxKind.ForStatement, SyntaxKind.WhileStatement].includes(sk)) break;

                for (const prop of Object.keys(styles)) {
                  if (styles[prop] !== null && styles[prop] !== 'COMPLEX') continue;
                  const val = isCtxPropAssignment(s, prop);
                  if (val) {
                    if (!isSimpleExpression(val)) {
                      styles[prop] = 'COMPLEX';
                    } else {
                      styles[prop] = val;
                    }
                  }
                }
              }
            }
            currentBlock = parentNode;
          } else if (isLoop(parentNode)) {
            break;
          } else {
            break;
          }
        }

        traced.push({ ftExpr, stmt, ftIdx, args, styles, sameBlockSetters });
      }

      // ── Phase 2: count how many fillText calls use each setter ─────────
      // A setter is "shared" if multiple traced fillTexts reference it.
      const setterUsageCount = new Map(); // stmt -> count
      for (const t of traced) {
        for (const setter of t.sameBlockSetters) {
          const key = setter.stmt;
          setterUsageCount.set(key, (setterUsageCount.get(key) || 0) + 1);
        }
      }

      // ── Phase 3: build migrations, filtering out shared setters ─────────
      for (const t of traced) {
        const { ftExpr, stmt, args, styles } = t;
        // Only remove setters that are used by exactly this fillText
        const privateSetters = t.sameBlockSetters.filter(s => setterUsageCount.get(s.stmt) === 1);

        // Build drawLabel options
        const hasFillStyle = styles.fillStyle && styles.fillStyle !== 'COMPLEX';
        const hasFont = styles.font && styles.font !== 'COMPLEX';
        const hasAlign = styles.textAlign && styles.textAlign !== 'COMPLEX';
        const hasBaseline = styles.textBaseline && styles.textBaseline !== 'COMPLEX';

        const fontInfo = hasFont ? parseFont(styles.font) : null;

        if (fontInfo && fontInfo.family.match(NON_STD_FONTS)) {
          fileSkipped++;
          continue;
        }

        if (hasFont && styles.font.getKind() === SyntaxKind.TemplateExpression) {
          fileSkipped++;
          continue;
        }

        const textArg = args[0].getText();
        const xArg = args[1].getText();
        const yArg = args[2].getText();

        const opts = [];
        opts.push(`text: ${textArg}`);
        opts.push(`x: ${xArg}`);
        opts.push(`y: ${yArg}`);

        if (hasFillStyle) {
          const fillText = styles.fillStyle.getText();
          if (fillText !== 'colors.textDim' && fillText !== 'getCanvasColors().textDim') {
            opts.push(`color: ${fillText}`);
          }
        }

        if (fontInfo) {
          if (fontInfo.weight === 'bold') opts.push(`weight: 'bold'`);
          if (fontInfo.size !== 10) opts.push(`size: ${fontInfo.size}`);
          if (fontInfo.family !== DEFAULT_FAMILY && fontInfo.family !== 'monospace') {
            // Multi-family strings (e.g. "JetBrains Mono", monospace) can't be
            // safely round-tripped through our simple parser — inline the original.
            if (fontInfo.family.includes(',')) {
              opts.push(`font: ${styles.font.getText()}`);
            } else {
              const safeFamily = fontInfo.family.includes(' ') ? `"${fontInfo.family}"` : fontInfo.family;
              opts.push(`font: '${fontInfo.size}px ${safeFamily}'`);
            }
          }
        } else if (hasFont) {
          opts.push(`font: ${styles.font.getText()}`);
        }

        if (hasAlign) {
          const align = styles.textAlign.getText().replace(/['"]/g, '');
          if (align !== 'left') opts.push(`align: '${align}'`);
        }

        if (hasBaseline) {
          const baseline = styles.textBaseline.getText().replace(/['"]/g, '');
          if (baseline !== 'alphabetic') opts.push(`baseline: '${baseline}'`);
        }

        // Only use drawCaption if we don't need options it doesn't support
        const needsUnsupportedForCaption = (fontInfo && fontInfo.family !== DEFAULT_FAMILY && fontInfo.family !== 'monospace') ||
          (hasBaseline && styles.textBaseline.getText().replace(/['"]/g, '') !== 'top') ||
          (fontInfo && fontInfo.weight === 'bold');
        const isCaption = isTopLeftCaption(args,
          hasBaseline ? styles.textBaseline : null,
          hasAlign ? styles.textAlign : null) && !needsUnsupportedForCaption;

        const helperName = isCaption ? 'drawCaption' : 'drawLabel';
        const finalOpts = isCaption
          ? opts.filter(o => !o.startsWith('baseline:') && !o.startsWith('font:') && !o.startsWith('weight:'))
          : opts;
        const replacement = `${helperName}(ctx, { ${finalOpts.join(', ')} })`;

        migrations.push({
          stmt,
          ftExpr,
          replacement,
          sameBlockSetters: privateSetters,
        });
      }
    }

    // Apply in reverse order so indices stay valid
    // Sort by position in file (descending)
    migrations.sort((a, b) => b.stmt.getStart() - a.stmt.getStart());

    for (const m of migrations) {
      if (!WRITE_MODE) {
        fileMigrations++;
        continue;
      }

      // Remove same-block setters first (reverse index order)
      const settersToRemove = m.sameBlockSetters
        .filter(s => s.stmt.getParent() === m.stmt.getParent())
        .sort((a, b) => b.index - a.index);

      for (const setter of settersToRemove) {
        setter.stmt.remove();
      }

      // Replace fillText with helper
      m.ftExpr.replaceWithText(m.replacement);
      fileMigrations++;
    }

    // ── Phase 4: remove dead shared setters ────────────────────────────
    // If a block no longer has ANY fillText calls (converted or skipped),
    // any remaining ctx.font / fillStyle / textAlign / textBaseline
    // setters in that block are dead code.
    if (WRITE_MODE) {
      for (const [block, fts] of byBlock) {
        const stmts = block.getStatements();

        // Check if any fillText calls remain anywhere in this block
        // (including nested if/for blocks)
        const remainingFillTexts = block.getDescendantsOfKind(SyntaxKind.CallExpression)
          .filter(ce => {
            const callee = ce.getExpression();
            if (callee.getKind() !== SyntaxKind.PropertyAccessExpression) return false;
            return callee.getExpression().getText() === 'ctx' && callee.getName() === 'fillText';
          });

        if (remainingFillTexts.length > 0) continue;

        // No fillText calls remain — all style setters in this block are dead
        const deadProps = ['fillStyle', 'font', 'textAlign', 'textBaseline'];
        for (let j = stmts.length - 1; j >= 0; j--) {
          const s = stmts[j];
          for (const prop of deadProps) {
            if (isCtxPropAssignment(s, prop)) {
              s.remove();
              break;
            }
          }
        }
      }
    }
  }

  if (fileMigrations > 0 || fileSkipped > 0) {
    touchedFiles.add(filePath);
    totalMigrations += fileMigrations;
    totalSkipped += fileSkipped;

    if (WRITE_MODE && fileMigrations > 0) {
      const text = sourceFile.getText();
      const hasDrawLabel = text.includes('drawLabel');
      const hasDrawCaption = text.includes('drawCaption');

      let importDecl = sourceFile.getImportDeclaration(d =>
        d.getModuleSpecifierValue() === '@/lib/canvasLayout'
      );

      if (!importDecl && (hasDrawLabel || hasDrawCaption)) {
        const imports = [];
        if (hasDrawLabel) imports.push('drawLabel');
        if (hasDrawCaption) imports.push('drawCaption');
        // Add after existing imports (or at top if none)
        sourceFile.addImportDeclaration({
          namedImports: imports,
          moduleSpecifier: '@/lib/canvasLayout',
        });
      } else if (importDecl) {
        const existing = new Set(importDecl.getNamedImports().map(n => n.getName()));
        const toAdd = [];
        if (hasDrawLabel && !existing.has('drawLabel')) toAdd.push('drawLabel');
        if (hasDrawCaption && !existing.has('drawCaption')) toAdd.push('drawCaption');
        for (const name of toAdd) {
          importDecl.addNamedImport(name);
        }
      }
    }
  }
}

if (WRITE_MODE) {
  await project.save();
}

console.log(`Files touched: ${touchedFiles.size}`);
console.log(`Total migrations: ${totalMigrations}`);
console.log(`Skipped sites: ${totalSkipped}${DRY_FLAG}`);
