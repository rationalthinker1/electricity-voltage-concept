---
name: ch23-transformerflux3d-rAF
description: TransformerFlux3D.tsx is the only Ch.23 demo not yet migrated to useSimLoop
metadata:
  type: project
---

As of 2026-05-23, `src/textbook/demos/TransformerFlux3D.tsx` still uses the legacy `useRef + useEffect + useCallback + requestAnimationFrame` shape (L146–151, draw loop ending at L536) instead of `useSimState` + `useSimLoop`. Every other Ch.23 demo (`TwoCoilTransformer`, `TurnsRatio`, `StanleyDemo`, `ImpedanceReflection`, `CoreLosses`, `GridHierarchy`, `Autotransformer`, `TransformerDesigner`, `InRushCurrent`, `HighFrequencyTransformer`) was migrated already.

**Why:** This demo already uses `createOrbitScene` (the orbit-helper part of the migration is done), but the rAF dance around it wasn't converted. The mechanical migration is straightforward: move the orbit setup into `useSimLoop`'s `init` callback (`return { context: scene, cleanup: () => scene.dispose() }`), collapse `let t; let last` into the `simTime` argument the loop already provides, and the draw body becomes the `draw` callback.

**How to apply:** Next demo-rAF-migrator pass should pick this up. If a chapter reviewer is auditing Ch.23 again and this file has been migrated, delete this memory; if a different chapter shows the same pattern, document it separately.
