---
name: ch1-audit-findings
description: Patterns and traps encountered auditing Ch1WhatIsElectricity.tsx (what-is-electricity)
metadata:
  type: project
---

## Rule A — Three-tier findings

**Electric field in Ch1:** The intuition tier is present (Faraday's "physical thing defined at every point" metaphor, L358–375), but it is embedded in the same paragraph that ends "and its definition is direct:" leading immediately to the Formula at L377. The intuition paragraph does NOT contain any formula and is genuine non-math intuition — this satisfies the rule. No violation.

**Charge in Ch1:** Intuition tier (balloon/hair surplus/deficit language, L38–118) precedes any Formula. Rule satisfied.

**Pattern:** `<Formula size="lg" id="…" />` resolves against src/lib/formulas.ts — never flag these as "symbol undefined" just because the formula body is not visible inline; the id lookup is the canonical form.

## Rule B — Formula glossary findings

**id-based Formulas always have a "where" paragraph after them.** Both `id="coulomb-force"` (L178) and `id="electric-field-def"` (L377) and `id="electric-field-point"` (L402) and `id="parallel-plate-field"` (L506) are followed by explicit "where" paragraphs — rule satisfied for all narrative-prose Formulas.

**tex-based Formulas inside TryIt answer blocks (L231, L339, L449, L453, L571):** all exempt by rule.

**tex-based Formula at L257–260** (`F ∝ 1/r²`): followed by a "where" paragraph at L261–268 that defines F, r, and 4πr². Satisfied.

## Rule C — Demo-framing prose findings

**HIGH: L533–538 paragraph before ParallelPlateUniformFieldDemo Fig. 1.7 (L541)** — Starts "Drag the separation slider." Pure UI framing. Should move into Fig. 1.7's caption. Identical duplicate of the paragraph that follows Fig. 1.6 (L533–538), which is itself a post-demo annotation — but L533 follows Fig. 1.6 and precedes Fig. 1.7, so it also frames Fig. 1.7.

Actually on re-reading: L533–538 FOLLOWS Fig. 1.6 and PRECEDES Fig. 1.7. The paragraph opens "Drag the separation slider." which is UI framing for whichever demo is adjacent. It also has physics ("The voltage between the plates does change, because V = Ed..."). Mixed.

Then L543–548 follows Fig. 1.7 and is an exact duplicate of L533–538. This is a content duplication bug, not solely a Rule C violation.

**MED: L477–494 paragraph after EquipotentialsDemo (L475)** — starts "The teal dotted contours in the demo above are equipotential lines…". References "the demo above" — deictic language. However the paragraph advances substantial physics (perpendicularity of E to equipotentials, contour-line metaphor for potential, forward pointer to Ch2). Mixed physics+UI. Not a clear Rule C violation; borderline.

## Traps to avoid

- `<Formula size="lg" id="…" />` — the formula text is in the registry, NOT inline. Do not flag as "no symbols visible." The where-paragraph after it defines the symbols.
- TryIt answer blocks use `<Formula tex="…" />` with full numeric substitution. These are EXEMPT from Rule B. Check parent `<TryIt … answer={…}>` context before flagging.
- The post-demo paragraph that both annotates the previous demo AND frames the next one is common in Ch1. Rule C only fires when the paragraph is PRIMARILY UI framing with little new physics.
