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
