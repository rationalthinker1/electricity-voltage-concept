---
name: ch39-audit-findings
description: Pedagogy audit findings for Ch39 House Outdoor Wet — all three rules clean
metadata:
  type: project
---

## Ch39 HouseOutdoorWet — audit result: ALL CLEAN

**Rule A (three-tier order):** Applied-track chapter (Ch.27–40). No new foundational
quantities introduced. All formulas (body current, step potential, EVSE power) are
applied forms that explicitly cross-reference earlier chapters (Ch.32, Ch.31). Rule A
not triggered.

**Rule B (formula glossaries):** Eight Formula blocks total.
- L180, L362, L363, L590, L826: inside TryIt answer bodies — exempt.
- L267 (`I_body = …`): where-paragraph at L268–294, all symbols defined with units.
- L312 (`V_step = E × Δd_step`): where-paragraph at L313–325, all symbols defined with units.
- L675 (`P_charge = V × I × η`): where-paragraph at L676–700, all symbols defined (η dimensionless, noted).
All narrative Formula blocks have complete where-paragraphs. Clean.

**Rule C (demo-framing prose):** No demos embedded (`grep` returned empty). Rule C not applicable.

## Pattern noted
Ch39 is one of the cleanest applied-track audits: no foundational quantities, correct
where-paragraphs on all three narrative formulas, no demos. Consistent with Ch35, Ch36, Ch38.
