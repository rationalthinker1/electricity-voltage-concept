---
name: ch24-demo-coverage
description: Inventory of 9 existing demos in Ch24 (Rectifiers and Inverters), identifies gaps in ripple-vs-topology comparison, inductor current waveform, efficiency vs load, and SCR/thyristor phase control.
metadata:
  type: project
---

Ch24 has 9 existing demos — one of the densest chapters in the book:

1. DiodeCharacteristic (Fig 24.1) — Shockley I-V curve, temperature sweep, three device types (Si, Schottky, Zener)
2. BridgeRectifier (Fig 24.2) — time-domain waveform, C and R_load sliders, ripple readout
3. LinearRegulator (Fig 24.3) — energy-flow bar, P_diss heat visualization, dropout constraint
4. BuckConverter (Fig 24.4) — inductor current ramp, duty cycle and V_in sliders, volt-second balance
5. BoostConverter (Fig 24.5) — step-up topology, inductor current waveform, V_out = V_in/(1-D)
6. FlybackConverter (Fig 24.6) — isolated topology, on/off phase animation, energy bar chart
7. HBridgeInverter (Fig 24.7) — PWM switching, sine carrier comparison, filtered output trace
8. PWMInverterOutput (Fig 24.8) — spectrum view, carrier frequency and modulation index, harmonic clusters
9. GridTieInverter (Fig 24.9) — real/reactive power, phase angle theta, P/Q/S phasor readouts

**Gaps identified (concepts described in prose but not animated):**
- Half-wave vs full-wave vs bridge topology comparison — the prose distinguishes all three (Vp/π, 2Vp/π, Vp-2VF) but only the bridge is shown
- Efficiency vs duty cycle for linear regulator vs buck — the trade-off is stated numerically but never shown as a comparison curve
- SCR/thyristor phase-controlled rectifier — mentioned as "workhorse for megawatt-class converters" with no animation; firing angle α is the key degree of freedom
- Power-factor correction (PFC) — described in the laptop charger case study as "forces input current to be sinusoidal," but no demo shows the distorted vs corrected current waveform
- The prose on the boost converter's parasitic-limited duty cycle (D≈0.85 ceiling) has no visual that shows efficiency collapse at high D

**Section mapping:**
- "The diode — a one-way valve": DiodeCharacteristic covers this well
- "Half-wave, full-wave, bridge": BridgeRectifier covers only bridge; no half-wave/full-wave comparison
- "Regulating the rough DC": LinearRegulator covers well; efficiency-vs-load comparison is the gap
- "Switch-mode: buck, boost, flyback": three demos cover these topologies; PFC gap here
- "DC back to AC — the inverter": HBridgeInverter + PWMInverterOutput cover well
- "Grid-tie inverters and HVDC": GridTieInverter covers P/Q well; SCR phase-control gap here

**Why:** surveyed during parallel Ch24 demo-ideation run, 2026-05-25.
**How to apply:** Do not propose demos for well-covered sections (diode I-V, bridge rectifier, buck/boost/flyback waveforms, inverter PWM). Focus on topology comparison, PFC current shaping, SCR firing angle, and linear vs switching efficiency trade-off.
