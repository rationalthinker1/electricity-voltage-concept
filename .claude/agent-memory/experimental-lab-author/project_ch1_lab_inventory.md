---
name: ch1-lab-inventory
description: Experimental-lab coverage for Chapter 1 (Charge and Field). Two labs delivered, five ideated and not yet built.
metadata:
  type: project
---

Chapter 1 has the following experimental labs as of 2026-05-23:

**Delivered:**
- **E1.1 `coulomb-phet` — Verifying Coulomb's Inverse Square** (software, PhET). Two controlled experiments: F vs r and F vs Q₁. Log-log fit for the exponent, linear fit for k vs CODATA. Runtime 60–90 min. Difficulty: intro.
- **E1.2 `faraday-cage` — Aluminum-Foil Faraday Cage** (hands-on). Four shielding conditions measured in dBm via the phone's signal-strength readout (Network Cell Info Lite on Android, Field Test Mode on iOS). Connects directly to "conductors enforce E = 0 internally." Runtime 45–60 min. Difficulty: intro.

**Ideated but not built** (from the original brainstorm slate):
- Lab 1.1 (originally proposed in the slate, distinct from delivered E1.1) — **Sticky-tape electroscope**. Hands-on charging-by-friction with two strips of Scotch Magic tape + a charged comb. 3×3 prediction matrix. PhET *Balloons and Static Electricity* as model-verification bridge.
- **Field & equipotential mapping** — either hands-on conductive-paper kit (Pasco ES-9080) or virtual via PhET *Charges and Fields*. Student completes a partial map.
- **Pith-ball pendulum via Tracker** — video-analysis lab using Open Source Physics's `Tracker`. We provide a video; student measures deflection vs r and fits a log-log slope. (Blended genre.)
- **Order-of-magnitude estimation spreadsheet** — pure Fermi lab. Six problems, three pre-solved as worked examples.
- **Triboelectric series builder** — hands-on, homemade electroscope + 6 household materials, build a pairwise ranking matrix.

**Where Chapter 1's main demos and equation labs already cover the ground:**
- Coulomb force and inverse-square: equation lab `coulomb`, demo `TwoCharges`, plus E1.1.
- Field of a point charge: equation lab `e-field`, demo `PointCharge3D`.
- Gauss's law: equation lab `gauss`.
- Potential difference: equation lab `potential`.
- The chapter's `relatedLabs` array currently lists `['coulomb', 'e-field', 'gauss']`; consider whether to add `coulomb-phet` / `faraday-cage` when those labs feel "first-class" enough.

**Style observations from delivering E1.1 and E1.2:**
- E1.1 has 5 sections (Open the sim / Experiment A / Experiment B / Bigger picture / Writeup) + Stretch. The "Bigger picture" section is where the historical citations (Coulomb 1785, Williams–Faller–Hill 1971) live with a `<Pullout>`. Worked well.
- E1.2 has 11 sections — the safety note (§00) and the per-condition runs (§02–06) ate the section budget. Consider folding 03/04/05 into a single "Sweep the conditions" section with three sub-procedures next time; the current shape is correct but verbose.
