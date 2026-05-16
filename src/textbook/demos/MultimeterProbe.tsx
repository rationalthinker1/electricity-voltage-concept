/**
 * Demo D11.7 — What the multimeter actually reads
 *
 * Fixed schematic circuit with six labelled test points and a battery.
 * The reader drags a red (+) probe and a black (−) probe between TPs and
 * a multimeter "display" panel shows the live reading. The mode selector
 * picks between V_DC, V_AC, I_DC, and R.
 *
 *           +12 V
 *            │
 *           R1 (470 Ω)
 *            │
 *      [TP1]─────────────[TP2]
 *            │             │
 *           R2 (1 kΩ)     C (10 µF)
 *            │             │
 *      [TP3]               [TP4]
 *            │             │
 *           R3 (220 Ω)    R4 (330 Ω)
 *            │             │
 *      [TP5]─────────────[TP6]
 *            │
 *           GND
 *
 * DC steady-state solution (capacitor open):
 *   I  = 12 / (470 + 1000 + 220)  = 7.1006 mA   through R1, R2, R3
 *   V(GND) = 0
 *   V(TP5) = V(TP6) = 0
 *   V(TP3) = I·R3 = 1.5621 V
 *   V(TP1) = V(TP2) = V(TP3) + I·R2 = 8.6627 V
 *   V(TP4) = 0       (no current through R4; cap blocks DC)
 *   V_cap  = V(TP2) − V(TP4) = 8.6627 V
 *
 * R-mode (battery shorted, cap open):
 *   R(TP1,GND) = R1 ∥ (R2+R3) = 470 ∥ 1220 ≈ 339.3 Ω
 *   R(TP3,GND) = R3 ∥ (R1+R2) = 220 ∥ 1470 ≈ 191.4 Ω
 *   R(TP1,TP3) = R2 ∥ (R1+R3) = 1000 ∥ 690 ≈ 408.3 Ω
 *   R(TP4,GND) = R4           = 330 Ω
 *   R(TP4,TPx) = R4 + R(GND,TPx)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniToggle } from '@/components/Demo';
import { renderCircuitToCanvas, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';

interface StaticCache {
  key: string;
  canvas: HTMLCanvasElement;
}

type Mode = 'V_DC' | 'V_AC' | 'I_DC' | 'R';

/** Test-point id. TP0 = battery + terminal, TP_GND = ground rail. */
type TPId = 'TP_BAT' | 'TP1' | 'TP2' | 'TP3' | 'TP4' | 'TP5' | 'TP6' | 'TP_GND';

interface TP {
  id: TPId;
  label: string;
  x: number; // canvas coordinates (CSS px)
  y: number;
}

/* ── Component values ───────────────────────────────────────────────── */
const V_BATT = 12; // V
const R1 = 470; // Ω
const R2 = 1000; // Ω
const R3 = 220; // Ω
const R4 = 330; // Ω
const C_VAL = 10e-6; // F (10 µF) — affects only AC/transient discussion

/* ── DC steady-state node voltages (volts wrt GND) ──────────────────── */
const I_main = V_BATT / (R1 + R2 + R3);
const V_NODE: Record<TPId, number> = {
  TP_BAT: V_BATT,
  TP1: I_main * (R2 + R3),
  TP2: I_main * (R2 + R3),
  TP3: I_main * R3,
  TP4: 0,
  TP5: 0,
  TP6: 0,
  TP_GND: 0,
};

/**
 * R-mode equivalent resistance between two TPs.
 * Battery short, capacitor open.
 *
 * Connections in the R-mode graph:
 *   R1   : TP_BAT — TP1     (with TP_BAT shorted to TP_GND via battery)
 *   R2   : TP1    — TP3
 *   R3   : TP3    — TP5
 *   R4   : TP4    — TP6
 *   wire : TP1 = TP2; TP5 = TP6 = TP_GND; TP_BAT = TP_GND (battery short)
 *   cap  : open  → TP4 is reachable only via R4 to TP6 = GND
 */
