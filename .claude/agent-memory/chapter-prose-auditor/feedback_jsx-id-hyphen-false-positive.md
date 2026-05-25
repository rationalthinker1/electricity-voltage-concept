---
name: jsx-id-hyphen-false-positive
description: JSX id/key attributes like id="potential-point-charge" are not prose hyphenation — don't count them as occurrences in hyphenation-consistency checks
metadata:
  type: feedback
---

When scanning for hyphenation consistency (e.g. "point-charge" vs "point charge"), grep hits inside JSX attribute values such as `id="potential-point-charge"` or `id="force-on-wire"` are false positives. These are formula-registry keys or component props, not prose text.

**Why:** The hyphen in `id="potential-point-charge"` is a key separator in `src/lib/formulas.ts` naming conventions, not an authorial hyphenation decision in prose.

**How to apply:** Before counting a grep hit as a hyphenation occurrence, check whether it appears inside a JSX attribute (`id=`, `slug=`, `storageKey=`, `deeperLab=`, etc.) or inside `<InlineMath tex="…">` / `<Formula id="…">`. Filter those out before tallying the two forms.
