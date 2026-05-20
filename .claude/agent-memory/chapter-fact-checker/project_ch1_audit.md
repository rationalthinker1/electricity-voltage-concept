---
name: ch1-audit-findings
description: Audit results for Ch1WhatIsElectricity.tsx — known open issues as of 2026-05-20
metadata:
  type: project
---

Ch.1 audit completed 2026-05-20. 7 BLOCKER issues, 2 WARNING issues.

**Open BLOCKERs:**
1. line 122 — "Franklin 1747" unsourced historical attribution. No key in registry for Franklin primary source. Recommend softening to "mid-18th century."
2. line 721 — "roughly a gigajoule" derived calc has no `<Cite />`. Add `rakov-uman-2003`.
3. lines 202-205 — "~10⁻⁸ coulombs" / "~10²³ electrons in a balloon" unsourced. Soften or add `hyperphysics-emag`.
4. lines 1043-1045 — ~⅔c velocity claim cited to `codata-2018` (wrong source). Correct source is `libretexts-conduction` but it is NOT in Ch.1 sources array. Add to Ch.1 sources array in chapters.ts, or soften to qualitative statement.
5. lines 996-997 — "nanocoulombs over the whole head" cited to `griffiths-2017` (which doesn't report this figure). Soften claim.
6. line 106 — atom charge-neutrality cited to `feynman-II-2` (vector calculus chapter). Remove cite (textbook-trivial) or change to `griffiths-2017`.
7. line 886 — EM Gauss's law cited to `gauss-1813` (math paper only). Change to `griffiths-2017`.

**Open WARNINGs:**
1. lines 720-722 — "roughly a gigajoule" is ~2× too high given the prose's own stated voltage of "a hundred million volts." At 10⁸ V × 5 C = 5×10⁸ J ≈ 0.5 GJ. Should read "roughly half a gigajoule" or "hundreds of megajoules."
2. line 998 — k described as "around 10¹⁰"; should be "around 9×10⁹" for accuracy.

**Why:** First full audit of Ch.1; issues logged for fix tracking.
**How to apply:** When Ch.1 is re-audited, check these specific lines to confirm they have been resolved.
