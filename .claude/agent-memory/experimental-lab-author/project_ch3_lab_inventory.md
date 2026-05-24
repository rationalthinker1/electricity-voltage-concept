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

**Style observations:**
- E3.1 follows the established experimental-lab pattern: Section blocks with numbered tags, DataTable with worked-example rows, Prompt analysis questions, Stretch going-further problem.
- The lab uses Falstad (not PhET), which is browser-based and free. Students build circuits virtually, edit component values, and read live voltage/current/power on hover.
- BASE_LAB_SOURCES added with falstad-circuit-simulator, griffiths-2017, joule-1841, drude-1900, ashcroft-mermin-1976, crc-resistivity, libretexts-univ-physics.
- Source `falstad-circuit-simulator` added to src/lib/sources.ts.
