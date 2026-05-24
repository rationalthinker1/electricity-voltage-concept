---
name: fig-ordering-walk-source
description: Fig./Try./Case. ordering check must walk source line order, not integer order
metadata:
  type: feedback
---

A chapter can have the right *count* of `Fig N.x` tags (e.g., 25.1 through 25.5) yet have them appear in scrambled order in the source. Ch.25 had `Fig. 25.1, 25.2, 25.5, 25.3, 25.4` along source lines 74, 194, 261, 368, 449 — `HalfCellPotentialsDemo` was tagged `25.5` but appeared third. Try-tags were correctly sequential; only Figs were rotated.

**Why:** when a demo is moved between sections during editing, its tag-integer isn't auto-updated. The §6 checklist counts (≥1 demo per section) all pass; the *order* breaks silently. Recent Ch.23/24 cleanups established the convention "Fig/Try/Case tags must be contiguous in source order" and Ch.25 was the next instance.

**How to apply:** in the codepat/checklist scan, run:
```
grep -nE 'tag=.(Try|Case|Fig)\s*[0-9]+\.[0-9]+|figure="Fig\.\s*[0-9]+\.[0-9]+"|figure=\{?.Fig\.\s*[0-9]+\.[0-9]+'
```
Then verify the integer suffix for `Fig`, `Try`, and `Case` each forms a `1, 2, 3, …` sequence independently in line-number order. Any mismatch is a High-priority manual-reorder item (orchestrator does the swap; no codemod handles this cleanly because the integers are spread across demo `figure="…"` attributes and JSX `tag="…"` attributes).

Related: [[stale-chapter-xref-linewrap]].
