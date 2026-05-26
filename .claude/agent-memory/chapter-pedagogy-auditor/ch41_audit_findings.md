---
name: ch41-ev-powertrain-audit
description: Findings from Rule A/B/C audit of Ch41EVPowertrain.tsx (capstone, not applied-track exempt)
metadata:
  type: project
---

## Key findings from Ch41 audit

### Rule A — Integration chapter pattern: new quantities minimal
Ch41 is an integration capstone. Every stage explicitly back-references an earlier chapter
(Ch.20, Ch.24, Ch.25, Ch.26, etc.). The physics of motor torque, back-EMF, inverter
efficiency, etc. is derived in those chapters; Ch41 imports results. Three-tier presentation
of already-derived quantities is not required for integration chapters; only genuinely new
foundational quantities need the three-tier structure.

The kWh-as-energy-unit section (L937–1042) is the main original pedagogical content.
It has an intuition tier (L941–948), a formal conversion formula (L961), and everyday
examples woven throughout. No tier-order violation.

### Rule A — Motor torque (τ = 3/2·p·ψ_PM·i_q) at L501
The FOC Term popover (L481–494) provides a non-mathematical conceptual description before
the formula. The chapter explicitly defers full derivation to Ch.20 ("Cite Ch.20 for the
synchronous-machine derivation" at L512). For an integration chapter, this is acceptable —
the three-tier treatment is in Ch.20.

### Rule B — All narrative Formula blocks have complete "where" paragraphs
L191 (E_pack), L230 (P_max), L412 (P_HV), L501 (τ_motor), L527 (η_inv),
L607 (V_BEMF), L792 (F_roll), L831 (F_drag), L871 (F_climb), L881 (F_a),
L891 (P_wheel), L961 (1 kWh), L1017 (E_delivered), L1050 (t_cruise) — all have
complete where-paragraphs with SI units.

L1061 is a numeric substitution following the glossed L1050 formula — correctly exempt.

### Rule B — F_climb where-paragraph uses back-reference ("m and g are as before")
L873–875 says "m and g are as before" — both were defined with units at L794–795.
Back-reference is legitimate (same session of prose, same section). NOT flagged.

### Rule C — No demo embeds in chapter
Zero <XxxDemo /> components found. Rule C has no paragraphs to evaluate.
The absence of demos in a non-applied-track capstone chapter is itself a checklist
violation (CLAUDE.md §6 rule 2: ≥1 demo per h2), but falls outside Rules A/B/C scope.

### Pattern worth noting
Capstone integration chapters that import all physics from named earlier chapters may
legitimately have only two tiers (intuition + formula) per quantity, if the three-tier
treatment was done in the earlier chapter and the text makes the cross-reference explicit.
This is distinct from a foundational chapter skipping tiers.
