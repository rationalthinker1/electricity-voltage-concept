---
name: project-ch15-audit
description: Ch.15 Fourier and Harmonic Analysis fact-check findings 2026-05-25
metadata:
  type: project
---

Audit date: 2026-05-25. File: `src/textbook/Ch15FourierHarmonics.tsx`. Lint: CLEAN.

**Key findings:**

HIGH (Arithmetic error):
- N=65536 FFT speedup stated as 1638× at lines 719 and 1053. Correct value: 4096× (N²/N·log₂N = 65536²/(65536×16) = 4096). Error recurs in both TryIt 15.4 answer and FAQ "Why is the FFT so important?" paragraph. **Why:** 1638 doesn't correspond to any standard calculation; appears to be an arithmetic error or confused formula.

HIGH (Arithmetic inconsistency):
- Scope case study (line 887): "naive DFT would take ~10¹⁸ operations per buffer; with the FFT it takes ~10⁷". Buffer size spec is 10⁴–10⁷ samples (line 859). At N=10⁷: naive=10¹⁴, FFT≈2×10⁸. The pair 10¹⁸ and 10⁷ are mutually inconsistent: 10¹⁸ implies N=10⁹, but then FFT≈3×10¹⁰, not 10⁷.

MED (Unsourced historical attribution):
- Gauss 1805 Pallas paragraph (lines 695-699): historical attribution (name + year + claim) with no `<Cite>` tag. Source: cooley-tukey-1965 paper itself cites Gauss's notebooks; or soften "apparently" further and drop year.

MED (Source-fitness):
- MP3 case study (lines 780-800): `oppenheim-willsky-1997` cited for MDCT/psychoacoustic masking (~150 Hz, ~50 ms) specifics. O&W is "Signals and Systems" covering LTI theory, not codec internals. ISO/IEC 11172-3 would be the primary source; prefer softening the 150 Hz/50 ms claims.

MED (Unsourced claims in MP3 section):
- "~150 Hz" masking bandwidth and "~50 ms" temporal masking (lines 785-786): no `<Cite>` tag at all. Both are rough approximations (critical bands vary with frequency; post-masking is typically 100-200 ms). Soften or add ISO reference.

MED (Source-fitness):
- IEEE 519 harmonic limits (3–5% / 5–8%) cited to `horowitz-hill-2015` (lines 606-609, 549). H&H is not authoritative for IEEE standards; prefer `grainger-power-systems-2003` (which at least covers power systems) or soften to "typically below a few percent."

LOW (Historical attribution uncited):
- "Good-Thomas, 1958", "Winograd (1976)", "Bluestein's chirp-z (1968)" (lines 1068-1069): three name+year attributions with only the `oppenheim-willsky-1997` end-of-paragraph cite. Winograd's key paper is 1978 (Math. Comp. 32, 175-199), not 1976 — possible year error.

**All other arithmetic verified clean:**
- Gibbs 8.95% formula correct (verified numerically)
- Form factor π/(2√2) ≈ 1.111 correct
- 5th harmonic coefficient 4/(5π) ≈ 0.255 correct
- UK 230Vrms → 325V peak correct; US 120Vrms → 170V peak correct
- N=1024: 102× speedup correct (prose says ~100× in FAQ, 102× in TryIt — both acceptable)
- N=4096: 341× speedup correct (prose says 340× — OK)
- N=16M: >600,000× correct (prose says "over 600,000×" — OK)

**How to apply:** The N=65536 speedup error (1638× vs 4096×) and the scope arithmetic inconsistency (10¹⁸/10⁷) are the only true arithmetic errors. Both need correction. The citation-fitness issues are secondary.
