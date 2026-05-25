---
name: ch24-shockley-glossary
description: Shockley equation "where" paragraph omits I and V symbol definitions — a Rule B finding in Ch24
metadata:
  type: feedback
---

In Ch24RectifiersAndInverters.tsx at L86, the Shockley diode equation
`I = I_s ( exp(V / (n V_T)) − 1 )` is followed by a "where" paragraph (L89–108)
that defines I_s, n, and V_T but does not name or give SI units for:
- `I` — the diode current (amperes)
- `V` — the forward voltage applied across the diode (volts)

**Why:** The paragraph jumps straight to defining the subscripted/less-obvious
symbols and assumes the reader infers I and V from context. Rule B requires
every symbol in the formula to be named and unitised.

**How to apply:** When auditing Shockley-equation formulas, always check that
the bare `I` and `V` receive explicit "where" entries even though they look
obvious — they are still first introductions of notation in that context.
