---
name: project-ch3-audit
description: Ch.3 Resistance and Power audit findings — BLOCKERs and WARNINGs logged 2026-05-20
metadata:
  type: project
---

Audit of `src/textbook/Ch3ResistanceAndPower.tsx` completed 2026-05-20.

**Why:** Fact-check pass for factual accuracy, citation coverage, and arithmetic before merge.
**How to apply:** Use as baseline when re-auditing Ch.3 or auditing adjacent chapters (Ch.4 uses same crc-resistivity and matthiessen patterns).

## BLOCKERs

1. **feynman-II-2 not in chapter sources array** — used at line 328 for P=VI unit derivation; renders [?] in red. Source is also misaligned (Ch.2 Feynman = vector calculus, not circuit power). Fix: remove cite, replace with `griffiths-2017` (already in sources array).

2. **Iron/Tungsten/Tungsten-melting-point values (lines 289-293) have no cite** — `1.0×10⁷ S/m` (iron), `1.79×10⁷ S/m` (tungsten), `3700 K` (melting point). The `crc-resistivity` cite at line 271 is for the general 23-OOM range claim, not for these specific values. Fix: add `<Cite id="crc-resistivity" in={SOURCES} />` at end of line 293 paragraph.

3. **Opening para "2800 K" (line 41) has no cite** — specific filament temperature, no `<Cite />`. Coaton-Marsden (already in sources) gives 2700–3000 K and is used later in Case 3.1 for the same claim. Fix: add `<Cite id="coaton-marsden-1997" in={SOURCES} />` near line 41.

4. **Aluminum conductivity value (line 283, "3.77×10⁷ S/m") has no cite** — the cite at line 282 is for silver+copper (end of previous sentence). Aluminum needs its own cite. Fix: add `<Cite id="crc-resistivity" in={SOURCES} />` after the aluminum sentence (line 283-286).

## WARNINGs

5. **Tungsten described as "worse still" after iron (line 291) — factual error in ordering** — Iron σ = 1.0×10⁷ S/m; Tungsten σ = 1.79×10⁷ S/m. Tungsten is a BETTER conductor than iron (higher σ), not worse. The prose ordering is inverted. Fix: swap order or change "worse still" to "better than iron, but only a third of copper's conductivity."

6. **"seventy times worse" for nichrome (line 296) should be ~65×** — Cu/Nichrome = 5.96×10⁷ / 9.1×10⁵ = 65.5×. The same inaccuracy appears at lines 987 and 1154. Source (Kanthal datasheet, already cited) gives ρ ≈ 1.1×10⁻⁶ Ω·m → σ ≈ 9.09×10⁵ S/m → ratio 65.5×. "Seventy" overstates by ~7%. Should read "roughly sixty-five times worse" (or "more than sixty times").

7. **Thermal speed inconsistency (lines 349-354)** — Prose states thermal speed "of order 10⁵ m/s" and ratio vth/vd "around 10¹⁰". But 10⁵/10⁻⁴ = 10⁹, not 10¹⁰. The 10¹⁰ ratio is correct for Fermi velocity (~1.57×10⁶ m/s per Ashcroft-Mermin), but calling that the "thermal speed" and stating 10⁵ m/s is wrong. Fix: change "10⁵ m/s" to "~10⁶ m/s (Fermi velocity)".

8. **feynman-II-2 scope misalignment (line 328)** — Even if added to sources array, Feynman Vol II Ch.2 is "Differential Calculus of Vector Fields" (grad, div, curl) and its registry note says "curl-free property of static E." It doesn't cover P=VI. Better cite: `griffiths-2017`.

## Clean counts
- ~28 numerical claims audited; 23 resolved correctly; 5 flagged above.
- All other cite IDs resolve to real registry entries.
- Try 3.1, 3.2, 3.3, 3.4 arithmetic all verified correct.
- Case 3.2 current/loss-ratio arithmetic verified correct.
- USB FAQ cable dissipation arithmetic verified correct.
- Extension cord warmth arithmetic verified correct.
- CRC 23-OOM range claim verified plausible.
