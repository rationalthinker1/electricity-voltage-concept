---
name: ch30-audit-findings
description: Ch.30 house-switches-receptacles audit findings from 2026-05-26 — NEC article numbers, GFCI threshold, pre-1962 date
metadata:
  type: project
---

Ch.30 "Receptacles, switches, and the three-way puzzle" audit run 2026-05-26.

**Why:** Applied-track chapter (reuses earlier demos by design); focus on NEC article accuracy, NEMA ratings, GFCI threshold, dimmer formula.

**How to apply:** Use for re-audit of this chapter or as patterns to watch in other house-track chapters (Ch.27-40).

## Summary findings

Lint: CLEAN (no H1-H5 mechanical errors).

All 5 source keys (`nec-2023`, `nema-wd-6`, `ul-498`, `lutron-dimmer-app-note`, `codata-2018`) are in the registry AND in chapter.sources. No broken `<Cite>` IDs.

All arithmetic correct: NEMA max-power table, TryIt 30.1-30.5, dimmer RMS formula, 3-switch truth table.

### HIGH (BLOCKER)

**Line 1215** — `"5 mA imbalance between hot and neutral"` — no cite on the 5 mA value itself. The `nec-2023` cite at line 1219 covers only the adjacent "single layer required" claim. The 5 mA Class A GFCI trip threshold comes from UL 943, which is NOT in the source registry. Remedy: soften to "a few milliamperes" (no cite needed), OR add `ul-943` to registry.

### MED

**Line 881-882** — `"NEC 625.41 treats EV charging as a continuous load"` — NEC 625.41 covers Equipment Rating, not the continuous-load factor. The 80% continuous-load rule for EV branch circuits is in NEC 625.42 (branch circuit sizing) or 210.20(A). The answer block correctly cites `nec-2023` but the article number in the question text is wrong. Remedy: change 625.41 → 625.42.

**Line 303** — `"common in pre-1962 homes"` — specific year for NEC grounding requirement, no cite. No source in registry covers NEC 1962 history. Remedy: soften to "homes wired before the NEC required three-prong grounded outlets" (drop the year).

### LOW

**Lines 232-256** — NEMA pattern list (<ul> items: 5-15, 5-20, 6-15, 6-20, 14-30, 14-50 with ratings/voltages) has no inline `<Cite>` within the list items. The `nema-wd-6` cite appears in the immediately preceding paragraph (line 197). Per project convention this is borderline acceptable but strict reading requires inline cites on the specific numerical ratings.

## Patterns reinforced

- NEC 625.41 vs 625.42 trap: EV continuous-load rule is in 625.42 (branch circuit), not 625.41 (equipment rating). Same pattern seen in other chapters.
- "pre-YYYY homes" historical dates for NEC adoption need either a source or softening.
- GFCI 5 mA threshold: UL 943 Class A (not in registry). Always flag as uncited; soften to "a few mA" is the cheapest fix.
- Dimmer RMS formula verified: `V_rms = V_peak * sqrt(alpha/(2*pi) - sin(2*alpha)/(4*pi))` is correct.
- Three-way switch XOR formula and 3-switch truth table (4 of 8 illuminate) both verified correct.
