# Chapter Review Report

Trimmed-semantic audit of all 42 chapters. The mechanical layer
(`npm run lint:chapters`) was **clean across every chapter** before this run, so
this pass skips the four mechanical sub-agents and runs only the three semantic
auditors per chapter:

- **Fact-check** — every number / year / attribution resolves to a real source in `src/lib/sources.ts` and the chapter's `sources[]`.
- **Pedagogy** — three-tier order, formula-glossary rule, bridging-paragraph placement (CLAUDE.md §6).
- **Prose** — misspellings, doubled words, hyphenation / broken-hyphen artefacts.

Run in batches of 6 chapters. Severity: **HIGH** (factual/anti-hallucination, must fix) ·
**MED** (pedagogy/structure) · **LOW** (prose nits). Report only — no edits applied.

---

## Batch 1 — Chapters 1–6

### Ch.1 — Charge and field
- **Fact-check:** ~35 claims audited, 33 resolve; no blockers; all `<Cite>` tags resolve. Two warnings:
  - **MED · fact** — L204: "a tiny fraction of the roughly 10²³ **free** electrons already in the rubber." Rubber is an insulator — it has essentially **zero free electrons**. Term is physically wrong and unsourced; total electron count is nearer 10²⁴. Fix: change to "total/bound electrons", correct to ~10²⁴, or drop the number (the qualitative point stands without it).
  - **LOW · fact** — L1021–1022 (FAQ): "100-watt bulb… draws on the order of 1 amp" — at 120 V a 100 W bulb draws 0.83 A, so 1 C passes in ~1.2 s, not 1 s (~20% off). Soften to "≈0.8 A at 120 V."
- **MED · pedagogy** — L358–376: electric-field **intuition tier bleeds into the formal intro**. The sentence "The symbol is E⃗, and its definition is direct:" should open the formal tier; split the paragraph there so the intuition stays formula-free.
- **HIGH · pedagogy** — L533–538: demo-framing paragraph before `ParallelPlateUniformFieldDemo` (Fig. 1.7) opens "Drag the separation slider." — pure UI instruction, and the physics sentence duplicates L527–528. Move into the demo's `caption`.
- **MED · pedagogy** — L477–494: mixed UI/physics paragraph after `EquipotentialsDemo` (Fig. 1.5); move the "teal dotted contours in the demo above" sentence to `caption`, keep the perpendicularity physics in prose.
- Formula glossaries all clean (coulomb-force, electric-field-def, point, parallel-plate). **Prose: clean.**

