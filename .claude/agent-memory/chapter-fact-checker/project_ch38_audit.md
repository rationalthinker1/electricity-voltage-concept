---
name: ch38-audit-findings
description: Chapter 38 (house-smart-retrofits) fact-check findings — 2026-05-26
metadata:
  type: project
---

Audit date: 2026-05-26. Lint: CLEAN.

**HIGH findings:**

1. Phase-cut RMS formula wrong (line 578): Written as `V_rms = V_peak × sqrt(alpha/pi - sin(2*alpha)/(2*pi))` using V_peak=170V. At alpha=pi (fully on) this gives 170V, not 120V. The correct formula uses V_rms_line (120V) not V_peak — i.e., the bracket must be multiplied by 1/2 (or the coefficient changed from V_peak to V_rms_line). The corrective prose at line 586 ("fully-on, α=π and V_rms = V_peak/√2 = V_rms_line") contradicts the formula as written.

2. Arithmetic false-equivalence (line 584-585): Prose says "170 × √0.5 ≈ 120 V × √0.5 ≈ 85 V". But 170×√0.5 = 120V, not 85V. The ≈ between them is wrong. The correct half-power answer (85V) requires 120×√0.5 — which means the formula coefficient should be V_rms_line=120, not V_peak=170. Try 38.2 arrives at the correct numerical answer (114V, 95%, ~90%) only because it compensates by dividing by sqrt(2) at the end.

**MED findings:**

3. MCU idle/peak figures uncited (lines 142-145): "around 30 mW" idle and "200–500 mW" peak transmit — no cite. horowitz-hill-2015 at line 137 covers radio idle draw generally; needs extension to cover these specific MCU figures, or soften ("a few hundred milliwatts").

4. Z-Wave S2 mandatory since 2017 (line 229): no cite. Soften to "newer Z-Wave devices use S2 security framing."

5. Device caps (lines 276-278): "Caséta caps at ~75 per hub; Z-Wave at 232; Zigbee at ~250" — no cites. Z-Wave 232 is a known spec-sheet figure but uncited. Soften or add `lutron-dimmer-app-note` for the 75 cap.

6. "24 V signal wire" for Caséta companion (lines 458, 862, 900): Caséta's companion signal wire uses a proprietary low-voltage signal — the voltage is not 24V (24V is typical of BACnet/Crestron systems). `lutron-dimmer-app-note` is cited nearby but its registry note doesn't mention signal voltage. Soften to "low-voltage signal wire."

7. 2.4 GHz metal-box attenuation "6–15 dB" (line 984): no cite. `itu-r-p2040` exists in registry and covers building-material attenuation, but it's not in chapter.sources. Either add `itu-r-p2040` to chapter.sources or soften.

8. codata-2018 misaligned for π and √2 (line 588): CODATA is for measured physical constants; π and √2 are mathematical constants. The prose notes they "carry no measurement uncertainty" — which makes the CODATA cite actively misleading. Remove the cite or replace with a note that these are mathematical constants.

9. UL 498 misaligned for box derating (lines 921-922): UL 498 covers plugs and receptacles. Box derating from heat is covered by NEC 314 and UL box listing standards, not UL 498. Replace cite with `nec-2023` (already used for box-fill on line 988).

10. `nema-wd-6` in file header comment but not used: Listed in the file header at line 12 but not in `chapter.sources[]` and no `<Cite>` in the file. Harmless but misleading header comment.

**UL 2017 claim (LOW):** Line 1019 says "UL 2017 for the radio." UL 2017 is for General-Purpose Signaling Devices, not specifically for wireless radio. The regulatory path for wireless is FCC Part 15, not a UL standard. Soften to "additional certifications for the electronic and wireless components."

**Arithmetic verified CLEAN:** Try 38.1 (7.2W), Try 38.3 (2.628 kWh, $0.39). Try 38.2 numerically correct (114V, ~95%, ~90%) despite formula coefficient error.

**Why:** codata-2018 for mathematical constants (π, √2) is a recurring misuse pattern; the formula error is subtle (Vpeak vs Vrms_line) and passes visual inspection because both paths coincidentally give ~85V at the half-power point via different routes, but the formula is definitively wrong at alpha=pi (fully on).
