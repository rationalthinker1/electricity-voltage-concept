---
name: project_ch26_audit
description: Ch.26 Modern Batteries audit findings — LFP year wrong, multiple bard-faulkner misuse for product specs, Mirai data can't be in 2003 textbook, 95% H2 fossil claim uncited
metadata:
  type: project
---

Audit run: 2026-05-26. Lint: CLEAN. All Cite IDs resolve. Arithmetic: CORRECT.

## HIGH findings

**H1 — Wrong historical year (L266):** LFP attributed "Goodenough et al. 1996" but the original paper is Padhi, Nanjundaswamy, Goodenough, J. Electrochem. Soc. 144, 1188 (1997). Off by one year and uncited. Fix: change 1996 → 1997 and add a <Cite> (no source key exists for this paper; either add one or soften to "late 1990s").

**H2 — Mirai specs cited to 2003 textbook (L620, Case 26.4):** larminie-dicks-2003-fuel-cells (published 2003) cannot contain Toyota Mirai specs (Mirai launched 2014, Gen 2 in 2021). The 114 kW spec-row Cite is invalid as a source. Fix: either soften to "~100+ kW, typical of modern automotive PEM stacks" or add a Toyota Mirai press/engineering spec source.

## MED findings

**M1 — bard-faulkner misaligned for product specs (multiple lines):** B&F is fundamentals electrochemistry, not a cell datasheet catalogue. These claims should cite linden-reddy-2011 instead:
- L117: lead-acid ~35 Wh/kg
- L242 (Try 26.2 answer): lead-acid ~35 Wh/kg, NiMH ~80 Wh/kg, alkaline ~150 Wh/kg
- L204: Li-ion 500–2000 cycles vs 100–300
- L347: supercap ~5–10 Wh/kg vs ~250 Wh/kg Li-ion
- L663 (FAQ): lead-acid −30 to +60°C range, 99% recycling, 400 A cranking
- L813 (FAQ): flow battery ~20 Wh/kg, 10 000+ cycles
- L859 (FAQ): C-rate examples (10–20C tools, 1–3C EV, grid lower)

**M2 — 95% H2 from fossil fuels uncited (L880, FAQ):** This is a specific quantitative market-share claim. larminie-dicks-2003 doesn't back a 2020s market statistic. Fix: soften to "most industrial hydrogen today" and drop the 95%, or add a real source (IEA Global Hydrogen Review is the standard citation for this statistic).

## LOW findings

**L1 — LFP/NMC thermal stability temperatures (L691–693):** SEI breakdown >80°C, cathode O₂ release >150°C, accelerating >200°C cited to B&F. These safety thresholds are specific to Li-ion and are more properly in Linden or materials-science literature. B&F doesn't cover Li-ion cell safety. Consider adding linden-reddy-2011 alongside B&F here.

## Arithmetic: all verified CLEAN
- Try 26.1: 12 V × 60 Ah = 720 Wh = 0.72 kWh ✓
- Try 26.2: 12 Wh / 0.047 kg = 255 Wh/kg ✓
- Try 26.3: ½ × 3000 × 2.7² = 10 935 J ≈ 3.0 Wh ✓
- Try 26.4: 100 × 0.65 V = 65 V; 65 × 200 A = 13 kW ✓
- Case 26.4 H₂ energy: 5 kg × 120 MJ/kg (LHV) = 166.7 kWh ≈ 166 kWh ✓; × 0.55 = 91.7 kWh ≈ 92 kWh ✓
- Mirai stack V: 370 × 0.66 V = 244 V → prose says ~245 V ✓
- Lead-acid cell V: 1.69 − (−0.36) = 2.05 V ✓; × 6 = 12.3 V → stated "nominal 12.6 V" ✓

## Historical attributions: verified
- Planté 1859/1860: correct (apparatus 1859, presented Académie 1860)
- Whittingham 1976 at Exxon: correct
- Goodenough 1980 at Oxford: correct (LiCoO₂ paper)
- Yoshino 1985 at Asahi Kasei: correct
- Nobel 2019: correct
- Goodenough age 97 at Nobel: correct (born 1922, Nobel 2019)
- Grubb/Niedrach GE PEM 1955: covered by larminie-dicks; acceptable
- LFP year "1996": WRONG — should be 1997

**Why:** LFP was Padhi, Nanjundaswamy & Goodenough, J. Electrochem. Soc. 144 (4) 1188–1194, March 1997.
