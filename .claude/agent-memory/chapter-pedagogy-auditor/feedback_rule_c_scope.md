---
name: rule-c-scope-precedes-only
description: Rule C only applies to paragraphs that immediately precede a demo, not those that follow one
metadata:
  type: feedback
---

Rule C ("bridging paragraphs belong inside the demo they frame") applies only
to `<p>` elements that immediately PRECEDE a `<XxxDemo />` element and use
deictic language like "below", "the next demo", "rotate to confirm", etc.

Paragraphs that immediately FOLLOW a demo and reference its sliders/controls
(e.g. "The two sliders in the spectrum view tell the engineering story" in
Ch24 at L803) are post-demo commentary. These can legitimately stay as
chapter prose or move into the demo's caption, but they are NOT a Rule C
violation as defined — Rule C specifically targets pre-demo framing paragraphs.

**Why:** The rule exists because pre-demo framing creates a navigation dependency
that breaks when demos are reordered. Post-demo commentary is a different
editorial choice and is outside Rule C's scope.

**How to apply:** When scanning for Rule C violations, only examine paragraphs
whose immediately following sibling is a `<XxxDemo />` element.
