---
name: ch41-audit-findings
description: Ch41 EVPowertrain fact-check findings — cite misuse patterns, suspect numbers, unsourced claims
metadata:
  type: project
---

**Audit date:** 2026-05-26 | **File:** src/textbook/Ch41EVPowertrain.tsx | **Lint:** CLEAN

## BLOCKERs — Misaligned cites (10 instances total)

**horowitz-hill-2015 massively overused** (H&H = Art of Electronics, analog design text):
- Line 184: NMC chemistry 1990s–2000s development → swap to linden-reddy-2011 / goodenough-1980-licoo2
- Line 325: passive balancing in production EVs → swap to erickson-maksimovic-2020
- Line 1407: BMS balancing life-of-pack → swap to linden-reddy-2011
- Line 1437: cold weather range / 5 kW heater → soften, swap cell-R half to linden-reddy-2011
- Line 1473: solid-state 500 Wh/kg spec → no registry source; soften and drop cite
- Line 1524: calendar vs cycle aging → swap to linden-reddy-2011

**sedra-smith-2014 overused** (Sedra/Smith = microelectronics BJT/MOSFET text):
- Line 288: BMS monitoring → swap/remove
- Line 398: isolated DC-DC design → swap to erickson-maksimovic-2020
- Line 468: SiC inverter efficiency specs → swap to erickson-maksimovic-2020
- Line 1363: SiC advantages (R_DS(on)×A, switching speed, temp) → swap to erickson-maksimovic-2020

**codata-2018 misaligned**:
- Lines 769, 900: rolling friction + drag force equations (C_rr = 0.008, C_d = 0.23) → fundamental equation needs no cite; specific EV coefficients need a SAE/vehicle-engineering source not in registry; soften or add source

## BLOCKERs — Unsourced claims

- Line 270: cell voltage drift "10–50 mV" over cycles → add linden-reddy-2011
- Line 1025: DCFC "accuracy class 0.5 of OIML R 46" → add ansi-c12-1-2014 or soften
- Line 1429: cell R_int "rises roughly threefold from +20°C to −10°C" → H&H cite wrong; use linden-reddy-2011
- Line 1473: solid-state "~500 Wh/kg" → no registry source; soften

## Suspect numbers

- **Line 162 vs 198 INCONSISTENCY**: Term def says "~4.5 Ah" per 21700 cell; formula section says "~4.8 Ah". 
  Pack energy 96×46×3.6×4.8 = 76.3 kWh matches "75 kWh"; 4.5 Ah gives 71.5 kWh. Term def is WRONG — fix to 4.8 Ah.
- Line 1002: gasoline ~33 MJ/L is low (~4%); standard LHV is ~34.2 MJ/L. No cite attached. LOW.
- Line 1061: 75×0.88/13.8 = 526 km, not 530 km. Minor rounding. LOW.
- Line 1171: Tesla Model 3 SiC "in 2017" cited to erickson-maksimovic-2020 — textbook doesn't document production dates. Soften and remove cite.
- Line 1536: "250×" cable cross-section — computed ~218× at 48A vs 3.25A; only reaches 256× if laptop draws 3A flat. LOW.

## Good news — arithmetic all clean
All 6 TryIt calculations verified correct (41.1–41.6). All explicit worked-example arithmetic in prose verified.

## Pattern note
`horowitz-hill-2015` is being used as a catch-all cite for EV battery specs and management that H&H simply does not cover. Same pattern seen in Ch34 (sedra-smith-2014 misuse). Both texts are misused here.

**linden-reddy-2011 should be added to chapter.sources[]** — it is currently NOT in the ev-powertrain sources array but is needed for at least 4 claims.

Why: The current sources[] = ['sae-j1772','iec-62196','ul-2231','sedra-smith-2014','erickson-maksimovic-2020','horowitz-hill-2015','codata-2018']. linden-reddy-2011 is in SOURCES registry but not in this chapter's array.
