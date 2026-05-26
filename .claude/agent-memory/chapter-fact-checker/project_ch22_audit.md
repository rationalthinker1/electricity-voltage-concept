---
name: project-ch22-audit
description: Fact-check audit results for Chapter 22 — Magnetically Coupled Circuits
metadata:
  type: project
---

Audit date: 2026-05-26. Lint: clean (no H1–H5 findings).

## Findings

### MED (misaligned citation)
- `src/textbook/Ch22MagneticallyCoupledCircuits.tsx:1258` — `maxwell-1873` cited for claim that a coupled inductor transitions to an "antenna pair" when displacement-current terms become important. `maxwell-1873` covers the mesh-current method (Treatise §282–284), not displacement current. `maxwell-1865` (which appears two sentences earlier in the same paragraph, correctly) is the right source. Soften by removing the terminal `maxwell-1873` cite — `maxwell-1865` already covers the quasi-static / radiation boundary.

### MED (historically wrong claim)
- `src/textbook/Ch22MagneticallyCoupledCircuits.tsx:113` — Term popover says Henry "discovered self-induction in 1832 a few months ahead of Faraday's separate work on mutual induction." The `henry-1832` source note says "simultaneously with Faraday." Faraday presented to the Royal Society in November 1831; Henry's Am J Sci paper appeared ~July 1832 — so Henry's publication came ~8 months AFTER Faraday's presentation. The "ahead" direction is wrong. Soften to: "discovered self-induction independently, simultaneously with Faraday" (matching the source note).

### MED (unsourced quantitative claim)
- `src/textbook/Ch22MagneticallyCoupledCircuits.tsx:769` and `:904` — `k²Q₁Q₂` as the effective coupling-quality product for wireless power transfer appears twice with no citation. This is a standard WPT/coupled-resonator result (Kurs et al., Science 2007 is the canonical reference) but no source exists in the registry. Options: add a source, or soften both mentions to "the product of coupling and coil quality factors" without the exact formula.

## Clean claims
- All Try-it arithmetic verified correct (Try 22.1–22.4).
- Qi frequency 110–205 kHz, 15 W EPP — correctly cited to `wpc-qi-1.3`.
- Induction cooktop 20–100 kHz, 1.5–3.7 kW, 85–90% — correctly cited to `lucia-induction-2014`.
- CT example (1000 A / 1000 turns = 1 A) — arithmetic correct.
- Wavelength "kilometres" at Qi frequencies — verified: ~1.5–2.7 km at 110–205 kHz.
- All `<Cite>` ids resolve to entries in both `sources.ts` and `chapter.sources[]`.

## Patterns noted
- `maxwell-1873` (mesh-current Treatise) was cited in a context about quasi-static breakdown / displacement current — classic wrong-fit trap. The correct source is `maxwell-1865`.
- Term popovers sometimes contain specific historical claims (dates, priority) that diverge from the source note for the same entry. Always cross-check Term popover text against the `sources.ts` note for the same key.
