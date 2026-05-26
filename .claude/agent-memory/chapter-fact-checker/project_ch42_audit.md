---
name: ch42-audit-findings
description: Chapter 42 (fiber-optics) fact-check audit findings, 2026-05-26
metadata:
  type: project
---

Audit of src/textbook/Ch42FiberOptics.tsx. Lint CLEAN. 10 sources in registry, all resolve. Key findings:

**HIGH — Wrong historical attribution (line 315):** "Maurer, Keck, and Schultz at Corning" — the third author is Kapron, not Schultz. Source registry entry `kapron-keck-maurer-1970` correctly names Kapron, Keck, Maurer.

**HIGH — Wrong arithmetic: critical angle (lines 106–109):** n_core=1.448, n_clad=1.444 give θ_c = 85.74° from normal and 4.26° from axis. Prose says 85.2° and 4.8° respectively. Error ~0.5° on each figure.

**HIGH — Internal inconsistency: NA mismatch (lines 105, 155, 584):** n_core=1.448/n_clad=1.444 gives NA = 0.108, not ~0.14. The Term def (line 139) and FAQ (line 584) both say NA ≈ 0.14. The two pairs (n=1.448/1.444 vs NA=0.14) are mutually inconsistent — NA=0.14 requires an index step of ~0.46%, not the 0.276% step implied by the stated indices.

**HIGH — Wrong arithmetic: chromatic dispersion (lines 456–458):** "For coherent 100G QPSK at 28 GBaud over 1000km of standard SMF, raw chromatic dispersion would smear pulses by ~30 ps." Accumulated dispersion = D×L = 17 ps/nm/km × 1000 km = 17,000 ps/nm. For a 28 GBaud signal with ~0.2 nm spectral width, spread ≈ 3,400 ps (3.4 ns), not 30 ps. Off by ~2 orders of magnitude. The 30 ps figure is not derivable from D=17 ps/nm/km at any plausible 28 GBaud spectral width.

**MED — Internal inconsistency: attenuation values (lines 299, 592–596):** Main text says "modern silica reaches roughly 0.18–0.20 dB/km" (the standard SMF range). FAQ says "current best commercial fibers reach about 0.15–0.17 dB/km." Both cited to different sources. These are consistent if read as "typical" vs "best," but should be clarified.

**MED — Uncited claims:**
- Line 177: "few ns/km of pulse spread, capping data rates at ~10 Gb/s" for multimode modal dispersion — no cite
- Line 330: "Loss is higher (~0.35 dB/km)" at 1310 nm — no cite
- Line 441: "50 μm OM4 multimode fiber: ~0.1 ns/km of pulse spread, capping 10 G links to ~400 m" — no cite
- Line 448: "D ≈ +17 ps/nm·km at 1550 nm" for standard SMF — no cite
- Lines 602–606: SMF bend radius ~30 mm; G.657 drops to ~10 mm — no cite; G.657 is not in chapter sources
- Lines 609–613: mode-field coupling loss (~0.2 dB/μm offset, fusion <0.05 dB/joint, mechanical 0.3–0.7 dB) — no cite

**MED — Misaligned cite (lines 503–507):** "~25 Tb/s per fiber pair… That number doubles roughly every 4 years" cited to `agrawal-2010` (published 2010). These figures describe post-2015 records for probabilistic-shaping coherent WDM; Agrawal 4th ed. predates those achievements. Soften or remove the numerical claim.

**MED — Misaligned cite (line 531):** MAREA cable 0.155 dB/km for G.654.C fiber, cited to `agrawal-2010`. MAREA was deployed in 2017; Agrawal 4th ed. (2010) cannot be the source for this specification.

**LOW — Suspect NA value in Term def (line 139):** "A single-mode fiber typically has NA ≈ 0.14, accepting rays within ±8° of the axis." G.652 max NA is indeed 0.14 per spec, but actual deployed SMF-28 is closer to 0.12–0.13. This is a spec cap, not typical — worth softening.

Why: All arithmetic clean except the critical angle (off by ~0.5°) and the chromatic dispersion (~2 orders of magnitude off). The NA inconsistency (0.108 from the stated indices vs 0.14 asserted elsewhere) is a recurring contradiction throughout the chapter.
