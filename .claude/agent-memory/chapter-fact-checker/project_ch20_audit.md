---
name: ch20-audit-findings
description: Fact-check audit of Ch20Motors.tsx (slug: motors), completed 2026-05-21
metadata:
  type: project
---

# Chapter 20 (Motors) Audit — 2026-05-21

## Sources array check
Chapter 20 (`motors`) sources array in chapters.ts:
`feynman-II-13`, `griffiths-2017`, `jackson-1999`, `tesla-1888`, `fitzgerald-kingsley-umans-2014`, `krishnan-2010-bldc`, `codata-2018`

All three primary motor sources (`tesla-1888`, `fitzgerald-kingsley-umans-2014`, `krishnan-2010-bldc`) exist in `src/lib/sources.ts` and are listed in the chapter's sources array. All Cite IDs in the file resolve.

`jackson-1999` and `codata-2018` are in the chapter's sources array but are NOT cited in any `<Cite>` in the file (dead entries).

## BLOCKERs found

### 1. NdFeB energy product range (line 255, Term def)
"Energy product ~280–440 kJ/m³" — no Cite. Unsourced numerical claim. `krishnan-2010-bldc` is the nearest applicable source.

### 2. Inrush current "commonly 10×" (line 194)
No Cite attached. The paragraph's Cite (line 201) is at sentence end and covers the back-EMF dynamics, not the "10×" quantitative claim.

### 3. Synchronous motor clock claim (lines 526–527) — BLOCKER + SUSPECT NUMBER
"A clock running on a synchronous motor keeps grid time to within a part in 10⁷ because the grid frequency itself is regulated that precisely."
- No `<Cite>` anywhere on this paragraph.
- The number is WRONG: NERC grid frequency band is ±36 mHz on 60 Hz = ~6×10⁻⁴, not 1×10⁻⁷. 
- Even accumulated time error (UTC alignment) is ~1×10⁻⁶ over a day at best, not 1×10⁻⁷.
- Recommend: soften to "keeps time accurate to within a few seconds per year" or remove, and add cite to a grid frequency standards source (e.g., NERC reliability standards or grainger-power-systems-2003).

### 4. "Tesla after 2017, all the European and Korean EVs — is a PMSM" (line 297)
Historical/industry claim with no Cite. `krishnan-2010-bldc` (2010) predates this development and cannot back a claim about EV topology choices post-2017. No source in registry covers this.
- Recommend: soften "all the European and Korean EVs" → "most modern EV traction drives" or add a verifiable manufacturer source.

### 5. Case 16.1 Peak output spec (line 707): `~310 kW (rear motor)` — no Cite
The spec line has no `<Cite>`. Other spec lines in the same CaseStudy have cites but this one does not.

### 6. Case 16.1 Cooling spec (line 718-720): no Cite
"liquid (ethylene-glycol jacket around the stator iron)" — no Cite.

### 7. Case 16.2 Speed spec (line 769): no Cite
"5400, 7200, 10 000, or 15 000 rpm (datasheet-fixed)" — no Cite.

### 8. Case 16.2 Speed regulation spec (line 771): no Cite
"±0.1 % of nominal — controlled by a PLL locking to a quartz reference" — no Cite.

### 9. Case 16.2 Power spec (line 773): no Cite
"~2–3 W steady-state at 7200 rpm" — no Cite.

### 10. Case 16.3 Supply spec (line 813): no Cite
"18 V or 20 V Li-ion battery" — no Cite.

### 11. Case 16.3 Peak power spec (line 814): no Cite
"~600 W (drilling stall)" — no Cite.

### 12. Case 16.3 Speed control spec (line 815-816): no Cite
"variable-duty PWM via trigger (FET in series with motor)" — no Cite.

### 13. Case 16.3 Brush life spec (line 819): no Cite
"~150–300 hours of cumulative running time" — no Cite.

### 14. Case 16.3 cost comparison (lines 824-826): no Cite
"$5–8 in parts ... $25–40" — no Cite for market cost figures. These are approximate and unverifiable from existing registry. Recommend softening or removing.

### 15. Case 16.3 "400 hours of cumulative running" crossover (line 829): no Cite
"lifetime cost flips at maybe 400 hours" — no Cite.

### 16. Case 16.3 PWM frequency "10–20 kHz" (line 834): no Cite
"a 10–20 kHz PWM signal" — no Cite.

