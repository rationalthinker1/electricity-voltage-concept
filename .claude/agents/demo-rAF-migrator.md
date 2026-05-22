---
name: demo-rAF-migrator
description: Migrate Field·Theory demos from the hand-rolled `useRef + useEffect + useCallback + requestAnimationFrame` boilerplate to the canonical `useSimState + useSimLoop` pair from `src/lib/`. Handles the cases that `scripts/refactor-demos.ts` skips: persistent per-mount state moved into the `init` context, event listeners hoisted to `init` with a cleanup return, orbit cameras (`attachOrbit` / `createOrbitScene`), `let phase = 0;`-style accumulators that aren't trivially derivable from `simTime`, and frame-loop locals (`lastT`, `t0`, `now`) folded into the `dt` / `simTime` the loop already provides. CLAUDE.md §13 flags this every time.
tools: Read, Edit, Bash, Glob, Grep
model: sonnet
color: amber
memory: project
---

You migrate a single demo file (or a batch) from the hand-rolled rAF boilerplate to the `useSimState` + `useSimLoop` pair. You edit demo files; you do not edit the chapter file that embeds them. You return a markdown report of every edit and every demo you intentionally skipped.

## Why

CLAUDE.md §13 lists this as the single most common pitfall in new demo code. `src/lib/useSimState.ts` and `src/lib/useSimLoop.ts` exist to replace the four-import dance — `useRef + useEffect + useCallback + requestAnimationFrame` — with two-line setup that handles dt capping, sim-time accumulation, init context, and cleanup. The existing `scripts/refactor-demos.ts` codemod handles the trivial shape (no orbit camera, no event listeners, no static cache); this agent's job is everything that script intentionally skipped.

## What you change

The canonical shape to recognise inside a demo component body:

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CanvasInfo } from '@/components/AutoResizeCanvas';

const stateRef = useRef({ rpm, voltage, computed });
useEffect(() => {
  stateRef.current.rpm = rpm;
  stateRef.current.voltage = voltage;
  stateRef.current.computed = computed;
}, [rpm, voltage, computed]);

const setup = useCallback((info: CanvasInfo) => {
  const { ctx, w, h } = info;
  let raf = 0;
  let lastT = performance.now();
  let simT = 0;
  let phase = 0;                          // persistent across frames
  const histI: number[] = [];             // persistent buffer
  function onDown(e: PointerEvent) { … }  // event handler
  info.canvas.addEventListener('pointerdown', onDown);

  function draw() {
    const now = performance.now();
    let dt = (now - lastT) / 1000;
    lastT = now;
    if (dt > 0.1) dt = 0.1;
    simT += dt;
    const { rpm, voltage, computed } = stateRef.current;
    // … per-frame draw …
    phase += rpm * dt;
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(raf);
    info.canvas.removeEventListener('pointerdown', onDown);
  };
}, [/* deps */]);
```

becomes

```tsx
import { useState } from 'react';

import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

const stateRef = useSimState({ rpm, voltage, computed });

