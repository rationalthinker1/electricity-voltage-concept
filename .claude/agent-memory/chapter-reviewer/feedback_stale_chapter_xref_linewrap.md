---
name: stale-chapter-xref-linewrap
description: "Chapter N" stale-xref grep misses when the digits wrap to the next source line
metadata:
  type: feedback
---

A one-line `grep -nE "Chapter\s+[0-9]+"` does NOT match `"Chapter\n19"` — when the editor or formatter wraps prose, the keyword and the integer can land on different source lines. Two Ch.25 stale xrefs (lines 224-225 "Chapter\n19" and 272-273 "(Chapter\n19)") were missed by the obvious pattern and only surfaced when I read the file by eye.

**Why:** chapter prose is hard-wrapped by editors. `Chapter` ends one line, digits start the next. The Ch.23/24 cleanups didn't trip this because their stale refs happened to land on one line.

**How to apply:** when scanning a chapter for stale chapter xrefs, run one of:
- `grep -nE "[Cc]hapter\s*$" file` to find every chapter-keyword line break, then read context.
- `tr '\n' ' ' < file | grep -oE "[Cc]hapter\s+[0-9]+"` to normalize whitespace.
- Read the chapter top-to-bottom on the first pass instead of relying on grep.

Also worth bumping into `chapter-xrefs-auditor.md`'s spec so the sub-agent doesn't miss these in the wild.