### 17. Case 16.4 Holding torque spec (line 862): no Cite
"~0.4–0.6 N·m typical NEMA-17 size" — no Cite.

### 18. Case 16.4 Driver spec (line 864-865): no Cite
"chopper-mode constant-current driver; rated 1.5–2 A per phase" — no Cite.

## SUSPECT NUMBERS

### S1. Synchronous clock "part in 10⁷" (line 526) — WRONG
See BLOCKER #3. Grid frequency regulated to ~6×10⁻⁴, not 1×10⁻⁷. The number overstates precision by ~600x for instantaneous frequency, and ~10x for daily accumulated time.

### S2. TryIt 16.2 stall-to-run ratio stated as "6×" (line 241)
The prose says "The starting current is 6× the running current." For the specific numbers in the TryIt (V=12V, R=1Ω, ke=0.1, ω=100 rad/s): stall=12A, run=2A, ratio=6×. ARITHMETIC IS CORRECT. But immediately above (line 194) the chapter says inrush is "commonly 10×." The TryIt's own worked example gives 6×, which could create reader confusion. Not an error in the arithmetic, but note the inconsistency with the prose above.

### S3. "180 g mass on a 10 cm lever" ≈ 0.18 N·m (lines 134-136)
Computed: 0.180 kg × 9.81 m/s² × 0.10 m = 0.177 N·m. Prose says the torque is "about the torque you'd feel holding a 180 g mass on a 10 cm lever" equating to "about 0.18 N·m." This is a 1.5% discrepancy from g=9.81 — rounding g=10 gives exactly 0.18 N·m. Acceptable rounding, not flagged as wrong, but technically 0.177 N·m.

## MISALIGNED CITES

### M1. NdFeB energy product (line 255 Term def) — no cite at all
If one were added, `krishnan-2010-bldc` (the BLDC motor textbook) would be appropriate.

### M2. Case 16.1 specs cited to `fitzgerald-kingsley-umans-2014` (line 713: ~16,000 rpm)
Fitzgerald-Kingsley-Umans is a 2014 electric machinery textbook that does not cover Tesla Model S specific motor parameters. The ~16,000 rpm spec is a vehicle-specific number. This source cannot credibly back a specific Tesla motor speed.
- Recommend: remove cite here and soften spec to "up to ~14,000–16,000 rpm depending on variant" without citation, or find a verifiable Tesla engineering document.

### M3. Case 16.1 "0.94 efficiency at cruise" (in summary line 696) — no cite
The summary's efficiency claim is uncited.

## CLEAN CLAIMS
- All Cite id keys resolve to real entries in `src/lib/sources.ts` — no typos or ghost references.
- All `<Cite>` ids are listed in the chapter's sources array — no [?] renders.
- TryIt 16.1 arithmetic: τ = 100×2×3×10⁻³×0.3 = 0.18 N·m — CORRECT.
- TryIt 16.3: 4 pole-pairs at 200 Hz → 3000 rpm — CORRECT.
- TryIt 16.4: ns=1800, s=(1800-1740)/1800=3.33% — CORRECT.
- TryIt 16.5: n=1800×0.96=1728 rpm — CORRECT.
- TryIt 16.6: 3200 microsteps/3200 = 1 rev, 12.5 µm/microstep — CORRECT.
- TryIt 16.7: τ=0.8×(1-2000/4000)=0.4 N·m — CORRECT.
- HDD speed regulation: 7200 rpm = 120 Hz, ±0.1% = ±0.12 Hz — CORRECT.
- 51,200 positions for 200-step motor at 1/256 — CORRECT.
- 14-pole-pair drone at 200 Hz: 857 rpm (prose says ~850) — acceptable rounding.
- Motor lamination thickness 0.35–0.5 mm — standard range, accurate.
- 14% torque ripple for 6-step commutation — ~14.4% from cos sector analysis, CORRECT.

**Why:** Summary of first-time audit for Ch.20 (motors slug). Key recurring issues: case study specs missing cites (same pattern as Ch.5, Ch.10, Ch.21); one seriously wrong number (10⁷ clock claim).
**How to apply:** When auditing similar motor/machinery chapters, pay extra attention to (a) case study spec lines without individual Cite tags, and (b) grid-related precision claims.
