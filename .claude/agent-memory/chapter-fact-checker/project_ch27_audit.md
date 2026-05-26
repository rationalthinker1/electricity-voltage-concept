---
name: ch27-audit
description: Ch.27 "The grid arrives at your meter" fact-check findings, 2026-05-26
metadata:
  type: project
---

Audit date: 2026-05-26. Lint: CLEAN. 4 sources in chapter.sources: ansi-c84-1-2020, nec-2023, ieee-std-3001-2-2017, grainger-power-systems-2003.

## HIGH findings

1. **Internal inconsistency (conductor size)** — Prose line 333-334 correctly states "#2 AWG Al for 100A service, #1/0 or larger for 200A". But Case 27.1 spec (line 855) describes a *200A* service and lists "~50 m of #2 AWG aluminium triplex" — the wrong gauge for a 200A service. Fix: change Case 27.1 spec to "#2/0 AWG (or utility-specific) aluminium triplex" or adjust the title/current rating to 100A.

2. **Misaligned citation — electricity rates** — Line 503-505: "North-American residential rates run roughly $0.10–$0.40 per kWh" cited to `ieee-std-3001-2-2017`. IEEE 3001.2 is a service-sizing standard, not a tariff reference. Either soften to "rates vary by jurisdiction and time-of-use" (no cite needed) or add a real tariff source.

3. **Misaligned citation — meter accuracy class** — Line 1268: "accuracy classes of 0.2–0.5 %" cited to `ieee-std-3001-2-2017` + `grainger-power-systems-2003`. Meter accuracy classes are defined in ANSI C12.1-2014 / C12.20-2015 (both in registry but not in chapter.sources). Swap to `ansi-c12-1-2014` or soften.

4. **Suspect number — oil dielectric strength** — Line 1176: "roughly 30 kV per millimetre" for mineral oil. Typical tested value under IEC 60156/ASTM D877 is ~10–15 kV/mm in service conditions; 30 kV/mm is near the ceiling for new highly-processed oil under ideal conditions. Soften to "roughly 10–30 kV/mm" or cite a transformer-oil datasheet. Citation at line 1182 (grainger) backs the cooling description, not the specific kV/mm figure.

## MED findings

5. **Misaligned NEC article — generator FAQ** — Line 1206: "NEC Article 702 and 705". Article 702 (Optional Standby) is correct for home generators. Article 705 covers grid-tied *interconnected* sources (solar/wind), not simple standby transfer switches. For a typical home generator FAQ, drop "and 705" or rephrase to cover grid-tied separately.

6. **Historical attribution uncited — Edison 1882** — Lines 174-179 and 1076-1079: "Edison's 1882 New York system delivered direct current at 110 V ... set by the working voltage of the carbon-filament incandescent lamps." The cite on these paragraphs (`ansi-c84-1-2020`) backs the nominal voltage standard, not the Edison 1882 historical fact. Add a history-of-technology source or soften to "the 110 V tradition dates to Edison's Pearl Street Station era."

7. **Historical attribution uncited — Stanley & Westinghouse 1890s** — Lines 205-227: "Stanley and Westinghouse — pushing AC against Edison's DC in the 1890s — settled on the compromise." No direct Cite tag on this attribution; the `ansi-c84-1-2020` cite at line 224 backs the nominal voltages, not the AC War history. Soften or add a history citation.

8. **Recloser timing internal inconsistency** — Case 27.2 spec (line 961): "auto-reclose after 1–2 s"; prose (line 988): "opens its breaker for one second." Minor inconsistency — both are cited to grainger. Align to "1–2 s" throughout.

## LOW

9. **Meter technology transition date** — Line 442: "most meters installed before about 2005 are Ferraris induction meters." The ~2005 date is cited to `grainger-power-systems-2003` (a 1994/2003 textbook), which can't back a 2005 industry-transition claim. Either soften to "before the AMI rollout of the 2000s–2010s" or drop the specific year.

## Arithmetic: all CLEAN
- 12.47/√3 = 7.20 kV ✓
- TryIt 27.1 (I and I²R at 120V/240V) ✓  
- TryIt 27.2 (8.5 V drop, "7%" is 7.08% ✓)
- TryIt 27.3 (360 kWh, $64.80) ✓
- TryIt 27.4 (PF ≈ 0.9998) ✓
- TryIt 27.5 (R1=3.6Ω, R2=14.4Ω, VL1=48V, VL2=192V) ✓
- Turns ratios 7200/120=60:1, 7200/240=30:1 ✓
- 200A × 240V = 48 kVA ✓

**Why:** Ch.27 is clean on most citation mechanics (lint passes). Key traps: Case 27.1 conductor-size mismatch (200A service spec'd with 100A wire), rate cite misaligned to engineering standard, oil dielectric strength high-end claim uncited.
