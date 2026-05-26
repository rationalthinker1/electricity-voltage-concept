---
name: ch28-audit-findings
description: Ch.28 (house-panel) fact-check findings — 2026-05-26
metadata:
  type: project
---

Ch.28 audit completed 2026-05-26. All `<Cite>` keys resolve (lint CLEAN, no H2). 3 HIGH / 2 MED / 2 LOW findings.

**Why:** Applied-track chapter, prose-heavy. Sources `nec-2023`, `ul-489`, `nfpa-70e-2024`, `nema-ab-1`, `square-d-qo-datasheet`, `eaton-br-datasheet`, `cpsc-fpe-stablok-1983`, `dalziel-1956`, `iec-60479-2018`, `codata-2018`, `awg-table-nec` all resolve in registry and sources[].

**How to apply:** Focus on three factual errors before shipping.

HIGH findings:
1. Line 349 — GFCI "Required since NEC 1971 in bathrooms" is wrong. NEC 1971 first required GFCI outdoors (swimming pools/construction); bathroom GFCI came in NEC 1975. Soften to "first required in NEC 1971 for outdoor and swimming-pool locations, then extended to bathrooms in NEC 1975." Cite nec-2023.
2. Line 418 — "AFCI requirement from bedrooms only (NEC 2002)" is wrong year. AFCI bedroom requirement began in NEC 1999 (§210-12). Soften to "NEC 1999" or "early 2000s." Cite nec-2023.
3. Line 1205–1208 — "A typical 25 kVA single-phase pole-pig…feeding a 200 A house" is a mismatch. A 200 A / 240 V service needs ~48 kVA transformer capacity minimum; 25 kVA serves a ~100 A service. Either change to 100 A service or change to 75–100 kVA transformer. The stated "5–10 kA" fault range is arithmetically consistent with 25 kVA / 2% / {120, 240} V, so the arithmetic is fine — the mismatch is service-size description only.

MED findings:
4. Line 317 — "at perhaps 8× rated current" for magnetic trip threshold is unsourced (no `<Cite>`). UL 489 defines a range (6–12× for residential breakers), not "8×" exactly. Soften to "roughly 6–12× rated current" and add `<Cite id="ul-489">`.
5. Lines 1205-1208 (FAQ "available fault current" item) — 2% transformer impedance stated without cite. NEC 2023 does not specify transformer impedance; this is more properly cited to IEEE Std 3001.2 or simply softened to "typical transformer impedance."

LOW findings:
6. Arc energy example (line 516) — E = 120 × 10,000 × 0.05 = 60,000 J = 60 kJ. Arithmetic is correct.
7. Try 28.5 arithmetic: R = 1.72 mΩ/m × 50 m = 0.086 Ω; ΔV = 2 × 80 × 0.086 = 13.76 V ≈ 14 V; 5.7% of 240 V. All correct.

All cite IDs resolve. `awg-table-nec`, `square-d-qo-datasheet`, `eaton-br-datasheet` all exist in registry and chapter sources[]. Split-phase phasor math correct. Arc energy arithmetic correct.
