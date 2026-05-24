# demo-rAF-migrator memory: orbit-scene demos

Date: 2026-05-24

The old bulk script skipped every file containing `createOrbitScene`, but those demos are migratable
when they use setup-scope `createOrbitScene(canvas, ...)` rather than a component-scope
`useOrbitScene` hook.

Migration pattern:
- Replace `useRef` + `useEffect` state bridge with `useSimState`.
- Use `useSimLoop<State, OrbitScene>` when the only persistent context is the orbit scene.
- Use a context object for extra persistent state, e.g. `{ scene: OrbitScene; electrons: Electron[] }`
  or `{ scene: OrbitScene; tFlow: number }`.
- Put `createOrbitScene` in the init callback and return `cleanup: () => scene.dispose()`.
- Use the loop-provided `dt` for flow/particle accumulators.

Files migrated with this pattern:
- `DipoleAlignment3D.tsx`
- `ImageChargeField3D.tsx`
- `MOSFET3D.tsx`
- `PanelBus3D.tsx`
- `SnellLaw3D.tsx`

After the pass, no `requestAnimationFrame` or `cancelAnimationFrame` text remained in `src/textbook/demos`.