function eqR(a: TPId, b: TPId): number {
  if (a === b) return 0;

  // Canonicalize: collapse aliases.
  const canon = (t: TPId): TPId => {
    if (t === 'TP2') return 'TP1';
    if (t === 'TP5' || t === 'TP6' || t === 'TP_BAT') return 'TP_GND';
    return t;
  };
  const A = canon(a);
  const B = canon(b);
  if (A === B) return 0;

  // Pair-by-pair lookup. All values in Ω.
  const key = [A, B].sort().join('|');
  switch (key) {
    case 'TP1|TP_GND':
      return (R1 * (R2 + R3)) / (R1 + R2 + R3); // 339.29 Ω
    case 'TP3|TP_GND':
      return (R3 * (R1 + R2)) / (R1 + R2 + R3); // 191.36 Ω
    case 'TP1|TP3':
      return (R2 * (R1 + R3)) / (R1 + R2 + R3); // 408.28 Ω
    case 'TP4|TP_GND':
      return R4; // 330 Ω
    case 'TP1|TP4':
      return R4 + (R1 * (R2 + R3)) / (R1 + R2 + R3); // 669.29 Ω
    case 'TP3|TP4':
      return R4 + (R3 * (R1 + R2)) / (R1 + R2 + R3); // 521.36 Ω
    default:
      return NaN;
  }
}

/**
 * I_DC magnitude (amps) flowing along the wire segment between two
 * adjacent test points. For DC steady state only the R1–R2–R3 path
 * carries current; the cap branch is dead.
 */
function eqI(a: TPId, b: TPId): number {
  const pair = [a, b].sort().join('|');
  switch (pair) {
    case 'TP1|TP_BAT':
    case 'TP2|TP_BAT':
      return I_main; // through R1
    case 'TP1|TP3':
      return I_main; // through R2
    case 'TP3|TP5':
      return I_main; // through R3
    case 'TP5|TP_GND':
    case 'TP6|TP_GND':
      return I_main; // return wire
    case 'TP5|TP6':
      return I_main; // bottom rail carries return current
    case 'TP1|TP2':
      return 0; // top rail; both nodes are the same node
    case 'TP2|TP4':
    case 'TP4|TP6':
      return 0; // cap branch, no DC
    default:
      return NaN; // probes don't span a single wire segment
  }
}

/* ── Formatting helpers ─────────────────────────────────────────────── */
function fmtVolts(v: number): string {
  if (!Number.isFinite(v)) return '— V';
  const a = Math.abs(v);
  if (a >= 1) return v.toFixed(3) + ' V';
  if (a >= 1e-3) return (v * 1000).toFixed(2) + ' mV';
  if (a === 0) return '0.000 V';
  return (v * 1e6).toFixed(1) + ' µV';
}
function fmtAmps(i: number): string {
  if (!Number.isFinite(i)) return '— A';
  const a = Math.abs(i);
  if (a === 0) return '0.000 A';
  if (a >= 1) return i.toFixed(3) + ' A';
  if (a >= 1e-3) return (i * 1000).toFixed(3) + ' mA';
  return (i * 1e6).toFixed(1) + ' µA';
}
function fmtOhms(r: number): string {
  if (!Number.isFinite(r)) return 'OL';
  if (r >= 1e6) return (r / 1e6).toFixed(3) + ' MΩ';
  if (r >= 1e3) return (r / 1e3).toFixed(3) + ' kΩ';
  return r.toFixed(2) + ' Ω';
}

