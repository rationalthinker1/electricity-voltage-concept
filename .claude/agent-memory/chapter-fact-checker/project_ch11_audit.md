---
name: project-ch11-audit
description: Ch.11 Relativity audit findings 2026-05-25 — 3 suspect numbers, 1 internal inconsistency, 0 unsourced/unresolved cites
metadata:
  type: project
---

# Ch.11 Relativity audit (2026-05-25)

**Lint**: clean (0 HIGH findings).
**All <Cite> IDs resolve**: einstein-1905, feynman-II-13, griffiths-2017, jackson-1999, purcell-morin-2013, ashby-2003, kaplan-hegarty-2017, schwinger-1949, bruning-lhc-2004, williams-faller-hill-1971, codata-2018 all in both SOURCES and chapter.sources[].
**No unsourced factual claims found.**
**No misaligned cites found** (all sources plausibly back their claims).

## Findings

### HIGH / Suspect numbers

**Case 11.2 gamma-1 exponent (line 572)**: Spec says `γ − 1 ≈ ½(v_d/c)² ≈ 2.7×10⁻²⁵`. Actual: v_d=2.2×10⁻⁵ m/s → (v_d/c)²/2 = 2.7×10⁻²⁷. Off by 2 orders of magnitude.

**Case 11.2 net charge density (line 575-576)**: Spec says `~−5×10⁻²⁵ C/m`. Actual from n·e·v_d²·A/c² = 2.4×10⁻²² C/m. Off by 3 orders of magnitude.

**Case 11.2 electron deficit (line 601)**: Prose says `~3×10⁻⁶ electrons per metre`. Actual: ~1.5×10⁻³ electrons per metre. Off by 3 OOM. (The spec gamma-1 and lambda' values are internally consistent with each other but both wrong vs the physics — they share the same exponent error in v_d/c.)

### MED / Internal inconsistency

**GPS net offset 38.5 vs 38.6 μs/day**: Case 11.1 summary (line 504) says "38.6 microseconds a day"; Try 11.3 answer, Case 11.1 specs (lines 432, 517, 535) all say "38.5 μs/day". The ashby-2003 source note also says 38.6. Arithmetic within the chapter (-7.2 + 45.7 = 38.5) is self-consistent; the summary is the outlier. Correct to 38.5 throughout or to the Ashby paper's canonical 38.4 μs/day value.

## Clean

- All TryIt gamma values (lines 222-225): verified correct to 4 d.p.
- Length contraction Try 11.2 (line 402): 0.866 m correct.
- LHC γ ≈ 7462 (stated as ~7460): acceptable rounding.
- LHC 1-v/c ≈ 9×10⁻⁹ (stated): correct.
- LHC "under three metres per second" lag: actual 2.70 m/s — correct.
- LHC ring contracted to ~4 m: actual 3.57 m — correct.
- Diamond Light Source γ≈5870 at 3 GeV: actual 5871 — correct.
- (m_e/m_p)⁴ ≈ 10⁻¹³: actual 8.8×10⁻¹⁴ — within stated order of magnitude.
- FAQ 20 A → 1.2×10²⁰ electrons/s: actual 1.25×10²⁰ — fine.
- All historical attributions (Einstein 1905, §9; Maxwell 1865; Schwinger 1949 Phys.Rev.75,1912) verified correct.
- bruning-lhc-2004 source note says "27 km" (rounded) but chapter uses 26.659 km; the LHC design report gives 26,659 m, so chapter value is more precise and correct.

**Why**: The Case 11.2 exponent errors look like a transcription error: the author may have written v_d/c ≈ 7×10⁻¹⁴ and then computed (v_d/c)²/2 incorrectly as if v_d/c ≈ 7×10⁻¹³ (adding only one power of 10 instead of squaring). All three wrong numbers derive from the same root error.
