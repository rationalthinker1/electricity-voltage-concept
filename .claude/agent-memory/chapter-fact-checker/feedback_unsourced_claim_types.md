---
name: unsourced-claim-types
description: Categories of claims that recurrently appear unsourced in chapter prose — patterns to watch for in all chapters
metadata:
  type: feedback
---

**Historical attributions with years** often lack `<Cite />`. Ch.1 example: "Franklin made the call in 1747" — a specific year+person claim with no citation. Authors assume named persons need no cite but the specific year does.

**Derived numerical estimates** (calculations done inline) sometimes lack a `<Cite />`. Ch.1 example: "~5 C × ~10⁸ V = roughly a gigajoule" — the result is derived from two cited numbers but the arithmetic result itself needs the parent cite re-applied.

**Order-of-magnitude demo claims** like "~10⁻⁸ coulombs" / "~10²³ electrons in a balloon" appear unsourced. These are softened but the specific exponent is a claim.

**Prose FAQ answers** are a high-risk area. Ch.1 FAQ had the "nanocoulombs over the whole head" misaligned cite and the "k around 10¹⁰" imprecision. The ~⅔c signal-velocity claim in a FAQ was cited to the wrong source.

**Battery-cell voltage specs** (per-chemistry: alkaline 1.5 V, lead-acid 2.0 V, Li-ion 3.7 V) appear in FAQ answers without citation. These need `linden-reddy-2011` (Linden's Handbook of Batteries), which is not yet in the registry as of Ch.2 audit. Flag whenever seen; suggest adding to registry.

**Historical-figure sign conventions** (Franklin, Thomson) given specific years without `<Cite>`. Registry has no Franklin or Thomson source. Remedy is always soften-or-add, not invent.

**"Snail 50× faster" style comparisons** — when prose gives a comparison ratio derived from a cited speed vs. a computed speed, verify the arithmetic. Ch.2 "fifty times faster" was actually ~442×.

**Why:** FAQ text is written last, under time pressure, and citations slip through.

**How to apply:** Audit FAQ answers first in every chapter — they concentrate the most unsourced or weakly-sourced claims. Also spot-check all analogy comparisons that include a specific multiplier.
