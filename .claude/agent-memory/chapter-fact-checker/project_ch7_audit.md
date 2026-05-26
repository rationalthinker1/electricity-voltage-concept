---
name: ch7-audit-findings
description: Ch.7 Induction fact-check results — 6 BLOCKERs (5 uncited, 1 misaligned); logged 2026-05-25
metadata:
  type: project
---

Audit date: 2026-05-25 (re-run). Lint: CLEAN (no H1–H5 findings). File: src/textbook/Ch7Induction.tsx.

## BLOCKERs — uncited claims

**B1 — line 218**: "articulated by Heinrich Lenz in 1834" — specific year + name with no <Cite />.
`henry-1832` is in the registry (Joseph Henry, not Lenz). No Lenz entry exists in registry or chapter sources.
Fix: soften ("articulated by Lenz") and drop year, OR add Lenz 1834 (Annalen der Physik 31, 483–494) to registry + sources array.

**B2 — lines 582–584 (Case 7.2)**: "≥ 95% for a USB-C cable" cited to `feynman-II-17` — BOTH uncited AND misaligned.
Feynman II-17 covers induction law; it does not report USB cable transfer efficiency.
Fix: soften to "versus a wired connection with negligible conduction loss" and drop the cite.

**B3 — lines 788–789 (FAQ)**: Same "95%+ for a cable" claim, no cite at all.
Fix: same soften as B2.

**B4 — lines 508 (Case 7.1 spec) and 797 (FAQ)**: "Iron-core saturation field ~1.5–2 T" / "~1.5 T" — no <Cite />.
Value is physically correct (soft iron ~2 T, silicon steel ~1.7 T) but spec lines need explicit cite.
Fix: add `griffiths-2017` cite; it covers iron saturation qualitatively in §6.3.

**B5 — lines 725–729 (FAQ)**: "Edison's DC grid couldn't be transformed…Tesla and Westinghouse won the AC argument" — historical attribution, no cite.
`griffiths-2017` appended covers only the physics (DC → dΦ/dt = 0), not the AC/DC historical narrative.
Fix: soften — remove names, keep the physics-only statement about DC and dΦ/dt.

**B6 — lines 403–404 (TryIt 7.3 answer)**: "Real transformers achieve 95–99% efficiency at their design point." No cite.
Griffiths cited just before does not supply this number. The claim needs `griffiths-2017` (§7.7) or `lucia-induction-2014` for practical transformer efficiency, or soften to "within a few percent."

## Misaligned cite (BLOCKER)

**M1 — line 584**: `feynman-II-17` cited for USB-C ≥ 95% cable efficiency. Feynman II-17 is induction laws; it contains no USB or cable-efficiency data. Already flagged in B2.

## Arithmetic — all clean

- Try 7.2: 50 × 0.1 × 0.01 × 377 = 18.85 V. Correct.
- Try 7.4: (4π×10⁻⁷)(10⁶)(10⁻⁴)/0.10 = 1.257 mH. Correct.
- Case 7.1 loss ratio: (765/7.65)² = 10,000. Correct (prose says "one ten-thousandth" — correct).
- 3,600 rpm for 2-pole 60 Hz: correct.

## Pattern notes

- "Lenz in 1834" recurs as a bare attribution — same unsourced-historical-year pattern seen in Ch.2 (Franklin 1747), Ch.6 (Minkowski 1908). No Lenz source exists in registry.
- `feynman-II-17` is heavily overloaded in this chapter (14+ cites). Most are legitimate; the USB cable claim is the only misuse.
- IEEE/industry efficiency claims belong to case-study sources (wpc-qi-1.3, lucia-induction-2014), not to Feynman.
- henry-1832 is in registry but only in Ch.22 sources array. If Ch.7 wants to note Henry's independent discovery, it needs henry-1832 added to the Ch.7 sources array.
- "Joseph Henry discovered self-induction independently of Faraday" (line 434, Term def) — the Term def is not a <Cite /> slot, but if promoted to prose it would need henry-1832.

**Why Edison/Tesla needs softening**: Hughes 1983 "Networks of Power" is the standard history-of-technology source but is not in the registry. Without it, softening is the only clean path.
