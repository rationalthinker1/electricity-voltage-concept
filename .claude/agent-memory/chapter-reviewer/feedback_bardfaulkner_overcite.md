---
name: bardfaulkner-overcite
description: Bard & Faulkner (2001) is a graduate electrochemistry methods text — it does not back consumer-cell product specs (mAh, Wh/kg, vendor self-discharge rates)
metadata:
  type: feedback
---

**Rule:** `bard-faulkner-2001` covers half-cell potentials, Butler–Volmer
kinetics, double-layer theory, SHE/Ag-AgCl reference electrode behavior,
and general electrochemistry methods. It does **not** carry the
following kinds of claims, even though it's tempting to use it as a
catch-all in any battery-related chapter:

- AA / 9 V / coin-cell capacity in mAh
- Alkaline / Li-ion / NiMH energy density in Wh/kg
- Vendor self-discharge rates (NiMH "20–30%/month", alkaline "few %/yr")
- Cold-temperature R_int multipliers (e.g. "−20 °C ≈ 2–3× room-temp R_int")
- Specific Li-ion or Li/SOCl₂ operating voltage windows as product values
- Lewis Urry / Eveready 1957 alkaline patent attribution

**Why:** B&F is a methods textbook; product specs come from manufacturer
datasheets, Linden's *Handbook of Batteries*, or chemistry-specific
papers. Stacking ten "see Bard & Faulkner" cites on consumer-cell claims
weakens the source's credibility and makes the citation feel
performative.

**How to apply when reviewing:**

- When a chapter has a battery/electrochemistry focus, list every
  `bard-faulkner-2001` cite and check whether the claim is *methods*
  (in scope) or *product* (out of scope).
- For product claims, recommend either (a) adding `linden-reddy-2011`
  (*Handbook of Batteries, 4e*, Linden & Reddy) to the registry and to
  the chapter's `sources` array, or (b) softening the number and dropping
  the cite.
- Ch.25 (`batteries`) was the canonical over-cite — 9 of 16 B&F cites
  were reaching past what B&F can back. Ch.26 (`modern-batteries`) is
  the next likely offender; check it next time.

Related: see CLAUDE.md §5 "no hallucinated science" — the rule is
not "cite *something*" but "cite a source that actually supports the
claim."
