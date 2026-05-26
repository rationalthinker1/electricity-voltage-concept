---
name: ch13-audit-findings
description: Audit findings for Ch.13 Network Analysis — re-audited 2026-05-25; persistent BLOCKERs remain from 2026-05-21
metadata:
  type: project
---

Ch.13 `network-analysis` first audited 2026-05-21, re-audited 2026-05-25.

**Lint:** Clean (no H1-H5 / M1 / M4 / M5 findings).

**Sources array:** 7 keys: kirchhoff-1845, maxwell-1873, kennelly-1899, norton-1926, irwin-circuit-analysis-2015, horowitz-hill-2015, hayt-kemmerly-durbin-2018. All resolve in registry.

**All <Cite /> tags resolve correctly.** No broken cite IDs.

**BLOCKER — Unsourced spec lines (systemic pattern):**

Case 13.1 specs — gauge resistance values (120/350/1000 Ω), gauge factor ≈2.0 (constantan), ΔR/R at 1000µε 0.2%, bridge output 5–10 mV — all in spec table without cites. Prose at line 1077 cites `horowitz-hill-2015` for the GF~2.0 claim, but the spec table entries have no cite prop.

Case 13.2 specs — 'SPICE first release: 1973 (UC Berkeley)' is a spec-table entry with no cite. `hayt-kemmerly-durbin-2018` is cited in nearby prose for MNA description, but not for the year 1973. Also 'Per-iteration cost: O(N^1.2) sparse LU' has no cite and is a specific technical claim.

Case 13.3 specs — 'P48 phantom voltage: 48 V ± 4 V', 'Feed resistors: 6.81 kΩ', 'Standard: IEC 61938 (P48)' — IEC 61938 is neither in `src/lib/sources.ts` nor in chapter.sources[]. The prose at line 1165 names "IEC 61938" without a `<Cite />`.

Case 13.4 specs — 'Class-AB audio amp efficiency: 50–78%', 'Class-D efficiency: 85–95%', 'Mismatch loss for 2:1 VSWR: ≈0.5 dB' — spec entries without individual cites.

**BLOCKER — IEC 61938 not in registry:** Prose at line 1165 says "codified as P48 in IEC 61938" with no <Cite /> and the standard is absent from sources.ts. Remedy: soften "IEC 61938" to "the IEC phantom-power standard (P48)" and drop the bare standard number, OR add iec-61938 to registry.

**Suspect number (LOW) — Case 13.1 full-bridge output:** Spec table says "≈ 5–10 mV (full-bridge, 1000 µε)" at 5–10 V excitation. Standard full-bridge sensitivity is V_exc · ΔR/R, which for V_exc=5–10 V and ΔR/R=0.002 gives 10–20 mV (not 5–10 mV). The prose says a half-bridge produces 2.5 mV and full-bridge "doubles" it — so the prose would give 5 mV at 5 V, but the spec label says "full-bridge" which by convention uses all four gauges and the standard formula V_exc × GF × ε gives V_exc × 0.002. This is internally consistent (prose + spec table) but the spec table label says "full-bridge" while the result matches a half-bridge. Either the label should say "half-bridge" or the numbers should read "10–20 mV."

**Conceptual wording issue (line ~900, "open-circuit energy budget"):** The phrase "exactly half of the source's open-circuit energy budget" is drafting-level imprecise — an open-circuit source has zero power, so "open-circuit energy budget" is not a meaningful quantity. The intended statement is "exactly half of V_Th²/R_S, which is the short-circuit dissipation rate." This is a prose-quality issue, not a factual error.

**Clean arithmetic:** All TryIt answers (13.1–13.7 incl. 13.5b) verified correct. The six-resistor bridge topology count (5 nodes, 8 branches → 8 equations) is internally consistent.

**Historical attributions:** Maxwell 1873 (Treatise — mesh current method), Kennelly 1899 (Electrical World — Y-Δ), Norton 1926 (Bell Labs memo), Kirchhoff 1845 — all correctly aligned to the sources registry.
