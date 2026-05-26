---
name: ch25-batteries-audit-findings
description: Pedagogy audit findings for Ch25Batteries.tsx (How a battery works)
metadata:
  type: project
---

## Rule A
- Cell EMF / standard electrode potential: intuition tier missing. Chapter jumps straight to E° tabulation (L252) with no non-mathematical analogy or everyday gloss before the formula. Formal tier (electrochemical potential definition) also absent.
- Internal resistance: adequately covered; Term popover + narrative intro before formula.

## Rule B
- L252: `E°(Cu²⁺/Cu) = +0.34 V, E°(Zn²⁺/Zn) = −0.76 V` — no "where" paragraph defines E° as a symbol, its volt units, or the slash notation. Term popover earlier is not a glossary paragraph.
- L342: `Q = [Zn²⁺] / [Cu²⁺]` — following paragraph never defines bracket notation [X] as molar concentration (mol/L). Q was glossed in the Nernst where-paragraph but [Zn²⁺]/[Cu²⁺] symbols are new here.

## Rule C
- Clean. All demo-preceding paragraphs are physics-forward.

## Patterns / traps noted
- Chemical half-reaction Formulas (those using → arrow notation with Term popovers embedded inline) do not need "where" paragraphs — the symbols are inherently defined by the reaction notation itself. Do not flag these.
- Term popovers do NOT substitute for formula glossary paragraphs (same trap as Ch17, Ch20, Ch23).

**Why:** Term popovers define the *concept* in narrative; a "where" paragraph defines the *symbol*, its notation, and its SI units as first introduced in a formula block. These are distinct obligations.
