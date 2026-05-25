---
name: ch24-audit-findings
description: Fact-check audit of Ch.24 Rectifiers and Inverters — findings logged 2026-05-25
metadata:
  type: project
---

Ch.24 (rectifiers-and-inverters) audit, 2026-05-25. Lint clean (no H1-H5 findings).

**Key findings:**

BLOCKERS:
1. Line 165: VF ≈ −2 mV/K (silicon diode temperature coefficient) — specific numeric claim, no <Cite>. Fix: add cite to `horowitz-hill-2015` or `streetman-banerjee-2015` (not in chapter sources); easier to soften ("a few millivolts per kelvin").
2. Lines 1067-1070 (Case 24.2): "~60 kW of recovered kinetic energy… roughly 30% of urban driving energy is recovered this way" — cited to `erickson-maksimovic-2020`, which is a switched-mode power supply theory textbook, not a Tesla performance source. These are manufacturer-level specs not in Erickson.
3. Lines 939-944 (Case 24.4): Pacific DC Intertie specs (846 miles, ±500 kV, 3.1 GW, in service 1970) cited to `kundur-1994-power-stability`. Kundur is a power-system stability textbook; it discusses HVDC conceptually but is unlikely to carry PDC Intertie engineering specs. Better source: BPA/WECC, not in registry — recommend softening.
4. All four CaseStudy spec rows (Cases 24.1-24.4): No <Cite> on individual spec values (standard project pattern issue — see other chapter audits too).

WARNINGS:
1. Line 521: "Modern synchronous bucks routinely hit 92–98% efficiency" — the cited source `erickson-maksimovic-2020`'s registry note says "typical 85–95%." 92–98% goes above the range the source note records. The claim is not wrong (state-of-art SiC synchronous bucks do hit 97-98%), but is slightly outside what the note records. Soften to "90–98%" or "up to 98%."
2. Pacific DC Intertie km: specs say 1361 km but 846 miles = 1362 km (1 km rounding difference — negligible).

CLEAN:
- All arithmetic correct: TryIt 24.1 (8.3V ✓), 24.2 (0.83V ✓), 24.3 (3.5W, 228°C ✓), 24.4 (6.0V ✓), 24.5 (48V ✓), 24.6 (7.2V, 1.5A, 36W each side ✓), 24.7 (265A ✓).
- VT = 25.85 mV at 300 K ✓ (CODATA match).
- Half-wave 0.318 ✓, full-wave 0.636 ✓.
- Linear regulator efficiencies: 12→5V wastes 58% ✓, 24→3.3V wastes 86% ✓.
- Schottky "8% savings on 5V rail" ✓ (0.4V/5V = 8%).
- 100kHz/60Hz core size "more than three orders of magnitude" ✓ (1667x = 3.2 decades).
- Sources array perfectly matches actual cite usage (8 sources, all used, none missing).
- Fleming 1904 (UK patent), SCR 1957 (GE) — both match source notes.

**Why:** kundur and erickson are legitimate textbook sources for the chapter's physics, but are misaligned for product-level specs (Tesla regen numbers, PDC Intertie engineering stats).
