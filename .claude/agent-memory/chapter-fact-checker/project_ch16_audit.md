---
name: project-ch16-audit
description: Fact-check audit results for Ch16 (Filters, op-amps, transmission lines) — slug filters-op-amps-tlines
metadata:
  type: project
---

# Ch16 Audit — Filters, Op-Amps, Transmission Lines

**Date:** 2026-05-25
**Result:** CLEAN — no HIGH or MED findings. Two LOW findings (minor historical attributions inside Term defs).

## Sources array (6 keys)
`horowitz-hill-2015`, `oppenheim-willsky-1997`, `sedra-smith-2014`, `widlar-1965`, `pozar-2011`, `johnson-graham-1993` — all present in registry.

## Arithmetic verified correct
- TryIt 16.1b: f0 = 1/(2π·10kΩ·10nF) = 1.59 kHz ✓
- TryIt 16.1: R = 1/(2π·1kHz·10nF) = 15.9 kΩ ✓
- TryIt 16.3 (quarter-wave): Z0 = sqrt(200·50) = 100 Ω ✓
- TryIt 16.3b (reflection): Γ = 1/3, power fraction 8/9 ≈ 89% ✓
- 50Ω compromise: sqrt(77·30) ≈ 48 Ω ✓
- LM741 slew-rate limit at 10 V peak: SR/(2π·Vp) = 0.5e6/(2π·10) ≈ 8 kHz ✓
- PCB TL threshold at 1 ns rise: (1/6)·1ns·1.5e8 = 2.5 cm ✓
- Sallen-Key K=1.586 for Butterworth Q=1/√2 ✓
- 4th-order Butterworth Q pairs: 0.54 and 1.31 (standard values 0.5412/1.3066) ✓

## LOW findings
1. "Bode plot — Named after Hendrik Bode at Bell Labs (1940s)" (line 138, inside Term def) — no cite on that line; the paragraph's `oppenheim-willsky-1997` cite is nearby but attached to a different sentence.
2. "Philip Smith, working at Bell Labs in 1939" (line 619) — `pozar-2011` cite at line 622 covers it adequately (Pozar §2 discusses Smith chart history), but the cite is on the end of the same paragraph not on the attribution sentence itself. Acceptable.

## Well-sourced claims confirmed
- LM741 GBW 1 MHz, TL081 GBW 3 MHz, slew rates — covered by H&H + Sedra-Smith at lines 410-411
- LM741 30 pF internal cap, ~10 Hz open-loop corner, ~60° phase margin — covered by Sedra-Smith line 957
- LM741 (1968) attribution — matches widlar-1965 registry note (says "LM741, National Semiconductor, 1968")
- Op-amp open-loop gain 10^5–10^6 (line 851) — covered by sedra-smith-2014 cite at line 859
- Smith chart bilinear conformal map — covered by pozar-2011 at line 622

**Why:** Ch16 was written with good citation hygiene; no missing numeric cites, no arithmetic errors.
