---
name: ch3-audit-findings
description: Patterns and traps encountered auditing Ch3ResistanceAndPower.tsx (resistance-and-power)
metadata:
  type: project
---

## Rule A — Three-tier findings

**Resistance in Ch3:** The Term def in the opening paragraph (L48–58) gives V=IR as the first contact with resistance — that is the OPERATIONAL form, not intuition. The "What resistance is" section then jumps directly to J=σE (formal, microscopic) and V=IR (operational). No non-mathematical intuition paragraph (e.g. "a narrow pipe resists flow more") ever precedes the formulas. Intuition tier MISSING.

**Power in Ch3:** The "Where the heat comes from" section (L325+) opens with P=dW/dt in the first sentence of prose — already mathematical. No non-mathematical picture for power (e.g. "like a heater converting electrical energy to warmth at a measurable rate") precedes the formal derivation chain. Intuition tier MISSING.

## Rule B — Formula glossary findings

All narrative-prose Formulas have "where" paragraphs:
- L102 J=σE → L103 defines J, E, σ with units. Clean.
- L149 R=L/σA → L150 defines R, L, A, σ. Clean (ρ not in this formula version).
- L163 V=IR → L164 defines V, I, R with units. Clean.
- L201 R=L/σA=ρL/A → L202 defines all including ρ. Clean.
- L334 P=VI derivation → L335 defines P, V, I with units. Clean.
- L387 p_v=J·E → L388 defines p_v, J, E, σ. Clean.
- L397 P=V²/R=VI=I²R → L398 defines P,V,I,R; L,A,σ referred to as "from above" rather than re-stating units — borderline but defensible since they appear 8 lines earlier.
- L537 R_series → L538 defines symbols. Clean.
- L560 1/R_parallel → L561 defines symbols plus siemens unit. Clean.

## Rule C — Demo-framing prose findings

**HIGH: L572–577 before SeriesParallelMixDemo (L579)** — "Real circuits rarely live at one extreme... The demo below lets you pick the topology and watch the voltage drops and branch currents re-balance themselves." The second sentence is pure UI framing with deictic "below." The first sentence is light transitional prose but adds no new physics. Candidate for caption.

**MED: L173–180 after OhmsLawTwoViewsDemo (L171)** — "The two panels above pull the same equation in opposite directions..." Describes what the two demo panels show. Thin physics; mostly framing. Candidate for caption.

**MED: L230–234 after LengthVsResistanceDemo (L228)** — "The length picture is the simpler of the two... from a few milliohms at 10 cm to a few tens of milliohms at 10 m." Narrates the demo output. Candidate for caption.

**NOT flagged: L132–142 after MicroscopicOhm3DDemo** — mixes UI framing with genuine new physics (sign convention, B-field rings, nichrome vs copper ×65 comparison). Physics-forward; stays in chapter.

## Traps specific to Ch3

- The Term def at L48–58 gives V=IR operationally in the opening paragraph. This is NOT the intuition tier — it is an early operational definition inside a hover-popover. Still counts as the reader's first contact being operational, not intuitive.
- The Drude-model prose at L86–128 feels like "intuition" but is already mathematical (vectors, collision times, drift velocity proportionality). Does NOT satisfy the non-mathematical intuition tier requirement.
- L397 formula glossary: "L, A, σ are the geometric and material quantities from above" is an acceptable shortcut since full definitions appear at L202 just 8 lines earlier in the same section. Not a Rule B violation.
