---
name: project_ch18_optics_audit
description: Fact-check audit of Ch18 Optics (src/textbook/Ch18Optics.tsx) — findings and patterns discovered 2026-05-25
metadata:
  type: project
---

Audit of Ch18 completed 2026-05-25. Key findings:

**BLOCKER — Unsourced historical attributions:**
- Einstein 1917 stimulated emission paragraph (line 639) — no Cite. Einstein 1917 paper ('Zur Quantentheorie der Strahlung', Phys. Z. 18, 121–128) is not in the registry. Remedy: soften to 'Einstein showed in the early 20th century' or add a new source entry.
- Newton Opticks 1704 prismatic dispersion claim (line 287-290) — no Cite.
- Newton soap-bubble colours 1670s (line 460) — no Cite.
- Malus 1809 law attribution (line 395) — no Cite (Malus not in registry).

**WARNING — Wrong number:**
- Prose line 481: fiber acceptance half-angle stated as '~10°' for n_core=1.4682, n_clad=1.4628. Correct value: arcsin(NA) = arcsin(0.126) = 7.2°. 10° would require NA ≈ 0.174, which implies much larger index difference. Remedy: change to '~7°' or '~5–7°'.

**WARNING — Arithmetic imprecision:**
- Fringe spacing claim (line 549): '550-nm light, slits 50 µm apart and a screen 500 mm away, the fringes are about 5 mm apart'. Computed: 550e-9 × 0.5 / 50e-6 = 5.5 mm, not 5 mm. Low severity (within 10%) but should be corrected to '~5.5 mm'.

**Patterns for future runs:**
- Laser section often lacks cite for pre-Maiman stimulated emission theory (Einstein 1917).
- Fiber optic sections use Hecht as catch-all; specific attenuation specs are better cited to miya-1979 or itu-t-g652 (both in registry but not in chapter.sources).
- Newton historical claims in optics chapters routinely lack cites.

Why: [[feedback_no_invented_sources]]
