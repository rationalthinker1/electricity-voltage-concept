---
name: project-ch3-audit
description: Ch.3 Resistance and Power audit findings — re-audited clean 2026-05-25 after BLOCKER fixes
metadata:
  type: project
---

Audit of `src/textbook/Ch3ResistanceAndPower.tsx`.

**Why:** Fact-check pass for factual accuracy, citation coverage, and arithmetic before merge.
**How to apply:** Use as baseline when re-auditing Ch.3 or auditing adjacent chapters (Ch.4 uses same crc-resistivity and matthiessen patterns).

## Re-audit 2026-05-25 — CLEAN

All 4 BLOCKERs and 4 WARNINGs from 2026-05-20 have been resolved:

- `coaton-marsden-1997` now appears at line 43 (opening para "2800 K" cite added).
- Iron/Tungsten ordering is correct: iron at 1.0×10⁷, tungsten at 1.79×10⁷, copper at 5.96×10⁷. Nichrome "sixty times worse" (not seventy).
- Fermi velocity terminology fixed: prose now says "Fermi speeds of order 10⁶ m/s" and the Term popover gives 1.6×10⁶ m/s. The v_F/v_d ratio "around 10^10" is mathematically consistent (1.6×10⁶ / 10⁻⁴ = 1.6×10^10, rounding to 10^10 is acceptable order-of-magnitude language).
- `feynman-II-2` is no longer cited in this chapter.
- All cite IDs resolve: full sources array = {drude-1900, ashcroft-mermin-1976, crc-resistivity, kanthal, joule-1841, griffiths-2017, onnes-1911, bcs-1957, matthiessen-1864, nec-2017-aluminum, grainger-power-systems-2003, irwin-circuit-analysis-2015, coaton-marsden-1997}.

## Minor registry note (not a chapter defect)

`grainger-power-systems-2003` key has a year mismatch: registry entry says year: 1994 (which is the correct publication year for the Grainger/Stevenson Power System Analysis textbook), but the key implies 2003. Pre-existing registry issue, not Ch.3-specific.

## Arithmetic verified
- Try 3.1: R = 0.0839 Ω ≈ 84 mΩ. Correct.
- Try 3.2: I = 20 A, P = 2.4 kW. Correct.
- Try 3.3: t = 167 s ≈ 2 min 47 s. Correct.
- Try 3.4: R_tot = 11 Ω. Correct.
- Case 3.2: 1 GW at 11 kV = 90.9 kA ≈ "91 kA"; at 500 kV = 2 kA. Correct.
- Loss ratio (500/11)² = 2066, prose says "≈ 2000" (acceptable rounding).
- Ag vs Cu gap: 5.7%, prose says "about 5%" (acceptable rounding).
- 27 numerical/historical claims audited; 27 resolved correctly; 0 blockers.
