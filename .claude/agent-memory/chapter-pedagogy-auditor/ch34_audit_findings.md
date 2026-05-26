---
name: ch34-house-plug-to-chip-audit
description: Findings from Rule A/B/C audit of Ch34HousePlugToChip.tsx (applied-track capstone)
metadata:
  type: project
---

## Key findings from Ch34 audit

### Rule A — Applied-track exception applies
Ch34 is a capstone in the applied track (Ch.27–40). It introduces NO new foundational
quantities from scratch; every formula is explicitly labelled as a restatement of
Ch.5/12/14/22/23/24 physics. Rule A does not fire.

### Rule B — L427: η_charger symbol not named in "where" paragraph
The efficiency formula η_charger = V_s · I_s / (V_in · I_in) at L427–428 is followed by
a "where" paragraph (L430–452) that defines V_s, I_s, V_in, I_in but never names or
defines η_charger itself (the left-hand side). As a dimensionless ratio "efficiency" it has
no SI unit, but the symbol and what it represents should still be stated.
All other narrative Formula blocks (L86–99, L132–144, L240–252, L280–303, L293–303, L427,
L621–646) have adequate "where" paragraphs.

### Rule B — L293: second transformer formula (I_s = I_p · N_p/N_s)
The paragraph at L296–303 defines I_p, I_s, and refers back to "the turns counts are as
defined above" — acceptable because N_p/N_s were defined two lines earlier in the same
prose block. Not a violation.

### Rule C — No demos present; Rule C not applicable.

### Note on TryIt Formulas
L173, L359, L471, L474, L585, L731, L735 are all inside TryIt answer blocks — exempt.
