---
name: ch39-audit
description: Mechanical prose audit result for Ch39HouseOutdoorWet.tsx
metadata:
  type: project
---

Two broken-hyphen artefacts found; no misspellings or doubled words; no hyphenation inconsistency.

- L917: `licensed- electrician` → `licensed-electrician`
- L1308: `personnel- protection` → `personnel-protection`

L92 `damp- and wet-location` is a legitimate suspended-hyphen list — false positive, do not report.

**Why:** The `enviro?nment` grep pattern matches the word "environment" (correct spelling); always verify grep hits are actual misspellings, not the pattern matching a correct word.
