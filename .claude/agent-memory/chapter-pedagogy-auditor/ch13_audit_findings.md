---
name: ch13-audit-findings
description: Patterns and traps encountered auditing Ch13NetworkAnalysis.tsx (network analysis methods)
metadata:
  type: project
---

## Rule A — Three-tier findings

**Procedural-method chapters need judgment.** Mesh-current and nodal analysis are *procedures*, not
foundational physical quantities — they don't have a classic intuition/formal/operational structure.
The chapter handles this correctly by opening each section with a conceptual rationale before writing
equations. No Rule A violation for procedural methods.

**Norton/Thévenin equivalents — MED.** The Thévenin theorem is referenced as already presented in
Ch.12 ("Thévenin's theorem (Ch.12) compresses…" at L521). The intuition tier for Norton is given via
a V-I straight-line geometric argument (L534–549), which is solid. The formal defining formula
(I_N = V_Th/R_Th, L530–532) has no "where" paragraph — Rule B violation — but the tier ordering is
reasonable given Ch.12 backstory.

**Norton I_N formula (L530–532) — no "where" paragraph at all.** The following paragraph
(L533–549) explains the derivation conceptually but never defines I_N, R_Th, or R_N with names and
SI units in the canonical "where" format. Clearest Rule B hit in the chapter.

## Rule B — Formula glossary

**L122–124:** `# equations = (N−1)_KCL + (B−N+1)_KVL = B` — no "where" paragraph. Symbols N, B
are defined in surrounding prose via Term popovers but not in a "where" paragraph immediately
after the formula. MED.

**L238–239 (mesh KVL system):** Two formula lines for the mesh equations — the following paragraph
(L240–252) explains them qualitatively but does not define R₁, R₂, R₃, I₁, I₂, V₁, V₂ with SI
units in canonical "where" format. MED.

**L343–344 (nodal KCL):** Same pattern — no "where" paragraph defining V_A, R₁, R₂, R₃, V₁, V₂
with units. MED.

**L530–532 (Norton I_N):** No "where" paragraph; HIGH.

**L748–759 (Y-Δ formulas, three Formula blocks):** Following paragraph (L760–774) explains the
derivation but does not define R_AB, R_BC, R_CA, R_a, R_b, R_c with SI units. MED.

**L854–856 (P_L formula):** Following paragraph (L858–867) refers to R_L, P_L but doesn't define
V_Th or R_S with units. MED.

**L873–876 (P_L,max formula):** Following paragraph (L877–887) refers to R_S, V_Th but doesn't
provide canonical "where" paragraph with SI units. MED.

## Rule C — Demo-framing prose

**L779 paragraph before YDeltaTransformDemo (L782):** "The algebra is unilluminating; the demo
below confirms the equivalence numerically." — pure UI-framing sentence embedded at end of physics
paragraph. Consider moving to caption.

**L593–598 paragraph after NortonTheveninDemo:** "The demo's three panels — original, Thévenin,
Norton — drive an identical load…" — this is a post-demo framing paragraph that points at the demo
UI ("three panels"). Could live in caption. LOW.

## Traps / patterns

**Pattern confirmed from Ch.11:** Term popovers define quantities (branch, node, loop, mesh current,
nodal voltage, Y, Δ) without narrative Formula blocks. These do not trigger Rule B grep hits but
can substitute for the formal tier. In Ch.13 this is mostly acceptable because these are procedural
concepts, not foundational physical quantities.

**New pattern:** Procedural method chapters (mesh, nodal, Norton, Y-Δ) use a "motivation paragraph
+ equations" structure rather than intuition/formal/operational tiers. This is correct and should
NOT be flagged as Rule A violations.
