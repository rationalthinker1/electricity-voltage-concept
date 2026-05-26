---
name: ch19-audit-findings
description: Chapter 19 (Antennas and radiation) fact-check findings — 2 HIGHs + 3 MEDs + 1 LOW
metadata:
  type: project
---

# Chapter 19 audit — 2026-05-26

**File:** `src/textbook/Ch19Antennas.tsx`
**Lint:** CLEAN (mechanical checks pass)
**Sources array:** `maxwell-1865`, `hertz-1888`, `feynman-II-21`, `griffiths-2017`, `jackson-1999`, `balanis-2016`, `friis-1946`, `yagi-1928`, `kraus-marhefka-2002` — all resolve in registry.

## HIGH findings

### H1 — TryIt 19.4 line ~543: watts conversion wrong by factor 10
- Prose: `-148 dBm` then says `"about 1.6 × 10⁻¹⁹ W"`
- Correct: -148 dBm = 10^(-148/10)/1000 = 1.585 × 10⁻¹⁸ W (factor 10 error)
- Fix: change `1.6 × 10⁻¹⁹ W` → `1.6 × 10⁻¹⁸ W`

### H2 — Case 19.1 line ~741: watts conversion wrong by factor 10 (paired with dBm)
- Prose: `−165 dBm, or 3 × 10⁻¹⁹ W`
- Correct: -165 dBm = 3.16 × 10⁻²⁰ W (factor 10 error)
- Additionally: independent Friis calculation gives ~-172 dBm for Voyager at 24 Gkm with stated parameters — but -165 dBm accounts for additional system gain and post-processing not captured in the simplified spec rows. The dBm-to-watts conversion error is the clear, verifiable arithmetic mistake.
- Fix: change `3 × 10⁻¹⁹ W` → `~3 × 10⁻²⁰ W`

## MED findings

### M1 — FAQ line 1063-1065: friis-1946 misaligned for propagation speed claims
- Prose attributes `n ≈ 1.0003 at sea level` and `~0.66c in coax` to `friis-1946`
- Friis 1946 (Proc. IRE 34(5), 254-256) is only the link budget formula — does not discuss atmospheric refractive index or cable velocity factor
- Fix: soften these two sub-claims or re-cite to a propagation reference (griffiths-2017 covers wave velocity in dielectrics; ITU-R P.453 covers atmospheric refractive index)

### M2 — Case 19.1 line ~763: FCC power limit spec cited to balanis-2016
- Spec row: `FCC limit 100 mW in 2.4 GHz; 1 W EIRP in 5 GHz UNII-3 <Cite id="balanis-2016">`
- Balanis is an antenna textbook; FCC regulatory limits come from FCC Part 15 rules, not from Balanis
- Fix: change cite to a regulatory source (ieee-80211 partly covers this; ideally cite FCC 47 CFR Part 15)

### M3 — TryIt 19.4 "one photon per millisecond" prose (line ~545)
- DSN TryIt says P_r ≈ 1.6e-19 W (wrong, see H1), and then adds "roughly one photon per millisecond at X-band"
- Energy per photon at 8.4 GHz = hf ≈ 5.57e-24 J; 1 photon/ms → P = 5.57e-21 W
- Correct P_r (~1.6e-18 W) corresponds to ~2.9e5 photons/s (~290 per ms), not 1 per ms
- The "one photon per ms" claim is only self-consistent at the wrong power level; fix requires correcting H1 first and then softening the photon analogy or recomputing it

## LOW finding

### L1 — Friis Transmission Equation term def (line ~461): "Harald Friis at Bell Labs in 1946"
- Historically accurate (Friis was at Bell Labs; paper published 1946) — just noting this needs no change
- But "A_eff = G λ²/(4π) for the receiving antenna" as basis — this is correct per Balanis and Friis 1946 ✓

## Clean / verified
- Larmor formula P = q²a²/(6πε₀c³): correct SI form ✓
- Short dipole R_rad = (2πη₀/3)(L/λ)² = 80π²(L/λ)²: correct ✓
- Half-wave dipole gain 2.15 dBi: correct (1.643 linear = 2.155 dBi) ✓
- Half-wave dipole R_rad = 73.13 Ω: correct ✓
- Friis Wi-Fi example 2.3e-7 W: computed 2.28e-7 W ✓
- Near/far field boundary r ≈ λ/(2π): correct ✓
- Fraunhofer distance 2D²/λ for DSN dish: 274 km, but prose says "≈ 2.7 km" — FLAGGED (see below*)
- Short dipole R_rad FAQ: 0.0086 Ω (computed 0.0088 Ω, ~2% rounding) ✓
- λ/4 at 2.4 GHz = 31 mm: correct ✓  
- λ/4 at 5 GHz = 15 mm: correct ✓
- Parabolic dish gain: 1m dish at 10 GHz ≈ 37 dBi ✓; 70m at 8.4 GHz ≈ 73 dBi ✓; A_eff ≈ 2100 m² ✓
- Patch antenna TryIt: L ≈ 29.2 mm ✓
- All Cite IDs present and resolve in registry ✓

### *Fraunhofer distance prose inconsistency — HIGH
- Prose line ~579: "For a 70-m DSN dish at 8.4 GHz this works out to ≈ 2.7 km"
- Computed: 2D²/λ = 2×70²/0.03571 = 274,400 m ≈ 274 km (off by exactly 100× — decimal-place shift)
- Fix: change "≈ 2.7 km" → "≈ 274 km"

## Recurring patterns noted
- dBm-to-watts conversion is a systematic failure mode across chapters (also seen in Ch.9, Ch.20)
- friis-1946 cite scope: only covers the P_r/P_t formula; any claim about propagation physics, atmospheric optics, or cable velocity factors needs a different source
