---
name: feedback_chapter_patterns
description: What kinds of strong/em math wraps actually exist across the 42 chapters, and where the conversion labour actually concentrates
metadata:
  type: feedback
---

Almost all `<strong className="text-text font-medium">` tags across Ch1–Ch42 are emphatic English (term glossary labels, section headings, numerical answers in TryIt blocks, case study data). They are NOT single math symbols in "where" paragraphs. The core physics chapters (Ch1–Ch12) had already converted all "where" paragraph symbols to `<InlineMath>` before this run.

The genuine math-wrap conversions found were:

- `<em className="text-text italic">` wrapping equations inside Term `def` JSX fragments (most common pattern — Ch1, Ch8, Ch9, Ch12, Ch17, Ch19)
- `<em className="text-text italic">` wrapping equations in FAQ answers and narrative prose
- `<em className="text-text italic">` for physics variables like `B`, `M`, `H`, `x`, `s`, `λ'`, `X(ω)`, `cos θ`
- Single physics variables in Term def JSX (Ch17 had many — diamagnetism B, paramagnetism B/χ_m, ferromagnetism T_C/χ_m, hysteresis M/H)
- The one genuine "where" paragraph case was Ch41 with `<strong>kWh</strong>` and `<strong>J</strong>`

**Why:** The chapters had already been partially converted — "where" paragraphs after Formula blocks in physics chapters are done. The remaining work is em-wrapped equations/symbols inside Term def fragments.

**How to apply:** For future math-typesetter runs on this codebase, focus the grep on `<em className="text-text italic">` patterns that contain math operators (=, ×, ·, ^, /), Greek letters, or subscripted symbols inside Term def JSX fragments and FAQ answers. Don't expect "where" paragraph strong-wraps to be the main source of work.
