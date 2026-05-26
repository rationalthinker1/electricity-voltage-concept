---
name: ch32-house-safety-audit-findings
description: Pedagogy audit findings for Ch32HouseSafety.tsx (Safety and what kills you)
metadata:
  type: project
---

## Rule A
- **Body resistance** (R_body): intuition tier missing (MED). L380–L382 bridging prose ("the
  current driving that test is fixed by Ohm's law") goes straight to the formal/operational formula
  `I_body = V_fault / R_body` at L383. The intuition picture (skin resistance swings 1 kΩ–100 kΩ
  dry vs. wet) appears only afterward, inside the "where" paragraph at L421–L423. A non-mathematical
  sentence before L383 would fix it.
- Let-go threshold, arc-flash incident energy: no three-tier issue (let-go has no formula; arc-flash
  incident energy has adequate prose framing before L783 even if technical rather than metaphorical).

## Rule B
- All three narrative Formula blocks (L383, L529, L783) have complete "where" paragraphs. Clean.
- Formulas at L247, L276, L604, L609, L867, L868, L870 are inside TryIt answer bodies — exempt.

## Rule C
- No demo components embedded (applied-track; header comment explicit). Rule C does not apply.

## Patterns / traps noted
- Applied-track (Ch.27–40) safety chapters still trigger Rule A when a new physical quantity
  (body resistance) is introduced with a formula — the "no-demo" exemption doesn't cover Rule A.
- "Where" paragraph context: when the intuition picture appears *inside* the "where" paragraph
  after a formula, it does not satisfy the intuition tier (must precede the formula).
- This chapter has no demos, so the TryIt-exempt rule is the only Formula exemption that fires.
