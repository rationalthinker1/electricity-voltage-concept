---
name: ch29-audit-findings
description: Fact-check audit of Ch.29 House Branch Circuits (house-branch-circuits), 2026-05-26
metadata:
  type: project
---

Audit date: 2026-05-26. Lint: CLEAN (no H1–H5 findings). Arithmetic: mostly clean with minor opening-paragraph rounding.

## HIGH (BLOCKER)

1. **line 1184–1185**: AFCI detection principle cited to `nfpa-70e-2024`. NFPA 70E is workplace electrical safety (arc-flash PPE), not AFCI breaker technology. Correct source is `nec-2023` (210.12) or UL 1699. **Misaligned cite.**

2. **line 245–246**: NM-B replaced older 60°C NM cable "in 1984" — specific year claim cited only to `nec-2023`. The 2023 code text does not document when the NM-B 90°C rating was introduced. **Misaligned cite** (year attribution the current code doesn't contain). Remedy: soften to "when the NEC revised its cable-insulation ratings to require 90 °C insulation in NM-B" and keep the `nec-2023` cite.

3. **lines 496–498**: "aluminium gives the needed ampacity with less cost and easier handling" — cited to `nec-2017-aluminum` (CPSC Pub #516 on aluminum wiring fire hazards). CPSC #516 does not address conductor cost or weight comparisons. **Misaligned cite.** Remedy: soften claim or cite a general engineering reference; CPSC fire-hazard publication is not the right source for a cost/weight claim.

## MED

4. **lines 511–514**: Thermal expansion coefficients — "Aluminium's coefficient of thermal expansion is about 23 ppm/K — almost double brass's 19 ppm/K" — **no `<Cite />` tag**. Both numbers appear mid-paragraph before the paragraph-closing cite at line 520. The cite at 520 (`nec-2017-aluminum`) backs the failure-mode narrative, not the specific CTE values. Remedy: `codata-2018` does not cover CTE; cite `crc-resistivity` (CRC Handbook covers thermal properties) or soften the values to "roughly double that of brass."

5. **lines 578–581**: Kitchen appliance wattages — "toaster pulls ~1100 W, a microwave 1200 W, a coffee maker 1100 W, an electric kettle 1500 W" — **no `<Cite />`**. These are typical spec values and serve to justify the 2× 20A circuit requirement. The NEC rationale appears in NEC 2023's informational notes but specific appliance wattages are not there. Remedy: add `nec-2023` with a note that these are typical values consistent with the NEC rationale, or soften to "typical high-power kitchen loads can pull 1000–1500 W each."

6. **line 1162**: "NEC 406.12 has, since 2008, required tamper-resistant receptacles" — "2008" is a specific historical year; `nec-2023` is the only cite. NEC 2023 requires TR per 406.12 but does not state when the requirement was introduced. Remedy: drop the year ("NEC 406.12 requires tamper-resistant receptacles in essentially all readily-accessible receptacles") or add a cite that documents the 2008 adoption.

## LOW / NOTE

7. **Opening paragraph (line 59–62)**: "round-trip resistance through 48 m of 14 AWG copper is about 0.41 Ω" — arithmetic is sound at 75°C operating temperature (8.45 mΩ/m × 48 m = 0.406 Ω ≈ 0.41 Ω), and "~41 W" follows (40.6 W). No cite on the resistance value itself; the cite comes only in the formula explanation at line 98–99. The opening paragraph pre-empts the formula, so the specific resistance number is effectively uncited in the hook paragraph. The cite at line 98 (`codata-2018`) backs the resistivity used to derive it. Marginal — leave as-is or add a forward-reference.

8. **lines 1139–1140**: "below 1.4 m above the floor" for NM-B protection threshold — NEC 334.15 uses different thresholds for different protection requirements; the specific "1.4 m" conversion may be slightly off (some provisions use 7 ft = 2.13 m, some use 5 ft = 1.52 m). Low-severity; the cite to `nec-2023` stands, and this is a metric conversion rather than a numerical fabrication.

9. **line 1149**: "stapled within 300 mm of every box and at intervals not exceeding 1.4 m" — NEC 334.30 uses 12 in = 304.8 mm (close enough) and 4.5 ft = 1.37 m (not 1.40 m). Marginal rounding; not a factual error.

## Arithmetic verified clean

All voltage-drop calculations, % values, 80%-rule math, EGC sizing, Try 29.1–29.5 all check out.

**Why:** Applied-track chapter; well-sourced for NEC provisions; main issues are three misaligned cites (NFPA 70E for AFCI, CPSC for Al cost, NEC 2023 for 1984 date) and two unsourced numerical-values paragraphs (CTE values, appliance wattages).
