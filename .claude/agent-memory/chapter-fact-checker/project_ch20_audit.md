---
name: ch20-audit-findings
description: Fact-check audit of Ch20Motors.tsx (slug: motors), re-audited 2026-05-26 (file substantially revised since 2026-05-21)
metadata:
  type: project
---

# Chapter 20 (Motors) Audit — 2026-05-26 (re-audit of revised file)

## Sources array check
Chapter 20 (`motors`) sources array in chapters.ts:
`feynman-II-13`, `griffiths-2017`, `tesla-1888`, `fitzgerald-kingsley-umans-2014`, `krishnan-2010-bldc`, `grainger-power-systems-2003`

All 6 keys exist in `src/lib/sources.ts`. The `jackson-1999` and `codata-2018` dead entries from the prior audit have been removed. `grainger-power-systems-2003` is new.

## Mechanical lint
`npm run lint:chapters -- --chapter 20` → CLEAN. No H1-H5 or M1/M4/M5 findings.

## BLOCKERs found

### B1. GM EV1 / RAV4 EV described as "DC motor" EVs (line 1034)
"Early EVs (GM EV1, 1996; Toyota RAV4 EV, 1997) actually did use DC motors."
This is factually WRONG. The GM EV1 used a 3-phase AC induction motor (Westinghouse/Hughes); the 1997 RAV4 EV used an AC synchronous motor. Neither used a DC motor. Cited to `krishnan-2010-bldc` which does not back this historical claim and cannot correct the error. Remedy: remove these two examples or replace with actual DC-motor EVs (some early 1990s conversion cars, some low-speed EVs). Alternatively, reframe: "some early EVs did use DC motors" without these specific incorrect examples.

### B2. ~150 °C demagnetization threshold for NdFeB (line 1065) — unsourced
"PM motors can irreversibly demagnetise above ~150 °C" — no Cite on this sentence. The paragraph ends with `<Cite id="fitzgerald-kingsley-umans-2014">` covering a different claim (efficiency trade-off). The 150 °C threshold is grade-dependent for NdFeB (H-grade ~80–120 °C, SH-grade ~150 °C, AH-grade ~200 °C) and needs a materials source. `krishnan-2010-bldc` covers this; alternatively soften to "well below the Curie temperature of ~310 °C, demagnetization can occur at temperatures typically above 100–200 °C depending on grade."

### B3. Clock "few seconds per year" cited to Grainger (line 503–506) — misaligned cite
"`grainger-power-systems-2003` (Power System Analysis)" covers transmission-line losses, not grid frequency regulation and timekeeping accuracy. The claim that synchronous-motor clocks keep time to "a few seconds per year" because "grid operators schedule periodic frequency corrections to keep accumulated cycle count aligned with civil time" needs a frequency-regulation source. `grainger-power-systems-2003` note says it covers I²R losses; it does not cover clock accuracy. Remedy: soften to remove the quantitative "few seconds per year" claim, cite `grainger-power-systems-2003` only for the frequency-regulation mechanism, or find a NERC/grid-frequency reference.

## MISALIGNED CITES

### M1. EV1/RAV4 year-type attribution cited to `krishnan-2010-bldc`
Krishnan (2010) covers BLDC/PMSM drive systems but does not catalogue historical EV motor topologies for specific 1990s vehicles. Even if the years were correct, `krishnan-2010-bldc` cannot back the claim. See B1 above — the facts are wrong, not just the source.

## SUSPECT NUMBERS

### S1. 14-pole-pair drone RPM stated as "~850 rpm" (line 325–326)
Computed: 200 Hz / 14 = 14.28 Hz mechanical → 857 rpm. "About 850 rpm" understates by ~1%. Technically acceptable rounding given the "about" qualifier.

### S2. "180 g mass on a 10 cm lever ≈ 0.18 N·m" (lines 129–132)
Strictly: 0.180 kg × 9.81 m/s² × 0.10 m = 0.177 N·m. The text says "about 0.18 N·m" which rounds g=9.81 to g=10. Acceptable (1.5% error with explicit "about").

## CLEAN CLAIMS
- All 6 Cite IDs resolve to registry entries and are listed in chapter.sources[].
- All TryIt arithmetic verified: τ=0.18 N·m (20.1), stall/run ratio 6× (20.2), 3000 rpm (20.3), slip 3.33% (20.4), τ=0.4 N·m (20.5). All CORRECT.
- n_s = 1800 RPM (4-pole/60 Hz), 900 RPM (8-pole/60 Hz): CORRECT.
- 51,200 microstep positions (200 × 256): CORRECT.
- NEMA-17 front face = 1.7 in × 1.7 in: CORRECT.
- Stepper 200 steps/rev = 50 teeth × 4 states: CORRECT (200/50=4 steps per tooth).
- Three-phase rotating field magnitude (3/2)B₀: textbook-standard result, no cite needed.
- Full-load slip 2–5%: standard range per Fitzgerald; cited correctly.
- Pull-out torque at ~10–15% slip: standard induction motor curve shape; cited.
- Motor efficiencies (PMSM ~96%, induction ~93%, brushed DC ~85%): cited to Fitzgerald; consistent with standard textbook claims.
- Iron losses ~f^1.5 power: standard Steinmetz approximation; textbook-trivial, no cite needed.
- tesla-1888 source note says "two phases 90° apart" — consistent with FAQ claim about Tesla's original two-phase system.
- grainger-power-systems-2003 year mismatch persists (key says 2003, registry entry year: 1994).

**Why:** Chapter was substantially revised between 2026-05-21 and 2026-05-26. Most previous BLOCKERs were fixed (case study specs now use qualified language with cites; "10×" inrush and "10⁷ clock" claims removed). Three new issues surfaced: B1 (EV1/RAV4 wrong motor type), B2 (NdFeB ~150°C unsourced), B3 (grainger misaligned on clock accuracy).
**How to apply:** EV motor type history is a recurring hallucination trap — always verify EV1 (AC induction) and RAV4 EV (AC) are not cited as DC-motor examples. Demagnetization temperatures for NdFeB need a materials source; Fitzgerald or Krishnan cover this.
