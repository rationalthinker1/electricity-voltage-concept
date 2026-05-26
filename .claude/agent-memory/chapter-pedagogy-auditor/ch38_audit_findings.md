---
name: ch38-audit-findings
description: Pedagogy audit of Ch38 Smart Retrofits — all three rules clean
metadata:
  type: project
---

Ch38HouseSmartRetrofits.tsx audit result: all three rules clean.

**Rule A:** No new foundational quantities introduced. The chapter uses power (P = VI) and RMS voltage as already-established quantities from Ch.2/Ch.3/Ch.12. P_bleeder and V_rms(α) are single-definition derived formulas for applied engineering contexts, not multi-tier foundational quantities requiring intuition/formal/operational split.

**Rule B:** Two narrative-prose Formulas:
- L353: P_bleeder formula — complete "where" paragraph at L354–361 (P_bleeder, V_line, I_bleeder all named with SI units). CLEAN.
- L578: V_rms(α) phase-cut formula — complete "where" paragraph at L579–589 (V_rms, V_peak, α all named with SI units, with worked examples). CLEAN.
Three additional Formulas at L403, L607, L806 are all inside TryIt answer blocks — exempt.

**Rule C:** No demos embedded in the chapter (applied-track Ch.27–40). Rule C trivially clean.

**Pattern note:** The applied-track chapters (Ch.35, Ch.36, Ch.38 confirmed so far) consistently have clean Rule B because the author writes careful "where" paragraphs; Rule C is always trivially clean (no demos); Rule A requires judgment about whether a formula is "new foundational quantity" vs "applied use of established quantity."
