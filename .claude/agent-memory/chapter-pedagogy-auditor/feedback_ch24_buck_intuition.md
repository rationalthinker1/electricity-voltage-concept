---
name: ch24-buck-intuition-tier
description: Buck converter section in Ch24 skips non-mathematical intuition tier, going directly to integral math
metadata:
  type: feedback
---

In Ch24RectifiersAndInverters.tsx (L448–514), the buck converter section opens
with volt-second balance introduced via an inline integral (`∫ V_L dt = 0` in a
Term def at L460), then moves directly to the volt-second balance formula and
conversion ratio. There is no purely non-mathematical intuition paragraph before
the math — the "chopping the voltage" metaphor at L448–450 is immediately
followed by duty-cycle math notation.

**Why:** Switch-mode conversion ratio (V_out = D · V_in) qualifies as a
foundational quantity (it defines the operating principle of every SMPS).
Rule A requires a non-mathematical intuition tier (analogy/picture) before
the formal and operational tiers.

**How to apply:** When auditing SMPS chapters, check whether duty cycle and
the conversion ratio get a concrete everyday metaphor (e.g. "like a car's
gas pedal fraction of the time") before the first integral or formula appears.
