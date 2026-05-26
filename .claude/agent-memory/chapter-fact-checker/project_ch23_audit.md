---
name: ch23-audit-findings
description: Ch.23 Transformers fact-check results, 2026-05-26
metadata:
  type: project
---

Audit date: 2026-05-26. Lint: CLEAN (no H-level findings).

**Verified clean:**
- All Cite IDs resolve in both sources.ts and chapter.sources[].
- Turns ratio formula arithmetic: 12470/240 ≈ 52:1 ✓; 7200/240 = 30:1 ✓; V=4.44fNBA gives A≈3.0e-3 m² ✓.
- 12.47/7.2 kV voltage pair: 12.47/√3 = 7.20 ✓ (no H5 violation).
- Try 23.4 I²R arithmetic: 250²×10 = 625 kW ✓; 2.5²×10 = 62.5 W ✓; ten-thousand-fold / hundred-fold claims ✓.
- Try 23.5: 20²×8 = 3.2 kΩ ✓.
- Case 23.4: 25:1 turns ratio, 8Ω → 5 kΩ ✓.
- Lamination scaling (body): (0.3/30)² = 1e-4, so 10⁴× reduction ✓.
- FAQ lamination: (0.3/10)² ≈ 1/1111 ≈ 1000× (FAQ says "about a thousand times") ✓.
- 400 Hz / 60 Hz: ratio 6.67×, "roughly six times" is acceptable rounding ✓.
- Steinmetz exponent 1.6 ✓. Ferrite Bsat ~0.4 T ✓. Silicon steel ~1.5–1.8 T ✓.
- Magnetizing current 1–5% ✓. T&D losses 5–8% ✓.

**BLOCKER findings:**
1. `chapters.ts` blurb line 837: "Stanley turned it into a working power-grid component in **1885**" — source `stanley-1886` and chapter prose both say **1886**. Date is wrong in the blurb. Fix: change 1885 → 1886.
2. Line 262–265: large utility transformer "99–99.5 % efficiency"; then line 768: "typical values of 95–99.5 % for large units." The lower bound shifts from 99% to 95% with no explanation. These are two different claims about the same category; one of them is over-broad. The line 262 cite (mclyman-2004) backs 99–99.5% for nameplate-load large units; the line 768 cite (fitzgerald-2014) backs the broader 95–99.5% range that includes lightly-loaded and smaller-distribution units. Not a factual error per se, but the two claims in the same chapter are inconsistent and could confuse readers.
3. Case 23.1, service-life spec line 893: "30–40 years; mineral-oil cooling and insulation" — no `<Cite>`. Needs a cite (grainger-power-systems-2003 or mclyman-2004 would back it).
4. Case 23.2, mass spec lines 937–941: "~5 g for a 30 W unit; 1000× lighter than a linear 60 Hz equivalent" — no `<Cite>`. mclyman-2004 is cited in the adjacent prose (lines 960–962) for the same claim; add `<Cite id="mclyman-2004">` to the spec row.
5. Case 23.3, cooling spec line 996 and mass spec line 998: "ONAN/ONAF" and "40–100 tonnes" — both uncited. grainger-power-systems-2003 or fitzgerald-kingsley-umans-2014 backs these.
6. Lines 817–820: "Run a 100 W transformer at 60 Hz and it needs roughly 120 cm³ of silicon steel. Run the same 100 W transformer at 100 kHz and the equivalent ferrite core is about **1700 times smaller**." The 1700× figure is correct for the frequency ratio alone (100000/60 ≈ 1667×). But ferrite Bsat is ~0.4 T vs silicon steel ~1.5 T, so the actual size advantage after accounting for lower Bsat is closer to 440×. The "a few cubic centimetres" claim roughly matches practical EE-core sizes at that power level. The "weighing five grams instead of six hundred" is soft — a 100 W flyback ferrite core is ~15–30 g, not 5 g; the 5 g claim comes from Case 23.2 which is for a 30 W unit. Recommend either qualifying the wattage or softening "five grams."

**WARNING (suspect numbers):**
- Line 819: "five grams instead of six hundred" appears to mix ratings: 5 g corresponds to a 30 W unit (per Case 23.2), but the surrounding prose is about 100 W transformers. Prose should say "tens of grams instead of roughly half a kilogram" for a 100 W comparison, or explicitly say "a 30 W flyback weighs about 5 g."

**Patterns noted:**
- Case study spec rows without Cite tags are a recurring pattern across all chapters; Ch.23 has several (cooling, mass, service-life rows).
- Date mismatches between chapter blurb and body prose (here 1885 vs 1886) are a recurring pitfall; the blurb text in chapters.ts is written separately and can fall out of sync.
