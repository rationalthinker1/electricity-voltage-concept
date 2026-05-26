---
name: project-ch14-audit
description: Ch.14 Semiconductors and Transistors fact-check findings, 2026-05-25
metadata:
  type: project
---

Audited 2026-05-25. Lint clean (0 findings).

**Why:** Semiconductor-specific numerical claims (band gaps, carrier concentrations, thermal voltage, Vbi arithmetic, device specs) need close scrutiny.

**Findings (9 HIGH/BLOCKER, 2 MED, 2 LOW):**

- B1: Case 14.1 die area (103 mm²) uncited — no registry source for A17 Pro silicon specs. Soften or remove.
- B2/M1: A17 Pro process node ("TSMC N3") and transistor count (19×10⁹) cited to razavi-2021 — a 2021 textbook cannot contain 2023 product data. CATEGORY mismatch. Soften to descriptive prose.
- B3: Case 14.2 spec rows (940 nm wavelength, 1.3V Vf, 38kHz/NEC modulation) uncited. horowitz-hill-2015 in prose but not on spec rows.
- B4: Case 14.3 spec rows (12AX7 µ≈100, 2N5457 gm≈1.5mS) uncited. horowitz-hill-2015 available and plausible.
- B5: Case 14.4 spec rows (2.5–5kV isolation, 10kHz–10MHz bandwidth) uncited.
- B6: FAQ Ge junction temp limit (~80°C) and Si (~175°C) uncited. streetman-banerjee-2015 available.
- B7: "40–50% wall-plug efficiency" for white LEDs uncited in FAQ. horowitz-hill-2015 available.
- B8: "1.5W heater power", "few thousand hours" tube lifetime — uncited in FAQ.
- M2: Vbi intermediate arithmetic wrong: NA=ND=5×10¹⁵, ni=10¹⁰ → ratio = 2.5×10¹¹ (not 5×10¹¹); ln(2.5×10¹¹)=26.24 (not 27.0); Vbi=0.68V (not 0.70V). The engineering "~0.7V" conclusion is fine but the intermediate ratio is wrong.

**MED:**
- W1: GaAs case study (14.2) body says "λ≈873nm" (correct from Eg=1.42eV: hc/E_g=873nm) but spec row says "~940nm". These contradict each other. 940nm corresponds to Eg=1.32eV, inconsistent with the "GaAs (Eg=1.42eV)" spec entry. Fix: correct spec to ~880nm for GaAs, or change material label to AlGaAs.
- W5: FAQ Vf explanation: intermediate step "6·VT·ln(10)≈0.36V" is mathematically correct for n=1, Is=10⁻⁹A at I=1mA, but leads to 0.36V not 0.6–0.7V. The leap to the final conclusion is not explained. The 0.6–0.7V result requires n≈1.5–2.

**LOW:**
- W3: "kT≈0.026eV" prose vs. "25.85mV" worked examples. Consistent use of approximation vs. precision, not an error.
- W6: Summary says "gain of about −400"; computed −387; 3% rounding, acceptable.

**Patterns to note:**
- Case-study spec rows are systematically under-cited in Ch.14 (same pattern as Ch.5, Ch.10, Ch.13, Ch.20).
- razavi-2021 misused for A17 Pro product data — recurring problem of citing a textbook for contemporary chip specs.
- Vbi intermediate computation had a factor-of-2 ratio error (5×10¹¹ vs 2.5×10¹¹).
- The GaAs 873nm vs 940nm inconsistency within one case study is a notable internal-consistency failure.

**How to apply:** For semiconductor chapters, always (1) check Vbi arithmetic with NA·ND/ni², (2) cross-check CaseStudy body wavelength vs spec-row wavelength when E_g is given, (3) verify any processor/chip spec is not cited to a textbook predating the product.
