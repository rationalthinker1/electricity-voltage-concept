#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════════
#  Master codemod runner — tests every migration in a disposable git worktree
#  so the working tree stays clean until you review the results.
# ═══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKTREE_DIR="${REPO_ROOT}/.codemod-worktree"

# ─── CLI ─────────────────────────────────────────────────────────────────────
WRITE_FLAG=""
DRY_FLAG="--dry"
if [[ "${1:-}" == "--write" ]]; then
  WRITE_FLAG="--write"
  DRY_FLAG=""
fi

# ─── Bootstrap worktree ──────────────────────────────────────────────────────
echo "=== Setting up git worktree ==="
rm -rf "${WORKTREE_DIR}"
git worktree prune
git worktree add "${WORKTREE_DIR}" HEAD

# Link node_modules so we don't reinstall
cd "${WORKTREE_DIR}"
ln -sfn "${REPO_ROOT}/node_modules" node_modules

# Copy the current scripts into the worktree so we're testing the latest versions
cp -r "${REPO_ROOT}/scripts/"* scripts/

# ─── Run codemods in dependency order ────────────────────────────────────────
# Each script supports --dry by default and --write when you want to apply.

echo ""
echo "=== 1. refactor-demos.ts (useSimLoop migration) ==="
npx tsx scripts/refactor-demos.ts ${WRITE_FLAG} || true

echo ""
echo "=== 2. codemod-withAlpha.mjs (rgba → withAlpha) ==="
node scripts/codemod-withAlpha.mjs ${DRY_FLAG} || true

echo ""
echo "=== 3. codemod-drawHalo.mjs (inline halos) ==="
node scripts/codemod-drawHalo.mjs ${DRY_FLAG} || true

echo ""
echo "=== 4. codemod-drawLabel.mjs (isolated text preambles) ==="
node scripts/codemod-drawLabel.mjs ${DRY_FLAG} || true

echo ""
echo "=== 5. codemod-drawLabel-shared.mjs (shared text preambles) ==="
node scripts/codemod-drawLabel-shared.mjs ${DRY_FLAG} || true

echo ""
echo "=== 6. codemod-drawLabel-aggressive.mjs (separated preambles) ==="
node scripts/codemod-drawLabel-aggressive.mjs ${DRY_FLAG} || true

echo ""
echo "=== 7. codemod-drawCaption.mjs (top captions) ==="
node scripts/codemod-drawCaption.mjs ${DRY_FLAG} || true

echo ""
echo "=== 8. codemod-useSimState.mjs (useRef+useEffect bridges) ==="
node scripts/codemod-useSimState.mjs ${WRITE_FLAG} || true

echo ""
echo "=== 9. codemod-drawCurrentDots.mjs (deduplicate current dots) ==="
node scripts/codemod-drawCurrentDots.mjs ${WRITE_FLAG} || true

echo ""
echo "=== 10. codemod-annotationBox.mjs (info panels) ==="
node scripts/codemod-annotationBox.mjs ${DRY_FLAG} || true

echo ""
echo "=== 11. centralize-formatters.mjs (local fmt* → @/lib/formatters) ==="
node scripts/centralize-formatters.mjs ${WRITE_FLAG} || true

echo ""
echo "=== 12. codemod-strip-unused-auto.mjs (auto remove unused imports) ==="
node scripts/codemod-strip-unused-auto.mjs ${DRY_FLAG} || true

# ─── Type-check only the demo files ──────────────────────────────────────────
echo ""
echo "=== Type-checking src/textbook/demos ==="
npx tsc --noEmit 2>&1 | grep "src/textbook/demos" || echo "No demo type errors."

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "  Codemod run complete."
echo ""
echo "  Worktree: ${WORKTREE_DIR}"
echo ""
if [[ -n "${DRY_FLAG}" ]]; then
  echo "  This was a DRY RUN. Review the output above, then run:"
  echo "    bash scripts/run-all-codemods.sh --write"
else
  echo "  Changes were WRITTEN to the worktree."
  echo "  Diff against main:"
  echo "    git -C ${WORKTREE_DIR} diff HEAD --stat"
  echo ""
  echo "  To copy changes back to the main working tree:"
  echo "    git -C ${WORKTREE_DIR} diff HEAD > /tmp/codemods.patch"
  echo "    git -C ${REPO_ROOT} apply /tmp/codemods.patch"
fi
echo "═══════════════════════════════════════════════════════════════════════"
