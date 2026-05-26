---
name: ch10-audit-findings
description: Patterns and traps encountered auditing Ch10Maxwell.tsx (maxwell)
metadata:
  type: project
---

## Rule A — Three-tier findings

**Synthesis chapter pattern:** Ch10 recaps E, B, flux, current, resistance (all from prior chapters).
The three-tier requirement applies only to NEW quantities introduced for the first time in this chapter.
The one genuinely new quantity is displacement current.

**Displacement current — MED violation:** The intuition tier is missing from chapter prose.
The Term def at L419–431 (inside a hover popover) partially functions as intuition, but a
non-mathematical analogy (e.g. "the growing E-field acts as if a current flows through the gap")
is never placed in prose before the corrected formula at L410. Chapter goes problem → formula
without a standalone non-mathematical picture.

**Why:** Term defs inside popovers do not count as the intuition tier. The tier must appear as
prose-level content before the formula.

## Rule B — Formula glossary findings

**L499–500 differential curl equations:** "where" paragraph (L501) defines ∇× as "the curl
operator" but omits SI units (V/m² for ∇×E, T/m² for ∇×B). LOW violation.

All other narrative Formula blocks have complete where-paragraphs or fall under the re-use
exemption (symbols fully defined at L75–89 and reused throughout the chapter).

**Pattern to remember:** When a chapter opens with a four-formula block (L65–74) and one shared
"where" paragraph (L75–89), that block establishes the canonical symbol definitions for all
subsequent re-statements of those same equations. Later standalone re-statements of the same
formulas (L234, L317, L395, L410) inherit those definitions and are clean.

## Rule C — Demo-framing prose

**HIGH: L141–152 before MaxwellEquations3DDemo (L154)** — pure UI framing ("The demo below is a
single rotating cubical box … Drag to orbit; pick a mode; watch the integral … match numerically").
No new physics. Belongs in MaxwellEquations3DDemo caption.

All other demo-preceding paragraphs are physics-forward. No other Rule C violations.

## Traps specific to Ch10

- Synthesis chapters introduce very few NEW quantities; the three-tier check is scoped to those.
  Do not flag E, B, flux, curl, divergence as missing three-tier treatment — all were introduced
  in prior chapters.
- Term defs (hover popovers) do NOT satisfy the intuition tier of Rule A.
- A shared "where" paragraph covering four formulas at once is a valid pattern (L75–89).
  Later re-uses of those same symbols are exempt from the re-statement requirement.
