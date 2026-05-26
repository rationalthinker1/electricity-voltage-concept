---
name: ch26-modern-batteries-audit-findings
description: Pedagogy audit findings for Ch26ModernBatteries.tsx (Modern batteries)
metadata:
  type: project
---

## Rule A
- **Energy density / specific energy** (HIGH): used numerically throughout (L117: ~35 Wh/kg; L173; L238–239; L343) as the chapter's primary comparative metric, but never introduced as a quantity with intuition → formal → operational tiers. No analogy ("how much energy fits in a kilogram"), no formula (ρ_E = E/m), no SI-unit gloss before use.
- **C-rate** (MED): introduced only in the FAQ (L845–861) with an operational gloss and a Term popover. No intuition tier (drain-rate analogy), no formal equation (I_C = Q_rated / t_h). Important enough for its own FAQ entry; should appear in narrative with at least two tiers.

## Rule B
- Chemical half-reaction Formulas (L96–97 lead-acid; L209–215 Li-ion intercalation; L393–398 fuel cell): all use → or ⇌ arrow stoichiometric notation. Per Ch25 precedent, these are EXEMPT — symbols are inherently defined by reaction notation.
- L325: `V(t) = V₀ − (I/C)·t` — complete "where" paragraph at L328–334 defines all five symbols with SI units. CLEAN.
- All TryIt Formula blocks (L134, L233, L362, L449, L452): EXEMPT per rule.

## Rule C
- Clean. All five demo-adjacent paragraphs (before or after) are physics-forward with no deictic UI-framing language.

## Patterns / traps noted
- Chemical stoichiometric Formulas (→ / ⇌ notation) are exempt from Rule B — confirmed across Ch25 and Ch26.
- Energy density is a stealth foundational quantity in chemistry/materials chapters: it's used numerically as the chapter's central comparative axis before ever being formally introduced. Watch for this in Ch17 Materials and any future energy-storage chapters.
- FAQ-only introductions of operational quantities (C-rate here, E° tabulation in Ch25) are a recurring Rule A gap: the FAQ is not a substitute for narrative three-tier coverage.
