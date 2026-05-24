---
name: voltage-class-notation
description: How North American distribution-voltage labels like "12.47/7.2 kV" decompose
metadata:
  type: reference
---

On a three-phase wye distribution system, the standard label "A/B kV" is **line-to-line / line-to-neutral**:

- `12.47/7.2 kV` — 12.47 kV line-to-line, 7.2 kV line-to-neutral. 12.47 / √3 = 7.1996.
- `13.2/7.62 kV` — same pattern.
- `25/14.4 kV` — same pattern (Canadian rural).
- `34.5/19.92 kV` — same pattern.

**Pole-pig primaries are usually wired line-to-neutral**, meaning a 25 kVA pole transformer on a 12.47/7.2 kV system has a 7.2 kV primary, not 12.47 kV. Some delta-connected primaries (older or rural systems without a four-wire neutral) do see the full 12.47 kV line-to-line. Both configurations exist; "12.47 kV primary" is shorthand that can mean either.

**Why it matters for fact-checking:** if a chapter says "X / Y kV" and then claims X is the line-to-neutral value (or Y is line-to-line), the author has reversed the convention. The smaller of the two is always line-to-neutral on a wye system.

**How to apply:** any time you see "12.47/7.2 kV" or "25/14.4 kV" check that the prose uses the larger number for line-to-line and the smaller for line-to-neutral; flag the reverse as a factual error.
