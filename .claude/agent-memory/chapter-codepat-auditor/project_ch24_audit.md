---
name: ch24-audit-findings
description: Ch24 RectifiersAndInverters codepat audit — known clean areas and confirmed bugs
metadata:
  type: project
---

Audited 2026-05-25. Chapter file: `src/textbook/Ch24RectifiersAndInverters.tsx`. Nine demos audited.

**Clean:**
- All 9 demos use `useSimState` + `useSimLoop` — no hand-rolled rAF boilerplate anywhere.
- All 9 demos have `<EquationStrip>` with live `${...}` substitution on the right side.
- No `pretty()` in `MiniReadout value=` props anywhere.
- No `toExponential()` in any TeX template — `DiodeCharacteristic` correctly imports and uses `sciTeX`.
- No `<p className="math">`, no TanStack `Link` without params.
- No local `sciTex` re-implementations.
- Chapter lint exits clean.

**Bugs confirmed:**
1. `demos/LinearRegulator.tsx:207` — `ctx.fillStyle = \`rgba(255, ${107 - heatFrac * 80}, ${42 - heatFrac * 30}, ...)\`` is a hardcoded interpolation of the accent color (#ff6b2a = 255,107,42) that bypasses the theme token. Should derive from `colors.accent` via `withAlpha` or a per-channel approach using CSS-var tokens.
2. `demos/FlybackConverter.tsx:175,177` — `'rgba(255,255,255,0.10)'` used as the "inactive" arrow fill. Hardcoded white-at-10%-opacity — will render incorrectly on light theme (near-invisible on cream background). Should use `withAlpha(colors.border, 0.4)` or `withAlpha(colors.textMuted, 0.3)` or similar theme token.

**Why:** These are both inside `useSimLoop` draw bodies — confirmed canvas `ctx.fillStyle` assignments, not slider formatters or canvas labels. Both are Rule B.5 violations.
