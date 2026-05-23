---
name: dom-nesting-trap
description: Block-level Formula component cannot live inside a <p>; use InlineMath for inline math.
metadata:
  type: feedback
---

When typesetting math inside a chapter or lab paragraph, use `<InlineMath tex="…" />`, never `<Formula tex="…" />`.

**Why:** `<Formula>` renders as a `<div>` (or other block element). Placing one inside a `<p>` triggers React's `validateDOMNesting` warning and HTML auto-closes the `<p>` before the div, splitting the paragraph in two and breaking the visual rhythm. This bit the very first draft of `CoulombPhetLab.tsx`: the prose paragraph "Every physics textbook tells you that `<Formula …/>` is the foundational…" produced a console warning that `<div>` cannot appear as a descendant of `<p>`.

**How to apply:**
- Inside `<p>…</p>`: only `<InlineMath tex="…" />` for math.
- Between paragraphs, or as a direct child of `<Section>`: `<Formula tex="…" />` is fine — that's its native habitat.
- If your `<InlineMath>` is rendering a sprawling multi-line equation, that's a signal it should be lifted to a block `<Formula>` *between* paragraphs, not inlined.

Verification: a headless-browser run that captures `console` events will surface `validateDOMNesting` warnings — always run it after authoring a lab. [[feedback_verification_recipe]]