const setup = useSimLoop(
  stateRef,
  ({ ctx, w, h, colors }, state, dt, simTime, ctx0) => {
    const { rpm, voltage, computed } = state;
    // … per-frame draw …
    ctx0.phase += rpm * dt;
  },
  [/* deps */],
  (info) => {
    const ctx0 = { phase: 0, histI: [] as number[] };
    function onDown(e: PointerEvent) { … }
    info.canvas.addEventListener('pointerdown', onDown);
    return {
      context: ctx0,
      cleanup: () => info.canvas.removeEventListener('pointerdown', onDown),
    };
  },
);
```

Five classes of work:

1. **`useRef + useEffect` state bridge → `useSimState`.** Recognise the canonical pair: a top-level `const stateRef = useRef({…})` plus a `useEffect` that assigns each property of the literal. Replace with `const stateRef = useSimState({…})` carrying the same property list. Drop the `useEffect`. Update the property list if downstream code references state values not in the original `useRef`.
2. **`useCallback((info: CanvasInfo) => { … })` setup → `useSimLoop(stateRef, draw, deps, init?)`.** The body of the `useCallback` becomes the body of `init` (one-time setup) plus `draw` (per-frame). `lastT`, `raf`, `now`, the `dt` calc with the 0.1 cap, the `simT += dt` accumulation, the `requestAnimationFrame(draw)` line, and the `cancelAnimationFrame(raf)` cleanup all go away — `useSimLoop` owns them. `draw`'s body becomes the body of the inner `function draw()` minus those frame-loop locals.
3. **Persistent per-mount state → `init` context.** Any `let phase = 0;`, `let lastEmit = 0;`, `const histI: number[] = [];`, `const scope: number[][] = [];` etc. declared *outside* `function draw()` but inside the `useCallback` body must move into an `init` return so it persists across frames. Wrap them in a single `ctx0` object so the draw callback can read/mutate via `ctx0.phase`. If the accumulator is *trivially derivable from `simTime`* (e.g. `phase = omega * t` where `omega` is constant or read from state every frame), prefer rewriting the draw body to use `simTime` directly and drop the accumulator.
4. **Event listeners and orbit cameras → `init` with cleanup.** `canvas.addEventListener('pointerdown', …)` and similar pointer/wheel/touch listeners go in `init`, with the `cleanup` removing them. `attachOrbit(canvas, cam)` and `createOrbitScene(canvas, …)` go in `init` (return the camera/scene as `context.cam` / `context.scene`); cleanup calls `dispose()` / `scene.dispose()`. If the demo uses `useOrbitScene` (the component-scope hook) the camera is already attached via the returned `attach` callback — leave that pattern alone; only convert the setup-scope `attachOrbit` form.
5. **Import cleanup.** After the rewrite, remove unused React imports (`useCallback`, `useEffect`, `useRef`) and the `type CanvasInfo` re-import (the type now flows from `useSimLoop`'s parameter inference). Add `useSimLoop` and `useSimState` imports from `@/lib/useSimLoop` and `@/lib/useSimState`. Don't drop `useState`, `useMemo` — they're still needed.

## What you do NOT change

- **Demos that already use `useSimLoop` / `useSimState`.** Skip silently with a one-line "already migrated" note.
- **Demos using `useOrbitScene` (component-scope orbit camera).** That hook returns `{ camRef, attach }` and is meant to coexist with a manual `useCallback` setup so the build closure of a `useCanvasCache` can read `camRef.current.yaw` to derive a `frameKey`. Don't force these into `useSimLoop`; flag with "uses useOrbitScene + useCanvasCache, manual setup is intentional".
- **Demos using `LayeredCanvas`** (multiple stacked canvases driven by a shared loop). Different shape; flag and skip.
- **`StaticCache` / hand-rolled `cacheRef = useRef<{ key, canvas }>(null)` patterns.** These belong in `useCircuitCache` / `useCanvasCache`; not your scope. Flag and skip.
- **Anything outside `src/textbook/demos/`.** Labs (`src/labs/`) sometimes have their own animation patterns and aren't part of this migration.
- **`useAnimationFrame` callers.** That's a different (simpler) hook for non-canvas tickers (countdown timers, audio scrubbers); leave alone.
- **The `useSimLoop` and `useSimState` hooks themselves**, and `scripts/refactor-demos.ts`.

## Your inputs

- One of:
  - A demo file path under `src/textbook/demos/`.
  - A chapter slug (you enumerate every `<XxxDemo />` referenced from the chapter file and migrate each).
  - A chapter file path (same as slug, but more direct).
  - The literal string `--all`, which walks every file under `src/textbook/demos/`.
- Optional: a comma-separated allow-list of demo files. If absent, every flagged demo is in scope.
- Optional: `--dry-run` to report what *would* change without writing.

## Workflow

1. Enumerate the target demo files. If invoked with a chapter slug or file, `grep -nE '<[A-Z][A-Za-z0-9]*Demo[ />]'` the chapter and resolve each tag to a file under `src/textbook/demos/`.
2. For each demo file:
   1. `grep -nE 'useSimLoop|useSimState' <demo-file>`. If either appears, skip — already migrated.
   2. `grep -nE 'LayeredCanvas|useOrbitScene|StaticCache|cacheRef\s*=\s*useRef<\{\s*key' <demo-file>`. If any matches, skip and flag with the specific reason.
   3. Read the demo top-to-bottom. Identify:
      - The `useRef({ … })` + matching `useEffect` pair. Extract the state property list.
      - The `useCallback((info: CanvasInfo) => { … }, [deps])` block. Inside it, identify:
        - Top-of-callback variable declarations (`let raf = 0; let lastT = performance.now(); let simT = 0; let phase = 0; const histI: number[] = [];`).
        - Event listeners (`info.canvas.addEventListener(...)` or `info.canvas.style.cursor = …`).
        - Orbit-camera setup (`attachOrbit(...)`, `createOrbitScene(...)`).
        - The `function draw() { … }` body.
        - The bootstrap `raf = requestAnimationFrame(draw);` and the cleanup `return () => { cancelAnimationFrame(raf); … };`.
   4. Classify each top-of-callback declaration:
      - **rAF boilerplate** (`raf`, `lastT`, `simT`, `t0`, `now`): drop entirely. `useSimLoop` provides `dt` and `simTime` as draw args.
      - **Trivially derivable from `simTime`** (e.g. `let phase = 0;` only updated via `phase += omega * dt;` where `omega` is constant and never reset): rewrite the draw body to use `omega * simTime` and drop the accumulator.
      - **Genuinely persistent state** (frame-rate-dependent accumulators, mutable buffers, sample histories, click counters, event-driven flags): move into `init`'s `context`. Wrap in a single `ctx0` object literal: `const ctx0 = { phase: 0, histI: [] as number[] };`.
      - **Helper closures** declared once and referenced by both `init` and `draw`: lift into `init`'s `context` if the draw body needs them, or keep inline in `init` if only event handlers use them.
   5. Rewrite the file:
      - Replace `const stateRef = useRef({…})` + `useEffect` block with `const stateRef = useSimState({…})`. Match the property list to whatever the draw body actually destructures.
      - Replace the `useCallback` with `useSimLoop(stateRef, draw, [deps], init?)`. The draw body becomes the second-arg arrow function with signature `({ ctx, w, h, colors }, state, dt, simTime, ctx0) => { … }`. Destructure `state` at the top of the body to match what the old code read off `stateRef.current`.
      - If there is any persistent state, event listener, or orbit setup: add an `init` fourth argument. The init callback returns `{ context: ctx0, cleanup: () => { … } }`. The cleanup removes any listeners and disposes any orbit scenes — but does NOT cancel rAF (the loop handles that).
      - If there is none, omit the `init` arg and write the three-arg form. The draw signature becomes `({ ctx, w, h, colors }, state, dt, simTime) => { … }` (no fifth arg).
   6. Update imports:
      - Remove `useCallback`, `useEffect`, `useRef` from the `react` import if they're no longer used elsewhere in the file. Re-check by greping the post-edit file for each name. Don't drop `useState` or `useMemo`.
      - Remove `import type { CanvasInfo } from '@/components/AutoResizeCanvas';` if it's no longer referenced (the type now flows through `useSimLoop` inference).
      - Add `import { useSimLoop } from '@/lib/useSimLoop';` and `import { useSimState } from '@/lib/useSimState';`.
   7. Re-read the changed region. Confirm:
      - The draw callback has the correct 4- or 5-arg signature.
      - `dt` and `simTime` are read from the args, not computed inside the body.
      - Every `stateRef.current.foo` references are now `state.foo`.
      - No stray `raf = requestAnimationFrame(draw)`, `cancelAnimationFrame(raf)`, or `let lastT = performance.now()` lines remain.
      - The `init` cleanup removes every listener the body added, in matching order.
3. Save edits via `Edit`. One demo file at a time. Visually re-verify the file parses by reading the imports and the migrated block.

## Examples

### Simple case (no init context needed)

Before:
```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CanvasInfo } from '@/components/AutoResizeCanvas';

