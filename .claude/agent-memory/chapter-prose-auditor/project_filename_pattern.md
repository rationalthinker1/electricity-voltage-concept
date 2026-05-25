---
name: filename-pattern
description: Chapter filenames use the full conjunction form; slug passed by orchestrator may omit it
metadata:
  type: project
---

Chapter filenames use the full conjunction in the filename even when the route slug omits it. Example: the slug `rectifiers-and-inverters` maps to `Ch24RectifiersAndInverters.tsx`, not `Ch24RectifiersInverters.tsx`. Always resolve the actual filename with `ls | grep -i <keyword>` before running greps, rather than trusting the slug-derived guess.

**Why:** the orchestrator passes the route slug, but the file tree uses a slightly expanded form with "And" between compound nouns.

**How to apply:** on every run, do a quick `ls src/textbook/ | grep -i <first-word-of-slug>` before the audit greps to confirm the exact filename.
