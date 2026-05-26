---
name: ch9-audit-findings
description: Patterns and findings from auditing Ch9EMWaves.tsx for three-tier order, formula glossaries, and demo-framing prose.
metadata:
  type: project
---

## Key findings

### Rule A
- Ch9 introduces the **wave equation** (∇²E = μ₀ε₀ ∂²E/∂t²) with no intuition tier before the PDE. The chapter argues from Poynting conservation → curl equations → PDE, but no non-mathematical analogy (e.g. string on a clothesline, ripple on a pond) precedes the formal tier.
- The SpeedOfLightDemo (Fig. 9.1) appears *after* all the wave-equation math (L202), not before.
- Free-space impedance (Z₀ = 377 Ω) is never named or introduced — not a three-tier failure but a notable gap for a chapter on EM waves.

### Rule B
- All narrative Formula blocks (L88, L146, L158, L170, L266, L289, L433, L473, L495, L505, L535) have complete "where" paragraphs. Chapter is clean on glossaries.

### Rule C
- L458–467 paragraph before WireToAntennaTransition3DDemo: last sentence ("The next demo holds the wire ... in real time") is UI framing; rest of the paragraph is substantive physics. This is a split case — last sentence should move to demo caption; physics sentences stay.

## Patterns to generalise
- Physics-forward chapters that derive quantities algebraically from first principles often skip the intuition tier entirely: the formal derivation *is* the argument. Flag this consistently — the intuition tier rule applies even when the derivation is clean.
- A demo placed *after* the formal derivation it exercises does not substitute for an intuition tier before the math.
- "The next demo..." framing at the end of a physics paragraph is a reliable Rule-C signal for a split case.

**Why:** matches the CLAUDE.md §6 three-tier rule and Rule C deictic test.
**How to apply:** in derivation-heavy chapters (Ch9, Ch10, Ch11), specifically check whether any non-mathematical picture precedes the wave equation / Maxwell equation tier.
