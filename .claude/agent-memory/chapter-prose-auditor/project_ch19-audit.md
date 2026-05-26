---
name: ch19-antennas-audit
description: Findings from mechanical prose audit of Ch19Antennas.tsx
metadata:
  type: project
---

Two broken-hyphen artefacts found:
- L76: `non- relativistic` → `non-relativistic`
- L265: `short- dipole` → `short-dipole`

No misspellings, no doubled words, no hyphenation inconsistencies.

The misspelling grep hit on L641 (`user's environment`) was a false positive — the grep matched "enviro" inside "environment" against the `enviro?nment` pattern. This is an inherent false positive from the regex: the pattern flags correct spellings of "environment" as well as the misspelling "envirnment". Grep reported it but it is not an error.

**Why:** The pattern `enviro?nment` matches both `environment` (correct) and `envirnment` (typo). Always manually verify "environment" hits from this grep before reporting.

**How to apply:** When the misspelling grep returns a hit on "environment", read the line — if the word is spelled `environment` (full, correct), discard the hit.
