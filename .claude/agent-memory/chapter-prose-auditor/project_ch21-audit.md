---
name: ch21-audit
description: Results of mechanical prose audit on Ch21Generators.tsx
metadata:
  type: project
---

Ch21Generators.tsx — one real finding:

- L494: broken-hyphen artefact `simple- cycle` → `simple-cycle`.

No misspellings, no doubled words, no hyphenation-pair inconsistency.

**Why:** Editor line-wrap during a refactor inserted a stray space after the hyphen in "simple-cycle gas turbines". The grep `\b[a-zA-Z]+- [a-zA-Z]+\b` caught it correctly.

**How to apply:** This pattern (compound adjective + stray space after hyphen mid-word) is the canonical broken-hyphen artefact. One instance here; flag and let orchestrator repair.
