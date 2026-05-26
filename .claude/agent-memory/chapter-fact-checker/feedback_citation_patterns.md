---
name: citation-patterns
description: Recurring citation misalignment patterns found across Ch.1 audit — source keys commonly misused or missing
metadata:
  type: feedback
---

`feynman-II-2` is Vol II Ch.2 "Differential Calculus of Vector Fields" — correct for conservative-field / curl-free / gradient properties of static E and F=qE formalism. WRONG to cite for textbook-trivial statements like atomic charge neutrality. See [[ch1-audit-findings]].

`gauss-1813` is the pure-math divergence theorem paper. It cannot back the *electromagnetic* Gauss's law statement Φ = Q/ε₀. Use `griffiths-2017` (§2.2) instead for the EM form.

`codata-2018` is for fundamental physical constants only (e, m_e, m_p, ε₀, μ₀, c, G, k_B). Do NOT use it to back propagation-velocity claims like "~⅔c in copper wire." The correct source for that claim is `libretexts-conduction` (in registry, note: "signal speed ~⅔ c in copper") — but that key is in Ch.2's sources array, not Ch.1's.

`griffiths-2017` is broad enough to back most undergraduate EM derivations and qualitative statements, but should not be cited for specific measured numbers (like "nanocoulombs over the whole head for triboelectric charging") that Griffiths does not actually report.

`feynman-II-2` appeared again in Ch.3 at line 328 for the P=VI unit derivation — another misalignment. Ch.2 Feynman is vector calculus, not circuit power. And it was also NOT in the Ch.3 sources array, so it renders [?] in red. Replace with `griffiths-2017` in both places.

**Material conductivity ordering:** When prose lists materials in descending conductivity (worse and worse), verify the actual σ values. Ch.3 had iron (1.0×10⁷) followed by tungsten (1.79×10⁷) described as "worse still" — but tungsten conducts BETTER than iron. These inversions are easy to make and easy to miss.

**"Seventy times" for nichrome:** The actual Cu/Nichrome ratio is ~65.5×, not ~70×. Authors tend to round up to a rounder number. Flag any "~70×" or "seventy times" claims against the CRC values.

**`kanthal` is NiCr (nichrome) only:** The Kanthal / Nikrothal-80 datasheet covers nickel-chromium resistance heating alloys. It does NOT cover manganin (Cu-Mn-Ni precision resistance alloy). Any claim about manganin — its history (developed ~1889 for resistance standards), composition (86% Cu, 12% Mn, 2% Ni), TCR (~0 at 20°C), or use in shunts/resistance boxes — must cite `horowitz-hill-2015` or `ashcroft-mermin-1976`, not `kanthal`. This misalignment appeared 4× in Ch.4 (lines 147, 378, 609, 884).

**`feynman-II-2` for "energy lives in the field":** Confirmed misalignment in Ch.5 (lines 57, 747). Vol II Ch.2 is vector calculus (curl-free E), NOT energy storage. The correct Feynman chapter for electrostatic field energy (u_E = ½ε₀E²) is Vol II Ch.8 (not yet in registry) or Vol II Ch.27 ("Field Energy and Field Momentum", already `feynman-II-27` in registry). Use `feynman-II-27` or `jackson-1999` for "energy is in the field" claims.

**`horowitz-hill-2015` scope:** H&H is an analog electronics design text. It plausibly backs: RC circuits, capacitor types (ceramic/electrolytic/film), ESR, bypassing/coupling, supercap working voltage (~2.7 V per cell). It does NOT back: clinical defibrillator medical specs, Li-ion energy density (use `linden-reddy-2011`), or modern sub-5nm transistor gate capacitances. Pattern confirmed in Ch.5.

**`moulson-herbert-2003` for dielectric constants:** When prose states specific εᵣ values (water ~80, specialist ceramics >1000, BaTiO₃ near Curie point), cite `moulson-herbert-2003` (already in registry, note covers X7R/Y5V ceramics up to εᵣ 10000). The `jackson-1999` cite covers the dielectric physics mechanism but not the specific numerical values.

**Von Kleist date:** Source title `leyden-jar-1745` says "October 1745" but historical literature (Heilbron 1979) dates von Kleist's letter to November 4, 1745. Use "autumn 1745" or "late 1745" in prose and source title to avoid the incorrect month claim.

**Why:** These patterns each appeared in Ch.1, Ch.3, Ch.4, and Ch.5 and likely recur in later chapters where the same authors write similar claims.

**`maxwell-1873` scope (confirmed Ch.22):** `maxwell-1873` is the Treatise §282–284 mesh-current method. It does NOT cover displacement current, quasi-static breakdown, or the transition from near-field coupling to antenna behavior. Any claim about "when displacement current becomes important" or "transition from coupled inductor to antenna pair" must cite `maxwell-1865` (the original displacement-current paper) instead.

**Term popover vs. source note consistency:** Term popover text sometimes contains specific historical claims (dates, priority claims) that diverge from the `sources.ts` note for the same key. Always cross-check both. In Ch.22, the `henry` Term popover said Henry discovered self-induction "a few months ahead of Faraday" while the `henry-1832` source note said "simultaneously." Faraday presented to Royal Society Nov 1831; Henry published Am J Sci ~Jul 1832 — so "ahead" is wrong direction; source note "simultaneously" is more defensible.

**`k²Q₁Q₂` WPT coupling-quality product (confirmed Ch.22):** This quantitative wireless-power-transfer result appears in Ch.22 (lines 769, 904) without a citation. It is a real result but no source is in the registry. Canonical reference: Kurs et al., Science 317 (5834), 83–86 (2007). If that source is not added, soften to qualitative language.

**`ul-498` vs `ul-943` for GFCI claims (confirmed Ch.35):** `ul-498` covers plugs and receptacles — temperature-rise, contact resistance, dielectric-withstand for mechanical device performance. It does NOT govern GFCI electronics. Claims about GFCI trip threshold (~5 mA), end-of-life electronics drift, LINE/LOAD reversal detection, or the 15–20 yr service life must cite `ul-943` (UL Standard for Ground-Fault Circuit Interrupters). `ul-943` is NOT currently in the registry. When a chapter mentions UL 943 by name in prose but only has `ul-498` in sources[], that is a misalignment. Remedy: add `ul-943` to registry and sources[], or soften the GFCI-electronics claims to cite the NEC article that mandates the trip threshold (e.g., NEC 210.8 for receptacle GFCI).

**How to apply:** When auditing any chapter, check: (1) every `feynman-II-*` cite matches the correct Feynman chapter topic AND is in the page's sources array, (2) `gauss-1813` is only for the pure divergence theorem, (3) `codata-2018` is only for CODATA constants — not for P=VI arithmetic or derived load currents, (4) `griffiths-2017` is not a catch-all for measured/experimental values, (5) material conductivity orderings are verified against CRC values, (6) `kanthal` only backs nichrome/NiCr claims, not manganin claims, (7) `feynman-II-2` is never the right cite for energy-in-field, (8) `horowitz-hill-2015` is not a battery energy-density or clinical-specs reference, (9) `maxwell-1873` is only for mesh-current/network analysis topics, NOT for displacement current or quasi-static/antenna boundary, (10) `ul-498` is for plug/receptacle geometry and temperature-rise only, NOT for GFCI trip threshold or end-of-life electronics (use `ul-943`).
