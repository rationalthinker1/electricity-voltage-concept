---
name: ch42-fiber-optics-audit
description: Findings from Rule A/B/C audit of Ch42FiberOptics.tsx (fiber-optic capstone, not applied-track exempt)
metadata:
  type: project
---

## Key findings from Ch42 audit

### Rule A — Three-tier order

**Snell's law / TIR (first h2, L57):**
The chapter moves immediately from an inline Term popover definition of refractive index
(which itself contains the math `c/v` at L65) into the Formula at L76. There is no
formula-free intuition tier paragraph before L76 (e.g., a gravity-lens analogy, a pool/
pencil-bending picture). The FiberOpticDemo at L114 arrives *after* both formulas. Missing
non-mathematical intuition tier before the formal Snell's law formula.

**Numerical aperture (second h2, L129):**
Single prose paragraph (L130–148) jumps directly to the Formula at L149. The "acceptance cone"
framing is geometric but still uses angles and indices. The Term popover at L134 contains the
formula inline. No formula-free metaphor or picture paragraph before L149. Missing intuition tier.

**All narrative Formula where-paragraphs: complete.** No Rule B violations.

### Rule B — Formula glossaries
All narrative Formula blocks have complete where-paragraphs with SI units:
- L76 (snells-law id form) — L77–111 defines n₁, n₂, θ₁, θ₂. Clean.
- L99 (sin θ_c = n₂/n₁) — L100–112 defines θ_c, n₁, n₂. Clean.
- L149 (NA = √…) — L150–158 defines NA, n_core, n_clad. Clean.
- L224 (V parameter) — L225–237 defines a (metres), λ (metres), NA. Clean.
- L362 (link budget) — L363–383 defines P_rx, P_tx, L_connectors, α, L. Clean.
- L195, 196, 253, 255, 404, 406: TryIt answer blocks — exempt.

The Δt = D·Δλ·L expression at L452 is an `<M>` (inline), not a `<Formula>` block;
symbols are defined in the same sentence. Correctly exempt.

### Rule C — Demo-framing prose

**L116–121 — paragraph immediately FOLLOWING `<FiberOpticDemo />` (L114):**
"Drag the angle slider in the demo. Below the critical angle, the ray zig-zags down the fiber
by total internal reflection; above it, the ray refracts into the cladding…"
This is pure UI framing — tells the reader what to do ("Drag") and what they'll see.
No new physics. Should move into FiberOpticDemo's `caption` prop.
Note: The paragraph follows the demo rather than preceding it, but is still misplaced
standalone UI-framing prose. Same Rule C logic applies — it belongs in the caption.

### Pattern noted
The "post-demo UI-framing paragraph" variant (paragraph immediately AFTER a demo rather than
before the next one) has now appeared in Ch17, Ch23, and Ch42. The Rule C check should
scan both N-6 lines (before) and N+10 lines (after) each demo for deictic/UI-framing language.
