---
name: ch32-audit-findings
description: Ch.32 (house-safety) fact-check audit results — 2026-05-26
metadata:
  type: project
---

Audit run 2026-05-26. Lint CLEAN. Applied-track chapter (no demo components by design).

**Source keys:** All 6 keys (iec-60479-2018, dalziel-1956, nfpa-70e-2024, nec-2023, osha-1910-269, codata-2018) resolve in registry and in chapter.sources[].

**HIGH findings:**

1. **Line 589-590 — wrong ignition threshold** (suspect number, BLOCKER): TryIt 32.4 question gives cellulose/paper piloted-ignition threshold as "50 W/cm^2" — also simultaneously labeled "autoignition threshold" (internal contradiction). Literature value for cellulose piloted ignition (SFPE Handbook, cone calorimeter): ~10–25 kW/m^2 = 1–2.5 W/cm^2. The stated 50 W/cm^2 = 500 kW/m^2 is ~25× too high and more consistent with total-flame-engulfment conditions than piloted ignition. The TryIt question is unsourced and the value is wrong.

2. **Line 421-422 — arithmetic error**: "at 120 V dry it is 1 mA" — computed from 100 kΩ context. 120/100 000 = 1.2 mA, not 1 mA. Prose rounds 1.2 mA down to 1 mA (off 20%).

**MED findings:**

3. **Line 575-577 — source misalignment**: "the listing standard (UL 1699) defines a long set of test waveforms" is cited to `nec-2023`. The NEC adopts UL 1699 by reference but doesn't define the waveforms; the test procedures live in UL 1699 itself. Preferred fix: soften to "a listing standard (UL 1699, referenced in NEC Article 210.12)" or drop the specific test-waveform detail, keeping the nec-2023 cite. Do not add a UL-1699 entry unless a verified URL/title is available.

4. **Line 1055-1058 — source misalignment**: "Workers have measured the leakage current through their conductive suits ... at a few hundred microamperes" cited to `iec-60479-2018`. IEC 60479 is a human-effects standard; it does not publish lineman suit-leakage measurements. Preferred fix: soften to "well inside IEC zone AC-1" without the specific "few hundred microamperes" quantity, or cite an EPRI/OSHA line-work study.

5. **Line 780-783 — weak source attribution for named formula**: Ralph Lee (1982) formula for arc-flash incident energy is attributed by name and year to "the original 1982 calculation" but cited only to `nfpa-70e-2024`. The original paper is Ralph Lee, "The Other Electrical Hazard: Electric Arc Blast Burns," IEEE Transactions on Industry Applications, 1982. It is not in the registry. Preferred fix: soften "the simplified Ralph Lee model" to "a simplified radiative-energy model referenced in NFPA 70E Annex D" and keep the `nfpa-70e-2024` cite, which does describe the model.

**LOW / clean:**

- All arithmetic in Try 32.1 (60 mA), 32.2 (1.2 mA), 32.4 (160 W, 3200 W/cm^2 density), 32.5 (96 000 J, 2.544 m^2, 0.90 cal/cm^2): CLEAN.
- 1 cal/cm^2 = 41 840 J/m^2: CLEAN.
- 138 kV / √3 = ~79.7 kV → "~80 kV": CLEAN.
- PPE categories (CAT 1=4, CAT 2=8, CAT 3=25, CAT 4=40 cal/cm^2): matches NFPA 70E 2024.
- Let-go 10 mA (women) / 16 mA (men): consistent with Dalziel 1956 values.
- GFCI/AFCI NEC years (GFCI first in NEC 1971 outdoor; bathroom 1975; AFCI 1999 bedrooms): both stated correctly and in consistent positions.
- NEC AFCI timeline (1999→2014→2023): correct.
- DC 4× safer for fibrillation: IEC-backed, plausible.
- Working distance 18 inches → 450 mm: 18 in = 457.2 mm; stated 450 mm is a minor rounding (1.6%), acceptable.
- Codata-2018 usage in FAQ: appropriate (elementary-charge counting).

**Why:** Applied-track safety chapter with narrow source set. Key traps: cellulose ignition threshold is a fire-engineering value not in any electrical-safety registry; lineman suit current is an EPRI measurement type; Ralph Lee 1982 formula needs softening to avoid implying the registry has the primary paper.
