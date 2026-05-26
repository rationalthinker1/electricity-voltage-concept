---
name: ch17-audit-findings
description: Ch.17 Materials audit results 2026-05-25 — copper electron config error, Cu paramagnet claim wrong, several uncited FAQ/case-study specifics
metadata:
  type: project
---

Audit date: 2026-05-25. Lint: CLEAN (no H/M/L mechanical issues).

**HIGH findings:**
- Line 1048: "copper atom has just one [unpaired d-orbital electron]" — Cu is [Ar]3d10 4s1; the 3d shell is FULL with ZERO unpaired 3d electrons. The one unpaired electron is in 4s, not 3d. Factually wrong claim.
- Line 1053: "copper is a paramagnet at most" — bulk Cu metal is weakly DIAMAGNETIC (chi_m ~−1×10⁻⁵). Kittel cited but does not support the 'paramagnet' characterization for metallic Cu.

**MED findings:**
- Line 1191: FAQ MRI — "1.5 to 3 T … compared to Earth's field of ~50 µT" — no cite. `codata-2018` available for Earth field; `kittel-2005` for MRI fields.
- Line 1167: FAQ superconductor "chi_m = −1 exactly" (Meissner effect) — no cite. `kittel-2005` covers this.
- Lines 961–964: Case 17.3 body — "Nd₂Fe₁₄B T_C is around 580 K" — no cite on this sentence; `kittel-2005` or a manufacturer datasheet would back it.
- Lines 847–852: Case 17.1 body — "areal density from few hundred megabits per sq inch to tens of gigabits" and IBM 1997 commercial GMR head — no cite. Consider softening or citing a review article.

**LOW findings:**
- Lines 1025–1030: FAQ dielectric breakdown "air breaks down at about 3 MV/m" — no cite; `jackson-1999` (already in sources array) covers this.
- Lines 277–284: TryIt 17.1 question — "mica ε_r ≈ 6.7" — no cite on question; Griffiths Table 4.2 gives ~5.4 for muscovite mica. 6.7 is within range for phlogopite mica but is on the high side; the answer cites `griffiths-2017` for a different claim.

**All arithmetic verified clean:**
- Try 17.3: M = 1e-4 × 1 / (4π×10⁻⁷) = 79.58 A/m → "~80 A/m" correct
- Try 17.5: (100/1043)^0.37 = 0.4200 → "~42%" correct
- Curie temps: iron 1043 K = 769.9 °C → "770 °C" correct; cobalt 1388 K → "1115 °C" correct; nickel 627 K → "354 °C" correct; Gd 292 K → "19 °C" correct
- Water n=1.33 → n²=1.77 correct
- All source keys resolve; all keys in page sources[] array

**Why/How to apply:** The copper FAQ item needs rework — either remove the d-orbital electron count claim or correct to "Cu 3d shell is full (3d10), with one unpaired 4s electron" and change "paramagnet" to "diamagnetic" for bulk Cu metal.
