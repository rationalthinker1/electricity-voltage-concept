---
name: ch36-audit-findings
description: Pedagogy audit of Ch36 House Troubleshooting — all three rules clean
metadata:
  type: project
---

Ch36HouseTroubleshooting.tsx audit result: all three rules clean.

**Rule A:** No foundational quantities introduced. The chapter uses voltage, current, and impedance as established quantities from earlier chapters. `I_leak` and `t_trip` are single-definition derived/empirical formulas, not multi-tier foundational quantities. The Ch31 note ("applied-track still triggers Rule A for new named formulas") does not apply here — those formulas have only one natural form, no intuition/formal/operational split exists.

**Rule B:** Four narrative-prose Formulas at L156, L258, L268, L566. All have complete "where" paragraphs with names and SI units. L268 is a numeric substitution of the L258 formula (values in place), effectively exempt. Formulas at L219, L221 (TryIt answer) and L656, L728, L729, L733 (TryIt answers) are TryIt-exempt.

**Rule C:** No demos embedded in the chapter (applied-track, prose-only). Rule C trivially clean.

**Pattern confirmed:** A second numeric-substitution Formula immediately following its symbolic form (L258→L268) needs no additional "where" paragraph — the symbols are defined by the paragraph between the two formulas. This is functionally the same as the TryIt-answer exemption.

**Why:** The "where" rule applies to *first introduction* of new symbols. If a "where" paragraph appears between the symbolic formula and its numeric substitution, all symbols are already defined.
