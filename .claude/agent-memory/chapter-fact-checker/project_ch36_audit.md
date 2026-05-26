---
name: ch36-audit-findings
description: Ch.36 (house-troubleshooting) fact-check audit findings, 2026-05-26
metadata:
  type: project
---

Audit run: 2026-05-26. Lint: CLEAN. File: src/textbook/Ch36HouseTroubleshooting.tsx.
Six sources all resolve (nec-2023, ul-498, horowitz-hill-2015, keysight-34465a-datasheet, iec-60479-2018, codata-2018).

**Why:** Applied-track chapter, prose-heavy. Main issues are (a) numeric inconsistency in Case 36.3, (b) internal contradiction in Try 36.2 answer, (c) source-fit issues with H&H for residential tool specs, (d) keysight datasheet 10 GΩ vs source note 1 GΩ mismatch, (e) 4-ton vs 4.2-ton rounding in Try 36.5, (f) Pullout "5 mA" is GFCI threshold not two-pole probe draw.

**How to apply:** Watch Case 36.3 for the three-way inconsistency: 1000 W warmer should increase bill by ~$130/month (not $25-40), recovery is ~$1577/yr (not $480/yr), and 7200 kWh/yr is a rounded approximation of 7358 kWh/yr (acceptable). The Pullout "5 milliamps" is the GFCI trip threshold, not what a two-pole probe draws (~40 mA at 120V/3kΩ). horowitz-hill-2015 is misaligned for clamp meter specs, NCVT calibration, verify-dead procedure, and breaker time-current curves.

Key findings:
- Line 145: keysight-34465a-datasheet source note says 1 GΩ but prose says 10 GΩ (HIGH mismatch)
- Lines 305-307: Pullout "5 milliamps" is GFCI threshold, not two-pole probe load current (~40 mA) (MED)
- Try 36.2 (lines 326-331): answer says "3 kΩ × 2 µA ≈ 6 mV" but then "meter rounds to 0.4 V" — contradictory (HIGH)
- Case 36.3 specs (lines 948, 958-959): $480/yr saved and $1300/yr cost of 840 W load are inconsistent with 1000 W culprit — a 1000 W always-on load costs ~$1577/yr, and the symptom of $25-40/month increase implies ~250 W load, not 1000 W (HIGH)
- Try 36.5 (line 739): "4-ton" AC but arithmetic gives 4.2 tons (50,400 / 12,000) (LOW)
- Lines 84, 124, 193, 577, 694: H&H cited for residential meter specs, NCVT calibration, verify-dead, clamp meter resolution, breaker time-current — H&H doesn't cover these residential tools (MED misalignment ×5)
