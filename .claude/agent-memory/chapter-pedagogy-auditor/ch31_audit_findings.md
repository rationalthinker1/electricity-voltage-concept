---
name: ch31-house-big-loads-audit-findings
description: Pedagogy audit findings for Ch31HouseBigLoads.tsx (Big loads: dryers, ranges, EVs, heat pumps)
metadata:
  type: project
---

## Rule A
- FLA (full-load amperage): intuition tier missing (MED). L433 bridging prose goes straight to the formal formula at L437 with no non-mathematical picture. A one-sentence nameplate-current gloss before L437 would fix it.
- LRA (locked-rotor amperage): thin separation between intuition and formal tiers (LOW). The "five to seven times" quantitative claim appears in the prose bridge (L464) immediately before the formula (L467). Acceptable but marginal.
- Demand factor: introduced only as a Term-popover gloss with no formula tier — correct for an applied-track (Ch.27–40) prose-only treatment. Do NOT flag this as a missing tier.
- P, I, P_loss: these are Ch.3 recaps, not first introductions; three-tier rule does not re-apply.

## Rule B
- All narrative Formula blocks have complete "where" paragraphs. Clean.
- Formula id="power-vi" (L68) uses the registry-id form; the following paragraph defines P, V, I — clean.

## Rule C
- No demos in this chapter (applied-track; header comment says so). Rule C does not apply.

## Patterns / traps noted
- Applied-track chapters (Ch.27–40) still trigger Rule A when they introduce a new engineering term (FLA, LRA) with a *formula*. The absence of new demos does not exempt a new named formula from needing an intuition sentence before it.
- Demand factor introduced as prose-only (Term popover + narrative description, no formula block) is correctly exempt from Rule A three-tier requirements.
