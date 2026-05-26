---
name: ch31-audit-findings
description: Chapter 31 (house-big-loads) fact-check audit findings, 2026-05-26
metadata:
  type: project
---

Chapter 31 — Big loads (dryers, ranges, EVs, heat pumps)
Audited 2026-05-26. Lint: CLEAN.

## Findings

### Misaligned cites (BLOCKER / MED)

1. **Line 96** — `codata-2018` cited for copper wire resistance "a few tens of milliohms over a typical 25 m run." CODATA covers fundamental constants (e, m_e, c, ε₀, etc.), not material resistivities. Correct source: `crc-resistivity`. **MED misaligned cite.**

2. **Line 183** — `codata-2018` cited for "ω = 2π·60 rad/s ≈ 377 rad/s is the angular frequency of the North-American grid." 60 Hz grid frequency is a utility/regulatory standard, not a CODATA fundamental constant. Better source: `ansi-c84-1-2020` (already in registry but not in chapter.sources). However `ansi-c84-1-2020` is not in chapter.sources for house-big-loads. Alternatively soften by removing the cite or treating 60 Hz as textbook-trivial. **LOW misaligned cite.**

### Arithmetic

All arithmetic verified CLEAN:
- Wire loss 5000W dryer 120V: 41.7A, 174W (prose: ~174W) ✓
- Wire loss 5000W dryer 240V: 20.8A, 43.4W (prose: ~43W) ✓
- TryIt 31.1 (1500W kettle, 0.40Ω): 120V→12.5A, 62.5W ✓; 240V→6.25A, 15.6W ✓
- FLA 5kW/240V = 20.8A ✓ (prose: "~21 A")
- LRA 5-7× FLA for compressors ✓
- TryIt 31.3: FLA=20.8A, 225%=46.8A → 40A ✓
- Dryer element 11Ω at 240V: 21.8A, 5.2kW ✓ (prose: "~22A, ~5.3kW" — close, element R is approximate)
- TryIt 31.2 conductor currents: L1=28A, L2=22A, neutral=6A ✓
- TryIt 31.4: 11.5kW/240V = 48A; P_dc = 240×48×0.92 = 10.6kW ✓; 7kWh waste heat ✓
- TryIt 31.5: 1.25×32=40A, 130+40=170A ✓
- Case 31.1: 78 + 1.25×40 = 78 + 50 = 128A ✓; EVEMS: 78 + 1.25×22 = 105.5A ✓
- Case 31.2: 6kW compressor + 10kW aux (blower on separate circuit) = ~16kW / 67A ✓
  (text omits blower from "~16kW" because blower has its own separate circuit — consistent)
- Case 31.3: 120 + 1.25×48 + 1.25×48 = 240A ✓; EVEMS: 120 + 1.25×48 = 180A ✓

### Sources
Chapter sources: nec-2023, sae-j1772, ul-2231, iec-62196, codata-2018, grainger-power-systems-2003
All resolve correctly. No unresolved Cite IDs.

### NEC/standards references verified
NEC 200.7(C)(1), 210.4, 210.4(B), 220.82, 220.83, 220.54/55, 250.140, 440, 625.22, 625.42 — all correct.
UL 489 (HACR), UL 916 (EVEMS), UL 2231 (CCID 20mA/100ms) — all correct.
NACS opened 2022, SAE J3400 2023 — correct.
1 tonne = 3.517 kW cooling — correct.

### Minor notes
- GFCI "5 mA in 25 ms" (line 1412): carried from Ch.28 pattern; Class A trips at ≤6 mA but 25 ms is approximate. Low-priority softening candidate; Ch.28 audit already flagged this pattern.
- grainger-power-systems-2003 key year note: registry year 1994, key says 2003 — known issue from Ch.3 audit.

**Why:** Chapter is well-cited with correct NEC articles throughout. The only real issue is codata-2018 used twice for engineering/material claims it doesn't cover.
**How to apply:** In applied-track house chapters, watch for codata-2018 being used as a catch-all "physics source" when the actual claim is about material properties (→ crc-resistivity) or utility standards (→ ansi-c84-1-2020 or soften).
