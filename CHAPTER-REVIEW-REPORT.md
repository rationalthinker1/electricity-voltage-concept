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

### Run status (resumable)

| Batch | Chapters | Fact-check | Pedagogy | Prose |
|---|---|---|---|---|
| 1 | 1–6 | ✅ done | ✅ done | ✅ done |
| 2 | 7–12 | ✅ done | ✅ done | ✅ done |
| 3 | 13–18 | ✅ done | ✅ done | ✅ done |
| 4 | 19–24 | ✅ done | ✅ done | ✅ done |
| 5 | 25–30 | ✅ done | ✅ done | ✅ done |
| 6 | 31–36 | ⬜ not started | ⬜ | ⬜ |
| 7 | 37–42 | ⬜ not started | ⬜ | ⬜ |

**To resume after 7pm UTC:** re-run fact-check for Ch.19–24, fetch line-level
detail for Ch.23 pedagogy, then run all three auditors for Batches 5–7
(Ch.25–42). Mechanical lint (`npm run lint:chapters`) was clean across all 42
before this pass, so the semantic auditors are the only outstanding work.

### Fixes applied

All **factual / anti-hallucination** findings from Batches 1–3 (Ch.1–18, Ch.16
was already clean) have been **fixed and pushed** — arithmetic errors,
wrong-physics corrections, misaligned-cite swaps, source wiring, and softened
unsourced claims. The broken-hyphen prose artefacts in Ch.19/21/23 are fixed.
**Still open:** the pedagogy findings (intuition tiers buried in `<Term>`
popovers, demo-framing prose that should move to captions, missing "where"
paragraphs) are larger editorial rewrites and have **not** been applied yet —
they await a go-ahead on scope. Batch 4 fact-checks + Batches 5–7 review are
being resumed.

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
- **Fact-check:** ~45 claims audited, 39 verify; **3 unsourced blockers + 1 cite-misalignment + 3 warnings.**
  - **HIGH · fact** — L389: NTC "resistance drops by a factor of two for every ~25 °C" is uncited **and wrong** — with the chapter's own B≈3950 K the ratio is 2.1–2.8× per 25 °C. Fix wording to "factor of 2–3 per 25 °C, → ~2× at higher temps" and cite `steinhart-hart-1968`.
  - **HIGH · fact** — L993–998 (FAQ): Pt100 range "−200 to +650 °C" uncited and **understates** the IEC 60751 standard (−200 to +850 °C). Correct + cite `horowitz-hill-2015`.
  - **HIGH · fact** — L683–684 (Case 4.2): CPU throttle "~95 °C" / shutdown "~105 °C" uncited specific thresholds. Soften (values vary by processor) or cite a datasheet.
  - **HIGH · fact (misaligned cite)** — L147, 378, 609, 884: `kanthal` is cited for **manganin** (Cu-Mn-Ni) composition/history/shunt use, but the Kanthal datasheet covers only NiCr heating wire. Re-aim these four to `horowitz-hill-2015`; keep `kanthal` only for the nichrome resistivity value.
  - **MED · fact** — L389 (W1, same as above): the stated sensitivity contradicts the chapter's own B constant.
  - **LOW · fact** — L667 (Case 4.2): NTC R₁₀₀ stated 680 Ω vs ~698 Ω from chapter's B (within part variation). L722 (Case 4.3): visible-photon "1.8–3.1 eV" — true band ~1.77–3.26 eV; soften to "~2–3 eV."
- **MED · pedagogy** — L354: Matthiessen's rule `ρ(T) = ρ_residual + ρ_phonon(T)` jumps straight to the formula with no non-mathematical intuition sentence first. (`R = ρL/A` correctly deferred to Ch.3 by cross-reference — not a violation.)
- Formula glossaries all clean; demo-framing clean. **Prose: clean.**

### Ch.5 — Capacitors
- **Fact-check:** 35+ claims audited, all arithmetic verifies; **7 HIGH + 2 warnings** (mostly unsourced case-study specs + a cite misalignment).
  - **HIGH · fact (misaligned cite)** — L57, L747: `feynman-II-2` (vector-calculus chapter) used to back "energy lives in the field" — should be `feynman-II-27` ("Field Energy and Field Momentum"), already in registry + chapter sources. Swap both.
  - **HIGH · fact** — L785–786: water εᵣ≈80 / ceramics >1000 unsourced. Add `moulson-herbert-2003` (already in `sources.ts`) to the chapter array + cite.
  - **HIGH · fact** — L672–682 (Case 5.3 supercap), L708–715 (Case 5.4 flash), L628 (Case 5.2 baseline pF): spec lines uncited. Attach `horowitz-hill-2015` (or a proper EDLC/datasheet source) per line.
  - **HIGH · fact** — L699: supercap "~10× lower energy density than Li-ion" uncited **and contradicts** the chapter's own FAQ (L847–848: 250 vs 10 Wh/kg = 25×). Fix to ~25× and cite `linden-reddy-2011`.
  - **HIGH · fact (source-fit)** — L576–610: defibrillator clinical specs (150–360 J / ~2 kV) backed by `horowitz-hill-2015` (a bench-electronics text). Soften to "typical clinical values" or find a medical-device source.
  - **MED · fact** — L507 & `sources.ts:1167`: von Kleist "October 1745" — literature (Heilbron) dates the letter to Nov 4, 1745. Use "late/autumn 1745."
  - **LOW · fact** — L608: defibrillator "τ = RC ≈ 7 ms" — with R=50 Ω, C=150 µF, τ=7.5 ms. Round up.
- Three-tier order (Intuition/Formal/Operational/Special-case h3s) present and correct.
- **MED · pedagogy** — L193: `C = ε₀A/d` "where" paragraph omits explicit SI units for `A` (m²), `d` (m), and `ε₀` (F/m, which only appears later at L267).
- **MED · pedagogy** — L209: `C = ε₀ε_rA/d` defers to "other symbols unchanged," inheriting the L193 unit gap.
- **MED · pedagogy** — L222–233: "Toggle the Gauss pillbox to see…" UI sentence → `ParallelPlate3DDemo`'s `caption`; keep σ/Gauss physics in prose. **Prose: clean.**

