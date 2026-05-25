---
name: ch17-materials-audit-findings
description: Findings from Rule A/B/C audit of Ch17Materials.tsx (materials chapter)
metadata:
  type: project
---

## Key findings from Ch17 audit

### Rule A trap — Term-popover-only definitions
Polarization (P), permittivity (ε), and permeability (μ) are first introduced as `<Term>` popover
definitions rather than as narrative three-tier sequences. The formal definition of P (volume
density of electric dipole moment, SI unit C/m²) lives only inside a `<Term def={…}>` at L133.
The intuition tier is present via prose (L116–123) and DipoleInFieldDemo (L125) but the formal
definition never appears as a standalone narrative paragraph before the operational formula at L164.

**Why this matters:** The three-tier order rule requires intuition → formal → operational in
*narrative prose*. A `<Term>` popover is hover/tap-only — readers who don't hover miss the formal
definition entirely. The formal tier must appear as visible prose.

### Rule B clean — FAQ Formulas
The Clausius–Mossotti formula at L1215 is inside a `<FAQItem>`, not a TryIt, so it IS subject to
Rule B — but it has a proper "where" paragraph at L1218–1224. Clean.

### Rule C pattern — physics-forward paragraphs before demos are NOT flagged
L240–243 ("Here is the cleanest demonstration: put a slab…") sits before DielectricBetweenPlatesDemo
but frames the demo via a physics statement, not UI framing — correctly NOT flagged.
L407–413 (after ImageChargeField3DDemo) says "Drag the scene to orbit" but comes AFTER the demo, not
before it — Rule C only applies to paragraphs *before* a demo.

### Watch: paragraphs before demos that mix physics and UI framing
The paragraph at L221–236 (after DipoleAlignment3DDemo, before DielectricBetweenPlates h2) is
post-demo prose — not a Rule C candidate.

