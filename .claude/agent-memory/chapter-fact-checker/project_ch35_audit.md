---
name: ch35-audit-findings
description: Ch.35 (house-replacing-fixtures) fact-check audit findings, 2026-05-26
metadata:
  type: project
---

Ch.35 audit completed 2026-05-26. Lint CLEAN. 7 findings total.

**HIGHs (3)**
1. codata-2018 misaligned ×2: line 1000 (spec row: "1500W heater ≈12.5A at 120V") and line 1048 (Case 35.1 prose: "about 12.5A flows…"). P=VI is Ohm's law, not a CODATA constant. Correct cite: nec-2023 or ul-498; or soften to no cite.
2. UL 498 misaligned for GFCI-specific claims: lines 872-874 (UL 943 named in prose but not registered), line 922 (end-of-life LINE/LOAD reversal feature), line 1311-1313 (15–20 yr lifespan + endurance cycling). UL 943 is the dedicated GFCI listing standard; UL 498 covers plugs/receptacles. UL 943 is not in registry.
3. Arithmetic error: line 1193 "six million cycles, give or take" at 70 rpm × 6 months. Correct: 70 rpm × 60 min/hr × 24 hr/day × 180 days ≈ 18 million cycles. Off by 3×.

**MEDs (2)**
4. Let-go current: line 164 states "5–6 mA for an adult woman." IEC 60479-1:2018 Table 7 gives ~6–7 mA for women at 50 Hz (not 5–6). The 5 mA figure at line 146 conflates the GFCI trip threshold with the let-go threshold.
5. Internal inconsistency: GFCI trip threshold described as "4–6 mA" at lines 869 and 1306, but FAQ line 1389 calls it "the 5 mA GFCI threshold." Standardize on "4–6 mA."

**LOWs (2)**
6. UL 498 2008-cycle claim (line 1239): "The 2008 cycle of UL 498 restricted backstabs to 14 AWG." This specific restriction year is asserted without a direct citation to the specific UL 498 edition. ul-498 cite present but note doesn't confirm year. Low risk since claim is common field knowledge.
7. NEC 406.12 "since 2008" (lines 308, 1279): NEC TR requirement appeared in the 2008 NEC cycle (2007 publication). The chapter says "since 2008" which is slightly ambiguous (adopted at different times by jurisdictions). Cite nec-2023 present; acceptable as stated.

**Arithmetic (all others clean):**
- 1500W/120V = 12.5A ✓
- 12²×0.05 = 7.2W ✓
- 12.5²×0.03 = 4.69W ✓; 12.5²×0.05 = 7.81W ✓
- 120V/12kΩ = 10mA ✓
- TryIt 35.2: 12²×0.06 = 8.64W ✓

**Why:** codata-2018 misuse is a recurring pattern (see Ch.8, Ch.21). UL 943 vs UL 498 for GFCI is a new pattern specific to the house chapters.
**How to apply:** When GFCI electronics (trip threshold, end-of-life, LINE/LOAD reversal detection) are cited, look for UL 943 not UL 498. UL 498 covers plug/receptacle geometry and temperature-rise only.
