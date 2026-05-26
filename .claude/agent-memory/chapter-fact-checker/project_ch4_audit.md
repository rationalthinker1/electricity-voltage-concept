---
name: project_ch4_audit
description: Chapter 4 (how-a-resistor-works) fact-check audit findings — 2026-05-25
metadata:
  type: project
---

Audit run 2026-05-25. Lint (chapter-lint.mjs) came back clean. Semantic findings below.

**Why:** Chapter 4 covers Drude-model-adjacent material (TCR, Wiedemann–Franz), component datasheets (Vishay Z-foil, CSM shunt, IEC 60062, Steinhart–Hart 1968), and several implicit numerical claims.

**Findings:**

BLOCKER (3):
1. Line 389: NTC "drops by a factor of two for every ~25°C rise" — wrong direction. With B≈3950 K (the value cited in Case 4.2 spec), the ratio is ~2.8× at 25→50°C and only reaches ~2× by 75→100°C. The claim is not cited at its location (line 389); Steinhart-Hart 1968 appears only at line 391. The cited B-constant in the same chapter contradicts the stated sensitivity. Soften to "roughly a factor of 2–3 per 25°C, becoming closer to 2× at higher temperatures."

2. Line 993 (FAQ): "wide temperature range (−200 to +650 °C)" for standard Pt100 RTDs — understates the IEC 60751 standard upper limit of +850 °C. No cite. Soften to "-200 to +850 °C" or add a cite.

3. Line 611 (Case 4.1 spec): "manganin or Cu-Mn-Sn metal strip" cited to `kanthal` — Kanthal datasheet covers nichrome (NiCr alloys) and Kanthal heating alloys, NOT manganin. This is a misaligned cite. Better: cite `horowitz-hill-2015` which describes precision current shunts, or soften the material spec.

MED (3):
4. Line 378: manganin described as "original reason for its existence as the alloy of the bench-standard resistor box" cited to `kanthal`. Kanthal docs cover nichrome, not manganin. The history of manganin (developed ~1889 for resistance standards) is not in the Kanthal datasheet. Cite `horowitz-hill-2015` instead or remove the historical claim.

5. Line 884 (FAQ): "alloy [manganin] was developed in the 1880s specifically for resistance standards" cited to `kanthal`. Same misalignment — kanthal doesn't cover manganin history. Move cite to `horowitz-hill-2015`.

6. Lines 683-688 (Case 4.2 prose): CPU throttle threshold "~95 °C" and shutdown "~105 °C" are uncited. These are specific numerical claims about microprocessor firmware behavior. Either soften ("typical thermal management thresholds") or add a cite.

NUMBERS — all OK:
- L₀ = 2.44×10⁻⁸ W·Ω·K⁻²: matches CODATA.
- Cu TCR 3900 ppm/K → ~0.4%/K: correct.
- W TCR ~4500 ppm/K: plausible per CRC.
- Try 4.3: R ≥ (5)²/0.25 = 100 Ω: correct.
- Try 4.4: R = (1.1×10⁻⁶ × 0.50) / 5.07×10⁻⁸ ≈ 10.8 Ω: correct.
- Try 4.5: κ/σ = 2.44×10⁻⁸ × 300 = 7.32×10⁻⁶ W·Ω/K; predicted κ ≈ 436 W/(m·K): correct.
- LED resistor: R = 150 Ω, P = I²R = 60 mW: correct.
- Pt100 TCR ~3850 ppm/°C: matches IEC 60751 (3851).
- CdS bandgap ~2.4 eV: correct.
- Visible light 1.8–3.1 eV: lower bound slightly low (1.77 eV at 700 nm) but acceptable rounding.
- E12 spacing ~1.21: correct (10^(1/12) = 1.212).
- NTC B-constant spec: computed 698 Ω vs spec 680 Ω at 100°C — minor rounding, acceptable.
- manganin composition ~86% Cu, 12% Mn, 2% Ni: correct.

**How to apply:** kanthal cite is specifically for nichrome/NiCr alloys; any claim about manganin (Cu-Mn-Ni resistance alloy) should cite horowitz-hill-2015 or ashcroft-mermin-1976 instead.
