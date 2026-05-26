---
name: ch5-audit-findings
description: Ch.5 Capacitors fact-check audit findings (re-audited 2026-05-25) — BLOCKERs and WARNINGs
metadata:
  type: project
---

Audit conducted 2026-05-25 against src/textbook/Ch5Capacitors.tsx. npm run lint:chapters --chapter 5 exits clean.

**Why:** Ongoing fact-check sweep of all chapters to ensure citation integrity.
**How to apply:** Use as baseline when anyone edits Ch.5 content.

## BLOCKERs (7 total)

### B1/M1 — feynman-II-2 misaligned for energy-in-field (most critical)
- Lines 57, 747: `feynman-II-2` ("Differential Calculus of Vector Fields") cited for "energy lives in the field" claim. Vol II Ch.2 is about curl-free E, NOT field energy. Correct cite: `feynman-II-27` ("Field Energy and Field Momentum", already in registry and chapter.sources). Both lines must be fixed.

### B2 — Water εᵣ ≈ 80, ceramics > 1000 unsourced
- Line 785-786: "Water comes in around 80; some specialist ceramics push past 1000." — closes after the jackson-1999 cite which covers the mechanism, not the specific values. Fix: add `moulson-herbert-2003` to chapter.sources array and append `<Cite id="moulson-herbert-2003">` at end of that sentence. (moulson-herbert-2003 is in registry, note covers BaTiO₃ εᵣ 1000-10000.)

### B3 — Case 5.3 supercap spec lines unsourced (all 4)
- Lines 672-682: per-cell cap 1000-3000 F, working voltage 2.5-2.7 V, energy 10.9 kJ, charge time. No <Cite> on any spec line. Prose body at 692 cites horowitz-hill-2015 (weak match for EDLC specs). Fix: add cites to spec lines or soften.

### B4 — Case 5.4 camera flash spec lines unsourced (all 4)
- Lines 708-715: 100-200 µF / 330 V, ~8 J, 3-5 s charge, 0.5-2 ms discharge. No cites. horowitz-hill-2015 plausible for some; add or soften.

### B5 — Case 5.2 per-cell baseline capacitance unsourced
- Line 628: "~1-5 pF" baseline touchscreen capacitance — no cite (only finger-change spec at 633 has cite). Add horowitz-hill-2015 cite.

### B6 — Supercap "~10× lower than lithium-ion" energy density unsourced
- Line 699: no cite. FAQ at line 847 gives Li-ion ~250 Wh/kg vs supercap ~10 Wh/kg (= 25× ratio, not 10×) cited to horowitz-hill-2015 (weak). Fix: swap to linden-reddy-2011 (already in registry) and add to chapter.sources array; also correct the "10×" → "~25×" to match the chapter's own numbers in the FAQ, or change the FAQ to ~100 Wh/kg consistent with 10×.

### M2 — horowitz-hill-2015 for clinical defibrillator specs
- Lines 576-610: H&H is an electronics design text, not a clinical medical device reference. The defib energy/cap/voltage specs (150-360 J, 100-200 µF, ~2 kV) are numerically reasonable but H&H is a weak source for clinical numbers. Soften to "typical clinical values" or add a medical-device engineering citation.

### M3 — horowitz-hill-2015 for Li-ion 250 Wh/kg and supercap ~10 Wh/kg
- Line 847-848: H&H is not a battery/supercap handbook. Correct source: linden-reddy-2011 (already in registry). Add to chapter.sources array.

## WARNINGs (2 total)

### W1 — Von Kleist date: "October 1745" likely should be "November 1745"
- Line 507 (prose) and sources.ts:1167 (source title): Both say "October 1745". Historical literature (Heilbron 1979) dates von Kleist's letter to November 4, 1745. Safer to say "autumn 1745" or "late 1745" in both places.

### W2 — Defibrillator τ slightly understated
- Line 608: τ = RC ≈ 7 ms, but with C = 150 µF and R = 50 Ω: τ = 7.5 ms. "~7 ms" rounds down. Change to "~7.5 ms" or "about 8 ms".

## Clean
- All inline arithmetic verified correct: Try 5.1 (44 pF), Try 5.2 (10 nJ), Try 5.3 (7.2 mJ, 7.5×10¹⁵ e), Try 5.4 (τ = 1 s), Case 5.3 energy (10.94 kJ), Case 5.4 energy (8.17 J), defib 300 J.
- ε₀ correctly cited to codata-2018. All core formulas correctly cited.
- Volta 1782, Leyden jar 1745/46 attributions match registry entries.
- Camera flash 5000× power multiplier (5s/1ms) correct.
- Debye/activated-carbon qualitative claims (thousands m²/g, nanometre gap) are textbook-standard; soft enough to not require new cites.
