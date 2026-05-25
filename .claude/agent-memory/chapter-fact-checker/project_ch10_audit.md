---
name: ch10-audit-findings
description: Ch.10 Maxwell's equations together fact-check audit findings — last re-audited 2026-05-25
metadata:
  type: project
---

Audit conducted 2026-05-21, re-audited 2026-05-25 against src/textbook/Ch10Maxwell.tsx.

**Why:** Ongoing fact-check sweep; re-run to confirm outstanding blockers after a round of fixes was applied to other chapters.
**How to apply:** Use as baseline when anyone edits Ch.10 content.

## Outstanding BLOCKERs (as of 2026-05-25 re-audit)

### Unsourced prose claims
- Line 538-540: Maxwell's "310,740,000 m/s" and Fizeau's "315,000,000 m/s" — no cite on either number. `maxwell-1865` cite is deferred to the Maxwell quote two sentences later. No `fizeau-1849` entry in registry. Remedy: move the `maxwell-1865` cite to immediately after "310,740,000 m/s"; for Fizeau's figure either add a Fizeau source or soften to "the then-best measurement" without the exact number.

### Unsourced case-study spec lines
- All specs in Cases 10.1–10.4 (24 total spec entries) still lack individual `<Cite>` tags. Key missing cites:
  - Case 10.1 (Hertz): 6 spec lines — source `hertz-1888` should cover all.
  - Case 10.2 (Marconi): 6 spec lines — `hong-2001-wireless` covers path/distance/date; transmitter power/wavelength/antenna need softening or that same source.
  - Case 10.3 (GPS): 6 spec lines — `kaplan-hegarty-2017` covers L1 freq, altitude, EIRP; received −130 dBm and 43 dB processing gain also covered by Kaplan/Hegarty.
  - Case 10.4 (21 cm): 6 spec lines — `ewen-purcell-1951` covers freq, wavelength, detection; lifetime ~10⁷ yr is well-known but needs a cite (e.g. Griffiths or a quantum textbook).

### Misaligned citations
- Line 1030: "QED predicts anomalous magnetic moment to twelve decimal places of accuracy" cited to `feynman-II-18` (1964 Feynman lectures). Feynman Vol II Ch.18 is about the Maxwell equations, not QED precision calculations. Best remedy: soften to "extraordinary precision" without "twelve decimal places" (which requires a modern QED reference ca. 2023 that is not in the registry), OR add a modern source.

## Precision issue (MED)
- Line 778: hydrogen hyperfine energy "5.9 μeV" — actual CODATA value is 5.874 μeV. Chapter rounds to 5.9 μeV without a cite. Soften to "~5.9 μeV" or correct to "~5.87 μeV" and add `codata-2018` cite.

## Clean items confirmed (2026-05-25)
- All 13 `<Cite>` IDs resolve correctly; all are in chapter.sources[].
- Lint: clean (no H1-H5 findings).
- TryIt 10.1–10.5 arithmetic: all correct.
- ε₀, μ₀ values: correct.
- GPS L1 wavelength ~19 cm: correct (c/1575.42 MHz = 19.03 cm).
- 21 cm wavelength 21.106 cm: correct.
- GPS EIRP ~27 dBW (~500 W): correct.
- GPS processing gain ~43 dB: correct (1.023 Mcps / 50 bps = 43.1 dB).
- Maxwell 1865 death year 1879: correct (cited to griffiths-2017 — defensible for biographical note in a textbook).
- Milky Way ~10^67 H atoms: correct order of magnitude.
- Maxwell's 1865 speed 310,740,000 m/s: correct per the primary source.
- Hertz Karlsruhe lab attribution: correct.
- Van de Hulst 1944 / Ewen & Purcell 1951 dates: correct per ewen-purcell-1951.
- Dirac 1931 monopole/charge-quantization: correctly cited to dirac-1931.
- Fine-structure constant ~1/137: correct.
