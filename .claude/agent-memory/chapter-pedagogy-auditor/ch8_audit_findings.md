---
name: ch8-audit-findings
description: Patterns and traps encountered auditing Ch8EnergyFlow.tsx (energy-flow / Poynting capstone)
metadata:
  type: project
---

## Rule A — Three-tier findings

**Poynting vector S — PASS.** Intuition tier: BatteryBulbFieldsDemo (L83) + WhereDoesEnergyFlowDemo (L101) + surrounding prose ("energy moving through the space around the copper") — fully non-mathematical. Formal tier: `<Formula id="poynting-vector" />` at L190 with complete glossary. No separate "operational" tier needed for a field-quantity like S; the surface-integral application at L240–L270 functions as the compute-with-it derivation.

**Pattern:** Field quantities (S, E, B) that have no separate "engineer's shortcut" form don't need three distinct tiers. The intuition → formal → derivation path satisfies Rule A. Operational tier is most salient for scalar circuit quantities (V, I, R, C, L, Z) that have both a field definition and a practical circuit formula.

## Rule B — Formula glossary

All nine narrative-prose Formulas have complete where-paragraphs:
- L127 E=V/L, L147 B=μ₀I/(2πa), L190 Poynting vector, L240 |S|_surf, L263 ∮S·dA=VI
- L858 Poynting's theorem PDE (inside FAQ), L900 ⟨S⟩ AC formula (inside FAQ)
- L970 |S|_surf identity (inside FAQ), L1037 u=½ε₀E²+B²/(2μ₀) (inside FAQ)

Eight TryIt-body Formulas (L365, L370, L403, L513, L517, L524, L554, L589) all confirmed exempt.

**Pattern:** FAQ FAQItem bodies contain narrative Formulas that need where-paragraphs. Check them — they are narrative prose, not TryIt answers. Ch8 happens to be clean on this.

## Rule C — Demo-framing prose

- L319–L323: HIGH — pure UI framing after PoyntingInflowDemo ("The 'P_surf / P_VI = 1.000' readout in the demo above…Move any slider you like"). Should move into PoyntingInflowDemo's caption prop.
- L325–L333: MED — mixed paragraph before PoyntingCoax3DDemo. First sentence ("That demo collapses the geometry into a flat side-view…Spin the next one") is UI framing; remainder is load-bearing coax physics. Split: framing sentence to caption, physics stays.

## Traps / patterns

- A paragraph *after* a demo (not before the next one) that references "the demo above" but makes a physics argument is NOT a Rule C violation. The test is whether the paragraph is primarily UI-framing vs. physics-advancing, not just whether it mentions a demo.
- "Spin the next one" is a strong deictic signal for Rule C — but check if the same sentence also introduces new physics. If yes, the finding is MED (split), not HIGH (move wholesale).
- This is a synthesis/capstone chapter — fewer than 10 Terms is expected and not flagged (per audit instructions).
