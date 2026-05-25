---
name: project-ch9-audit
description: Findings from Ch.9 (em-waves) fact-check audit — May 2026
metadata:
  type: project
---

Ch.9 (em-waves) audit completed 2026-05-25.

**Why:** Fact-check all numerical, historical, and attribution claims in Ch9EMWaves.tsx.

**Key findings:**

BLOCKER (misaligned cite):
- Line 599: `hertz-1888` cited to support the claim that EM waves travel at c from Earth to Moon (1.28 s). Hertz's 1888 paper is about producing/detecting radio waves in a lab — it says nothing about light travel time to the Moon. Cite is semantically misaligned. Recommend: soften sentence (drop the `hertz-1888` cite from Try 9.5 answer, or use `codata-2018`/`maxwell-1865`).
- Line 862: FAQ says Maxwell wrote down displacement current in "1861" citing `maxwell-1865`. Historically accurate (Maxwell's 1861 paper 'On Physical Lines of Force' introduced it), but the source key is the 1865 paper which does not describe the 1861 introduction. Either use `maxwell-1865` as the published synthesis (and soften "wrote down in 1861" to "introduced and formalised"), or add a `maxwell-1861` source if that precision is needed.

BLOCKER (unsourced factual):
- Lines 1035–1043: Olbers' paradox FAQ states CMB temperature "about 2.7 K" with no `<Cite>`. This is a specific numerical claim that needs a source (CODATA or Penzias–Wilson).
- Line 891: "spiral into the nucleus in about 10⁻¹¹ seconds" — the specific timescale is cited to `feynman-II-21` which covers it, so this is fine.
- Lines 1051–1057: Rayleigh scattering "about six times as readily" for blue vs red — cited to `jackson-1999`, plausible. No issue.
- Lines 975–986: Michelson-Morley, Einstein 1905 — both cited. OK.

SUSPECT NUMBER (minor):
- Line 824–825: Case 9.4 prose says X-ray λ is "roughly five orders of magnitude shorter" than visible. At 0.01 nm vs 500 nm = 5e4x = 4.7 orders; at 0.1 nm vs 500 nm = 5000x = 3.7 orders. The claim is approximately true only at the hard-X-ray extreme. The spec table correctly says 0.01–0.1 nm. Recommend soften to "four to five orders of magnitude shorter."

INTERNAL INCONSISTENCY:
- IKAROS sail area: Case 9.3 specs and prose say "20 m × 20 m" = 400 m². Try 9.4 answer (line 567) says "200 m² polyimide sail." The tsuda-2013-ikaros source says 196 m² (≈14 m × 14 m membrane, with the full 20 m being diagonals/total span). The "200 m²" and "400 m²" values conflict internally. The tsuda source records ~196 m² (actual membrane area), which rounds to ~200 m². The "20 m × 20 m" is the sail diagonal span, not the membrane area. Recommend: standardise on ~196 m² (~200 m²) and clarify "20 m across" rather than "20 × 20."

CLEAN: All arithmetic checks pass (radiation pressure, wavelength/frequency products, lunar travel time, Try 9.1–9.5). All key source IDs (`maxwell-1865`, `hertz-1888`, `codata-2018`, `griffiths-2017`, `jackson-1999`, `feynman-II-21`, `kopp-lean-2011`, `tsuda-2013-ikaros`, `rontgen-1895`, `ieee-80211`, `buffler-1993`, `rappaport-2013-mmwave`, `einstein-1905`) are in both SOURCES and chapter.sources[].

**How to apply:** The main action items are (1) fix hertz-1888 on Try 9.5, (2) add cite for 2.7 K CMB, (3) fix IKAROS area inconsistency, (4) soften X-ray order-of-magnitude claim.
