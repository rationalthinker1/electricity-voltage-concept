---
name: ch40-audit-findings
description: Fact-check findings for Ch40 "Surge and grounding" (house-surge-grounding) — audited 2026-05-26
metadata:
  type: project
---

Audited 2026-05-26. Lint CLEAN. All 5 source keys resolve and appear in chapter.sources[].

## HIGH

**H1 (MISALIGNED + WRONG NUMBER) — Transformer back-feed ratio "~50:1, ~12 kV"**
- Lines 775, 1070, 1074, 1108–1110: Claims residential pole transformer ratio is "~50:1" and back-feed produces "~12 kV".
- Standard North-American residential distribution: single-bushing wye pole pig has 7.2 kV primary (L-N on 12.47/7.2 kV system) and 120/240 V secondary → ratio = 7,200/240 = 30:1 → back-feed = 7.2 kV, not 12 kV.
- 12 kV / 50:1 would only be correct for a delta-connected 12.47 kV primary, which is uncommon for residential single-phase service.
- Citation at line 778 (`nec-2023`) is misaligned: NEC does not specify transformer step-up ratios.
- Remedy: change "~50:1, so 12 kV" to "~30:1, so about 7.2 kV on the primary" and soften "12 kV" to "~7 kV" throughout; change cite to ieee-c62-41 or drop specific ratio.

**H2 (POSSIBLY IMPRECISE) — IEEE C62.41 "Category C high-exposure = 10 kA"**
- Line 107–108: "Category C (high-exposure service entrance) test level is 10 kA for the 8/20 µs waveform."
- IEEE C62.41.2-2002 defines sub-categories: C1=6 kA, C2=10 kA, C3=20 kA. The "high-exposure" sub-level is C3=20 kA. 10 kA corresponds to C2 (medium exposure).
- Using "high-exposure" for the 10 kA level is technically imprecise; C3 at 20 kA is the highest residential category. The claim should say "Category C2 (medium exposure at the service entrance, 10 kA)" or just "the C2 service-entrance test level is 10 kA."
- Cite `ieee-c62-41` is correct source; the number and characterization need adjustment.

## MED

**M1 — "NEC 250.56's compliance band" article number**
- Line 386: cites "NEC 250.56's compliance band" for the two-rod 12.5 Ω result.
- In NEC 2023, the 25-Ω single-rod supplemental rule is primarily in 250.53(A)(2); NEC 250.56 governs "resistance of supplemental electrodes" and does restate a similar rule, so reference is defensible but unusual. No misalignment, but worth confirming against the printed 2023 code.

## ARITHMETIC — ALL CLEAN
- ½LI² = 250 J (L=5 µH, I=10 kA): correct.
- V_L = 6.25 kV (L=5 µH, dI/dt=1.25×10⁹ A/s): correct.
- dV/dt ≈ 4 kV/µs for 1.2/50 µs, 5 kV: correct (4.18 kV/µs on 30–90% slope).
- XL at 1 MHz for 6 µH ≈ 38 Ω: correct.
- 12 in of wire at 25 nH/in = 300 nH → 300 V at dI/dt=10⁹: correct.
- Try 40.1 VR=250 kV, VL=7.5 kV: correct.
- Try 40.2 R=12.5 Ω, L=3 µH: correct.
- Try 40.3 900 V total: correct.
- Try 40.4 #4 AWG GEC for 200A service with #2/0 SE conductors: correct per NEC Table 250.66.

## NEC ARTICLES — ALL CORRECT
- 250.52, 250.53, 250.50, 250.56, 250.64(B), Table 250.66, 230.67, 702, 250.24, 250.52(A)(1)/(3)/(4)/(5), 310.12 — all consistent with NEC 2023.
- NEC 230.67 added 2020, tightened 2023: correct.
- NEC 250.50 Ufer mandate since 2008: correct.

**Why:** Back-feed voltage/ratio is load-bearing for the lineman-safety story and should not overstate the hazard. The standard wye pole-pig math gives 7.2 kV, not 12 kV.
**How to apply:** When auditing house-track chapters (27–40), verify any transformer ratio claims against the 12.47/7.2 kV canonical wye distribution (30:1 for full 240V secondary).
