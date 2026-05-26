---
name: ch11-audit-findings
description: Patterns and traps encountered auditing Ch11Relativity.tsx (relativity and EM)
metadata:
  type: project
---

## Rule A — Three-tier findings

**E/B frame-mixing relations — HIGH.**
The transformation equations (E'_∥ = E_∥, E'_⊥ = γ(E + v×B)_⊥, etc.) never appear as narrative
`<Formula>` blocks anywhere in the chapter. The tensor contraction F'^μν = Λ Λ F^αβ is given only
inline in `<M>` text without a "where" paragraph. The EBTransformDemo (L310) exercises these
relations but the reader has no formula in prose to refer to. Neither intuition, formal, nor
operational tiers are presented in the three-tier pattern.

**γ (Lorentz factor) — MED.**
The definition γ = 1/√(1 − v²/c²) appears only inside a `<Term def={…}>` popover (L193–194) and
in TryIt hints (L218). There is no dedicated narrative sequence with intuition → formal `<Formula>`
→ operational use. TryIt 11.1 (L210–235) uses γ values without the reader having seen a narrative
presentation.

## Rule B — Formula glossary

Only one narrative-prose `<Formula>` block exists (L167–168): `F_magnetic (lab) = F_electric (boosted)`.
The following paragraph (L170–185) defines both sides with names and units. PASS.

All other Formulas (L222–225, 402, 429–430, 454, 482–485) are inside TryIt answer bodies — exempt.

## Rule C — Demo-framing prose

Clean. No standalone UI-framing paragraphs detected before any demo. Paragraphs before EBTransformDemo
(L308) and FieldTensorDemo (L341) are physics-forward.

## Traps / patterns

**KEY TRAP:** `<Term def={…}>` popovers can silently substitute for the formal tier of a foundational
quantity without triggering a Rule B grep hit, because they don't use `<Formula>`. A quantity whose
only formal definition lives in a popover has *no narrative tier* — it still fails Rule A. Always
check whether the first full definition of a foundational quantity is in narrative prose or buried in
a popover/hint.

**Pattern:** Highly mathematical/theoretical chapters (SR, field tensor) tend to introduce
foundational quantities through inline `<M>` text and `<Term>` popovers rather than `<Formula>`
blocks. This makes them harder to audit mechanically (grep for `<Formula>` misses them) but they
still fail Rule A if the three-tier narrative sequence is absent.
