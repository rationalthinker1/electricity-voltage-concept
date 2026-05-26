---
name: ch1-audit-findings
description: Audit results for Ch1WhatIsElectricity.tsx — known open issues, updated 2026-05-25
metadata:
  type: project
---

Ch.1 re-audited 2026-05-25. Most prior BLOCKERs from 2026-05-20 are resolved.

**Resolved since previous audit:**
- "roughly a gigajoule" (line 722) now reads "roughly half a gigajoule" — arithmetic fixed and cite added.
- `libretexts-conduction` now in Ch.1 sources array — ⅔c claim is properly sourced.
- Franklin attribution now says "18th century" (no year) — unsourced year removed.
- k described as "9×10⁹" in FAQ (not "10¹⁰") — fixed.

**Remaining open BLOCKERs (2026-05-25):**
1. line 204 — "roughly 10²³ free electrons already in the rubber" — rubber is an INSULATOR with zero free electrons. Should be "total electrons" not "free electrons." Also unsourced (the cite on line 203 applies to the nanocoulombs figure, not to this number). Remedy: change to "total electrons" or "bound electrons" and note it's an illustration; or drop the number.

**Remaining WARNINGs (2026-05-25):**
1. line 1021-1022 — "roughly the charge that flows through a 100-watt incandescent bulb in about a second, since a typical household bulb draws on the order of 1 amp." At 120 V, 100 W => 0.83 A (not 1 A). The claim is off by ~20% and is unsourced. Low priority (illustrative, no cite needed) but the 1-amp figure is slightly misleading.

**Clean:**
- All `<Cite>` keys resolve to both registry and chapter sources array (lint: clean).
- Lightning energy arithmetic: 5 C × 10⁸ V = 0.5 GJ = "half a gigajoule" — now correct.
- Cavendish bound, WFH 1971 bound, k value, e value, ε₀ value all verified correct.
- TryIt 1.1, 1.2, 1.3, 1.4 arithmetic verified correct.

**Why:** Second audit pass. Most prior fixes confirmed. One factual error persists (free vs bound electrons).
**How to apply:** On next Ch.1 audit, focus on line 204 "free electrons" terminology.
