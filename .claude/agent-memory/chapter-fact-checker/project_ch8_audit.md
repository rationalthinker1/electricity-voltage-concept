---
name: ch8-audit-findings
description: Chapter 8 (energy-flow) fact-check audit findings — 2026-05-25
metadata:
  type: project
---

Audit run 2026-05-25. Lint passed clean. Findings:

**HIGH — Arithmetic error, FAQ line 1091**
`<M tex="c\\varepsilon_0 E^2" />` for time-averaged plane-wave Poynting magnitude is missing the factor of ½.
Correct form: `(1/2)*c*eps0*E0^2` (using peak E0). The chapter uses E0 notation consistently elsewhere (lines 503, 513, 753); the bare `E^2` here is 2× too large if E is peak amplitude.
Fix: change to `\tfrac{1}{2}c\varepsilon_0 E^2` or clarify E is rms amplitude.

**HIGH — Internal inconsistency, line 74**
Ch8 prose says "In Chapter 2 we calculated... about 0.03 mm/s" but Ch2 explicitly calculates and states 0.02 mm/s (≈2.9×10⁻⁵ m/s) for 12-gauge Cu at ~1 A. The Fig 8.1 demo caption at line 88 also says 0.03 mm/s. Both Ch8 occurrences should read 0.02 mm/s to match Ch2 and the cited libretexts-conduction source.

**MED — Attribution mismatch, lines 438 and 957**
Prose says "Morris and Styer" but `morris-styer-2012` registry entry lists only "Daniel F. Styer (lecture notes)" as author. No co-author named Morris appears in the source. Either update prose to "Styer" or verify whether a Morris co-author exists (the URL points to Oberlin Styer lecture notes).

**MED — Unsourced spec, Case 8.2 line 736**
`'Annual global energy demand (2024)', value: '~6 × 10²⁰ J'` carries no `<Cite>`. Value is consistent with IEA World Energy Outlook (~600 EJ total primary), but no source key exists in the registry. Either add an IEA or BP Statistical Review key, or soften to "humanity's annual energy use" without the specific number.

**LOW — Cite scope mismatch, Case 8.2 specs lines 729-734**
`codata-2018` is cited for Earth's intercepted power (~1.74×10¹⁷ W). CODATA carries the AU distance and speed of light, but not Earth's cross-sectional area or the derived intercepted power. The power is a derived calculation; soften by removing the cite from that spec line or add a note that it is a derived value from CODATA constants.

**All arithmetic verified clean:**
- Try 8.1: |S| = 60/(6.283e-3) = 9549 W/m² ≈ 9.55 kW/m² ✓; "~7× solar constant" ✓ (9549/1360.8 = 7.0)
- Try 8.3: E0 = √(2×1361/(c×ε0)) = 1012.6 ≈ 1013 V/m ✓
- Try 8.2 and 8.5: VI cancellation exact by construction ✓
- Earth intercept: π×(6.371e6)²×1360.8 = 1.735e17 W ≈ spec's 1.74e17 ✓
- Sun-Earth travel time: 1.496e11/c = 8.3 min ✓
- "1 hour" for annual demand: 6e20/1.735e17 = 0.96 h ≈ ~1 hour ✓
- Poynting year gap: 1884-1865 = 19 years ✓
- Velocity factor 0.66c for PE (ε_r≈2.25): 1/√2.25 = 0.67 ✓ (prose says ~0.66, close)
- B0 solar ≈ 3.4 µT vs geo 50 µT: ratio ~15×, prose says "roughly an order of magnitude smaller" (1.17 decades — defensible but slightly loose)

**All cite ids resolve:** poynting-1884, maxwell-1865, feynman-II-27, davis-kaplan-2011, morris-styer-2012, griffiths-2017, jackson-1999, pozar-2011, kopp-lean-2011, green-bohn-2015, codata-2018, libretexts-conduction all present in both sources.ts and chapter.sources[].

**Why:** Internal-consistency drift velocity discrepancy is a classic cross-chapter reference error. Plane-wave |S| formula missing ½ is a subtle but consequential arithmetic slip (off by 2×).
**How to apply:** In future Ch8 audits, re-check lines 74/88 (drift velocity) and line 1091 (plane-wave magnitude) first.
