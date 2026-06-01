---
name: ch3-lab-inventory
description: Experimental-lab coverage for Chapter 3 (Conduction / Resistance and Power).
metadata:
  type: project
---

Chapter 3 has the following experimental labs as of 2026-05-24:

**Delivered:**
- **E3.1 `falstad-ohms-law` — Ohm's Law, Resistance, and Power in a Virtual Circuit** (software, Falstad Circuit Simulator). Four controlled experiments: (A) verify V = IR by sweeping voltage at fixed R; (B) series resistance and voltage divider; (C) parallel resistance and current divider; (D) power dissipation P = VI = I²R. Worked-example rows in all data tables. Runtime 60–90 min. Difficulty: intro.

**Equation labs in ch3 for context:**
- 3.1 ohms-law (microscopic J = σE)
- 3.2 resistance (R = ρL/A)
- 3.3 drift (drift velocity)
- 3.4 joule (P = I²R)
- 3.5 ac-impedance
- 3.6 network-analysis
- 3.7 pn-junction
- 3.8 transistor-iv
- 3.9 fourier-series
- 3.10 bode-filter
- 3.11 op-amp
- 3.12 rectifier
- 3.13 dc-dc-converter
- 3.14 pwm-inverter
- 3.15 cell-emf
- 3.16 li-ion-cycling

- **E3.2 `resistivity-measurement` — Measuring Resistivity and Temperature Coefficients** (hands-on, no software required). Two-part lab: (A) pencil-graphite traces on paper at 5 lengths and 5 widths, back-solve ρ/t from R vs L and R vs 1/w slopes; (B) nichrome (or copper) coil in four water baths, fit linear temperature coefficient α, compare to CRC table values. Runtime 75–100 min. Difficulty: core.
  - 5 analysis prompts (Q1–Q5) covering proportionality checks, non-zero intercept, Matthiessen's rule, Drude R² fit, Wiedemann–Franz connection.
  - BASE_LAB_SOURCES: drude-1900, ashcroft-mermin-1976, crc-resistivity, kanthal, matthiessen-1864, griffiths-2017, wiedemann-franz-1853, vishay-z-foil, libretexts-conduction.
  - Delivered 2026-05-24; build + browser verification (H1, eyebrow, 9 sections, Sources block, 0 console errors) confirmed clean.

**Equation labs in ch3 for context:**
- 3.1 ohms-law (microscopic J = σE)
- 3.2 resistance (R = ρL/A)
- 3.3 drift (drift velocity)
- 3.4 joule (P = I²R)
- 3.5 ac-impedance
- 3.6 network-analysis
- 3.7 pn-junction
- 3.8 transistor-iv
- 3.9 fourier-series
- 3.10 bode-filter
- 3.11 op-amp
- 3.12 rectifier
- 3.13 dc-dc-converter
- 3.14 pwm-inverter
- 3.15 cell-emf
- 3.16 li-ion-cycling

**Style observations:**
- E3.1 follows the established experimental-lab pattern: Section blocks with numbered tags, DataTable with worked-example rows, Prompt analysis questions, Stretch going-further problem.
- E3.2 adds a Safety section (§00) because the water-bath step has a mild burn risk from hot kettle water. Standard form for hands-on labs with any thermal hazard.
- Pencil-graphite on paper is a reliable, cheap sample for ρ measurement: resistance of a 2B trace lands in the 1–20 kΩ range per cm, well within any DMM's most sensitive range.
- nichrome 30 AWG coil gives α ≈ 1.7e-4 K⁻¹; measurable change over 50 °C ≈ 0.9% of R₀ — detectable with a 3.5-digit DMM.
- BASE_LAB_SOURCES for E3.2 uses vishay-z-foil to anchor the "precision resistor design" chapter connection without inventing new datasheet numbers.
- Source `falstad-circuit-simulator` was added to src/lib/sources.ts for E3.1 (already present). No new sources were needed for E3.2.

**Physics gaps not yet covered by experimental labs in ch3:**
- Kirchhoff's laws in a real circuit (hands-on with battery + resistors + DMM)
- Diode I-V curve measurement (hands-on with 1N4001 and bench supply)
- RC charging time constant (hands-on with voltmeter + stopwatch)
- Fourier analysis of a real waveform (blended: recorded audio + spreadsheet FFT)
