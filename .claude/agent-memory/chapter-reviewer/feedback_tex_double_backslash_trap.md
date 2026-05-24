---
name: tex-backslash-conventions
description: Both single `\` and double `\\` work in JSX tex="…" attributes; the real trap is JS-escape-recognised characters
metadata:
  type: feedback
---

The original framing of this memory ("double backslash breaks KaTeX") was wrong. Both styles work for most TeX commands. The actual situation:

JSX attribute values in `attr="…"` form are compiled by Babel/TSC into JS string literals on the `React.createElement` call. JS string-literal escape rules then apply. So:

- `tex="\dfrac…"` — `\d` is not a recognised JS escape, so the string stays as `\dfrac…`. KaTeX gets `\dfrac…`. ✓
- `tex="\\dfrac…"` — `\\` is the JS escape for `\`, so the string collapses to `\dfrac…`. KaTeX gets `\dfrac…`. ✓ (verbose but correct)

Both produce identical KaTeX input. The Field·Theory codebase has a **mix**:
- Ch.1 (and most early chapters) uses single `\` (`tex="e = 1.602\,176\,634\times 10^{-19}"`)
- Ch.27 (and some later chapters) uses double `\\` (`tex="V_{\\text{centre}} = V_{240} \\cdot \\dfrac{Z_1}{Z_1 + Z_2}"`)

**Both render correctly.** Don't flag either as a bug.

## The actual trap

Single `\` IS broken when the next character is a recognised JS string escape:

- `\t` → TAB → `"\text{km}"` becomes `<TAB>ext{km}`, KaTeX renders garbage
- `\n` → newline → `"\nu"` becomes `<NL>u`
- `\r` → carriage return → `"\rho"` becomes `<CR>ho`
- `\b` → backspace
- `\f` → form feed
- `\v` → vertical tab
- `\u…` → unicode escape
- `\x…` → hex escape
- `\0` → null

For these, you MUST write `\\` (or use a template literal with `String.raw`). The single-`\` convention silently breaks for `\text{…}`, `\nu`, `\rho`, etc. Notably `\text{…}` is one of the most common TeX commands in the book, so files written with the single-`\` convention need to be checked: does Ch.1 use `\text{...}` anywhere with a single `\`? If yes, that line is broken.

The double-`\\` convention is **strictly safer** because it always survives whatever JS escape lookups Babel does, regardless of the next character.

## How to apply (chapter-reviewer)

- **Don't flag either `\` or `\\` style as a bug** — both work for `\dfrac`, `\cdot`, `\quad`, `\approx`, `\sigma`, etc.
- **Do flag any `\t`, `\n`, `\r`, `\b`, `\f`, `\v`, `\u`, `\x`, `\0` that appears single-backslashed in a JSX attribute string** — those are silent renderer bugs. Grep pattern: `grep -nE 'tex="[^"]*\\[tnrbfv0ux][a-zA-Z]?' <file>` and visually inspect each.
- **Do note the mix** in chapter notes ("Ch.27 uses `\\`, Ch.1 uses `\`"); flag for the codepat-auditor if it would help, but neither is the canonical project convention — they coexist.
- **For template literals (`` tex={`…`} ``)** the rule is different: JS string escapes always apply because backtick-delimited literals are JS strings, so `\\` is necessary for any backslash and `\t` will always be a tab. The codebase consistently uses `\\` in template literals; flag any single-`\` in a template literal as a real bug.

## What changed

This memory was originally written claiming `\\` "silently breaks KaTeX." That was based on a misunderstanding of where the JS-string-escape happens (it happens in the React.createElement compile, not in JSX itself). Ch.27 (which uses `\\` everywhere) renders fine; Ch.1 (which uses `\`) also renders fine. The memory has been rewritten to capture the actual rule.

Related: [[reference-voltage-class-notation]] for the other Ch.27 trap (which IS a real fact-checking gotcha).