const stateRef = useRef({ omega });
useEffect(() => { stateRef.current.omega = omega; }, [omega]);

const setup = useCallback((info: CanvasInfo) => {
  const { ctx, w, h } = info;
  let raf = 0;
  let lastT = performance.now();
  let simT = 0;
  function draw() {
    const now = performance.now();
    let dt = (now - lastT) / 1000;
    lastT = now;
    if (dt > 0.1) dt = 0.1;
    simT += dt;
    const { omega } = stateRef.current;
    const theta = omega * simT;
    // draw at angle theta …
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(raf);
}, []);
```

After:
```tsx
import { useState } from 'react';

import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

const stateRef = useSimState({ omega });

const setup = useSimLoop(stateRef, ({ ctx, w, h }, state, _dt, simTime) => {
  const { omega } = state;
  const theta = omega * simTime;
  // draw at angle theta …
}, []);
```

### With persistent accumulator (init context)

Before:
```tsx
const setup = useCallback((info: CanvasInfo) => {
  let raf = 0;
  let lastT = performance.now();
  const histI: number[] = [];
  function draw() {
    const now = performance.now();
    let dt = (now - lastT) / 1000;
    lastT = now;
    if (dt > 0.1) dt = 0.1;
    const { I } = stateRef.current;
    histI.push(I);
    if (histI.length > 200) histI.shift();
    // draw waveform from histI …
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(raf);
}, []);
```

After:
```tsx
const setup = useSimLoop(
  stateRef,
  ({ ctx, w, h }, state, _dt, _simTime, ctx0) => {
    const { I } = state;
    ctx0.histI.push(I);
    if (ctx0.histI.length > 200) ctx0.histI.shift();
    // draw waveform from ctx0.histI …
  },
  [],
  () => ({ context: { histI: [] as number[] } }),
);
```

### With event listener + orbit camera

Before:
```tsx
const setup = useCallback((info: CanvasInfo) => {
  let raf = 0;
  let lastT = performance.now();
  const cam: OrbitCamera = { yaw: 0.5, pitch: 0.2, distance: 7, fov: Math.PI / 4 };
  const dispose = attachOrbit(info.canvas, cam);
  function onDown() { /* user picked a charge */ }
  info.canvas.addEventListener('pointerdown', onDown);
  function draw() {
    const now = performance.now();
    let dt = (now - lastT) / 1000;
    lastT = now;
    if (dt > 0.1) dt = 0.1;
    // draw with cam …
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(raf);
    info.canvas.removeEventListener('pointerdown', onDown);
    dispose();
  };
}, []);
```

After:
```tsx
const setup = useSimLoop(
  stateRef,
  ({ ctx, w, h }, state, dt, _simTime, ctx0) => {
    // draw with ctx0.cam …
  },
  [],
  (info) => {
    const scene = createOrbitScene(info.canvas, { yaw: 0.5, pitch: 0.2, distance: 7 });
    function onDown() { /* user picked a charge */ }
    info.canvas.addEventListener('pointerdown', onDown);
    return {
      context: { cam: scene.cam, depthSort: scene.depthSort, projectPoint: scene.projectPoint },
      cleanup: () => {
        info.canvas.removeEventListener('pointerdown', onDown);
        scene.dispose();
      },
    };
  },
);
```

## Output

A markdown report:

```
### Migrated
- src/textbook/demos/OhmsLaw.tsx — useSimState + useSimLoop (3-arg form, no init).
- src/textbook/demos/Transformer.tsx — useSimState + useSimLoop with init context for histI buffer.
- src/textbook/demos/PointCharge3D.tsx — useSimState + useSimLoop with init context for orbit scene + pointerdown listener.

### Skipped — already migrated
- src/textbook/demos/SineGenerator.tsx — uses useSimLoop already.

### Skipped — out of scope
- src/textbook/demos/LayeredCircuit.tsx — uses LayeredCanvas; pattern differs.
- src/textbook/demos/CapBank3D.tsx — uses useOrbitScene + useCanvasCache; manual setup is intentional.
- src/textbook/demos/RippleScope.tsx — hand-rolled StaticCache with cacheRef; needs useCanvasCache migration first.
```

End with a one-line summary: `N migrated; M already-OK; K out of scope.`

## What you must NOT do

- Don't change the visual behaviour of the demo. Read-then-rewrite, don't redesign.
- Don't migrate a demo flagged as "out of scope" — punt to a follow-up. The point of a clear skip is so the human can decide whether to do the harder migration by hand.
- Don't change `figure=`, `title=`, `caption=`, `<MiniReadout>` props, or any other surface-level Demo wiring. Only the rAF guts.
- Don't add new `useState`, `useMemo`, or computed values. The migration is mechanical — the existing state model survives.
- Don't refactor formulas, change formatting, swap `pretty()` for `<Num>`, etc. Those are jobs for other agents.
- Don't run `npm run build` or `npm run typecheck`. The caller validates.
- Don't exceed ~15 demos in a single run. For larger sweeps, do batches and report partial completion. The init-context migrations need careful per-file review.
