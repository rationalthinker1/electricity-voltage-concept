---
name: term-count-band
description: Jargon-heavy chapters (rectifiers, semiconductors, applied-track Ch.27-40) routinely run 20-30 Term tags; M3 lint passes at the 6-30 practical band
metadata:
  type: project
---

Ch.24 (Rectifiers and Inverters) has 28 Term tags. The lint M3 check uses the practical band 6-30 (not the 8-15 narrative target from the checklist prose). For jargon-heavy chapters, 20-30 is expected and correct — every topology name, control loop name, and device type (SCR, IGBT, MOSFET, thyristor, PWM, PFC, MPPT, etc.) is a legitimate glossary candidate.

**Why:** CLAUDE.md §6 note says "jargon-heavy chapters (semiconductors, rectifiers, op-amps, the applied-track house chapters Ch.27-40) routinely run 20-30." The auditor should not flag 28 as high when the lint tool also clears it.

**How to apply:** When Term count is between 6-30 and lint passes M3, do not flag it. Only flag if below 8 in a concept chapter, or if lint fires M3 (outside 6-30).
