---
name: ch1-coverage
description: Chapter 1 demo inventory and pedagogical gaps, as of 2026-05-20
metadata:
  type: project
---

Chapter 1 (what-is-electricity) has five embedded demos as of 2026-05-20:

1. TwoChargesDemo — sign toggles, attraction/repulsion, Coulomb force arrow + readout. Slots under "Two kinds of charge" h2.
2. InverseSquareDemo — log-log F(r) plot, slope = -2, single r slider, marker. Slots under "Why exactly the square?" h2.
3. FieldArrowsDemo — 2D radial arrow grid with draggable probe, |E| readout + EquationStrip showing kQ/r² and F=eE. Slots under "From force to field" h2.
4. PointCharge3DDemo — 3D spiky sphere with 80 arrows, orbit camera, shows |E(r)|/|E(2r)| = 4 invariant. Slots under "From force to field" h2.
5. EquipotentialsDemo — heatmap + teal equipotential rings, draggable charges, dipole vs like-pair toggle. Slots under "Field patterns to carry forward" h2.
6. ConductorRedistributionDemo — animated N-body charge redistribution, conductor vs insulator toggle. Slots under "Conductors, insulators" h2.

**Gaps identified:**
- No demo for the parallel-plate uniform field (E = σ/ε₀), despite prose claiming it is the "simplest non-trivial geometry." The formula is introduced but never made interactive.
- No demo for Gauss's law / flux visualization — the "flux spreading over a sphere" argument is the pedagogical core of the inverse-square law section but is only prose.
- No demo for superposition principle (adding fields of multiple charges, or charges of different magnitudes showing that E is a linear sum).
- No demo for the charge density / surface charge concentration at conductor tips (sharp-point effect), which the ConductorRedistribution demo gestures at but doesn't isolate.

**Why:** chapter is strong on point-charge and dipole patterns, but the parallel-plate geometry is the entry point for all capacitor/voltage work in Ch.2–5 and has no canvas demo.

**How to apply:** Prioritize parallel-plate field demo and Gauss flux demo when adding to Ch.1.
