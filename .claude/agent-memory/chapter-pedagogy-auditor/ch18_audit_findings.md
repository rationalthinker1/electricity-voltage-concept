---
name: ch18-audit-findings
description: Patterns and traps encountered auditing Ch18Optics.tsx (Optics from EM)
metadata:
  type: project
---

## Rule A — Three-tier findings

**Refractive index — HIGH.**
Introduced at L81–86 with the formal definition `n = √εᵣ` buried entirely in a `<Term>` popover.
No intuition tier (no metaphor or analogy), no narrative `<Formula>` block for the formal definition.
The chapter jumps straight to the four boundary-condition Formula at L89.

**Brewster's angle — MED.**
Formula `θ_B = arctan(n₂/n₁)` introduced as inline `<M>` at L371 inside a running prose sentence,
with the definition in a `<Term>` popover. No intuition tier, no formal `<Formula>` block, no
three-tier narrative sequence.

## Rule B — Formula glossary

**L89–92 — HIGH.**
Boundary-condition block (`E_∥`, `B_∥/μ`, `D_⊥`, `B_⊥`) has no following "where" paragraph
defining the symbols with SI units. The following paragraph explains origins, not symbols.

All other narrative `<Formula>` blocks (Snell L117, Cauchy L277, Fresnel L345/349, thin-film L445,
double-slit L538) have complete "where" paragraphs. PASS.

Formulas inside TryIt bodies (L164, L167, L244, L247, L250, L321, L418, L502, L505, L570, L573,
L613–619) — exempt.

## Rule C — Demo-framing prose

**L142–152 — HIGH.**
Paragraph immediately before `<SnellLaw3DDemo />` is mostly UI framing ("Drag the next demo
around … tilt the camera … the canonical 2D refraction triangle pops back out"). The one physics
point (all four rays lie in a single plane of incidence) is already made in the preceding paragraph.
Belongs in SnellLaw3DDemo's `caption` prop.

## Traps / patterns

**Confirmed pattern from Ch11:** `<Term>` popovers silently substitute for formal tiers in optics
chapters too. The refractive index and Brewster's angle both had their only formal definitions inside
popovers, not in narrative `<Formula>` blocks. grep for `<Formula>` alone misses these — manual
scan of `<Term def="…">` blocks is required for foundational quantities.

**Optics-chapter pattern:** "Wave hits a wall" sections tend to introduce boundary conditions as
Formula blocks but omit "where" paragraphs because the symbols (D, μ, ∥/⊥ notation) feel
"obvious" to an author who just wrote Ch.6 and Ch.9. Flag these carefully.
