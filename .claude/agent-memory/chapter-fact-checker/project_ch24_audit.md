---
name: ch24-audit-findings
description: Ch.24 Rectifiers and Inverters fact-check audit results — 2026-05-26
metadata:
  type: project
---

Chapter 24 audit completed 2026-05-26. Overall: one of the cleaner chapters in the book.

**Lint result:** clean (0 findings from chapter-lint.mjs)

**Arithmetic:** ALL 9 worked examples verified correct:
- Try 24.1: ΔV = 8.33 V ✓
- Try 24.2: ΔV = 0.83 V ✓
- Try 24.3: P_diss = 3.5 W, ΔT = 227.5 °C (prose rounds to 228 °C) ✓
- Try 24.4: Vout = 6.0 V ✓
- Try 24.5: Vout = 48 V ✓
- Try 24.6: Vout = 7.2 V, Iin = 1.5 A ✓
- Try 24.7: Ipeak = 265 A ✓
- VT = 25.85 mV at 300 K ✓
- 120 Vrms → ~170 V peak; 230 Vrms → ~325 V peak ✓
- 1/π = 0.318, 2/π = 0.636 ✓
- Linear regulator efficiency: 12→5 V wastes 58%; 24→3.3 V wastes 86% ✓

**MED findings (3):**

1. Line 165: "V_F falls about 2 mV per kelvin" — no Cite. Correct value (approximately right) but needs citation. `horowitz-hill-2015` or `shockley-1949` could cover it; soften to "a couple mV per kelvin" or add cite.

2. Lines 1043–1047, 1067–1070: Tesla Model S specs (375 V bus, 320 kW, ~15 kHz PWM, ~60 kW regen, "30% of urban driving energy recovered") — cited to `erickson-maksimovic-2020` (a 2020 Springer power-electronics textbook) which cannot carry product-specific Model S specs. No cite can fix this — these are manufacturer-specific figures. Remedy: soften ("a modern EV traction inverter may recover…") or drop the specific Model S figures.

3. Lines 1028–1029: "in 1965 it would have weighed five kilos and run at 50% efficiency" — cited to `horowitz-hill-2015`. Speculative/illustrative historical comparison. H&H doesn't document a specific 1965 product weight. Soften to "far heavier and far less efficient" or remove the specific numbers.

**LOW findings (2):**

1. Line 872: "smart inverter functionality required by IEEE 1547-2018" — prose references the standard but no `<Cite id="ieee-1547-2018">` appears here. `ieee-1547-2018` IS in the registry but NOT in chapter.sources[]. The anti-islanding FAQ cites mohan instead. Consistent pattern: IEEE 1547 referenced multiple times (lines 872, 1088, 1089, 1238) with only mohan cited; `ieee-1547-2018` should be added to sources[] and cited at line 872.

2. Line 1002: "Required by IEC 61000-3-2 for supplies above 75 W" — no cite for IEC 61000-3-2. That standard is not in the registry. Mohan covers PFC requirement generally but not the specific IEC standard threshold. Soften to "international standards require PFC for supplies above ~75 W" or add IEC 61000-3-2 to registry.

**Source alignment notes:**
- `kundur-1994-power-stability` used for Pacific DC Intertie specs (846 miles, ±500 kV, 3.1 GW, 1970) and HVDC breakeven distances (~600 km / ~50 km). Kundur covers HVDC principles and converter theory; it does not carry specific PDCI installation specs or published breakeven distances. These numbers are correct (verifiable externally) but Kundur is a loose cite. Mohan covers HVDC also. Flag as LOW.

**What's clean:**
- All source keys resolve in both registry and chapter.sources[]
- Fleming 1904 patent attribution correct
- Shockley 1949 diode equation attribution correct  
- Moll-Tanenbaum-Goldey-Holonyak 1956 SCR attribution correct
- All TryIt arithmetic clean
- IEC 61000-3-2 75 W threshold is factually correct
- Pacific DC Intertie 846 miles / ±500 kV / 3.1 GW factually correct
- Schottky VF ≈ 0.3 V, Si VF ≈ 0.7 V standard values, correctly cited to H&H

**Why:** Ch.24 citations are anchored primarily to 3 strong sources (Mohan, Erickson, H&H) which collectively cover essentially all the chapter's claims well. The main issue is manufacturer-specific EV specs cited to a general textbook.
