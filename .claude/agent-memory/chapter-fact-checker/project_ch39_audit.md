---
name: ch39-audit-findings
description: Ch.39 (house-outdoor-wet) fact-check audit results, 2026-05-26
metadata:
  type: project
---

Audit date: 2026-05-26. Lint: CLEAN. Sources: nec-2023, sae-j1772, ul-2231, iec-62196, iec-60479-2018, codata-2018.

## HIGHs

1. **Line ~552: 6 AWG at 75°C = 55 A** — wrong. NEC Table 310.16 gives 6 AWG Cu at 75°C = **65 A**; 55 A is the 60°C column. Prose saying "A 50 A breaker on 6 AWG copper (NEC Table 310.16 at 75°C termination, 55 A ampacity)" is factually wrong on the ampacity figure.

2. **Line ~1113: "delivers 11.5 kW (240 × 48 × 0.92 ≈ 10.6 kW)"** — internal contradiction. 240×48×0.92 = 10.6 kW; 11.5 kW is the unlossy gross (240×48×1.0 ≈ 11.52 kW). The two numbers in the same sentence are inconsistent; soften to "about 10.6 kW (240 V × 48 A × 0.92)".

3. **Line ~638: Term def says "6% = 6 A"** — wrong per SAE J1772. The 6% duty cycle is a digital-communication or standby state, not 6 A. Per J1772's 0.6 A/% rule, 6 A ≡ 10% duty cycle. Should read "10% ≡ 6 A (minimum advertised current)".

## MEDs

4. **Line ~1235–1240 (IP FAQ): IP44/IP67 definitions stated without IEC 60529 cite.** IEC 60529 is not in chapter.sources. The nec-2023 cite at the end covers only the NEC-uses-NEMA claim, not the IP-rating definitions. Soften ("roughly equivalent to the IEC 60529 IP44 standard") or add IEC 60529 to sources.

5. **Line ~207–215: Perimeter surface stated as "three feet (roughly 1 m)"** — imprecise framing. NEC 680.26(B)(6) uses 1.5 m / 5 ft for the bonding zone around pools. "3 ft ≈ 1 m" describes a narrower subset; the chapter opening and elsewhere uses "1.5 m". The two-sentence description creates the impression that 3 ft and 1.5 m are synonyms, which they are not. Should clarify: pool perimeter surface = 3 ft (0.9 m); full bonding zone including spas = 1.5 m / 5 ft.

## Arithmetic verified clean

- Try 39.1: 120/250000 = 0.48 mA ✓
- Opening: 50V/1.5kΩ = 33.3 mA ("over 30 mA") ✓
- Case 39.1: 55V/1.5kΩ = 36.7 mA ("~37 mA") ✓
- Case 39.2: 240×48×0.92 = 10.6 kW ✓ (but conflated with 11.5 kW in same sentence — HIGH)
- EVSE section: 240×40×0.92 = 8.83 kW ✓
- J1772 duty 40A → 67%, 48A → 80% ✓
- NEC burial depths: 12V at 6", 120V at 24" ✓
- NEC 300.5 landscape 6" ✓
- TryIt 39.3: 35A×1.25 = 43.75A → 50A breaker → 8 AWG@75°C = 50A ✓

**Why:** Applied-track chapter with tight source whitelist (6 keys). Three HIGH issues: wrong ampacity, internal kW conflict, and wrong J1772 duty-cycle percentage. One MED for unsourced IP-rating definitions. One MED for 3ft/1m vs 1.5m distance framing.
