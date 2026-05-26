---
name: ch23-transformers-audit-findings
description: Pedagogical audit findings for Ch23Transformers.tsx — turns ratio, impedance transformation, demo-framing prose
metadata:
  type: project
---

## Ch23 Transformers — audit findings (2026-05-25)

### Rule A — Three-tier order
- **Turns ratio** (`Vs/Vp = Ns/Np`): intuition tier missing. Chapter opens with the pole-pig hook (mentions voltages/numbers) then jumps straight to `Vs(t) = −Ns dΦ/dt` at L101. No formula-free analogy or picture before the first Formula block. Needs a non-mathematical paragraph or demo before L101.
- **Impedance transformation**: intuition tier collapsed into a `<Term>` popover at L462–469 — the popover body is already the formula relationship, not a picture/analogy. No separate narrative intuition paragraph before the Formula at L480.

### Rule B — Formula glossaries
- All narrative Formula blocks clean (L101, L117, L130, L200, L216, L397, L480).
- `V = 4.44 · f · N · B · A` used in TryIt 23.6 (L711) with no prior narrative `<Formula>` introduction. Formula is only inside TryIt bodies (exempt), but there is no narrative presentation of it at all. MED gap.

### Rule C — Demo-framing prose
- L667–672: paragraph before `<TransformerDesignerDemo>` (L674) is pure UI framing ("The build-it demo below…", "Watch how the dominant loss flips…"). Move to TransformerDesignerDemo's `caption` prop.

### Trap confirmed (matches Ch17, Ch21 pattern)
- `<Term>` popovers used as the *sole* intuition tier for a foundational quantity. The popover body is not a narrative tier — it's a hover tooltip. The intuition tier must be prose visible on the page before the first Formula block.
