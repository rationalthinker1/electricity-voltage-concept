---
name: ch21-audit-findings
description: Fact-check audit results for Ch21 Generators and the grid (slug: generators), logged 2026-05-21
metadata:
  type: project
---

Audit of src/textbook/Ch21Generators.tsx against src/lib/sources.ts and chapters.ts sources array.

**Chapter sources array** (7 keys): faraday-1832, feynman-II-17, griffiths-2017, grainger-power-systems-2003, fitzgerald-kingsley-umans-2014, kundur-1994-power-stability, codata-2018. All 7 keys exist in SOURCES registry.

**BLOCKERs found: 7**
1. Line 35-43 opening hook: Hoover Dam physical specs (35 km³ Lake Mead, 220m head, 17 generators, ~2 GW, 400km to LA) — no <Cite /> at all.
2. Line 394-397 car alternator idle speed: prose says "1900 RPM alternator (2.5:1 pulley ratio)"; 750×2.5=1875, not 1900. Also states "300 Hz electrical at idle" but (1875/60)×6=187.5 Hz, not 300 Hz. Cited to fitzgerald-kingsley-umans-2014 but the numbers are wrong.
3. Line 509 battery storage claim: "<0.1% of installed grid capacity globally" cited to kundur-1994-power-stability (published 1994) — this is a 2020s statistic; a 1994 book cannot back it.
4. Lines 806-807 Case 17.3 wind turbine offshore spec: "8–15 MW for current off-shore designs" cited to fitzgerald-kingsley-umans-2014 (published 2014). 15 MW turbines are 2020+ designs the 2014 textbook cannot have covered.
5. Line 782 Case 17.2 Hoover Dam spec: efficiency claims (synchronous-generator >0.97, water-to-wire ~0.90) are unsourced — the only case body cite is fitzgerald or grainger but neither specifically backs these efficiency numbers.
6. Lines 1060-1065 pumped-hydro FAQ: round-trip efficiency "75–85%" and battery "~90–95%" cited to grainger-power-systems-2003. Grainger/Stevenson is a power systems analysis text, not a storage-technology reference; battery efficiency comparison in particular is outside its scope.
7. Lines 985-995 out-of-phase breaker close FAQ: "roughly 20–50 times rated" transient current — specific numerical claim with no <Cite />.

**WARNINGs (arithmetic/number issues): 3**
1. Line 394-397 (car alternator frequency): "idle ≈ 750 RPM crank → ~1900 RPM alternator" should be 750×2.5=1875. "300 Hz electrical at idle" is wrong: (1875/60)×6=187.5 Hz. "500 Hz at cruise" (2000×2.5=5000 RPM, (5000/60)×6=500 Hz) — cruise frequency is correct.
2. Line 413 (3-phase bridge ripple): "peak-to-valley ~14% of average" — the actual peak-to-valley as % of V_avg_bridge is ~8%; peak-to-valley as % of V_peak is ~13.4%. The 14% figure is an approximation of the peak-to-valley relative to peak, not to average. Ambiguous but the stated denominator ("of average") makes the number wrong.
3. All TryIt arithmetic verified correct: Try 17.1 (≈377 V), Try 17.2 (180 RPM), Try 17.3 (δ≈63°, P_max≈0.93 pu), Try 17.4 (750 Hz), Try 17.5 (−0.125 Hz/s), Try 17.6 (−0.375 Hz/s).

**Why:** See above for details. Key pattern: fitzgerald-kingsley-umans-2014 (2014 text) cited for state-of-the-art offshore wind specs that postdate publication; kundur-1994 cited for present-tense grid-storage statistics.

**How to apply:** Flag any cite that tries to use a pre-2015 textbook to back a "current" or "today" quantitative claim about renewable energy penetration, battery storage, or offshore wind ratings.
