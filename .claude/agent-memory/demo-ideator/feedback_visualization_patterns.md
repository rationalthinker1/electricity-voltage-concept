---
name: visualization-patterns
description: Canvas demo patterns that work well in this textbook's palette-constrained, touch-friendly style
metadata:
  type: feedback
---

Patterns confirmed effective in existing demos:

- **Field-line density as opacity rather than count** — FieldArrowsDemo uses `rgba(255,107,42, 0.15 + log-scaled-alpha)` to show inverse-square fall-off without needing a dense grid. Works well.
- **stateRef pattern for animation loops** — state in useState, mirrored to stateRef so the rAF draw loop reads `stateRef.current` without re-running setup. Critical for any animated canvas. See TwoChargesDemo.
- **EquationStrip with live substitution** — showing symbolic form AND numeric substitution side-by-side is the strongest single element in most demos. PointCharge3DDemo and FieldArrowsDemo both do this well.
- **Depth-faded arrows for 3D effect** — PointCharge3DDemo uses `(cam.distance + 2 - dMid) / 4.0` alpha fade to fake depth without full 3D rendering. Very effective for spiky-sphere patterns.
- **log-scaled arrow lengths** — for fields that span many orders of magnitude, log-mapping the arrow/line length keeps the visualization readable at all distances. Both FieldArrowsDemo and InverseSquareDemo use this.
- **LayeredCanvas for interactive probes** — FieldArrowsDemo uses a two-layer canvas (field layer + ui layer) so the slow field render only redraws on parameter change, and the fast probe follows the mouse on every frame. Good pattern for any draggable probe.
- **Draggable charges at fractional canvas coordinates** — EquipotentialsDemo stores charge positions as {x: 0..1, y: 0..1} fractions so they survive canvas resizes cleanly.
- **getCanvasColors() inside the draw loop** — re-reading every frame (not caching at setup) is required for instant light/dark toggle. Confirmed in PointCharge3DDemo and FieldArrowsDemo.

**Why:** these are already-tested patterns in the codebase; new demos should reuse them rather than inventing alternatives.

**How to apply:** when proposing or building a new demo, check which of these patterns applies and use the existing code as a template.
