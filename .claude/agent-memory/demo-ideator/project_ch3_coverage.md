---
name: ch3-demo-coverage
description: Inventory of Ch3 (resistance-and-power) existing demos and pedagogical gaps as of 2026-05-20
metadata:
  type: project
---

Ch3 (resistance-and-power) embeds 9 demos as of 2026-05-20:

1. MicroscopicOhm3DDemo — J = σE, 3D wire with E/J/B vectors, material toggle
2. OhmsLawTwoViewsDemo — V=IR from two directions (fixed R scrubs V; fixed V scrubs R)
3. LengthVsResistanceDemo — R linear in L with copper wire visualization
4. AreaVsResistanceDemo — R inverse in A, log-scale spans practical engineering range
5. MaterialPickerDemo — σ spans orders of magnitude (silver to nichrome), fixed geometry
6. DriftInCopper3DDemo — thermal v_th vs drift v_d, Drude collision picture, ratio ~10^10
7. JouleHeatingDemo — P = I²R + Stefan–Boltzmann equilibrium T, wire glows red-to-white
8. SeriesVsParallelDemo — pure series vs. pure parallel, formula side-by-side
9. SeriesParallelMixDemo — mixed R1 + (R2 || R3) network with draggable voltage probes

**Pedagogical gaps identified:**

- No demo for P_loss = (P/V)²R — the quadratic dependence that drives high-voltage transmission. The chapter's Case 3.2 covers this verbally but there is no interactive lever for it.
- No demo for R = ρL/A as a simultaneous 2D surface — L and A both vary, and the reader can't currently see the joint sensitivity.
- No demo for Joule heating timeline (energy accumulation over time), only equilibrium. The P·t = mcΔT thermodynamics of kettles/toasters is computed in TryIt 3.3 but not visualized.
- No demo for voltage drop across a wire segment (the V = IR "drop" concept that the FAQ addresses at length). Prose explains it well but there's no visual proof.
- No demo for the power dissipation triangle — how P = VI, P = I²R, and P = V²/R are three projections of the same thing depending on which variable is held fixed.

**Why:** to inform future demo proposals and avoid re-proposing demos already built.

**How to apply:** propose demos that fill the gaps above; do not re-propose the 9 already built.
