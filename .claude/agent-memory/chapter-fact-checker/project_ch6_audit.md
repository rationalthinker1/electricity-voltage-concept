---
name: project_ch6_audit
description: Ch.6 Magnetism audit findings, 2026-05-25 — 3 BLOCKERs + 3 WARNINGs
metadata:
  type: project
---

**Audit date:** 2026-05-25. File: `src/textbook/Ch6Magnetism.tsx`.
Lint: CLEAN (no H-/M-level mechanical issues).

## BLOCKERs

### B1 — Unsourced historical attribution: Minkowski 1908
- Line 479: "Minkowski in 1908 to write them as two faces of one antisymmetric tensor"
- No `<Cite>` attached. No Minkowski entry in `src/lib/sources.ts`.
- Fix: soften ("shortly after, the E and B fields were unified into a single antisymmetric tensor") or add a registry entry for Minkowski 1908 (*Raum und Zeit*, Jahresbericht DMV 18, 75–88).

### B2 — Unsourced claim: "About thirty confirmed magnetars known in our galaxy" (line 679–681)
- Cited to `duncan-thompson-1992`, which is a *theory paper* proposing magnetar existence. It cannot confirm a count of observed objects.
- The standard observational catalog is Olausen & Kaspi (2014), McGill Online Magnetar Catalog. Not in registry.
- Fix: change cite to soften ("dozens of confirmed magnetars"), or add `olausen-kaspi-2014` to the registry.

### B3 — Unsourced numerical claim: MRI "0.3 T in the early 1980s" (line 529)
- No `<Cite>`. `lauterbur-1973` covers the 1973 zeugmatography proposal; it says nothing about early-1980s clinical field strengths.
- Fix: soften to "fractions of a tesla in the early 1980s" (dropping the specific 0.3 T), or find a real source (e.g., Hinshaw 2022 review in RSNA Radiology).

## WARNINGs (suspect numbers)

### W1 — Wrong arithmetic: "hundred million times weaker than magnetar" (Case 6.3, line 634)
- Earth ~50 µT; magnetar ~10¹⁰ T → ratio = 2×10¹⁴ (200 trillion), not 10⁸ (hundred million).
- The error is six orders of magnitude. Soften to "about 200 trillion times weaker" or "~10¹⁴ times weaker."

### W2 — Wrong arithmetic: "ten quadrillion times the Earth's field" (Case 6.4 summary, line 661)
- 10 quadrillion = 10¹⁶. Best-case ratio (10¹¹ T / 25 µT) = 4×10¹⁵; lower end = 1.5×10¹⁴.
- Even at the most favorable figures, the ratio is at most ~4 quadrillion. Correct to "a few quadrillion" or "~10¹⁴ to 10¹⁵."

### W3 — Internal inconsistency: LHC ring circumference (Case 6.2)
- Specs line 569: `26.7 km`; prose line 596–597: `27 km ring`.
- LHC design report (bruning-lhc-2004): 26.659 km. Standardize on 26.7 km throughout.

## What checked out clean
- All `<Cite>` keys resolve in both `sources.ts` and `chapter.sources[]`.
- TryIt arithmetic: all correct (TryIt 6.1: 40 µT ✓; TryIt 6.2: 20 mN/m ✓; TryIt 6.4: r≈0.107 m ✓).
- µ₀ value `1.257×10⁻⁶ T·m/A` correct (4π×10⁻⁷ = 1.2566…×10⁻⁶ ✓).
- FAQ B(1A, 1cm) ≈ 2×10⁻⁵ T ✓.
- MRI "fifty thousand times weaker" ≈ correct (at ~60 µT midpoint: 3 T / 60 µT = 50,000 ✓).
- Hall 1879 on gold: historically accurate (paper used gold leaf).
- Thomson 1897 "two decades" after Hall 1879: 18 years, acceptable.
- Einstein 1905 / Minkowski 1908 historical timeline: correct.
- NbTi ~9 T critical field at 4.2 K: physically reasonable (bruning-lhc-2004 backs this implicitly).
- Magnetar spec "~3×10¹⁰" ratio to MRI: defensible only using upper-end (10¹¹ T) field.
