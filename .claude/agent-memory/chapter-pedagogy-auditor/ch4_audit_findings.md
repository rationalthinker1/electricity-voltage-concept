---
name: ch4-audit-findings
description: Patterns and traps encountered auditing Ch4HowAResistorWorks.tsx (how-a-resistor-works)
metadata:
  type: project
---

## Rule A — Three-tier findings

**Architectural split across chapters:** Ch4 deliberately delegates the three-tier treatment of R = ρL/A to Ch3. The chapter opens by citing Ch3 and immediately uses the formula operationally. This is NOT a Rule A violation — it is an intentional chapter-level architecture. Do not flag a chapter for omitting the three tiers of a quantity whose three-tier treatment already appeared in the immediately preceding chapter.

**Matthiessen's rule ρ(T) (L354) — MED violation:** The formal formula is introduced with no non-mathematical intuition tier before it. The prose at L345–L353 names the rule and calls it an additive decomposition but reads as a mathematical description, not a physical picture. A one-sentence intuition ("impurity scattering is fixed; phonon scattering grows as the lattice vibrates harder") before the formula would satisfy tier-1.

**Why:** The intuition tier must be non-mathematical. Naming a formula type ("decomposes additively") is still mathematical framing.

## Rule B — Formula glossary

All six narrative-prose Formula blocks (L68, L249, L354, L393, L496) have complete where-paragraphs. TryIt Formulas (L195, L279, L289, L312, L319, L522, L525) are all exempt — confirmed in TryIt answer bodies.

## Rule C — Demo-framing prose

All six demos (Fig. 4.1–4.6) are preceded by physics-forward prose. No UI-framing standalone paragraphs detected.

## Traps / patterns

- When a chapter says "In Chapter N we wrote down X" and then re-states the formula, the three-tier check applies to NEW quantities introduced in *this* chapter, not recycled ones. Recycled quantities from the prior chapter satisfy Rule A by reference.
- Matthiessen's rule is the main quantity Ch4 formally introduces. Its two sub-terms (residual, phonon) are the symbols to check in the where-paragraph — both present and correct at L355–L365.
