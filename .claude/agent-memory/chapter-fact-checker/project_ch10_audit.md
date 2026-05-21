---
name: ch10-audit-findings
description: Ch.10 Maxwell's equations together fact-check audit findings (2026-05-21) — BLOCKERs and WARNINGs
metadata:
  type: project
---

Audit conducted 2026-05-21 against src/textbook/Ch10Maxwell.tsx.

**Why:** Ongoing fact-check sweep of all chapters to ensure citation integrity.
**How to apply:** Use as baseline when anyone edits Ch.10 content.

## BLOCKERs (14 total)

### Unsourced prose claims
- Line 550: Maxwell's calculated speed "310,740,000 m/s" lacks `<Cite>`; nearest `maxwell-1865` cite is two sentences later.
- Line 552: Fizeau's 1849 measurement "315,000,000 m/s" is unsourced; no `fizeau-1849` key exists in registry.
- Line 665: Case 8.2 summary "12 December 1901" lacks `<Cite>`.
- Line 715: Case 8.3 summary "1575.42 MHz, 20,200 km altitude" lacks `<Cite>`.
- Line 765: Case 8.4 summary "1420.406 MHz" lacks `<Cite>`.
- Line 743: GPS received power "−130 dBm" lacks `<Cite>`.
- Line 746: GPS spread-spectrum processing gain "~43 dB" lacks `<Cite>`.
- Line 786: Hydrogen hyperfine energy splitting "5.87 μeV" lacks `<Cite>`.
- Line 788: 21-cm transition mean lifetime "~10⁷ years" lacks `<Cite>` (spec and prose).
- Line 890: Dirac's 1931 monopole/charge-quantization claim lacks `<Cite>`; preceding `griffiths-2017` cite ends before this sentence.

### Unsourced case-study spec lines
- Lines 619-629: All six Hertz spec entries lack `<Cite>` (transmitter, wavelength, frequency, detector, standing-wave measurement, inferred speed/error bars).
- Lines 671-676: All six Marconi spec entries lack `<Cite>` (date, path, distance, transmitter type, carrier wavelength, receiver antenna).
- Lines 720-725: All six GPS spec entries lack `<Cite>` (L1 frequency, L1 wavelength, constellation, altitude, EIRP, received signal level).
- Lines 770-779: All six 21-cm spec entries lack `<Cite>` (frequency, wavelength, transition, predicted by, detected by, mean lifetime).

### Misaligned citations
- Line 1058: FAQ claims QED predicts electron anomalous magnetic moment "to twelve decimal places of accuracy." Cited to `feynman-II-18` (1964), which predates modern 12-decimal-place QED results. Needs modern QED source or softened claim.
- Line 770: 21-cm spec lists frequency "1420.40575177 MHz" backed by `ewen-purcell-1951`, which reported 1420.406 MHz. Same for wavelength "21.106 cm" (paper gives "21 cm"). Precision mismatch.

## WARNINGs (0 total)

- All derived arithmetic checks out. No suspect numbers flagged.

## Clean
- 55 `<Cite>` tags audited; all resolve to real registry keys and are present in the chapter's `sources` array.
- Historical attributions with inline cites are correctly placed.
- TryIt 10.1–10.5 arithmetic is correct.
- Physical constants (ε₀, μ₀) and derived values (c, 21-cm energy/lifetime) are numerically accurate.
