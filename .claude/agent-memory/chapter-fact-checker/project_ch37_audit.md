---
name: ch37-audit-findings
description: Ch.37 "Adding a new branch circuit" audit findings — 2026-05-26. NEC article errors, wrong ampacity column, incorrect 220.82 formula, NFPA 70E boundary mismatch, Grainger misalignment.
metadata:
  type: project
---

**Audit date:** 2026-05-26  
**Lint result:** CLEAN (all six source keys resolve, no H2/H3/H4/H5/H6 findings)

**Why:** Applied-track chapter with dense NEC arithmetic; primary risk is NEC article mis-citation and wrong column references in 310.16.

**How to apply:** Future audits of applied-track chapters should focus on NEC article precision and column-specific ampacity claims.

---

## Confirmed HIGH findings

### H1 — WRONG FORMULA: 220.82 formula uses factor of 3 on first 10 kVA (lines 87–111)
The displayed formula `I = (3 × W_first10k/1000 + 0.40 × W_remainder/1000) / V` is wrong.  
NEC 220.82(C) applies 100% (factor = 1) to the first 10 kVA, then 40% to the remainder.  
The "3" comes from the 3 VA/sq ft load-density assumption in 220.12, which is computed separately *before* the 100%/40% demand split — it is not a coefficient in the demand formula.  
**Fix:** Replace factor of 3 with 1 in the formula. Note that the descriptive text (line 109) says "first chunk" and "remainder" correctly, but the formula contradicts it.

### H2 — WRONG AMPACITY COLUMN: FAQ line 1165 says "25 A at 75 °C" for 12 AWG
NEC Table 310.16: 12 AWG copper at 75 °C column = **20 A**, not 25 A.  
25 A is the 90 °C column for 12 AWG.  
**Fix:** Change "25 A at 75 °C" to "25 A at 90 °C" (or omit and say "NEC caps it at 20 A via 240.4(D)").

### H3 — NFPA 70E approach boundary wrong: lines 703–713 say "~1.5 m" for Limited Approach Boundary
NFPA 70E 2024 Table 130.4(D)(a): Limited Approach Boundary for nominal 50 V–600 V = **3.05 m (10 ft)**.  
The Restricted Approach Boundary (which requires PPE + energised-work permit) is 1.07 m (42 in).  
1.5 m is between the two and matches neither.  
**Fix:** Change 1.5 m to 3.05 m (or clarify "within the Restricted Approach Boundary (~1.07 m)").

### H4 — NEC 334.23 cross-reference error: line 445 says it "references 320.23"
NEC 334.23 governs NM-B in attics directly. It does **not** cross-reference 320.23, which applies exclusively to Type AC (armored) cable.  
**Fix:** Remove "references 320.23 —" and cite 334.23's own provisions.

### H5 — WRONG CONDUCTOR COUNT in box-fill worked example: line 576 and line 993 say "three insulated conductors"
12-2 NM-B has two insulated conductors (black hot + white neutral) plus one bare ground. The formula arithmetic (11.25 in³) is correct, but the descriptive text "three insulated conductors" is wrong.  
**Fix:** Change to "two insulated conductors" at both lines 576 and 993.

---

## Confirmed MED findings

### M1 — Grainger misaligned ×2 for NEC-specific claims
- Line 1145: ground-rod surge-path reference → `grainger-power-systems-2003`. Grainger covers HV transmission analysis; NEC 250.32 and grounding-electrode behavior is purely an NEC topic. **Fix:** replace with `nec-2023`.  
- Line 1369: 125% continuous-load multiplier / time-current curve argument → `grainger-power-systems-2003`. The 125% multiplier is an NEC 210.19 rule, not a power-system analysis result. **Fix:** replace with `nec-2023`.

### M2 — GFCI 5 mA threshold has no cite (inside Term def, line ~360)
The 5 mA figure needs either `nec-2023` (which cross-references UL 943 in 210.8 commentary) or a softened assertion (e.g., "a few milliamperes"). UL 943 is not in the registry.  
**Fix:** Add `<Cite id="nec-2023" in={SOURCES} />` after the 5 mA claim in the Term def, or soften to "a few milliamperes".

### M3 — 6 AWG for 60 A feeder unexplained (Case 37.3 specs, line 1086)
At the 60 °C column, 6 AWG copper = 55 A (insufficient for a 60 A breaker). 6 AWG is code-compliant only when 75 °C terminations are confirmed per 110.14(C)(1)(a). The prose does not explain this, which could mislead the reader.  
**Fix:** Add a clause noting that 6 AWG is valid when lugs are rated 75 °C per Table 310.16 (65 A at 75 °C). (This is a prose-clarity issue, not a blocker, but it is factually incomplete.)

---

## Arithmetic verification (all others CLEAN)
- 16 A, 100 ft, 1.59 mΩ/ft → 5.09 V (4.2%) — prose says 5.1 V, 4.2% ✓  
- Try 37.2: 14 A, 75 ft → 3.34 V (2.8%) ✓  
- Try 37.4: 10 A, 100 ft, 2.52 mΩ/ft → 5.04 V (4.2%) ✓; 12 AWG = 3.18 V (2.65%) ✓  
- Case 37.1: 12.5 A, 35 ft → 1.39 V (1.2%) ✓  
- Try 37.1: 50 × 1.25 = 62.5; 95 + 62.5 = 157.5 A ✓  
- Try 37.3: 4 × 2.00 + 2 × 2.00 + 1 × 2.00 = 14 in³ ✓  
- Box fill 11.25 in³ formula ✓ (just the text description is wrong)  
- NEC 240.4(D) AWG/breaker pairings (14→15, 12→20, 10→30) ✓  
- NM-B support 12 in / 4.5 ft spacing ✓  
- 300.4(A) 1.25 in clearance / 1/16 in nail plate ✓  
- MWBC 180° phase math ✓  

---

## Pattern note for future applied-track audits
- Applied-track chapters (Ch.27–40) concentrate NEC article references; always verify specific subsection numbers (e.g., 210.19(A)(1)(a), 240.4(D), 334.23) against the actual 2023 NEC structure.  
- `grainger-power-systems-2003` is recurrently misused for NEC-specific claims in applied-track chapters — it is a HV transmission text with no bearing on 120/240 V residential wiring rules.  
- NEC Table 310.16 has three columns (60 °C, 75 °C, 90 °C); claims about ampacity must specify which column. The 90 °C column value for 12 AWG (25 A) is often confused with the 75 °C column value (20 A).