/* ── Component ──────────────────────────────────────────────────────── */
export function MultimeterProbeDemo({ figure }: { figure?: string }) {
  // Test-point positions (CSS px). Computed once relative to canvas size.
  // We use a virtual layout and project at draw time.
  // Logical coordinates 0..1 in x and y.
  const TPS: TP[] = useMemo(
    () => [
      { id: 'TP_BAT', label: '+12V', x: 0.1, y: 0.12 },
      { id: 'TP1', label: 'TP1', x: 0.3, y: 0.32 },
      { id: 'TP2', label: 'TP2', x: 0.7, y: 0.32 },
      { id: 'TP3', label: 'TP3', x: 0.3, y: 0.62 },
      { id: 'TP4', label: 'TP4', x: 0.7, y: 0.62 },
      { id: 'TP5', label: 'TP5', x: 0.3, y: 0.86 },
      { id: 'TP6', label: 'TP6', x: 0.7, y: 0.86 },
      { id: 'TP_GND', label: 'GND', x: 0.1, y: 0.94 },
    ],
    [],
  );

  // Probes: stored as TP ids (snap-to-TP semantics).
  const [redProbe, setRedProbe] = useState<TPId>('TP1');
  const [blackProbe, setBlackProbe] = useState<TPId>('TP_GND');
  const [mode, setMode] = useState<Mode>('V_DC');

  // Drag state (which probe is currently being dragged, if any) and last
  // pointer position in CSS px relative to the canvas.
  const dragRef = useRef<{ which: 'red' | 'black' | null; x: number; y: number }>({
    which: null,
    x: 0,
    y: 0,
  });

  const stateRef = useRef({
    red: redProbe,
    black: blackProbe,
    mode,
    drag: dragRef.current,
    t: 0,
    w: 0,
    h: 0,
  });
  useEffect(() => {
    stateRef.current.red = redProbe;
    stateRef.current.black = blackProbe;
    stateRef.current.mode = mode;
  }, [redProbe, blackProbe, mode]);

  // Reading
  const reading = useMemo(() => {
    const va = V_NODE[redProbe];
    const vb = V_NODE[blackProbe];
    switch (mode) {
      case 'V_DC':
        return { value: fmtVolts(va - vb), label: 'V DC' };
      case 'V_AC': {
        // The only AC-relevant excitation is the small voltage across the
        // capacitor branch as it charges/discharges with R4. At steady
        // state, V_AC ≡ 0 — the multimeter is true-RMS but the circuit is
        // pure DC. We model this honestly.
        return { value: '0.000 V', label: 'V AC (rms)' };
      }
      case 'I_DC': {
        const i = eqI(redProbe, blackProbe);
        if (!Number.isFinite(i)) {
          return { value: '— A', label: 'I DC (no series path)' };
        }
        return { value: fmtAmps(i), label: 'I DC' };
      }
      case 'R': {
        const r = eqR(redProbe, blackProbe);
        return { value: fmtOhms(r), label: 'Resistance' };
      }
    }
  }, [redProbe, blackProbe, mode]);

  const cacheRef = useRef<StaticCache | null>(null);

  /* ── Drawing ─────────────────────────────────────────────────────── */
  const setup = useCallback(
    (info: CanvasInfo) => {
      const { ctx, canvas, dpr } = info;
      let raf = 0;

      function projectTP(tp: TP, w: number, h: number) {
        return { x: tp.x * w, y: tp.y * h };
      }
      function tpById(id: TPId, w: number, h: number) {
        const tp = TPS.find((t) => t.id === id)!;
        return projectTP(tp, w, h);
      }

      function pickNearestTP(px: number, py: number, w: number, h: number): TPId | null {
        let best: TPId | null = null;
        let bestD = Infinity;
        for (const tp of TPS) {
          const p = projectTP(tp, w, h);
          const d = Math.hypot(p.x - px, p.y - py);
          if (d < bestD) {
            bestD = d;
            best = tp.id;
          }
        }
        // Snap within ~30 px; otherwise no snap.
        if (bestD < 38) return best;
        return null;
      }

      // Pointer handlers — operate in canvas CSS px.
      function localXY(clientX: number, clientY: number) {
        const r = canvas.getBoundingClientRect();
        return { x: clientX - r.left, y: clientY - r.top };
      }
      function pickProbeUnderPointer(
        px: number,
        py: number,
        w: number,
        h: number,
      ): 'red' | 'black' | null {
        const r = tpById(stateRef.current.red, w, h);
        const b = tpById(stateRef.current.black, w, h);
        const dr = Math.hypot(r.x - px, r.y - py);
        const db = Math.hypot(b.x - px, b.y - py);
        if (dr < 20 && dr <= db) return 'red';
        if (db < 20) return 'black';
        return null;
      }

      function onDown(e: MouseEvent) {
        const { x, y } = localXY(e.clientX, e.clientY);
        const w = canvas.clientWidth,
          h = canvas.clientHeight;
        const which = pickProbeUnderPointer(x, y, w, h);
        if (which) {
          dragRef.current.which = which;
          dragRef.current.x = x;
          dragRef.current.y = y;
          e.preventDefault();
        }
      }
      function onMove(e: MouseEvent) {
        if (!dragRef.current.which) return;
        const { x, y } = localXY(e.clientX, e.clientY);
        dragRef.current.x = x;
        dragRef.current.y = y;
        const w = canvas.clientWidth,
          h = canvas.clientHeight;
        const id = pickNearestTP(x, y, w, h);
        if (id) {
          if (dragRef.current.which === 'red') {
            if (id !== stateRef.current.red) setRedProbe(id);
          } else {
            if (id !== stateRef.current.black) setBlackProbe(id);
          }
        }
      }
      function onUp() {
        dragRef.current.which = null;
      }

      function onTouchStart(e: TouchEvent) {
        const t = e.touches[0];
        if (!t) return;
        const { x, y } = localXY(t.clientX, t.clientY);
        const w = canvas.clientWidth,
          h = canvas.clientHeight;
        const which = pickProbeUnderPointer(x, y, w, h);
        if (which) {
          dragRef.current.which = which;
          dragRef.current.x = x;
          dragRef.current.y = y;
          e.preventDefault();
        }
      }
      function onTouchMove(e: TouchEvent) {
        if (!dragRef.current.which) return;
        const t = e.touches[0];
        if (!t) return;
        const { x, y } = localXY(t.clientX, t.clientY);
        dragRef.current.x = x;
        dragRef.current.y = y;
        const w = canvas.clientWidth,
          h = canvas.clientHeight;
        const id = pickNearestTP(x, y, w, h);
        if (id) {
          if (dragRef.current.which === 'red') {
            if (id !== stateRef.current.red) setRedProbe(id);
          } else {
            if (id !== stateRef.current.black) setBlackProbe(id);
          }
        }
        e.preventDefault();
      }
      function onTouchEnd() {
        dragRef.current.which = null;
      }

      canvas.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);

      function draw() {
        const st = stateRef.current;
        st.t += 0.016;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        st.w = w;
        st.h = h;

        // Background
        ctx.fillStyle = getCanvasColors().bg;
        ctx.fillRect(0, 0, w, h);

        // Resolve node positions
        const p_bat = projectTP(TPS[0], w, h);
        const p1 = projectTP(TPS[1], w, h);
        const p2 = projectTP(TPS[2], w, h);
        const p3 = projectTP(TPS[3], w, h);
        const p4 = projectTP(TPS[4], w, h);
        const p5 = projectTP(TPS[5], w, h);
        const p6 = projectTP(TPS[6], w, h);
        const p_gnd = projectTP(TPS[7], w, h);

        const r1cx = (p_bat.x + p1.x - 24) / 2;
        const r2cy = (p1.y + p3.y) / 2;
        const r3cy = (p3.y + p5.y) / 2;
        const r4cy = (p4.y + p6.y) / 2;
        const capCy = (p2.y + p4.y) / 2;

        // Cache key invalidates only on resize / DPR change — the schematic uses
        // module-level constants for V_BATT / R1..R4 / C_VAL so no slider state
        // affects the static layer.
        const cacheKey = `${w}x${h}@${dpr}`;
        if (cacheRef.current?.key !== cacheKey) {
          // Six-node bench network: battery → R1 → TP1=TP2 rail; left branch R2 then R3 to GND; right branch C then R4 to bottom rail.
          const elements: CircuitElement[] = [
            { kind: 'wire', points: [p_bat, { x: p_bat.x, y: p1.y }, { x: p1.x - 24, y: p1.y }] },
            {
              kind: 'resistor',
              from: { x: r1cx - 20, y: p1.y },
              to: { x: r1cx + 20, y: p1.y },
              amplitude: 6,
              label: `R₁ = ${R1} Ω`,
              labelOffset: { x: 0, y: -10 },
            },
            { kind: 'wire', points: [{ x: r1cx + 20, y: p1.y }, p1] },
            { kind: 'wire', points: [p1, p2] },
            { kind: 'wire', points: [p1, { x: p1.x, y: r2cy - 20 }] },
            {
              kind: 'resistor',
              from: { x: p1.x, y: r2cy - 20 },
              to: { x: p1.x, y: r2cy + 20 },
              amplitude: 6,
              label: `R₂ = ${R2} Ω`,
              labelOffset: { x: 12, y: 0 },
            },
            { kind: 'wire', points: [{ x: p1.x, y: r2cy + 20 }, p3] },
            { kind: 'wire', points: [p2, { x: p2.x, y: capCy - 14 }] },
            { kind: 'wire', points: [{ x: p2.x, y: capCy + 14 }, p4] },
            { kind: 'wire', points: [p3, { x: p3.x, y: r3cy - 20 }] },
            {
              kind: 'resistor',
              from: { x: p3.x, y: r3cy - 20 },
              to: { x: p3.x, y: r3cy + 20 },
              amplitude: 6,
              label: `R₃ = ${R3} Ω`,
              labelOffset: { x: 12, y: 0 },
            },
            { kind: 'wire', points: [{ x: p3.x, y: r3cy + 20 }, p5] },
            { kind: 'wire', points: [p4, { x: p4.x, y: r4cy - 20 }] },
            {
              kind: 'resistor',
              from: { x: p4.x, y: r4cy - 20 },
              to: { x: p4.x, y: r4cy + 20 },
              amplitude: 6,
              label: `R₄ = ${R4} Ω`,
              labelOffset: { x: 12, y: 0 },
            },
            { kind: 'wire', points: [{ x: p4.x, y: r4cy + 20 }, p6] },
            { kind: 'wire', points: [p5, p6] },
            { kind: 'wire', points: [p5, { x: p_gnd.x, y: p5.y }, p_gnd] },
            {
              kind: 'battery',
              at: { x: p_bat.x, y: p_bat.y - 24 },
              label: `${V_BATT.toFixed(0)} V`,
              labelOffset: { x: 28, y: 0 },
              leadLength: 14,
              negativePlateLength: 14,
              plateGap: 4,
              positivePlateLength: 24,
            },
            { kind: 'ground', at: p_gnd, color: 'rgba(160,158,149,0.85)', size: 20, leadLength: 4 },
          ];
          const off = renderCircuitToCanvas(
            { elements, defaultWireColor: 'rgba(255,255,255,0.55)', defaultWireWidth: 1.5 },
            w,
            h,
            dpr,
          );
          // Bake the header label, the standalone capacitor symbol, and the TP dots
          // + labels into the same offscreen image so a single drawImage replaces
          // many strokes/fills per frame.
          const sctx = off.getContext('2d')!;
          sctx.fillStyle = getCanvasColors().textDim;
          sctx.font = '10px "JetBrains Mono", monospace';
          sctx.textAlign = 'left';
          sctx.textBaseline = 'top';
          sctx.fillText('Six-node bench network — drag the probes to any TP', 12, 10);
          drawCapacitorV(sctx, p2.x, capCy, 'C', `${(C_VAL * 1e6).toFixed(0)} µF`);
          for (const tp of TPS) {
            const p = projectTP(tp, w, h);
            sctx.fillStyle = getCanvasColors().accent;
            sctx.beginPath();
            sctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            sctx.fill();
            sctx.fillStyle = getCanvasColors().text;
            sctx.font = 'bold 10px "JetBrains Mono", monospace';
            const onLeftSide = tp.x < 0.5;
            sctx.textAlign = onLeftSide ? 'right' : 'left';
            sctx.textBaseline = 'middle';
            const dx = onLeftSide ? -8 : 8;
            sctx.fillText(tp.label, p.x + dx, p.y);
          }
          cacheRef.current = { key: cacheKey, canvas: off };
        }
        ctx.drawImage(cacheRef.current.canvas, 0, 0, w, h);

        // Dynamic overlay: animated current dots crawling along the main R1–R2–R3 path.
        const Imax = I_main;
        drawCurrentDotsPath(
          ctx,
          st.t,
          [p_bat, { x: p_bat.x, y: p1.y }, p1, p3, p5, { x: p_gnd.x, y: p5.y }, p_gnd],
          I_main / Imax,
        );

        // Dynamic overlay: the two draggable probes drawn at their current TPs.
        const pRed = tpById(st.red, w, h);
        const pBlk = tpById(st.black, w, h);
        drawProbe(ctx, pRed, '#ff3b6e', '+');
        drawProbe(ctx, pBlk, '#5baef8', '−');

        // Dynamic overlay: ribbon at the top echoing which TP each probe touches.
        ctx.fillStyle = getCanvasColors().pink;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`Red(+): ${st.red}`, w - 12, 10);
        ctx.fillStyle = getCanvasColors().blue;
        ctx.fillText(`Black(−): ${st.black}`, w - 12, 24);

        raf = requestAnimationFrame(draw);
      }
      raf = requestAnimationFrame(draw);

      return () => {
        cancelAnimationFrame(raf);
        canvas.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };
    },
    [TPS],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 11.7'}
      title="What the multimeter actually reads"
      question="Drag the red and black probes between TPs. Switch modes. The display tracks."
      caption={
        <>
          A fixed bench network: 12 V into R₁ = 470 Ω, splitting into two parallel branches — R₂
          then R₃ down the left, a 10 µF cap then R₄ down the right. The capacitor blocks DC, so at
          steady state all the current flows through R₁ → R₂ → R₃, and the right branch sits quietly
          at ground. V_DC reads V<sub>red</sub> − V<sub>black</sub>. R-mode imagines the battery
          shorted and the cap removed — what an ohmmeter actually sees.
        </>
      }
    >
      <AutoResizeCanvas height={360} setup={setup} />

      {/* Multimeter "display" */}
      <div
        style={{
          marginTop: 12,
          padding: '14px 16px',
          background: 'rgba(255,107,42,0.06)',
          border: '1px solid rgba(255,107,42,0.35)',
          borderRadius: 8,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '6px 16px',
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            color: 'rgba(160,158,149,0.85)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {reading.label}
        </span>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 28,
            color: '#ff6b2a',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {reading.value}
        </span>
      </div>

      <DemoControls>
        <MiniToggle label="V DC" checked={mode === 'V_DC'} onChange={() => setMode('V_DC')} />
        <MiniToggle label="V AC" checked={mode === 'V_AC'} onChange={() => setMode('V_AC')} />
        <MiniToggle label="I DC" checked={mode === 'I_DC'} onChange={() => setMode('I_DC')} />
        <MiniToggle label="Ω" checked={mode === 'R'} onChange={() => setMode('R')} />
      </DemoControls>
    </Demo>
  );
}

