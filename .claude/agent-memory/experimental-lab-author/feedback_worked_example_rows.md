---
name: worked-example-rows
description: Pre-fill the first 1–2 rows of every DataTable with real values; leave the rest as "__" fill-in slots.
metadata:
  type: feedback
---

Every `<DataTable>` in an experimental lab should have its first 1–2 rows pre-populated with **real, computed values** that match what the student is about to measure or simulate. The remaining rows are the string `"__"` (renders as a dashed underline).

**Why:** A student opening a lab cold needs to see the units, the rounding convention, the sign convention, and the order of magnitude *before* they're asked to produce their own numbers. A table that's entirely blank ("fill these in") is a worksheet without scaffolding — they don't know whether to enter cm or m, what precision to use, or whether the sign matters. Confirmed effective in `CoulombPhetLab.tsx` (PhET force readout at 2.0 cm and 3.0 cm) and `FaradayCageLab.tsx` (baseline RSRP of −87 dBm; condition-A attenuation of 6.5 dB). The user accepted both as-is.

**How to apply:**
- **Pre-filled rows must be real.** For sim labs, *run the sim* and copy the readings. For hands-on labs, run the experiment yourself or pull values from a published source and cite them. Don't eyeball — every reviewer will compare against your worked rows.
- **One worked row is sometimes enough**; two if the second row introduces a new column convention (e.g. log-axis values, sign-flipped quantity). Three is too many — the student is no longer producing the dataset, they're verifying yours.
- **Mark the worked rows in the caption** so the student knows which are scaffolding. The convention is: "Two rows are pre-filled as worked examples — confirm them yourself before continuing." Optionally add a sanity-check value ("if you see something an order of magnitude off, check that …").

Don't pre-fill a "Mean" or "Sum" summary row that the student is supposed to compute themselves — leave that as `"__"`. But *do* put the row label as JSX (`<strong key="mean">Mean</strong>`) so it's visually distinguished. [[feedback_jsx_key_trap]]
