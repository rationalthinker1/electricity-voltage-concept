---
name: ch23-audit
description: Results of Ch23 Transformers prose audit
metadata:
  type: project
---

Ch23Transformers.tsx — two broken-hyphen artefacts, otherwise clean.

Findings:
- L1213: `low- impedance` → `low-impedance` (wrap artefact in CT description)
- L1271: `open- circuit` → `open-circuit` (wrap artefact in Tesla-coil description)

No misspellings, doubled words, or hyphenation inconsistencies detected.

**Why:** Editor line-wrapping during refactor inserted a space after the hyphen in two hyphenated compounds.
**How to apply:** Both are clear mechanical bugs, not suspended-hyphen constructions (no "low- and high-impedance" pair pattern).
