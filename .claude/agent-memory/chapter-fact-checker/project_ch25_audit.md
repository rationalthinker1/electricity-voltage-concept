---
name: project-ch25-audit
description: Ch.25 Batteries audit findings — 2026-05-26, Lewis Urry uncited, B&F misaligned for R_int specs, Li-ion/gasoline energy density uncited, prose/spec voltage inconsistency
metadata:
  type: project
---

Audit date: 2026-05-26. Lint: CLEAN (0 findings).

**BLOCKERS**

1. `Ch25Batteries.tsx:588-589` — "The chemistry was patented by Lewis Urry in 1957 at Eveready" has no `<Cite>`. Historical attribution without a source. Fix: soften ("developed in the 1950s at Eveready") or add a linden-reddy-2011 cite (Linden discusses the history of the alkaline cell) — do NOT invent a specific Urry patent citation.

2. `Ch25Batteries.tsx:426-429` — R_int specs (AA alkaline 100–300 mΩ, car battery "few milliohms", coin cell "tens of ohms") follow a `bard-faulkner-2001` cite that closes the preceding Butler–Volmer sentence. The R_int numbers are commercial-cell specs → wrong source (B&F is fundamentals, not datasheets). These three specific values have no cite of their own. Fix: add `<Cite id="linden-reddy-2011" in={SOURCES} />` at end of line 428.

3. `Ch25Batteries.tsx:452-456` — 9V battery R_int ≈ 35 Ω and car battery R_int ≈ 4 mΩ are cited only to bard-faulkner-2001. These are product specs, not fundamental electrochemistry. Fix: swap to `linden-reddy-2011`.

4. `Ch25Batteries.tsx:802-803` — "the best Li-ion cells store ~250 Wh/kg; gasoline holds ~12 000 Wh/kg … ~3000 Wh/kg comes out as useful work" — entire sentence has no `<Cite>`. The closing cite on line 807 (bard-faulkner-2001) is for a different sentence. Li-ion 250 Wh/kg and the energy density claims need `linden-reddy-2011`. Gasoline 12 000 Wh/kg is a factual but un-cited claim (soften or add an engineering-thermodynamics cite).

**MISALIGNED CITES (MED)**

5. `Ch25Batteries.tsx:553` — Case 25.1 body cites B&F for the R_int discussion; same misalignment pattern as findings 2–3. Product-level R_int behavior should cite Linden.

**INTERNAL INCONSISTENCY (LOW)**

6. Case 25.2 summary line says "1.5 V open" while the spec row says "~1.55 V (fresh)". These values differ (1.5 V is nominal nameplate; 1.55 V is measured fresh OCV). Standardize to "~1.55 V (fresh) / nominal 1.5 V" or reconcile.

**ARITHMETIC — ALL CLEAN**
- Daniell E°_cell = +0.34 − (−0.76) = +1.10 V ✓
- Li/F₂ cell = +2.87 − (−3.04) = +5.91 V ✓
- RT/nF at 298 K, n=2 = 12.84 mV (prose rounds to 12.8 mV) ✓
- "29.6 mV per decade" for n=2 ✓; "59 mV per decade for one-electron reaction" (n=1) ✓
- TryIt 25.4: Q=0.01, ln Q=−4.605, V=1.10+0.059=1.16 V ✓
- Case 25.3: I²R = 400²×0.005 = 800 W ✓; IR sag = 400×0.005 = 2 V ✓
- TryIt 25.5: V_term = 1.5×1/1.2 = 1.25 V ✓
- Faraday constant 96 485 C/mol ✓

**NUMBERS — NO HALLUCINATIONS DETECTED**
All electrode potentials (Cu +0.34 V, Zn −0.76 V, Li −3.04 V, F₂ +2.87 V, Ag +0.80 V, AgCl/Ag +0.222 V) are standard values per IUPAC/Bard&Faulkner. Nernst Nobel Prize 1920 ✓. Daniell year 1836 ✓. Volta 1800 ✓. AA 2500 mAh at 20 mA ✓ (Linden). Lead-acid 30–40 Wh/kg ✓ (Linden). All sources resolve in registry and sources[].

Why: B&F scope boundary (see [[feedback_citation_patterns]]) — it covers fundamentals/kinetics/electrode potentials but not commercial cell datasheets/R_int/capacity specs. Those belong to Linden.