/* ── Drawing primitives ─────────────────────────────────────────────── */
type Pt = { x: number; y: number };

function drawCapacitorV(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  value: string,
) {
  ctx.strokeStyle = getCanvasColors().teal;
  ctx.lineWidth = 1.8;
  // Two horizontal plates separated by a gap
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy - 4);
  ctx.lineTo(cx + 14, cy - 4);
  ctx.moveTo(cx - 14, cy + 4);
  ctx.lineTo(cx + 14, cy + 4);
  ctx.stroke();
  ctx.strokeStyle = getCanvasColors().textDim;
  ctx.fillStyle = getCanvasColors().teal;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label} = ${value}`, cx + 18, cy);
}

function drawProbe(ctx: CanvasRenderingContext2D, p: Pt, color: string, sym: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sym, p.x + 18, p.y - 12);
}

function drawCurrentDotsPath(ctx: CanvasRenderingContext2D, t: number, pts: Pt[], Iscale: number) {
  const segs: Array<{ x0: number; y0: number; x1: number; y1: number; len: number }> = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, len });
    total += len;
  }
  if (total < 1) return;
  const spacing = 28;
  const speed = 60;
  const offset = (t * speed) % spacing;
  const intensity = Math.max(0.15, Math.min(1, Iscale));
  ctx.fillStyle = `rgba(91,174,248,${0.35 + 0.5 * intensity})`;
  for (let s = -spacing; s < total; s += spacing) {
    const d = s + offset;
    if (d < 0 || d > total) continue;
    let acc = 0;
    for (const sg of segs) {
      if (d <= acc + sg.len) {
        const f = (d - acc) / sg.len;
        const x = sg.x0 + (sg.x1 - sg.x0) * f;
        const y = sg.y0 + (sg.y1 - sg.y0) * f;
        ctx.beginPath();
        ctx.arc(x, y, 1.6 + 1.4 * intensity, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      acc += sg.len;
    }
  }
}
