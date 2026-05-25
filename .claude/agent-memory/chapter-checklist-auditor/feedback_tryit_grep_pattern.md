---
name: tryit-grep-pattern
description: grep pattern '<TryIt[ >]' fails to match TryIt when the tag opens on its own line as '<TryIt\n'; use bare '<TryIt' instead
metadata:
  type: feedback
---

When grepping for TryIt elements use `grep -nE '<TryIt'` (no trailing character class). The pattern `<TryIt[ >]` requires a space or `>` immediately after the component name on the same line, but TryIt is almost always written as a multi-line JSX element where the tag name is immediately followed by a newline, so the pattern silently returns zero results even when TryIt elements are present.

**Why:** Discovered during Ch24 audit — `grep -nE '<TryIt[ >]'` returned empty output, then `grep -nE '<TryIt'` returned 7 matches.

**How to apply:** Use `<TryIt` (bare, no trailing class) for all TryIt counts. Same caution applies to any multi-line JSX element where the opening tag name may be the last character on its line.
