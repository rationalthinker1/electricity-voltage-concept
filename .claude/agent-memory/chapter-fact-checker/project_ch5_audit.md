---
name: ch5-audit-findings
description: Ch.5 Capacitors fact-check audit findings (2026-05-21) — BLOCKERs and WARNINGs
metadata:
  type: project
---

Audit conducted 2026-05-21 against src/textbook/Ch5Capacitors.tsx.

**Why:** Ongoing fact-check sweep of all chapters to ensure citation integrity.
**How to apply:** Use as baseline when anyone edits Ch.5 content.

## BLOCKERs (7 total)

### Misaligned cites
- Lines 55, 362, 733: `feynman-II-2` cited for "energy lives in the field" claims. Vol II Ch.2 is vector calculus (curl/div/gradient), NOT field energy. Correct cite is `feynman-II-27` ("Field Energy and Field Momentum"). `feynman-II-27` is in registry but NOT in the chapter's sources array. Fix: add `feynman-II-27` to sources array AND replace `feynman-II-2` with `feynman-II-27` at lines 55, 362, 733.

### Unsourced spec lines
- Line 579: `{ label: 'Discharge time', value: <>~5–20 ms (transthoracic impedance ~50 Ω)</> }` — no `<Cite />`. Can extend horowitz-hill-2015.
- Line 612: Case 4.2 spec `Per-cell baseline capacitance ~1–5 pF` — no cite.
- Line 621: Case 4.2 spec `Scan rate ~60–240 Hz typical` — no cite. horowitz-hill-2015 would cover.
- All 4 Case 4.3 (supercap) spec lines (lines 657-666): no cite on any of them. horowitz-hill-2015 is cited in the prose below.
- All 4 Case 4.4 (camera flash) spec lines (lines 693-699): no cite on any of them. No source currently in chapter sources covers these specs.

### Unsourced prose claims
- Line 683: "energy density is ~10× lower than lithium-ion" — no cite.

## WARNINGs (2 total)

### Arithmetic inconsistency
- Line 683 vs Lines 839-840: Case 4.3 says supercaps are "~10× lower" energy density than Li-ion. But the FAQ at line 839 gives Li-ion ~250 Wh/kg vs supercap ~10 Wh/kg = a 25× ratio. The chapter's own numbers contradict the "10×" claim. Fix: either change "10×" to "~25×" or change the FAQ numbers to a Li-ion figure consistent with 10× (e.g., ~100 Wh/kg pack-level).

### Defibrillator τ mismatch
- Line 592: prose says `τ = RC ≈ 7 ms` with `R = 50 Ω` transthoracic impedance. With C = 150 µF → τ = 7.5 ms (correct). But spec at line 567 says C range is 100–200 µF, giving τ = 5–10 ms. The "7 ms" is accurate for 150 µF but is slightly misleading when the spec range is broad. Not a hard error — within range — but worth noting. Actually: at 100 µF → τ = 5 ms, at 150 µF → τ = 7.5 ms, at 200 µF → τ = 10 ms. The claim "τ ≈ 7 ms" is in the middle of the spec range and is arithmetically correct for the stated 150 µF exemplar.

## Clean
- All mathematical formulas (C = ε₀A/d, Q = CV, U = ½CV², τ = RC, V_C(t)) are correctly stated.
- TryIt 5.1: C = 44 pF correct. TryIt 5.3: U = 7.2 mJ, N = 7.5×10¹⁵ correct. TryIt 5.2: W = 10 nJ correct. TryIt 5.4: τ = 1 s, 5τ = 5 s correct.
- Camera flash ~5000× power multiplier (5 s / 1 ms) is arithmetically correct.
- ε₀ = 8.854×10⁻¹² F/m correctly cited to codata-2018.
- Historical attributions: Volta 1782 → volta-1782 (correct); Leyden jar 1745/1746 → leyden-jar-1745 (correct).
- Musschenbroek "kingdom of France" quote is historically documented (letter to Réaumur) and attributed to leyden-jar-1745; the registry note doesn't explicitly mention the letter but the source covers the discovery event. Borderline but defensible.
- Case 4.3 supercap energy per cell: ~10.9 kJ = ½ × 3000 × 2.7² = 10,935 J ✓
- Case 4.4 flash energy: ~8 J = ½ × 150e-6 × 330² = 8.17 J ✓ (labeled "~8 J", fine)
