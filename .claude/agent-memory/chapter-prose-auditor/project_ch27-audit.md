---
name: ch27-audit
description: Mechanical prose audit result for Ch27HouseGridArrives.tsx
metadata:
  type: project
---

Chapter 27 (`src/textbook/Ch27HouseGridArrives.tsx`) audited 2026-05-26.

**Result: clean.** No misspellings, doubled words, or hyphenation inconsistencies found.

**Broken-hyphen check:** L619 matched `single- or split-phase` — confirmed as a legitimate suspended-hyphen list construction, not an artefact. Do not report.

**Why:** The system-prompt rules explicitly exclude "intentional suspended-hyphen lists ('low- and high-pass filters')" from broken-hyphen reporting. "single- or split-phase" is the same pattern.