### Ch.6 — Magnetism
- **Fact-check:** ~40 claims audited, 37 verify; **3 unsourced blockers + 3 numerical warnings** (two large arithmetic errors). All `<Cite>` keys resolve.
  - **HIGH · fact** — L479: "Minkowski in **1908**" attribution + year uncited; no Minkowski source. Drop the year or add Minkowski *Raum und Zeit* (1909).
  - **HIGH · fact** — L679–681: "about thirty confirmed magnetars" cited to `duncan-thompson-1992` — that's the *theory-prediction* paper, can't support an observed count. Soften to "dozens" + drop cite, or add `olausen-kaspi-2014` (McGill Magnetar Catalog).
  - **HIGH · fact** — L529: MRI "**0.3 T in the early 1980s**" uncited (`lauterbur-1973` covers the 1973 proposal only). Soften to "fractions of a tesla in the early clinical era."
  - **HIGH · fact** — L634 (Case 6.3): "hundred million times weaker than a magnetar" — Earth ~50 µT vs magnetar ~10¹⁰ T gives **2×10¹⁴**, not 10⁸. **Off by six orders of magnitude.** Fix to "~10¹⁴ times weaker."
  - **MED · fact** — L661 (Case 6.4): "ten quadrillion times the Earth's field" (10¹⁶) overstates; actual ≈ few×10¹⁵ at best. Fix to "a few quadrillion."
  - **LOW · fact** — L569 vs L597: LHC ring stated as `26.7 km` (spec) and `27 km` (prose); standardize to 26.7 km.
- **HIGH · pedagogy** — L89–98: magnetic-field B **intuition analogy appears after the formula** (`|B| = μ₀I/2πr` at L98; "contour lines around a mountain" at L100). The metaphor must precede the first formula.
- **HIGH · pedagogy** — L820 (FAQ): formula `f = qB/2πm` — `f` (cyclotron frequency) never defined, no "where" paragraph.
- **MED · pedagogy** — L89–115: no operational tier for B (e.g. Hall-probe / `B = F/qv` measurable handle).
- **MED · pedagogy** — L163–208: `F = BIL` never given a standalone narrative Formula + "where" (only inline in derivation + TryIt).
- **MED · pedagogy** — L98: `|B|` glossary not in canonical "where B is … (in tesla)" form; unit is in a separate sentence. **Prose: clean.**

---

## Batch 2 — Chapters 7–12

### Ch.7 — Induction
- **Fact-check:** ~38 claims audited, 31 verify; **6 blockers (5 unsourced + 1 misaligned), 0 arithmetic errors.**
  - **HIGH · fact** — L218: "Lenz … in **1834**" — name+year uncited; no Lenz source in registry. Drop the year or add Lenz, *Ann. Phys.* 31, 483–494 (1834).
  - **HIGH · fact (misaligned cite)** — L582–584 (Case 7.2): "≥95% for a USB-C cable" cited to `feynman-II-17` (the induction-law chapter — no cable-efficiency data). Soften and drop cite.
  - **HIGH · fact** — L788–789 (FAQ): same "95%+ cable" claim, uncited.
  - **HIGH · fact** — L508 (Case 7.1) & L797 (FAQ): iron-core saturation "~1.5–2 T" uncited (values are correct). Add `griffiths-2017`.
  - **HIGH · fact** — L725–729 (FAQ): "Edison's DC grid… Tesla and Westinghouse won the AC argument" — War-of-Currents attribution uncited; appended `griffiths-2017` covers only the physics. Rephrase as physics-only (DC → dΦ/dt=0).
  - **HIGH · fact** — L403–404 (TryIt 7.3 answer): "95–99% efficiency" uncited. Cite `lucia-induction-2014` or soften.
- **HIGH · pedagogy** — L88–122: **EMF intuition tier missing** — chapter goes from general historical narrative straight to the flux surface integral (L99) and formal Faraday's law (L122). EMF's only plain-words gloss is a `<Term>` popover. Add a non-mathematical EMF picture before L99.
- **HIGH · pedagogy** — L270: `Φ(t) = NBA cos(ωt)` has **no "where" paragraph**; the glossary at L274 is attached to the *next* formula (L272). Duplicate the symbol definitions onto L270 or merge the two `<Formula>` blocks.
- **MED · pedagogy** — L99: magnetic flux Φ intuition lives only in the FAQ (L672), far from the formal definition.
- **MED · pedagogy** — L372: `V₂/V₁ = N₂/N₁` has no own "where" (symbols defined on the preceding formula); add a one-line back-reference.
- **HIGH · pedagogy** — L299–305: pure demo-framing before `RotatingCoilFlux3DDemo` (Fig. 7.5) → move into `caption`. **Prose: clean.**

### Ch.8 — Where the energy actually flows (Poynting capstone)
- **Fact-check:** ~35 claims audited; **2 HIGH + several MED/LOW.** All 12 cite keys resolve.
  - **HIGH · fact** — L1091 (FAQ): plane-wave Poynting magnitude given as `cε₀E²` — should be `½cε₀E₀²` (peak) or note `E` is rms. **Off by 2×.**
  - **HIGH · fact** — L74, L88: drift velocity quoted as "0.03 mm/s" but Ch.2 (and `libretexts-conduction`) give **0.02 mm/s** (2.9×10⁻⁵ m/s). Ch.8 misquotes its own earlier chapter by 50%; fix both to 0.02 mm/s.
  - **MED · fact** — L438, L957: "Morris and Styer" — the source `morris-styer-2012` lists only Styer (Oberlin notes); no co-author Morris. Change prose to "Styer."
  - **MED · fact** — L736: "Annual global energy demand (2024) ~6×10²⁰ J" uncited (no IEA/BP source in registry). Add a source or drop the number.
  - **LOW · fact** — L729–734: Earth-intercepted-power spec cited to `codata-2018`, but it's a derived quantity CODATA doesn't carry. Drop the cite or mark "(derived)."
- Three-tier order clean; all 9 narrative `<Formula>` blocks have complete "where" paragraphs.
- **HIGH · pedagogy** — L319–323: "The 'P_surf/P_VI = 1.000' readout… is the entire chapter compressed into one number" — pure UI framing after `PoyntingInflowDemo` → `caption`.
- **MED · pedagogy** — L325–333: mixed UI/physics before `PoyntingCoax3DDemo`; move the opening UI sentence to `caption`, keep the coax cross-product physics. **Prose: clean.**

### Ch.9 — Electromagnetic waves
- **Fact-check:** ~45 claims audited, all arithmetic correct; **3 blockers + 2 warnings.** All `<Cite>` IDs resolve.
  - **HIGH · fact (misaligned cite)** — L599: Apollo Earth–Moon signal-delay sentence cited to `hertz-1888` (a Karlsruhe radio-wave paper — nothing on lunar latency). Drop the cite (`codata-2018` two lines up suffices).
  - **HIGH · fact (misaligned cite)** — L862 (FAQ): "Maxwell wrote down displacement current in **1861**" cited to `maxwell-1865` (the synthesis paper). Displacement current is from the 1861 "On Physical Lines of Force." Soften to "early 1860s" so the 1865 cite fits.
  - **HIGH · fact** — L1042 (FAQ): CMB "about 2.7 K" uncited. Append `codata-2018` or soften to "a few kelvin."
  - **MED · fact** — L567/L757/L778: IKAROS sail area **internally inconsistent** — "20 m × 20 m" (=400 m²) at L757 contradicts "~200 m²" at L567/L778 (Tsuda 2013: ~196 m², 20 m is the diagonal span). Fix the spec row.
  - **LOW · fact** — L824: X-ray "five orders of magnitude shorter" overstated; true ≈ 4–5 (soft end ~3.7). Soften to "four to five."
