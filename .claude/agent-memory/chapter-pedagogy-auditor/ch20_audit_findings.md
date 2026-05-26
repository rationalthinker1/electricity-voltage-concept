---
name: ch20-audit-findings
description: Patterns and traps found auditing Ch20Motors.tsx (Motors)
metadata:
  type: project
---

## Rule A — Three-tier findings

**Torque — HIGH (L55–104).**
No intuition tier before the formula. `<Term>` popover at L87 gives dictionary gloss but that is not
a narrative intuition tier. Chapter jumps directly from prose to force-on-wire Formula at L75 and
torque Formula at L93. Need a non-mathematical analogy (wrench, steering wheel) before L75.

**Back-EMF — MED (L164–202).**
Both the intuition and the formal expression (E = NBAω) live inside a `<Term>` popover at L164–179.
Nothing in narrative prose outside the popover constitutes an intuition tier. The operational form
(E_back = k_e ω) appears only as inline `<M>` at L196, never as a `<Formula>` block.

**Synchronous speed — LOW (L354–376).**
Term popover at L355 contains the formula. Narrative Formula block at L369. The rotating-field
intuition (why the field rotates at that speed) arrives *after* the formula at L386–399. Formal
precedes intuition — reverse for compliance.

## Rule B — Formula glossary findings

**L369 — LOW.**
`n_s = 120f/p` "where" paragraph (L370–376) introduces `ω_s = 4πf/p` as an inline `<M>` without
stating units (rad/s) or giving `ω_s` a name. Strictly missing per Rule B.

All other narrative Formula blocks (L75, L93, L424) have complete "where" paragraphs. PASS.

## Rule C — Demo-framing prose

No violations found. No pure UI-framing paragraphs immediately before any demo.

## Traps / patterns confirmed

**Term-popover-as-tier trap** confirmed again in Ch20 (back-EMF, synchronous speed). This is the
third chapter where a popover silently carries both the formal equation and the informal gloss,
leaving the narrative tiers empty. Now confirmed in Ch11, Ch17, Ch18, and Ch20.

**Post-formula intuition** (synchronous speed L386–399): substantive intuition paragraph appears
*after* the formula section rather than before it. The fix is reordering, not missing content.
