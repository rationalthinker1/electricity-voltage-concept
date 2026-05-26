---
name: project_ch2_audit
description: Ch.2 "Voltage and Current" fact-check findings — 2026-05-25
metadata:
  type: project
---

Audit date: 2026-05-25. Lint: clean.

**BLOCKERs (3 unsourced claims):**
- FAQ ~841: alkaline 1.5 V / lead-acid 2.0 V / Li-ion 3.7 V + "six cells = 9 V" — no `<Cite>`. No linden-reddy-2011 in registry. Remedy: add to registry + sources array, or soften.
- FAQ ~1047: "J. J. Thomson identified the electron in 1897" — no `<Cite>`. No Thomson source in registry. Remedy: soften to "late nineteenth century" or add Thomson 1897.
- Prose ~300 and FAQ ~1044: "Benjamin Franklin… 1747" — year claimed twice without `<Cite>`. No Franklin source in registry. Remedy: soften to "mid-eighteenth century" or add Franklin 1751.

**WARNINGs (3 arithmetic/consistency issues):**
- "thirteen hours" to traverse 1 m (line ~435): computed 9.6 h at 2.9×10⁻⁵ m/s. The 13 h figure fits only if using 0.02 mm/s (12-gauge/1A) scenario. Scenarios are mixed. Fix: use one consistent wire scenario or update time.
- "roughly fifty times faster" snail comparison (line ~434): 0.013 m/s / 2.9×10⁻⁵ m/s ≈ 442×. Should be "hundreds of times faster."
- "thirteen orders of magnitude" signal/drift ratio (line ~514): at computed 2.9×10⁻⁵ m/s, ratio = 6.7×10¹², not 10¹³. Should say "roughly twelve orders of magnitude."

**Why:** See [[feedback_unsourced_claim_types]] — FAQ battery-chemistry claims and historical year attributions are recurring citation gaps.
