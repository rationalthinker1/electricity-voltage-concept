#!/usr/bin/env node
/**
 * Remove dead canvas text-property setters.
 *
 * After fillText → drawLabel migration, many blocks still have
 *   ctx.fillStyle = …; ctx.font = …; ctx.textAlign = …; ctx.textBaseline = …;
 * preambles that are now dead because drawLabel uses save/restore.
 *
 * This script scans each block for ctx.font / ctx.textAlign / ctx.textBaseline
 * assignments. A setter is removed only when we can prove it's dead:
 *   – The block contains no ctx.fillText / ctx.strokeText / ctx.measureText calls.
 *   – For ctx.fillStyle, we only remove it when it appears in a contiguous
 *     text-preamble cluster (fillStyle + font + align + baseline) and there
 *     are no ctx.fill() / ctx.fillRect() calls after it that might use it.
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

function isCtxPropAssignment(stmt, propName) {
  if (stmt.getKind() !== SyntaxKind.ExpressionStatement) return null;
  const expr = stmt.getExpression();
  if (expr.getKind() !== SyntaxKind.BinaryExpression) return null;
  if (expr.getOperatorToken().getText() !== '=') return null;
  const left = expr.getLeft();
  if (left.getKind() !== SyntaxKind.PropertyAccessExpression) return null;
  const obj = left.getExpression();
  if (!obj || obj.getText() !== 'ctx') return null;
  if (left.getName() !== propName) return null;
  return true;
}

function hasCanvasTextCall(block) {
  const calls = block.getDescendantsOfKind(SyntaxKind.CallExpression);
  for (const ce of calls) {
    const callee = ce.getExpression();
    if (callee.getKind() !== SyntaxKind.PropertyAccessExpression) continue;
    if (callee.getExpression().getText() !== 'ctx') continue;
    const name = callee.getName();
    if (name === 'fillText' || name === 'strokeText' || name === 'measureText') {
      return true;
    }
  }
  return false;
}

function hasFillRectOrFillAfter(stmt, blockStmts) {
  const idx = blockStmts.indexOf(stmt);
  if (idx < 0) return false;
  for (let i = idx + 1; i < blockStmts.length; i++) {
    const s = blockStmts[i];
    if (s.getKind() !== SyntaxKind.ExpressionStatement) continue;
    const expr = s.getExpression();
    if (expr.getKind() !== SyntaxKind.CallExpression) continue;
    const callee = expr.getExpression();
    if (callee.getKind() !== SyntaxKind.PropertyAccessExpression) continue;
    if (callee.getExpression().getText() !== 'ctx') continue;
    const name = callee.getName();
    if (name === 'fillRect' || name === 'fill') return true;
  }
  return false;
}

/* ── main processing ─────────────────────────────────────────────────── */

const files = globSync(DEMO_GLOB, { cwd: PROJECT_ROOT, absolute: true });
let totalRemoved = 0;
const touchedFiles = new Set();

const project = new Project({ tsConfigFilePath: resolve(PROJECT_ROOT, 'tsconfig.json') });

for (const filePath of files) {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) continue;

  let fileRemoved = 0;

  const funcs = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
    .concat(sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction))
    .concat(sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression));

  for (const func of funcs) {
    const body = func.getBody();
    if (!body || body.getKind() !== SyntaxKind.Block) continue;

    const blocks = [body, ...body.getDescendantsOfKind(SyntaxKind.Block)];

    for (const block of blocks) {
      // Skip blocks that still have raw canvas text calls
      if (hasCanvasTextCall(block)) continue;

      const stmts = block.getStatements();
      const toRemove = [];

      for (let i = 0; i < stmts.length; i++) {
        const stmt = stmts[i];

        // Always safe to remove font / textAlign / textBaseline when no raw text calls remain
        if (isCtxPropAssignment(stmt, 'font') ||
            isCtxPropAssignment(stmt, 'textAlign') ||
            isCtxPropAssignment(stmt, 'textBaseline')) {
          toRemove.push(i);
          continue;
        }

        // For fillStyle, only remove when we can prove it's safe:
        // it must be immediately followed by drawLabel calls that ALL
        // have an explicit `color` property (so the fillStyle is unused).
        if (isCtxPropAssignment(stmt, 'fillStyle')) {
          let safe = true;
          let foundConsumer = false;

          for (let j = i + 1; j < stmts.length; j++) {
            const s = stmts[j];

            // Another fillStyle assignment shadows this one
            if (isCtxPropAssignment(s, 'fillStyle')) break;

            // Control-flow boundaries break the chain
            const sk = s.getKind();
            if ([SyntaxKind.IfStatement, SyntaxKind.ForStatement, SyntaxKind.WhileStatement,
                 SyntaxKind.SwitchStatement].includes(sk)) break;

            // Check if this is a drawLabel/drawCaption/etc. call
            if (s.getKind() === SyntaxKind.ExpressionStatement) {
              const expr = s.getExpression();
              if (expr.getKind() === SyntaxKind.CallExpression) {
                const callee = expr.getExpression();
                if (callee.getKind() === SyntaxKind.PropertyAccessExpression &&
                    callee.getExpression().getText() === 'ctx' &&
                    callee.getName() === 'fillText') {
                  safe = false;
                  break;
                }
                const calleeText = callee.getText();
                if (calleeText === 'drawLabel' || calleeText === 'drawCaption' ||
                    calleeText === 'drawLabeledValue' || calleeText === 'drawLegend') {
                  foundConsumer = true;
                  const args = expr.getArguments();
                  if (args.length >= 2) {
                    const opts = args[1];
                    const optsText = opts.getText();
                    // Does the options object have an explicit `color` key?
                    if (!/\bcolor\s*:/.test(optsText)) {
                      safe = false;
                      break;
                    }
                  }
                }
              }
            }
          }

          if (safe && foundConsumer && !hasFillRectOrFillAfter(stmt, stmts)) {
            toRemove.push(i);
          }
        }
      }

      if (toRemove.length === 0) continue;

      if (WRITE_MODE) {
        // Remove in reverse index order
        for (let k = toRemove.length - 1; k >= 0; k--) {
          stmts[toRemove[k]].remove();
        }
      }

      fileRemoved += toRemove.length;
    }
  }

  if (fileRemoved > 0) {
    touchedFiles.add(filePath);
    totalRemoved += fileRemoved;
  }
}

if (WRITE_MODE) {
  await project.save();
}

console.log(`Files touched: ${touchedFiles.size}`);
console.log(`Setters removed: ${totalRemoved}${DRY_FLAG}`);
