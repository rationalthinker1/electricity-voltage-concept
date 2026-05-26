---
name: ch21-audit-findings
description: Ch.21 Generators fact-check findings — re-audited 2026-05-26 on the current file (fully rewritten since 2026-05-21 audit)
metadata:
  type: project
---

Re-audited 2026-05-26. The file is completely different from the 2026-05-21 audit; all previous findings are superseded.

Lint: CLEAN (0 H-level mechanical issues from npm run lint:chapters -- --chapter 21).

Chapter sources array (6 keys, all resolve): faraday-1832, feynman-II-17, griffiths-2017, grainger-power-systems-2003, fitzgerald-kingsley-umans-2014, kundur-1994-power-stability.

**Why:** See findings below.
**How to apply:** Route HIGH items to content author or cite-id-resolver.

## HIGH (BLOCKER)

H1 — "Seven orders of magnitude" arithmetic error (line 654)
CaseStudies intro: "four generators spanning seven orders of magnitude, from a 700 MW dam unit to a 2 MW backup diesel." 700 MW / 2 MW = 350 = 10^2.54 — roughly 2.5 orders, not seven. Soften to "nearly three orders of magnitude."

H2 — Three Gorges spec lines uncited (lines 665–683)
- Installed capacity `22.5 GW (32 × 700 MW main units + 2 × 50 MW station-service)` — no Cite (arithmetic is correct)
- `typically 80 poles per machine` — no Cite
- `~95–112 TWh/year` annual generation — no Cite
- `80 m hydraulic head` at Three Gorges (body, ~line 691) — no Cite
- `fitzgerald-kingsley-umans-2014` does not cover Three Gorges installation specs; either soften or add a real source (Three Gorges Corp. TDR exists but must be verified before adding)

H3 — Hoover Dam uprate history uncited (lines 714–715, 732–733)
"~2.08 GW (after 1986–93 uprate); originally 1.34 GW (1936)" — specific historical figures with no Cite. `fitzgerald-kingsley-umans-2014` is not a dam-history reference. Soften to "roughly 2 GW after successive uprates."

H4 — Hoover water-to-wire efficiency 0.85–0.90 uncited (line 747)
"overall water-to-wire conversion typically around 0.85–0.90" — the paragraph-end Cite to fitzgerald covers generator efficiency, not system-level penstock+turbine+generator efficiency. Soften to "typically above 80%" or cite a hydraulics engineering reference.

H5 — Governor droop "typically ~5%" inside Term def, no Cite (line 527)
The Term def states "with a slope (typically ~5%) set by their governors" — specific quantitative claim with no Cite anywhere near it. The nearest `<Cite id="kundur-1994-power-stability">` is paragraphs later. Either add a Cite in the Term def or soften.

H6 — Case 21.4 spec lines uncited (lines 823–829)
- `4-pole 3-phase synchronous, ~1800 RPM at 60 Hz` spec row — no Cite
- `typically 480 V line-to-line for data center bus` — no Cite
- `~10 s from cold start` — no Cite
- `typically 24–72 hours of run-time on-site` — no Cite
The `grainger-power-systems-2003` Cite in the ATS paragraph is misaligned for demand-response dispatch practice; Grainger covers power-flow analysis, not data center operational practice.

## MEDIUM

M1 — H system inertia "4–6 s" possibly conservative (line 575)
Kundur gives H for large steam/nuclear units typically 5–10 s; 4–6 s is the low end. The claim isn't wrong but may mislead. Soften to "on the order of a few to ~10 s."

M2 — Three Gorges "typically 20 kV" output voltage cited to Grainger (line 702)
Grainger doesn't cover Three Gorges specs. Soften to "a few tens of kilovolts."

M3 — grainger-power-systems-2003 key has year mismatch (src/lib/sources.ts line 318)
Key says 2003 but registry `year: 1994`. Pre-existing issue logged in Ch.3 audit.

## LOW

L1 — Hoover hydraulic head "~180 m" in spec row (line 727) — uncited but consistent with public Bureau of Reclamation data; low-severity.

L2 — "Essentially every utility generator above ~150 MW is hydrogen-cooled" (line 1065–66) — fitzgerald cite present, but the 150 MW threshold is a specific claim fitzgerald may not state precisely. Verify page reference.

## Arithmetic: ALL CLEAN
Try 21.1: NBA×ω = 100×0.5×0.02×377 = 377 V ✓
Try 21.3: sin δ = 0.8929, δ = 63.2° ✓; P_max = 0.933 pu ✓
Try 21.4: n_alt = 7500 RPM, f = 750 Hz ✓
Try 21.5: df/dt = −1/8 = −0.125 Hz/s ✓
Try 21.6: df/dt = −0.05×60/(2×4) = −0.375 Hz/s ✓
Three Gorges: 32×700 + 2×50 = 22,500 MW = 22.5 GW ✓
Hoover: n_s = 120×60/40 = 180 RPM ✓
3-phase FW bridge: peak-to-valley ~13.4%, ripple factor ~4% ✓

Pattern note: `fitzgerald-kingsley-umans-2014` is stretched to cover Three Gorges specs, Hoover uprate history, and data center ATS details — none of which are in an electric machinery textbook. Same pattern as Ch.20 with Tesla Model S motor spec.
