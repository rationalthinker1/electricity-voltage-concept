---
name: ch12-audit-findings
description: Ch.12 (Circuits, AC, and impedance) fact-check findings — 2026-05-25
metadata:
  type: project
---

Audited: src/textbook/Ch12CircuitsAndAC.tsx
Sources array: kirchhoff-1845, griffiths-2017, irwin-circuit-analysis-2015, grainger-power-systems-2003, horowitz-hill-2015, ansi-c84-1-2020, erickson-maksimovic-2020, keysight-34465a-datasheet

## BLOCKERS

### HIGH-1: Steinmetz attribution uncited (line 641-643)
"formalized by Charles Steinmetz at General Electric in the 1890s"
No <Cite>. steinmetz-1893 exists in registry but is NOT in chapter.sources[]. Fix: add steinmetz-1893 to sources array and attach <Cite id="steinmetz-1893">.

### HIGH-2: Westinghouse/AEG 60/50 Hz history — two separate uncited claims
- Line 1164-1165 (Case 12.1 prose): "Westinghouse standardised on 60 Hz … AEG had already picked 50 Hz in Germany" — no <Cite>
- Lines 1373-1374 (FAQ): "Tesla and Westinghouse settled on 60 Hz … AEG in Germany chose 50 Hz a few years earlier" — no <Cite>
Neither location has a citation. Fix: soften or add steinmetz-1893 / tesla-1888 if they cover this (they do not directly); recommend soften to remove specific company names or add a new source (Hughes, "Networks of Power", 1983, covers early AC standardization).

### HIGH-3: Arithmetic error — 33% extra I²R loss at pf=0.7 (line 1348)
"with 33% extra I²R losses in the transmission lines compared to a unity-power-factor customer"
Correct arithmetic: at pf=0.7, current is (1/0.7) = 1.429× higher, so I²R losses are (1/0.7)² = 2.041× — that is 104% extra, not 33%. Correct the prose to "more than twice the I²R losses" or "~100% extra I²R losses."

### HIGH-4: Crystal oscillator Q ≈ 10⁶ and cesium Q ≈ 10¹⁰ — uncited (lines 1400-1401)
"Crystal oscillators reach Q ≈ 10⁶; an atomic clock's cesium transition has effective Q ≈ 10¹⁰"
No <Cite>. These are specific quantitative claims. No registry source currently covers them. Recommend soften "crystal oscillators have very high Q (millions)".

## MEDS

### MED-1: AM antenna coil "around 250 µH, 30–365 pF" (lines 1213-1215) — no <Cite>
These are specific component specs. irwin-circuit-analysis-2015 is not a radio engineering reference. Recommend soften to "typical coil inductances and variable capacitor ranges for the AM band."

## All arithmetic otherwise correct:
- λ = c/f at 60 Hz = 5000 km ✓
- Xc (10µF, 60Hz) = 265.3 Ω ✓, XL (10mH, 60Hz) = 3.77 Ω ✓
- f₀ (10mH, 100µF) = 159 Hz ✓, (10mH, 100pF) = 159 kHz ✓
- Try 12.3: f₀ (10mH, 10µF) = 503 Hz ✓
- Try 12.4: Q = 31.6 ✓
- Try 12.6: S=1250 VA, pf=0.80, I=5.21 A ✓
- Try 12.7: P=700W, Q=714 VAR ✓
- Try 12.8: Vload = 8.0 V ✓, 100A×1Ω=100V narrative correct ✓
- V_rms = 169.7/√2 = 120.0 V ✓
- 208Y/120 V check: 208/√3=120.1 ✓; 480Y/277 V: 480/√3=277.1 ✓ (Case 12.1 specs fine)
