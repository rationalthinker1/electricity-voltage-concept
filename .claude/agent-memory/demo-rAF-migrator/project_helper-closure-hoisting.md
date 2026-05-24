---
name: helper-closure-hoisting
description: When inner helper functions close over setup-scope ctx/cam/W/H, hoist them to module scope with explicit parameters rather than keeping them inside the draw callback.
metadata:
  type: project
---

When a demo's `useCallback` body contains helper functions like `projectPolyline`, `drawArrow2D`, `drawArrow3D`, `drawLamination` that close over `ctx`, `cam`, `W`, `H` from the setup scope, the migration to `useSimLoop` requires hoisting them.

**Rule:** Lift those helpers to module scope (below the geometry constants, above the component) and add explicit `(ctx, cam, W, H, ...)` parameters. The draw callback in `useSimLoop` then calls them with `(ctx, cam, W, H, ...)` instead of relying on closure.

**Why:** The `useSimLoop` draw callback receives `ctx`, `w`, `h` from the `info` arg and `cam` from `scene.cam` (the init context). There is no longer a shared setup-scope closure for helpers to capture. Hoisting to module scope mirrors the pattern already used in `PointCharge3D.tsx` (`drawChargeBall`, `drawSampleSphere`, `drawRadialArrow`).

**How to apply:** Any time a demo has inner helpers that close over setup-scope values, check whether they're pure rendering functions. If so, hoist to module scope and add explicit params. If they close over mutable per-mount state (event listeners, camera refs), they may need to stay inline inside `init` or `draw`.

**Example file:** `src/textbook/demos/TransformerFlux3D.tsx` — four helpers (`projectPolyline`, `drawArrow2D`, `drawArrow3D`, `drawLamination`) were hoisted to module scope with explicit ctx/cam/W/H params during the migration from `useCallback` to `useSimLoop`.
