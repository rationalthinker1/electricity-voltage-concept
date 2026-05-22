---
name: ch13-audit-findings
description: Audit findings for Ch.13 Network Analysis — case-study specs remain unsourced; suspect full-bridge output number; open-circuit energy budget misstatement
metadata:
  type: project
---

Ch.13 `network-analysis` audited 2026-05-21.

**Pattern repeat:** All four `<CaseStudy>` blocks (13.1–13.4) contain 24 `spec` lines, every one unsourced. Same gap seen in Ch.5, Ch.10, and Ch.1. This is now a systemic pattern across the textbook.

**Suspect number:** Case 13.1 full-bridge strain-gauge output `≈ 5 – 10 mV` for 5–10 V excitation at 0.2 % ΔR/R. Standard full-bridge sensitivity is `V_exc · ΔR/R`, which gives **10–20 mV**. Prose describes a half-bridge output of 2.5 mV (quarter-bridge behaviour) and says full-bridge “doubles the sensitivity again” to 5 mV — internally consistent but physically off by 2× relative to canonical full-bridge gain.

**Conceptual error:** Line ~1038 claims max-load power is “exactly half of the source's open-circuit energy budget.” Open-circuit power is zero, so the phrase is meaningless. Likely a drafting slip for “half the short-circuit power” or “half the source's available power.”

**Clean:** All 66 `<Cite />` tags resolve correctly to `src/lib/sources.ts` keys and are present in the chapter's `sources` array. Historical attributions (Maxwell 1873, Kennelly 1899, Norton 1926, Kirchhoff 1845) are correctly aligned. All seven TryIt answer blocks are arithmetically correct. Unused sources in the chapter array: `griffiths-2017`, `codata-2018`.
