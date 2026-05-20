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

**Why:** These patterns each appeared in Ch.1 and Ch.3 and likely recur in later chapters where the same authors write similar claims.

**How to apply:** When auditing any chapter, check: (1) every `feynman-II-*` cite matches the correct Feynman chapter topic AND is in the page's sources array, (2) `gauss-1813` is only for the pure divergence theorem, (3) `codata-2018` is only for CODATA constants, (4) `griffiths-2017` is not a catch-all for measured/experimental values, (5) material conductivity orderings are verified against CRC values.
