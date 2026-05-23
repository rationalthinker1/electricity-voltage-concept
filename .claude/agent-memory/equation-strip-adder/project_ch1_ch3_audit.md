---
name: project_ch1_ch3_audit
description: Equation-strip audit results for Ch1 (what-is-electricity), Ch2 (voltage-and-current), Ch3 (resistance-and-power) — 25 demos checked, 1 edited, 4 exempt, 20 already-OK
metadata:
  type: project
---

Ran equation-strip-adder on Ch1, Ch2, Ch3 (2026-05-22). 25 demos enumerated.

**Audit result:** 20 already had `<EquationStrip` in JSX. 1 edited. 4 exempt.

**Already-OK (20):** TwoCharges, InverseSquare, FieldArrows, PointCharge3D, ParallelPlateUniformField, VabWorkEnergy, VoltageDrivesFlow, TwoSpeeds, DriftVelocity, ACElectronJitter, MicroscopicOhm3D, OhmsLawTwoViews, WireVoltageDrop, LengthVsResistance, AreaVsResistance, MaterialPicker, DriftInCopper3D, JouleHeating, SeriesVsParallel, SeriesParallelMix.

**Edited (1):** VoltageAsHeight.tsx — added EquationStrip showing `W = q\,\Delta V` (symbolic) and `W = (1 C)(ΔV V) = ... J` (substituted). Also added `InlineMath` import from `@/components/Formula` and `EquationStrip` to the Demo import.

**Exempt (4):**
- SwitchAndBulb: toggle-only readouts (fixed "~5 ns"/"~13 hours"), no slider-driven formula. Intuition-pump.
- Equipotentials: no MiniReadout, pure drag-and-toggle field-pattern viz. Intuition-pump.
- ConductorRedistribution: no MiniReadout, pure polarity-toggle. Intuition-pump.
- CursorEFieldOnWire: has slider (|q_cursor|) but no readout showing a computed value; qualitative field-arrow demo.

**Why:** VoltageAsHeight had `energyJ = voltage` (W = qΔV with q=1 C) in a MiniReadout, making it formula-exercising. The strip reinforces that the ramp height IS the energy per coulomb, which is the whole point of the gravity analogy.
