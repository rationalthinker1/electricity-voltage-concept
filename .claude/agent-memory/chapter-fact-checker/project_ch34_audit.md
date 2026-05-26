---
name: ch34-audit-findings
description: Fact-check audit findings for Ch34 "From plug to chip" (house-plug-to-chip), run 2026-05-26
metadata:
  type: project
---

# Ch34 "From plug to chip" — Audit 2026-05-26

**Why:** Applied-track capstone; dense with power-electronics specs and historical product claims.

**How to apply:** Future audit passes on this chapter should start from these findings.

## lint:chapters result
CLEAN — no H2 broken cites, no H3/H5 failures, all 5 source keys resolve.

## Sources in chapter.sources[]
- erickson-maksimovic-2020 (Fundamentals of Power Electronics, 3rd ed.)
- horowitz-hill-2015 (Art of Electronics 3e)
- usb-pd-r3 (USB-PD R3.1 spec)
- sedra-smith-2014 (Microelectronic Circuits 7e — op-amps/BJT focus, not power electronics)
- codata-2018

## Key findings

### BLOCKERS

**B1** (HIGH — unsourced product specs): Case 34.1 body prose, lines 809–816:
"In 1995 by a brick that weighed roughly 600 g, ran at 50 to 60 % efficiency, and used a 60 Hz iron-core transformer the size of a shot glass." No Cite. Remedy: soften to "heavier, bulkier" or cite erickson-maksimovic-2020 which does discuss the efficiency advantage of switching over linear.

**B2** (HIGH — unsourced product weight claim): FAQ "Why is the laptop charger smaller" body, lines 931–933:
"A 100 W charger that used to weigh 400 g now weighs about 150 g, and the next generation will halve that again." No Cite. These are specific consumer-product claims with no source. Remedy: soften to "several times lighter" or drop the specific numbers.

**B3** (MED — misaligned cite): sedra-smith-2014 cited 3× (lines 697, 848, 1058) for DVFS, VRM/LDO topology, and core-voltage/power-scaling arguments. Sedra & Smith is an op-amp / BJT undergraduate microelectronics text; it does not cover VRM architecture, DVFS control loops, or on-die power delivery. erickson-maksimovic-2020 would be more appropriate for VRM/LDO topology. For DVFS specifically, no source in the registry covers it well — softening is the correct remedy.

**B4** (MED — misaligned cite for UL touch temperature): TryIt 34.3 answer (line 482–483): "UL touch-temperature limit of 70 °C on any user-accessible surface" cited to horowitz-hill-2015. H&H covers analog design, not UL safety certification. The correct standard is UL 60950-1 (equipment) or IEC 62368-1 (now superseding 60950-1), neither of which is in the registry. Soften to "a thermal limit set by the applicable UL/IEC safety standard" or add the standard to registry.

### SUSPECT NUMBERS

**S1** (LOW — minor term inconsistency): The "power profiles" Term def (line 530–537) lists "5 V, 9 V, 15 V, 20 V at currents up to 5 A" (no 12 V). The prose at line 542 says "5 V, 9 V, 12 V, 15 V, and 20 V." Case 34.3 specs include 12 V. In USB-PD R3.1, 12 V is an optional Fixed PDO, not a mandatory standard profile. The Term def omission is defensible; the inconsistency should be resolved to include 12 V in the Term def or note it is optional.

**S2** (LOW — M3 specs): Lines 701–704 state "146 mm² of TSMC 3 nm silicon" and "~25 billion transistors." These match Apple's announced M3 base chip figures (25 billion transistors, ~146 mm²). No Cite. These are publicly announced manufacturer specs; they should cite an Apple press release or a tech-press die analysis. However, no appropriate source is in the registry — soft fix: add "approximately" and drop cite, or accept that well-publicised manufacturer figures are borderline textbook-trivial. Flag as LOW.

## All arithmetic verified CLEAN
- Vpeak = 120√2 ≈ 170 V ✓; 230√2 ≈ 325 V ✓
- Stage 2 ripple (0.2A, 220µF): 7.58 V ≈ 7.6 V ✓; (0.5A): 18.94 V ≈ 19 V ✓
- TryIt 34.1 (1A): 37.88 V ≈ 37.9 V ✓
- Stage 3 flyback power (0.5 × 1mH × 4A² × 100kHz): 200 W ✓
- Turns ratio 8, Vs = 170/8 = 21.25 V ≈ 21 V ✓
- TryIt 34.2 (Ns=10, Np=100): 17 V ✓
- TryIt 34.3: Pin = 65/0.92 = 70.65 W ≈ 70.7 W ✓; Pheat = 5.65 W ≈ 5.7 W ✓
- DVFS 10% V drop → ~19% power saving (prose says ~20% — acceptable rounding) ✓
- DVFS 1.0→0.8 V → 36% saving (FAQ says ~36%) ✓
- TryIt 34.5: 1.1×5/20 = 0.275 A ideal ✓; /0.9 = 0.306 A real ✓; heat = 0.62 W ✓
- EPR max 48V×5A = 240 W ✓
- Cap ratio 100kHz/120Hz = 833 ≈ 800 (prose) ✓
- 65W charger: 20V×3.25A = 65W ✓
- Resistive drop FAQ: 150V×1A = 150W ✓

## CLEAN count
~40 numerical claims audited, ~36 clean, 4 flagged.
