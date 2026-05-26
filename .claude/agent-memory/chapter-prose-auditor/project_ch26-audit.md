---
name: ch26-audit
description: Ch26 Modern Batteries prose audit result — clean
metadata:
  type: project
---

Ch26 (`src/textbook/Ch26ModernBatteries.tsx`) audit — 2026-05-26.

**Result: clean.** No misspellings, no doubled words, no broken-hyphen artefacts.

One false-positive from the broken-hyphen grep: L537 "Volume- and shape-optimized" — this is an intentional suspended-hyphen list construction, not a wrap artefact. The agent-file spec already lists this as a false-positive category; confirming it holds in practice.

Hyphenation consistency: all `open-circuit` instances (L113, L404, L760, L768) are uniformly hyphenated. `short-circuit` at L161 is consistent.

**Why:** The suspended-hyphen false-positive pattern ("low- and high-pass", "Volume- and shape-optimized") recurs across chapters. Always inspect the token to the right of the hyphen for an "and"/"or" coordinator before reporting.
