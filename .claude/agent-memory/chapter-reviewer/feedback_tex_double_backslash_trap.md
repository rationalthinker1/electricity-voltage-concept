---
name: tex-double-backslash-trap
description: Double-backslash in tex="..." JSX attributes silently breaks KaTeX — convention is single backslash
metadata:
  type: feedback
---

In this codebase, the canonical pattern for `<Formula tex="...">` and `<InlineMath tex="...">` is **single backslash** for TeX commands:

  tex="F = \dfrac{P}{V} \cdot \text{kW}"   ✓ renders correctly
  tex="F = \\dfrac{P}{V} \\cdot \\text{kW}"  ✗ KaTeX errors

JSX attributes in double-quoted form do NOT process JS backslash escapes — they pass the raw text. So `\\` arrives at KaTeX as two literal backslashes, and KaTeX treats `\\` as a newline / line-break command followed by `dfrac` (no leading control sequence), which either errors or renders garbage.

**Why this is a trap:** Looks identical to canonical JavaScript template-literal escaping, where you do need `\\` to produce a single `\` in the resulting string. Authors used to writing `useState\` + `useCallback` come in expecting JS string semantics and get bitten.

**How to apply:**
- Code-pattern audits should grep `tex="[^"]*\\\\\\\\[a-z]` (literal `\\` in source) and flag every match as a render breakage.
- Cross-check: pick any "known good" chapter (Ch.1, Ch.7, Ch.23 — all use single-backslash) and confirm the suspect chapter is the outlier.
- Fix is mechanical: `\\\\` → `\\` in source (each `\\foo` → `\foo` in the JSX attribute).
- Beware partial-conversion files (Ch.27 had 28 broken sites and 2 correct ones in the same file) — do per-line not per-file replacement, or be ready to re-verify the canonical sites after the sweep.

Related: [[reference-voltage-class-notation]] for the other Ch.27 trap.