- **HIGH · pedagogy** — L170: **wave-equation intuition tier missing** — derived purely algebraically (Poynting → curls → PDE); `SpeedOfLightDemo` (L202) lands only after the full derivation. Add a one-sentence analogy and/or move the demo earlier.
- **MED · pedagogy** — L207/L323: operational forms `v = c/n`, `λ = c/f` appear as inline math inside prose, not as a distinct operational tier.
- **MED · pedagogy** — L458–467: final sentence is UI framing for `WireToAntennaTransition3DDemo` → `caption`. Formula glossaries clean. **Prose: clean.**

### Ch.10 — Maxwell's synthesis
- **Fact-check:** 61 claims audited, 56 verify; **4 blockers + 1 misaligned cite + 1 warning.** All `<Cite>` IDs resolve; all TryIt arithmetic correct.
  - **HIGH · fact (misaligned cite)** — L1030: "electron anomalous moment predicted by QED to twelve decimal places" cited to `feynman-II-18` (a 1964 lecture — predates the multi-loop result by ~60 years). Soften to "more than ten significant figures" (no source needed) or cite Hanneke 2008 / Aoyama 2019.
  - **HIGH · fact** — L538–540: Maxwell's "310,740,000 m/s" and Fizeau's "315,000,000 m/s (1849)" both uncited (the paragraph's `maxwell-1865` is deferred to the quote). Attach `maxwell-1865`; add a Fizeau source or soften.
  - **HIGH · fact** — Cases 10.1–10.4: **all 24 spec lines uncited** — but the backing keys already exist in the chapter (`hertz-1888`, `hong-2001-wireless`, `kaplan-hegarty-2017`, `ewen-purcell-1951`). Just attach them (21-cm lifetime ~10⁷ yr needs `griffiths-2017`).
  - **HIGH · fact** — L778: hydrogen hyperfine "≈5.9 μeV" uncited (CODATA: 5.874 μeV). Attach `codata-2018`, optionally tighten to ~5.87 μeV.
- **MED · pedagogy** — L409–412: displacement-current **intuition tier missing** from prose (the conceptual gloss lives only in a `<Term>` popover). Add an analogy sentence before L410. (The four equations are recaps of prior-chapter quantities — Rule A doesn't bind.)
- **LOW · pedagogy** — L499–501: `∇×E`, `∇×B` "where" paragraph defines the curl operator but omits its SI units (V/m², T/m²).
- **HIGH · pedagogy** — L141–152: pure demo-framing before `MaxwellEquations3DDemo` → `caption`. **Prose: clean.**

### Ch.11 — Relativity and EM
- **Fact-check:** 40+ claims audited, 36 verify; **no citation problems** (all 10 `<Cite>` IDs resolve and back their claims); **3 HIGH arithmetic errors + 1 inconsistency**, all in Case 11.2 / the GPS summary.
  - **HIGH · fact** — L572 (Case 11.2): `γ−1 ≈ 2.7×10⁻²⁵` should be **2.7×10⁻²⁷** (two orders off).
  - **HIGH · fact** — L575–576: net charge density `λ' ≈ −5×10⁻²⁵ C/m` should be **~2.4×10⁻²² C/m** (three orders off).
  - **HIGH · fact** — L600–601: electron deficit "~3×10⁻⁶ per metre" should be **~1.5×10⁻³ per metre** (three orders off). All three share a root cause — undercounted powers of 10 when squaring `v_d/c ≈ 7×10⁻¹⁴`.
  - **MED · fact** — L504 vs L432/L517/L535: GPS net offset "38.6 µs/day" (summary) is the outlier; the chapter's self-consistent arithmetic gives **38.5 µs/day**. Standardize.
- **HIGH · pedagogy** — L302–310: the **E/B frame-mixing transformation equations** the `EBTransformDemo` visualises never appear in narrative prose at any tier (only inline `<M>` tensor contraction, no "where", no intuition). Add them as a `<Formula>` block + "where" + a one-sentence intuition.
- **MED · pedagogy** — L193: Lorentz factor γ defined only inside a `<Term>` popover + a TryIt hint; no narrative intuition/formal/operational tier, yet TryIt 11.1 asks the reader to compute γ. Add a short three-tier block before L154.
- Only narrative `<Formula>` (L167) has a complete "where"; demo-framing clean. **Prose: clean.**

### Ch.12 — Circuits, AC, and impedance
- **Fact-check:** 39 claims audited, 35 verify; **4 blockers (1 a real arithmetic error) + 1 warning.**
  - **HIGH · fact** — L1348 (FAQ): "33% extra I²R losses" at pf=0.7 is **wrong** — current scales 1/0.7=1.43×, losses ×(1.43)²=2.04 → **~100% extra**, not 33%. Fix to "roughly double the I²R losses." (`grainger-power-systems-2003` cite stays.)
  - **HIGH · fact** — L642: "Charles Steinmetz at General Electric in the 1890s" uncited — `steinmetz-1893` **is in the registry but missing from `chapter.sources[]`**. Add the key + `<Cite>`.
  - **HIGH · fact** — L1164–1165 (Case 12.1) & L1373–1374 (FAQ): Westinghouse 60 Hz / AEG 50 Hz history uncited; no grid-frequency source in registry. Soften (drop AEG specifics) or add a real history source (e.g. Hughes, *Networks of Power*, 1983 — verify first).
  - **HIGH · fact** — L619 & L1400–1401: crystal-oscillator Q≈10⁶ and cesium Q≈10¹⁰ uncited. Soften ("Q in the millions") or cite a verifiable source.
  - **MED · fact** — L1213–1215: AM radio coil/cap spec (250 µH, 30–365 pF) overruns the band edges by ~9% and is uncited. Soften to ranges without specific numbers.
- **HIGH · pedagogy** — L639–675: **impedance intuition tier absent** — jumps from the Steinmetz note to `V = IZ` and the per-component Z formulas; the `<Term>` popover holds the operational form `Z = R + jX`, not an intuition.
- **HIGH · pedagogy** — L800–814: **RMS intuition tier missing** — introduced only via a `<Term>` popover (`V_rms = V_p/√2`); leads with time-averaging math.
- **MED · pedagogy** — L703: reactance intuition collapsed into its `<Term>` definition.
- **HIGH · pedagogy** — L122–124: KCL `ΣI_in = ΣI_out` has **no "where"** — `I_in`/`I_out` never given units (A). L146–148: KVL `ΣV_loop = 0` likewise.
- **MED · pedagogy** — L1030–1033: Thévenin formula no "where" for `V_th` (V) / `R_th` (Ω). L1042–1051: split the UI-framing clause before `SuperpositionDemo` into `caption`. **Prose: clean.**

---

## Batch 3 — Chapters 13–18

### Ch.13 — Network analysis methods
- **Fact-check:** ~70 claims audited, 65 resolve; **no misaligned cites, all 7 worked examples arithmetically correct.** Issues are uncited claims/specs:
  - **HIGH · fact** — L1165: "codified as P48 in IEC 61938" uncited; `IEC 61938` not in registry. Soften or add `iec-61938` (real standard).
  - **HIGH · fact** — L1108: "SPICE first release: 1973" uncited — `ho-ruehli-brennan-1975` **is in the registry but not in `chapter.sources[]`**; add it + cite, or soften to "circa 1970s."
  - **HIGH · fact** — L1112: "Per-iteration cost: O(N^1.2) sparse LU" uncited specific complexity claim. Soften to "near-linear" or cite.
  - **MED · fact** — Cases 13.1/13.3/13.4 spec arrays (gauge factor, P48 ±4 V, Class-AB/D efficiencies, VSWR loss) uncited — but `horowitz-hill-2015` in adjacent prose covers them; attach the cite inside the specs.
  - **MED · fact** — L899–901: "half of the source's open-circuit energy budget" is not physically meaningful (open-circuit power = 0). Rephrase in terms of short-circuit power.
  - **LOW · fact** — L1068: full-bridge output label "≈5–10 mV" should be 10–20 mV (or the label should say half-bridge).
- No three-tier violations (procedural-method chapter; the motivation-then-equation pattern is appropriate). Norton's `I_N` intuition (V-I line argument) is correctly placed.
- **HIGH · pedagogy** — L530–532: `I_N = V_Th/R_Th, R_N = R_Th` has **no "where"** — `I_N`, `R_N`, `R_Th` never defined with names/units.
- **MED · pedagogy** — recurring missing-units glossaries: L122–124 (`N`,`B` only in Term popovers), L238–239 (mesh-KVL), L343–344 (nodal-KCL), L748–759 (Y→Δ), L854–856 & L873–876 (max-power `P_L`, `P_L,max`) — none give SI units in a "where" paragraph.
- **MED · pedagogy** — L779: "the demo below confirms the equivalence numerically" → `YDeltaTransformDemo` caption. **LOW** — L593–597 retrospective demo-pointing after `NortonTheveninDemo`. **Prose: clean.**

### Ch.14 — Semiconductors and transistors
- **Fact-check:** 60 claims audited, 13 flagged (9 HIGH, 2 MED, 2 LOW).
  - **HIGH · fact (arithmetic)** — L322–323: `V_bi` ratio stated 5×10¹¹ but `N_A·N_D/n_i² = (5×10¹⁵)²/(10¹⁰)² = 2.5×10¹¹`; `ln` should be 26.24 (not 27.0), V_bi = 0.678 V. Fix the ratio and ln.
  - **HIGH · fact (misaligned cite)** — L1163–1171: "TSMC N3" + "≈19×10⁹ transistors" (A17 Pro, 2023) cited to `razavi-2021` (a 2021 textbook). Soften to descriptive prose.
  - **HIGH · fact** — L1175: A17 Pro die area "≈103 mm²" uncited (no source for it). Soften/remove.
  - **HIGH · fact** — Cases 14.2/14.3/14.4 spec rows (LED λ/Vf, 12AX7 µ≈100, 2N5457 gm, optocoupler isolation), L1341 (175 °C vs 80 °C Ge), L1419 (LED 40–50% wall-plug), L1488 (1.5 W heater, "few thousand hours") all uncited — attach `horowitz-hill-2015`/`streetman-banerjee-2015` or soften.
  - **MED · fact** — L1216 vs L1229: Case 14.2 spec "~940 nm" contradicts prose "λ ≈ 873 nm" from E_g=1.42 eV (873 is correct for GaAs). Fix spec to ~880 nm or relabel material AlGaAs.
  - **MED · fact** — L1358–1364 (FAQ): diode-knee derivation's intermediate "6·V_T·ln(10) ≈ 0.36 V" doesn't reach the stated 0.6–0.7 V; rework or drop the step.
- **HIGH · pedagogy** — L355: Shockley diode equation `I = I_s(e^{qV/nkT}−1)` has **no intuition tier** before it (the hill-height picture is scattered *after* the formula; the `<Term>` popover only labels it). Add an analogy paragraph before L355.
- **HIGH · pedagogy** — L762: triode formula — `k_n` never defined with units (A/V²) in a "where"; its definition lands ~30 lines later at L810.
- **HIGH · pedagogy** — L570: `I_C = β·I_B` has **no "where"** glossary; the `<Term>` for β dangles *below* the formula it defines.
- **HIGH · pedagogy** — L726–731: pure demo-framing before `MOSFET3DDemo` → `caption`.
- **MED · pedagogy** — L306 (`V_bi`) and L923 (`g_m`/`V_T`): intuition tier missing and "where" units deferred to later paragraphs. **Prose: clean.**

### Ch.15 — Fourier and harmonic analysis
- **Fact-check:** ~55 claims audited; **2 arithmetic errors + 3 misaligned cites + 2 unsourced.** Gibbs/series/RMS/crest-factor arithmetic all verified.
  - **HIGH · fact (arithmetic)** — L719 & L1053: FFT speedup for N=65 536 stated "1638×" — correct is `N²/(N log₂N) = 4096×`. Fix **both**.
  - **MED · fact (arithmetic)** — L887: oscilloscope op-count pair (~10¹⁸ naive / ~10⁷ FFT) inconsistent for one buffer. Fix to ~10¹⁴ naive / ~2×10⁸ FFT.
  - **MED · fact (misaligned cite)** — L769/L797: MP3 MDCT/codec architecture cited to `oppenheim-willsky-1997` (covers transfer functions, not MDCT/psychoacoustics). Soften. L549/L606–609: IEEE 519 voltage-class limits cited to `horowitz-hill-2015`; soften to "a few percent."
  - **LOW · fact** — L1068–1069: "Winograd (1976)" should be **1978** (*Math. Comp.* 32). L695–699 (Gauss 1805/Pallas) → add `cooley-tukey-1965`. L785–786 (MP3 masking ~150 Hz/~50 ms) uncited — soften.
- **HIGH · pedagogy** — L105–113: Fourier-series **intuition tier collapsed** (the vivid hook examples sit two sections earlier; "The series formula" section opens straight into the formula, with only a `<Term>` popover gloss). **Operational tier missing entirely** (no "how an engineer computes/looks these up — FFT, spectrum analyser, tables").
- **HIGH · pedagogy** — L113 (`f(t) = a₀/2 + Σ[…]`) and L151–152 (the `a_n`/`b_n` projection integrals) have **no "where"** paragraphs — `a₀`, `a_n`, `b_n` and their units never listed.
- **MED · pedagogy** — L627–638: DFT intuition tier missing (opens with a `<Term>` popover then the complex-exponential formula). Several more partial/missing glossaries: L400, L417 (RMS), L478 (transfer-function superposition), L592 (THD), L638 (DFT) lack units/where.
- **MED · pedagogy** — L515–518: caption-style summary after `SquareThroughLPFDemo` → move into its `caption`.
- **Prose: clean.**

### Ch.16 — Filters, op-amps, and transmission lines
- **Fact-check: CLEAN.** ~65 claims audited, all resolve; no blockers, no misaligned cites, all arithmetic verified. Notably clean citation hygiene.
  - **LOW · fact** — L138: "Bode … Bell Labs (1940s)" attribution sits inside a `<Term>` def where the `oppenheim-willsky-1997` cite can't naturally follow (attribution is correct). L618–619: "Philip Smith … 1939" — backed by `pozar-2011` on the same paragraph. No action required.
- **HIGH · pedagogy** — L57–96: transfer-function / cutoff-frequency **intuition tier missing** — derives `H(jω)` and `ω_c = 1/RC` straight off; `ω_c` glossed only in a `<Term>` popover; `RCFilterBodeDemo` (L153) lands after the formal formulas.
- **HIGH · pedagogy** — L494–513: characteristic impedance `Z₀` **intuition tier missing** — the `<Term>` popover holds the formula `Z₀ = √(L′/C′)`; no plain-words picture precedes it.
- **HIGH · pedagogy** — L364 & L371: inverting/non-inverting op-amp gain formulas have **no "where"** paragraphs (`V_out`, `R_f`, `R_in`, `R_g` undefined with units).
- **HIGH · pedagogy** — L183–190: pure demo-framing before `FilterDesignerDemo` → `caption`. **Prose: clean.**

### Ch.17 — Materials
- **Fact-check:** ~60 claims audited, 54 resolve, all arithmetic correct; **2 genuine physics errors + several uncited values.**
  - **HIGH · fact (wrong physics)** — L1047–1049: "copper atom has just one [unpaired d electron]" — Cu is [Ar]3d¹⁰4s¹, the 3d shell is **full** (zero unpaired 3d electrons); the lone unpaired electron is 4s. Correct the statement.
  - **HIGH · fact (wrong physics)** — L1053: "copper is a paramagnet at most" — bulk Cu is weakly **diamagnetic** (χ_m ≈ −1×10⁻⁵). Replace with "weakly diamagnetic in bulk."
  - **MED · fact** — uncited values, all backable by keys already in `chapter.sources`: L1191 (MRI 1.5–3 T, Earth ~50 µT → `codata-2018`/`kittel-2005`), L1167–1169 (Meissner χ_m=−1 → `kittel-2005`), L961–964 (Nd₂Fe₁₄B Curie ~580 K → `kittel-2005`), L847–852 (GMR areal-density/1997 IBM history — soften or cite).
  - **LOW · fact** — L1025 (air breakdown 3 MV/m → `jackson-1999`), L277 (mica ε_r≈6.7 — Griffiths lists muscovite ~5.4; cite + note or lower).
- **HIGH · pedagogy** — L116–164: polarization `P` formal tier (`P = n⟨p⟩`, C/m²) lives **only in a `<Term>` popover** — a reader who never hovers jumps from the atom-dipole intuition straight to the operational `E_inside = E_applied/ε_r`. Surface the formal statement as narrative prose before L164.
- **MED · pedagogy** — L64–99: permittivity ε and permeability µ formal definitions (`D = εE`, `B = µH`, F/m, H/m) confined to `<Term>` popovers.
- All narrative `<Formula>` blocks have complete "where" paragraphs; no demo-framing violations. **Prose: clean.**

### Ch.18 — Optics from EM
- **Fact-check:** ~65 claims audited, 59 resolve; **no misaligned cites**, all Snell/Fresnel/Brewster/fiber/grating arithmetic verified. 6 flagged:
  - **MED · fact** — 4 uncited historical attributions: L639 (Einstein 1917 stimulated emission), L287–290 (Newton *Opticks* 1704), L460 (Newton soap-bubble colours 1670s), L395 (Malus 1809). Soften and lean on the in-scope `hecht-2017` cite, or add registry entries.
  - **MED · fact** — L481: fiber acceptance half-angle "~10°" inconsistent with the stated indices (n_core 1.4682, n_clad 1.4628 → NA 0.126 → **7.2°**). Fix to "~7°."
  - **LOW · fact** — L549–551: double-slit fringe spacing stated "~5 mm" but λL/d = **5.5 mm**. L767: coated reflectance "~1.4%" vs chapter's own formula 1.26%.
- **HIGH · pedagogy** — L81–86: refractive index `n` — **both intuition and formal tiers absent** from prose (`n = √εᵣ` only in a `<Term>` popover); chapter jumps to the boundary-condition formula at L89. Add an intuition paragraph + a `<Formula>n = c/v = √εᵣ</Formula>` with a "where".
- **HIGH · pedagogy** — L89–92: boundary-condition formula has **no "where"** — `D` (C/m²), `µ` (H/m), and the ∥/⊥ convention all first appear here undefined.
- **MED · pedagogy** — L370–377: Brewster's angle `θ_B = arctan(n₂/n₁)` only inline `<M>` + `<Term>`; no three-tier structure.
- **HIGH · pedagogy** — L142–152: pure demo-framing before `SnellLaw3DDemo` → `caption`. **Prose: clean.**

---

## Batch 4 — Chapters 19–24

### Ch.19 — Antennas and radiation
- **Fact-check:** ~55 claims audited; **3 HIGH arithmetic errors + 2 misaligned cites.** No unsourced claims.
  - **HIGH · fact (arithmetic)** — L~543 (TryIt 19.4): −148 dBm converted to "1.6×10⁻¹⁹ W" — correct is **1.6×10⁻¹⁸ W** (10× slip); the follow-on "one photon per ms" then needs recomputing (~290k/s).
  - **HIGH · fact (arithmetic)** — L~741 (Case 19.1): −165 dBm → "3×10⁻¹⁹ W" should be **~3×10⁻²⁰ W** (10× the other way).
  - **HIGH · fact (arithmetic)** — L~579: Fraunhofer distance for a 70-m dish at 8.4 GHz stated "≈2.7 km" — `2D²/λ` = **≈274 km** (100× slip).
  - **MED · fact (misaligned cite)** — L1063–1065: atmospheric n and coax velocity factor cited to `friis-1946` (only the link-budget formula). Re-cite to `griffiths-2017`/`horowitz-hill-2015` or soften.
  - **MED · fact (misaligned cite)** — L763–765: FCC EIRP limits cited to `balanis-2016` (antenna theory text). Re-point to `ieee-80211` (already in sources) or "per FCC Part 15."
  - **LOW · fact** — L~1047: short-dipole R_rad 0.0086 vs 0.0088 Ω (benign).
- **HIGH · pedagogy** — antenna gain/directivity has **no intuition tier** (first appears at L267 as "~2.15 dBi"; the gain-vs-directivity distinction is deferred to the FAQ and never gets a narrative tier). Add a "flashlight vs. bare bulb" picture.
- **HIGH · pedagogy** — L228–236: radiation resistance `R_rad` lives **only in a `<Term>` popover**; the expression is inline math, not a `<Formula>` + "where". Give it all three tiers.
- **HIGH · pedagogy** — L173–179: pure demo-framing before `DipoleRadiation3DDemo` → `caption`.
- **MED · pedagogy** — L78–87 Larmor: operational tier (`P = ½R_rad I²`) missing; L494–497 Friis worked `<Formula>` in prose has no "where"; L507–517 split the 45°/90° examples into the demo caption.
- **LOW · prose** — **broken-hyphen artefacts**: L76 `"non- relativistic"` → `non-relativistic`; L265 `"short- dipole"` → `short-dipole`.

### Ch.20 — Motors
- **Fact-check:** ~45 claims audited, 42 resolve, all worked examples correct; **1 factual error + 2 source issues.**
  - **HIGH · fact (wrong)** — L1034–1042: "Early EVs (GM EV1, 1996; Toyota RAV4 EV, 1997) actually did use DC motors" — **both used AC motors** (EV1: 3-phase induction; RAV4 EV: AC synchronous). Remove/replace the examples.
  - **HIGH · fact** — L1065: NdFeB "irreversibly demagnetise above ~150 °C" uncited and grade-dependent → cite `krishnan-2010-bldc` or soften.
  - **MED · fact (misaligned cite)** — L503–506: synchronous-clock "few seconds per year" cited to `grainger-power-systems-2003` (an I²R-losses text). Soften the quantifier.
- **HIGH · pedagogy** — L55–104: torque has **no intuition tier** (the `<Term>` gloss is a hover popover; prose goes straight to `force-on-wire` then `τ = NIABsinθ`). Add a wrench/steering-wheel picture before L75.
- **MED · pedagogy** — L163–202: back-EMF — both gloss and `E = NBAω` live only inside the `<Term>` popover; narrative jumps to the operational `E_back = k_e ω`.
- **LOW · pedagogy** — L350–399: synchronous speed `n_s = 120f/p` (L369) lands before the rotating-field intuition (L386–399); reverse the order. L370–376: `ω_s = 4πf/p` introduced without naming it or its unit (rad/s). **Prose: clean.**

### Ch.21 — Generators and the grid
- **Fact-check:** ~55 claims audited, 47 resolve, all TryIt arithmetic correct; **1 arithmetic error + uncited case specs + 2 misaligned cites.**
  - **HIGH · fact (arithmetic)** — L654: "Four generators spanning **seven orders of magnitude**… 700 MW … to 2 MW" — 700/2 = 350× ≈ **2.5 orders**, not seven. Fix to "nearly three orders of magnitude."
  - **HIGH · fact** — Cases 21.x: Three Gorges (L665–702: 22.5 GW, 80 poles, 95–112 TWh/yr, 20 kV, 80 m head), Hoover (L714–747: 2.08 GW uprate, 1.34 GW 1936, 0.85–0.90 efficiency), data-center diesel (L823–829), and governor droop "~5%" (L527) all uncited — `fitzgerald-kingsley-umans-2014` covers machine theory, not installation specifics. Soften or source.
  - **MED · fact (misaligned cite)** — L702 (Three Gorges 20 kV) and L851 (data-center demand-response) cited to `grainger-power-systems-2003` (power-flow text). Soften.
  - **LOW · fact** — L575: grid inertia "H 4–6 s" understates Kundur's 5–10 s. **Note:** `grainger-power-systems-2003` registry year mismatch (says 2003, year field 1994) — cross-cutting, pre-existing.
- **HIGH · pedagogy** — L56–76: generated EMF has **no intuition tier** — the analogy carries inline math, the `<Term>` popover holds the formal `−dΦ/dt`, and `faraday-law` fires at L76; `RotatingCoilGeneratorDemo` (L122) that could supply the intuition lands *after* both the formal and operational formulas. Move the demo earlier or add a non-math analogy.
- **MED · pedagogy** — L71: Faraday's law defined only in a `<Term>` popover.
- All five narrative `<Formula>` blocks have complete "where" paragraphs; no demo-framing violations.
- **LOW · prose** — broken-hyphen artefact: L494 `"simple- cycle"` → `simple-cycle`.

### Ch.22 — Magnetically coupled circuits
- **Fact-check:** ~35 claims audited, 32 resolve, all TryIt arithmetic correct; **2 misaligned cites + 1 unsourced formula.**
  - **MED · fact (misaligned cite)** — L1258: quasi-static / antenna-pair transition cited to `maxwell-1873` (the mesh-current method); should be `maxwell-1865` (already cited two sentences earlier). Drop the 1873 cite.
  - **MED · fact** — L113 (Term "henry"): "Henry … a few months **ahead** of Faraday" contradicts the chapter's own `henry-1832` note ("simultaneously"); Henry actually published ~8 months after Faraday's 1831 presentation. Soften to "independently, simultaneously."
  - **MED · fact** — L769 & L904: the `k²Q₁Q₂` figure of merit is uncited. Add Kurs et al. 2007 (*Science* 317) or soften to qualitative.
- **HIGH · pedagogy** — coupling coefficient `k` has **no operational tier** — intuition (flux-leakage picture, L295–312) and formal (`k = M/√(L₁L₂)`, L314) are present, but the compute-with-it form `M = k√(L₁L₂)` only appears inside TryIt 22.1 (exempt). Add an operational paragraph between L317 and L319.
- **MED · pedagogy** — L230: `M₁₂ = M₂₁ ≡ M` has no proper "where" — `M₁₂`/`M₂₁` never named as mutual inductances in henries. Mutual inductance M's intuition tier is buried in the chapter-opening Qi hook rather than anchored to its h2 (correct ordering otherwise).
- No demo-framing violations. **Prose: clean.**

### Ch.23 — Transformers
- **Fact-check:** 37+ claims audited, zero arithmetic errors; **1 date error + 3 uncited specs + 1 inconsistency.**
  - **HIGH · fact (wrong)** — `chapters.ts:837` (Ch.23 blurb): "Stanley turned it into a working power-grid component in **1885**" — prose, the `stanley-1886` registry entry, and history all say **1886** (Great Barrington). Fix the blurb.
  - **HIGH · fact** — uncited spec rows: Case 23.1 service life (L893 → `mclyman-2004`/`grainger`), Case 23.2 mass (L937–941 → `mclyman-2004`, already cited in adjacent prose), Case 23.3 cooling + mass (L996, L998 → `grainger`/`fitzgerald`).
  - **MED · fact** — L262 ("99–99.5%") vs L768 ("95–99.5%") efficiency ranges inconsistent; reconcile/qualify.
  - **LOW · fact** — L817–820: "five grams instead of six hundred" uses the 30 W unit's 5 g for a 100 W transformer; qualify to 30 W or scale up.
- **HIGH · pedagogy** — L62–151: turns ratio (`Vs/Vp = Ns/Np`) **intuition tier missing** — the section opens with an already-numerical pole-pig hook, then goes straight to the Faraday-law derivation (L101); `TurnsRatioDemo` (L151) lands after three `<Formula>` blocks. Add a formula-free "count the turns, scale the voltage — like gears" picture before L101.
- **MED · pedagogy** — L458–480: impedance-transformation intuition lives **only in a `<Term>` popover** (which states the formula, not a picture). Add a "10:1 step-down makes the load look 100× heavier" analogy before L480.
- **MED · pedagogy** — L811–821: `V = 4.44·f·N·B·A` is used in TryIt 23.6 but never presented as a narrative `<Formula>` + "where" first.
- **HIGH · pedagogy** — L667–672: pure demo-framing before `TransformerDesignerDemo` → move verbatim into its `caption`.
- All other narrative `<Formula>` blocks pass the glossary rule. **Prose: clean** (broken-hyphen artefacts now fixed).
- **LOW · prose** — broken-hyphen artefacts: L1213 `"low- impedance"` → `low-impedance`; L1271 `"open- circuit"` → `open-circuit`.

### Ch.24 — Rectifiers and inverters
- **Fact-check:** 20 claims audited, 17 resolve, all TryIt arithmetic exact; **3 unsourced/misaligned blockers + 2 warnings.**
  - **HIGH · fact** — L165: V_F temp-coefficient "~2 mV/K" uncited → add `horowitz-hill-2015`.
  - **HIGH · fact** — L1002: "IEC 61000-3-2 … above 75 W" uncited (standard not in registry) → soften or add the standard.
  - **HIGH · fact** — L872: "IEEE 1547-2018" referenced but `ieee-1547-2018` not in `chapter.sources[]` (it's in the registry) → add the key + `<Cite>`.
  - **HIGH · fact (misaligned cite)** — L1043–1070 (Case 24.2): Tesla Model S specs + "~30% urban regen" cited to `erickson-maksimovic-2020` (a fundamentals text, not Tesla data) → soften specs, drop the 30% figure.
  - **MED · fact (misaligned cite)** — L1027–1028: "1965 … 5 kg, 50% efficiency" counterfactual cited to `horowitz-hill-2015` → soften, drop specific numbers.
  - **LOW · fact** — Case 24.4: 846 mi = 1362 km (shown 1361). L1267: HVDC breakeven cited to `kundur-1994` (stability text) → soften.
- **HIGH · pedagogy** — L243–265: ripple is introduced **only inside a `<Term>` popover** (formula `ΔV ≈ I/(2fC)` in the `def` prop); no narrative intuition/formal/operational tier.
- **HIGH · pedagogy** — L488–498: duty cycle `D = t_on/T_sw` appears **only in a `<Term>` popover**; never a narrative paragraph.
- **HIGH · pedagogy** — L86: Shockley diode `<Formula>` "where" defines `I_s`, `n`, `V_T` but **not `I` (A) or `V` (V)** — the equation's two primary symbols.
- **MED · pedagogy** — L172–241: half-wave/centre-tap/bridge definitions carried entirely by three `<Term>` popovers; no formal-tier prose.
- **LOW · pedagogy** — L160–167 (after `DiodeCharacteristicDemo`) and L270–274 (after `BridgeRectifierDemo`): post-demo UI-framing captions that escaped their demos → move into `caption`. **Prose: clean.**

---

## Batch 5 — Chapters 25–30

### Ch.25 — How a battery works
- **Fact-check:** ~35 claims audited, 31 resolve, all arithmetic correct (Daniell E°=1.10 V, Nernst slopes, etc.); **uncited claims + misaligned cites.**
  - **HIGH · fact** — L588–589: "Lewis Urry … 1957 … Eveready" attribution uncited → soften to "developed in the 1950s at Eveready" + `linden-reddy-2011`.
  - **HIGH · fact** — L426–429 & L802–803: AA/car/coin-cell R_int values and Li-ion/gasoline energy densities uncited → cite `linden-reddy-2011` (in chapter); soften the gasoline figure if unsourced.
  - **MED · fact (misaligned cite)** — L452–456 & L553: commercial R_int / short-circuit-current claims cited to `bard-faulkner-2001` (fundamentals) → `linden-reddy-2011`.
  - **LOW · fact** — L561 vs L563: Case 25.2 "1.5 V open" (summary) vs "~1.55 V fresh" (spec); standardize.
- **HIGH · pedagogy** — L235–252: standard electrode potential `E°` skips both intuition and formal tiers — goes straight to the operational tabulation (`E°(Cu²⁺/Cu)=+0.34 V`, etc.). Add a "leaderboard of electron-eagerness" analogy and a formal `E° = −ΔG°/nF` before L252.
- **MED · pedagogy** — L252: `E°` values have no "where" (V vs SHE). L342: `Q = [Zn²⁺]/[Cu²⁺]` doesn't gloss the bracket = molar-concentration (mol/L) notation.
- Demo-framing clean. **Prose: clean.**

### Ch.26 — Modern batteries
- **Fact-check:** ~55 claims audited, 52 resolve, all arithmetic correct; **1 wrong year + misaligned cites.**
  - **HIGH · fact (wrong)** — L266: "Goodenough et al. **1996**" for LFP — the Padhi/Goodenough paper is **1997** (*J. Electrochem. Soc.* 144); also uncited. Fix year + soften/cite.
  - **HIGH · fact (misaligned cite)** — 7 product-spec claims (L117, L242, L204, L347, L663, L813, L859) cited to `bard-faulkner-2001` (fundamentals text); re-aim to `linden-reddy-2011` (**already in chapter sources**).
  - **MED · fact (misaligned cite)** — L620 & L429–435: Toyota Mirai specs cited to `larminie-dicks-2003` (predates the car). Soften or drop the cite from the spec.
  - **MED · fact** — L880 (FAQ): "~95% of industrial hydrogen from fossil fuels" uncited → soften.
- **HIGH · pedagogy** — energy density / specific energy is the chapter's headline metric from L117 (~35/250/165 Wh/kg) but is **never introduced as a quantity** — no intuition, no `ρ_E = E/m`, no units before first use. Add a three-tier intro at/before L117.
- **MED · pedagogy** — C-rate appears only in the FAQ `<Term>` popover (L845–861); no intuition/formal tier in the narrative.
- All narrative `<Formula>` "where" paragraphs clean; demo-framing clean. **Prose: clean.**

### Ch.27 — The grid arrives at the house (applied track)
- **Fact-check:** ~60 claims audited, 52 resolve, all arithmetic correct (12.47/√3=7.20 kV, turns ratios, voltage drops); **misaligned cites + an internal inconsistency.**
  - **HIGH · fact (misaligned cite)** — L1206: "NEC Article 702 **and 705**" for standby-generator transfer switches — 705 governs grid-tied interconnection, not standby. Remove "and 705" or split the scope.
  - **HIGH · fact (misaligned cite)** — L503–505: residential retail rates ($0.10–0.40/kWh) cited to `ieee-std-3001-2-2017` (a sizing methodology) → soften/drop. L1268: meter accuracy class cited to IEEE 3001.2 → should be `ansi-c12-1-2014` (in registry, **not** in chapter sources — add it).
  - **HIGH · fact (inconsistency)** — L333–334 vs L855: Case 27.1 (a 200 A service) specs "#2 AWG" triplex, but the prose assigns #2 AWG to **100 A** and #1/0+ to 200 A. Fix the case spec to the 200 A gauge.
  - **MED · fact** — L174–179 & L1076–1079 (Edison 1882) and L205–227 (Stanley/Westinghouse 1890s) uncited (ANSI C84.1 backs the voltage standard, not the history) → soften. L1176: oil dielectric "30 kV/mm" overstates typical (~10–15); soften. L442: "before ~2005 … Ferraris meters" year unsupported by a 1994 text → soften.
  - **LOW · fact** — L961 vs L988: recloser timing "1–2 s" vs "one second"; align.
- Applied-track: no three-tier violation (re-applies earlier quantities); no embedded demos.
- **LOW · pedagogy** — L191–192: `I = P/V` "where" says "same symbols, same meaning" without restating SI units; add a one-line unit restatement. **Prose: clean.**

### Ch.28 — The house panel (applied track)
- **Fact-check:** ~45 claims audited, all arithmetic correct, all cites resolve; **2 NEC-history errors + uncited values + a sizing mismatch.**
  - **HIGH · fact (wrong)** — L349 (GFCI Term): "Required since NEC 1971 in bathrooms" — 1971 was outdoor/pools; **bathroom** GFCI came in NEC **1975**.
  - **HIGH · fact (wrong)** — L418–419: AFCI "bedrooms only (NEC 2002)" — first required in NEC **1999** (§210-12). Fix to 1999.
  - **HIGH · fact** — L1205–1208: 25 kVA transformer "feeding a 200 A house" is mismatched (25 kVA ≈ 100 A); the 5–10 kA fault math fits 100 A. Change "200 A" → "100 A". 2% impedance uncited → cite or soften to 1–5%.
  - **HIGH · fact** — L317: magnetic-trip "8× rated current" uncited; UL 489 gives 6–12×. Soften + cite `ul-489`.
- **MED · pedagogy** — L504: arc-flash `E_arc ≈ V·I_fault·t_clear` has no "where" paragraph after it (symbols only in preceding prose). Add one (J / V / A / s).
- **MED · pedagogy** — L270–277: pure demo-framing before `PanelBus3DDemo` → move into its `caption`. **Prose: clean.**

### Ch.29 — House branch circuits (applied track)
- **Fact-check:** ~80 claims audited, 74 resolve, all arithmetic correct; **3 misaligned cites + 2 uncited values.**
  - **HIGH · fact (misaligned cite)** — L1184–1185: AFCI detection principle cited to `nfpa-70e-2024` (workplace arc-flash PPE) → should be `nec-2023` (Art. 210.12).
  - **MED · fact (misaligned cite)** — L245–246: NM-B "replaced … in 1984" cited to `nec-2023` (current edition, can't date a 1984 change) → drop the year. L496–499: aluminium cost/handling claim cited to a CPSC fire-safety advisory → soften.
  - **MED · fact** — L511–514: Al/brass CTE values (23/19 ppm/K) uncited → add `crc-resistivity` (in registry) or soften. L578–581: kitchen-appliance wattages uncited → soften to "typical 1000–1500 W."
  - **LOW · fact** — L1162: TR-receptacle "since 2008" year unsupported by the cited NEC-2023; drop the year.
- **MED · pedagogy** — L76–106: ampacity has intuition + formal tiers but **no operational tier** — physics + NEC tables, but no concise "max continuous current (A) a conductor may carry" statement. Add one after L106.
- Formula glossaries + demo-framing clean. **Prose: clean.**

### Ch.30 — House switches and receptacles (applied track)
- **Fact-check:** ~45 claims audited, 42 resolve, all arithmetic correct (NEMA power table, dimmer RMS, 3-way truth table); **1 wrong NEC article + 2 uncited values.**
  - **MED · fact (wrong)** — L881–882: "NEC **625.41**" for EV continuous-load sizing — should be **625.42** (625.41 is equipment ratings).
  - **MED · fact** — L1215: GFCI "5 mA imbalance" uncited (UL 943, not in registry) → soften to "a few milliamperes." L303: "pre-1962 homes" grounding-mandate year uncited → soften.
  - **LOW · fact** — L232–256: NEMA rating list cites `nema-wd-6` one paragraph up rather than inline (acceptable).
- Applied-track: no three-tier violation; all narrative `<Formula>` "where" paragraphs clean.
- **HIGH · pedagogy** — L576–584: pure demo-framing (click-to-wire instructions) before `ThreeWaySwitchBuilderDemo` → move into its `caption`.
- **MED · pedagogy** — L586–595: mixed UI/physics; keep the SPDT-collapse + neutral-hazard physics, move the "flagged in red" UI observations to the caption. **Prose: clean.**

---
