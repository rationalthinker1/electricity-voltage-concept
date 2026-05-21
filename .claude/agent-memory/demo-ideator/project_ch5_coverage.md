---
name: project-ch5-coverage
description: Inventory of 7 existing Ch.5 Capacitors demos and primary gaps for new proposals
metadata:
  type: project
---

Seven demos exist in Ch5Capacitors.tsx as of 2026-05-21:

1. BuildACapacitorDemo — click charges on, V and U rise (section: "Building one charge at a time")
2. WhyHarderEachChargeDemo — work-per-charge vs existing charge (section: "Why the work to add the Nth charge…")
3. PlateGeometryDemo — A/d sliders resize plates, C readout (section: "V = Q/C: a linear relationship")
4. ParallelPlate3DDemo — 3D view with Gauss pillbox toggle (section: "V = Q/C: a linear relationship")
5. EnergyInTheGapDemo — energy density in field (section: "Where the energy goes")
6. ChargingCurveDemo — live RC trace with τ markers (section: "Charging through a resistor")
7. LeydenJarReplayDemo — historical flavour (section: "From Leyden jars to your phone")

Primary gaps identified:
- No dielectric insertion demo: εᵣ is described verbally but never made interactive
- No discharge / symmetric demo: only charging is shown; the FAQ mentions discharge but no demo
- No series/parallel combination demo: FAQ answers it but nothing interactive
- No energy-in-field vs energy-on-plates comparison: the Pullout thesis ("stores the separation, not the charge") is never directly dramatised on canvas
- No touchscreen fringing-field demo: Case 4.2 describes it but nothing interactive

**Why:** discovering these gaps for future demo-ideation sessions.
**How to apply:** don't re-propose any of the 7 demos above; focus new ideas on the five gaps.
