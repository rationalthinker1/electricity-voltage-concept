---
name: internal-voltage-arithmetic-check
description: When chapter prose states "X kV / Y kV = √3" or similar derived figures, plug the numbers in to verify
metadata:
  type: feedback
---

Voltage-class fact-checks shouldn't stop at "the pair shows up on a real ANSI system" — the chapter often presents the relationship symbolically too (e.g., "7,200 ≈ 13,800/√3"). When prose includes the arithmetic, **compute it**: that's the single best detector of voltage-class swaps.

Concrete catches:
- Ch.27 body asserted 13.8 kV / √3 = 7,200. Actual: 13,800/1.732 = 7,967.4. The 7,200 figure belongs to a 12.47 kV wye system (12,470/1.732 = 7,201). Two real ANSI systems were conflated.
- Same chapter's Case 27.1 spec list correctly said 13.8 kV / 7.97 kV — i.e., the chapter contradicted itself. **Always cross-check body claims against case-study specs in the same chapter**; they're often written at different times and drift.

**How to apply:**
- Grep `(\d+(?:\.\d+)?)\s*≈?\s*\d+(?:,\d+)?/(?:√3|sqrt\(?3\)?)` and similar.
- For every "kV / √3" or "× √3" claim, compute by hand or shell (`python3 -c "print(13800/3**0.5)"`).
- For every transformer turns-ratio derived from a primary voltage (e.g., "7200/120 = 60:1"), confirm the numerator matches whichever voltage-class the chapter is committed to.

Related: [[reference-voltage-class-notation]], [[tex-double-backslash-trap]] (Ch.27 had both at once).
