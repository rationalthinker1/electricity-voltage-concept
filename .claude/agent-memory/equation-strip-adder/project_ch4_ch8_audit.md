---
name: project_ch4_ch8_audit
description: Equation-strip audit results for Ch4–Ch8 — 32 demos checked, 5 edited, 2 exempt, 25 already-OK
metadata:
  type: project
---

Ran equation-strip-adder on Ch4 (how-a-resistor-works), Ch5 (capacitors), Ch6 (magnetism), Ch7 (induction), Ch8 (energy-flow) on 2026-05-22.

**Ch5, Ch6, Ch7, Ch8:** All demos already have `<EquationStrip>` in JSX — already-OK.

Already-OK (25): BuildACapacitor, ChargingCurve, EnergyInTheGap, DielectricSlide, ParallelPlate3D, PlateGeometry, WhyHarderEachCharge (Ch5); BiotSavartWire3D, Cyclotron, Solenoid, TwoParallelWires, WireBField (Ch6); EddyCurrentTube, LenzsLaw, MagnetThroughCoil, RotatingCoil, RotatingCoilFlux3D, Transformer (Ch7); BatteryBulbFields, BCirculation, EAxialField, PoyntingCoax3D, PoyntingInflow, SuperconductorLimit, WhereDoesEnergyFlow (Ch8).

**Edited (5) — all in Ch4:**
- ColorCodeDecoder.tsx: EquationStrip showing `R = (d₁·10 + d₂) × 10^m Ω` (or 5-band form) / live decoded value ± tolerance.
- PowerDerating.tsx: EquationStrip showing `P_max = P_rated × max(0, 155−T)/(155−70)` / live allowed wattage at current T.
- RvsTemperature.tsx: EquationStrip showing Cu linear formula (`R/R₀ = 1 + α(T−T₀)`) on left and NTC exponential (`R/R₀ = e^{B(1/T−1/T₀)}`) on right, both with live T values.
- VariableResistors.tsx: EquationStrip showing pot identity (`R_AW + R_WB = R_total`) on left, LDR power-law (`R = A·E^{−γ}`) on right.
- WiedemannFranz.tsx: EquationStrip showing `L = κ/(σT) ≈ L₀ = 2.44×10⁻⁸` on left, live values for selected metal on right.

**BuildAResistor.tsx:** Already had EquationStrip (R = ρL/A with live values). Counted as already-OK.

**Exempt (2):**
- LeydenJarReplay.tsx: historical demo with only Charge/Discharge buttons, no slider-driven numeric readout, no formula being exercised. Pure intuition-pump.
- ColorCodeDecoder note: originally assessed as borderline (lookup table vs. formula), ultimately included since it has 3 MiniReadouts and does compute R = (digits) × 10^mult.

**Why pattern for Ch4:** Ch4's demos were written before the EquationStrip convention was established. Ch5–8 were written (or updated) after the convention and were already compliant.