### Ch.2 — Voltage and current
- **Fact-check:** 22 claims audited, 18 verify; **3 unsourced-claim BLOCKERs + 3 arithmetic warnings.** No cite misalignments.
  - **HIGH · fact** — FAQ ~L841: cell-voltage table (1.5 V alkaline, 2.0 V lead-acid, 3.7 V Li-ion; "9 V = six 1.5 V cells") carries **no `<Cite>`** and no battery source exists in the registry. Fix: add `linden-reddy-2011` (*Linden's Handbook of Batteries*, 4e, McGraw-Hill 2011) to `sources.ts` + chapter array, or soften and drop the cross-chemistry table.
  - **HIGH · fact** — ~L300 & FAQ ~L1044: "Franklin … **1747**" stated twice, uncited; no Franklin source in registry. Soften to "mid-eighteenth century" or add Franklin 1751 *Experiments and Observations on Electricity*.
  - **HIGH · fact** — FAQ ~L1047: "J. J. Thomson identified the electron in **1897**" — attribution + year uncited; no Thomson source. Soften or add Thomson 1897 "Cathode Rays," *Phil. Mag.* 44.
  - **MED · fact** — ~L435: "**thirteen hours** to traverse one metre" inconsistent with the chapter's own 2.9×10⁻⁵ m/s drift (→ 9.6 h). 13 h belongs to a different wire scenario (0.02 mm/s). Pick one scenario.
  - **MED · fact** — ~L434: "garden snail moves roughly **fifty times faster**" — actual ratio ≈ 442× (snail ≈0.013 m/s vs 2.9×10⁻⁵ m/s). Change to "hundreds of times faster."
  - **LOW · fact** — ~L514: "**thirteen orders of magnitude**" — the L538 ratio is ~6.7×10¹² ≈ 10¹². Soften to "twelve to thirteen."
- **HIGH · pedagogy** — L538: formula `v_signal/v_drift ≈ 2×10⁸/3×10⁻⁵ ≈ 10¹³` has **no following "where" paragraph**; `v_signal`/`v_drift` never get SI units there.
- **MED · pedagogy** — L253–292: current's three tiers aren't structurally separated — operational `1 A = 1 C/s` bleeds into the intuition block; formal `I = dQ/dt` arrives with no h3 separator.
- **MED · pedagogy** — L467–476: closing sentence "…is what the next demo lets you watch" is pure UI framing; move into `CursorEFieldOnWireDemo`'s `caption` (keep the E=0-inside-conductor physics in prose).
- **LOW · pedagogy** — L206: `W = qV = qEd` "where" paragraph doesn't explicitly assign SI units (symbols glossed earlier; borderline). **Prose: clean.**

### Ch.3 — Resistance and power
- **Fact-check: CLEAN.** 27 claims audited, 27 resolve; no blockers. Minor (no action): `(500/11)²≈2000` rounding ok; "about 5%" silver/copper gap actual 5.7% ok; `v_F/v_d ~10¹⁰` order-of-magnitude ok. **Registry note (not a Ch.3 defect):** `grainger-power-systems-2003` key/year mismatch — registry records `year: 1994` (correct for Grainger & Stevenson); affects any chapter citing that key.
- **HIGH · pedagogy** — L82: resistance section **missing intuition tier** (opens with `J = σE`); the only pre-formal contact is `V = IR` inside a Term popover.
- **HIGH · pedagogy** — L325: power section **missing intuition tier** (opens with `P = dW/dt`).
- **HIGH · pedagogy** — L572–577: demo-framing before `SeriesParallelMixDemo` (Fig. 3.10) → `caption`.
- **MED · pedagogy** — L173–180 (after Fig. 3.2) and L230–234 (after Fig. 3.4): demo-narrating paragraphs, candidates for `caption`. **Prose: clean** (short circuit / short-circuit noun-vs-adjective defensible).

### Ch.4 — How a resistor works
- **Fact-check:** _pending (running)_
- **MED · pedagogy** — L354: Matthiessen's rule `ρ(T) = ρ_residual + ρ_phonon(T)` jumps straight to the formula with no non-mathematical intuition sentence first. (`R = ρL/A` correctly deferred to Ch.3 by cross-reference — not a violation.)
- Formula glossaries all clean; demo-framing clean. **Prose: clean.**

### Ch.5 — Capacitors
- **Fact-check:** _pending (running)_
- Three-tier order (Intuition/Formal/Operational/Special-case h3s) present and correct.
- **MED · pedagogy** — L193: `C = ε₀A/d` "where" paragraph omits explicit SI units for `A` (m²), `d` (m), and `ε₀` (F/m, which only appears later at L267).
- **MED · pedagogy** — L209: `C = ε₀ε_rA/d` defers to "other symbols unchanged," inheriting the L193 unit gap.
- **MED · pedagogy** — L222–233: "Toggle the Gauss pillbox to see…" UI sentence → `ParallelPlate3DDemo`'s `caption`; keep σ/Gauss physics in prose. **Prose: clean.**

### Ch.6 — Magnetism
- **Fact-check:** _pending (running)_
- **HIGH · pedagogy** — L89–98: magnetic-field B **intuition analogy appears after the formula** (`|B| = μ₀I/2πr` at L98; "contour lines around a mountain" at L100). The metaphor must precede the first formula.
- **HIGH · pedagogy** — L820 (FAQ): formula `f = qB/2πm` — `f` (cyclotron frequency) never defined, no "where" paragraph.
- **MED · pedagogy** — L89–115: no operational tier for B (e.g. Hall-probe / `B = F/qv` measurable handle).
- **MED · pedagogy** — L163–208: `F = BIL` never given a standalone narrative Formula + "where" (only inline in derivation + TryIt).
- **MED · pedagogy** — L98: `|B|` glossary not in canonical "where B is … (in tesla)" form; unit is in a separate sentence. **Prose: clean.**

---
