---
name: ch21-audit-findings
description: Patterns and traps encountered auditing Ch21Generators.tsx (Generators and the grid)
metadata:
  type: project
---

## Rule A — Three-tier findings

**Generated EMF — MED.**
The chapter's core quantity is generated EMF (ε = −dΦ/dt → NBA ω sin(ωt)).
- No intuition tier: the "Run a motor backwards" section (L56–91) opens with a prose analogy (reversed motor)
  which is partially intuitive, but the very next paragraph names "Faraday's law of induction" inside a
  `<Term>` popover that *contains* the formal definition, and immediately drops the formal Formula (L76).
  There is no non-mathematical intuition paragraph before the formal formula; the Term popover's def
  string ("−dΦ/dt") **is** the formal definition, not an analogy or metaphor.
- The operational form ("ε = NBAvω, peak voltage you can compute from coil parameters") appears at L102
  only after the formal tier. Tier ordering is formal → operational, with intuition tier absent.
- The RotatingCoilGeneratorDemo (Fig. 21.1) at L122 comes *after* the formal formula at L76-102,
  so there is no demo-first intuition build-up.

**Three-phase power / synchronous generator — PASS.**
No attempt at a three-tier sequence for "3-phase power" as such; the chapter treats it as already
established from Ch.20 (motors), which is appropriate given the explicit back-reference.

## Rule B — Formula glossary

All five narrative Formula blocks have "where" paragraphs:
- L76 (`faraday-law` id) → L77–82 defines ε, Φ, t. PASS.
- L102 (ε(t) = NBA ω sin(ωt)) → L103–109 defines all symbols. PASS.
- L194 (f = np/120) → L195–199 defines f, n, p. PASS.
- L264 (P = |V||Ef|/Xs · sin δ) → L265–275 defines all symbols. PASS.
- L277 (Q = ...) → L278–282 defines Q; notes shared symbols. PASS.

TryIt Formula blocks (L158, L159, L234, L335, L336, L399, L403, L554, L609–617) — exempt.

## Rule C — Demo-framing prose

No paragraphs immediately preceding demos that are pure UI-framing. All pre-demo paragraphs
make substantive physics arguments. PASS.

## Traps / patterns from this chapter

**Term-popover trap confirmed again (Rule A).**
The "Faraday's law of induction" Term at L71 wraps a def that contains the formal definition
(−dΦ/dt, Lenz's law). The *immediate* Formula after it is the formal block. The entire first-tier
(intuition) slot is occupied by a single introductory phrase ("The bedrock physics is…") with no
metaphor, no visual analogy, no non-mathematical picture. Authors treating the opening prose
("run a motor backwards", "water turbine", "gasoline engine") as the intuition tier — this is
partially correct but falls short: the rule requires the intuition tier to be *non-mathematical*
and *before any formula*. The reversed-motor analogy at L58–68 is close but immediately followed
by the formal Formula at L76 with no dedicated non-math intuition block in between.

**"Formal-before-demo" as a potential Rule A structure.**
Several sections (the alternator section, L93–122) show: formal Formula (L102) → demo (L122).
The prose before the formula is mildly intuitive (describing the coil geometry in words),
which partially satisfies the intuition tier. Borderline — not a clear violation.
