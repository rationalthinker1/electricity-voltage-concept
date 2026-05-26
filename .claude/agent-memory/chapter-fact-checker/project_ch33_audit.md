---
name: ch33-audit-findings
description: Chapter 33 (house-smart-meter) fact-check audit findings — 2026-05-26
metadata:
  type: project
---

Audit date: 2026-05-26. Lint: CLEAN (no H-codes). Arithmetic: mostly clean except for two WRONG numbers and one large case-study inconsistency.

**Findings summary:**

HIGH (arithmetic errors):
1. Line 264-265: disk meter calibration wrong. Prose says "1 rev per 7.2 Wh, so 500 revs = exactly 1 kWh". Math: 500 × 7.2 Wh = 3600 Wh = 3.6 kWh, not 1 kWh. 1 kWh requires Kh = 2 Wh/rev (500 × 2 = 1000 Wh). Fix: either change Kh to 2 Wh/rev or change 500 to ~139 revs. Uncited — no cite on Kh=7.2 claim.
2. Line 740-741: TryIt 33.5 NEM 3.0 calculation says "1.7 cent charge". Actual: 8kWh × $0.27 − 10kWh × $0.05 = $1.66 (dollars, not cents). Off by 100×. Fix: "a $1.66 charge" or "about $1.70."

HIGH (arithmetic inconsistency in Case 33.2):
3. Lines 982-987: Case 33.2 prose uses 800 kW numbers but arrives at 626 kVAR (correct only for 780 kW). Actual kVAR for 800 kW at PF=0.78 = sqrt(1025.6²-800²) = 640.8 kVAR. Over-threshold (vs 495.8 kVAR at PF=0.85) = 145 kVAR, penalty = ~$725/month. Prose says 626 kVAR, 131 kVAR over-threshold, ~$655 — these are numbers from the TryIt 33.4 (780 kW) scenario accidentally reused. Spec row at line 933 says "~143 kVAR over threshold ≈ $715/month" — also inconsistent with prose.

MED (misaligned citations):
4. Rate schedule numbers ($0.12–$0.30/kWh residential, $5–$15 service charge at line 427; PG&E $0.27/$0.13 TOU rates at line 453; California NEM 3.0 $0.05/kWh export at line 669) are all cited to ansi-c12-1-2014. C12.1 is a metering accuracy/code standard — it does not contain utility rate schedules. These claims should either be softened ("typical rates vary") or cited to a tariff filing.
5. TryIt 33.1 answer (line 207) cites ansi-c12-1-2014 for "$5–$15 service charge" — same misalignment.
6. Case 33.1 TOU bill "no load shift = $215/month" does not check out: 900kWh × 40%peak × $0.27 + 60%off × $0.13 + $10 = $177, not $215. To produce $215 requires ~70% of consumption in the peak window, which is implausible for a 5-hour peak period. Spec row uncited (no cite on the $215 figure).

LOW:
7. Lines 271-272: "0.5 % accuracy class" applied to the mechanical Ferraris disk meter. ANSI C12.20 accuracy classes apply to solid-state electronic meters only. The mechanical meter's accuracy was defined under C12.1 and typically quoted as Class 1 or Class 2 (±1%–±2%). Applying "class 0.5" to the mechanical meter is a terminology error even if the actual accuracy was ±0.5% on some meters.
8. Lines 58-59: "1 to 4 thousand times per second per phase" — plausible for typical metering ICs (2–8 kHz range) but not directly mandated by ANSI C12.20, which specifies output accuracy not sampling rate. Citation to C12.20 is loose but acceptable as the governing standard.
9. Grainger source: key says 2003, registry year is 1994. Multiple uses cite Grainger for: induction-disk torque physics (plausible), power triangle (plausible), demand charge/PF penalty (plausible), industrial PF correction payback (plausible). The source is reasonably aligned for the power-systems content.

**Key pattern:** ansi-c12-1-2014 is repeatedly used as a citation for utility rate/tariff numbers it does not contain — same misalignment seen in Ch.27 with ieee-3001.2.

Why: Soften rate figures to "typical" (drop the precision) so the cite to C12.1 (as the governing standard) is a governance cite, not a data cite — or add a CPUC/EIA tariff source for the specific California figures.
