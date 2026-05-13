/**
 * Demo D13.5 — Thévenin ↔ Norton equivalence
 *
 *   Source network (left): voltage source V_s in series with R_s, plus a
 *   bleeder R_p in parallel across the output terminals.
 *
 *      V_s ──[R_s]──+── terminal A
 *                   |
 *                   [R_p]
 *                   |
 *      ──────────── +── terminal B (ground)
 *
 *   Open-circuit voltage at AB:
 *       V_oc = V_s · R_p / (R_s + R_p)
 *   Thévenin resistance (V_s shorted):
 *       R_Th = R_s ∥ R_p = R_s R_p / (R_s + R_p)
 *   Norton equivalent:
 *       I_N  = V_oc / R_Th = V_s / R_s     (independent of R_p — short-circuit current)
 *       R_N  = R_Th
 *
 *   For an external load R_L, the terminal voltage is:
 *       V_L = V_oc · R_L / (R_Th + R_L)
 *   and the load current is:
 *       I_L = V_oc / (R_Th + R_L) = I_N · R_N / (R_N + R_L)
 *   The two equivalents give numerically identical V_L and I_L.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawCircuit, type CircuitElement } from '@/lib/canvasPrimitives';

interface Props { figure?: string }

export function NortonTheveninDemo({ figure }: Props) {
  const [Vs, setVs] = useState(12);
  const [Rs, setRs] = useState(4);
  const [Rp, setRp] = useState(12);
  const [RL, setRL] = useState(8);

  const V_oc = Vs * Rp / (Rs + Rp);
  const R_Th = (Rs * Rp) / (Rs + Rp);
  const I_N = V_oc / R_Th;                     // == Vs / Rs (algebraically)
  // Driven by Thévenin
  const I_L_T = V_oc / (R_Th + RL);
  const V_L_T = I_L_T * RL;
  // Driven by Norton (current divider)
  const I_L_N = I_N * R_Th / (R_Th + RL);
  const V_L_N = I_L_N * RL;

  const stateRef = useRef({ V_oc, R_Th, I_N, RL });
  useEffect(() => {
    stateRef.current = { V_oc, R_Th, I_N, RL };
  }, [V_oc, R_Th, I_N, RL]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { V_oc, R_Th, I_N, RL } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Three panels: original, Thévenin, Norton
      const colW = w / 3;
      drawOriginal(ctx, 0, 0, colW, h);
      drawThev(ctx, colW, 0, colW, h, V_oc, R_Th, RL);
      drawNort(ctx, 2 * colW, 0, colW, h, I_N, R_Th, RL);

      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath();
      ctx.moveTo(colW, 8); ctx.lineTo(colW, h - 8);
      ctx.moveTo(2 * colW, 8); ctx.lineTo(2 * colW, h - 8);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,107,42,0.85)';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⇌', colW, h * 0.45);
      ctx.fillText('⇌', 2 * colW, h * 0.45);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.5'}
      title="Thévenin ⇌ Norton — three networks, identical terminal behaviour"
      question="Connect the same load R_L to any of three networks; V_L and I_L agree."
      caption={<>
        The original network on the left contains a source, a series resistor, and a
        bleeder. The middle panel is its Thévenin equivalent: a single voltage source
        V<sub>Th</sub> = V<sub>oc</sub> in series with R<sub>Th</sub>. The right panel is
        the Norton equivalent: a current source I<sub>N</sub> = V<sub>Th</sub>/R<sub>Th</sub>
        in parallel with the same R<sub>N</sub> = R<sub>Th</sub>. From the outside, all
        three are indistinguishable for any linear load.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider label="V_s" value={Vs} min={1} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setVs} />
        <MiniSlider label="R_s" value={Rs} min={0.5} max={50} step={0.5}
          format={v => v.toFixed(1) + ' Ω'} onChange={setRs} />
        <MiniSlider label="R_p" value={Rp} min={0.5} max={100} step={0.5}
          format={v => v.toFixed(1) + ' Ω'} onChange={setRp} />
        <MiniSlider label="R_L" value={RL} min={0.5} max={100} step={0.5}
          format={v => v.toFixed(1) + ' Ω'} onChange={setRL} />
        <MiniReadout label="V_Th = V_oc" value={<Num value={V_oc} digits={3} />} unit="V" />
        <MiniReadout label="R_Th = R_N" value={<Num value={R_Th} digits={3} />} unit="Ω" />
        <MiniReadout label="I_N (short)" value={<Num value={I_N} digits={3} />} unit="A" />
        <MiniReadout label="V_L  (Thévenin)" value={<Num value={V_L_T} digits={3} />} unit="V" />
        <MiniReadout label="V_L  (Norton)" value={<Num value={V_L_N} digits={3} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}

function drawOriginal(
  ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number,
) {
  ctx.save();
  ctx.translate(x0, y0);
  ctx.fillStyle = 'rgba(160,158,149,0.85)';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Original network', w / 2, 12);

  const cy = h / 2;
  const xS = 26;
  const xR1 = 64;
  const xR2 = 112;
  const xA = w - 30;
  const yTop = cy - 50;
  const yBot = cy + 50;

  // Source network: V_s in series with R_s plus bleeder R_p across A–B.
  const elements: CircuitElement[] = [
    { kind: 'wire', points: [{ x: xS, y: yTop }, { x: xR1 - 18, y: yTop }] },
    { kind: 'resistor', from: { x: xR1 - 18, y: yTop }, to: { x: xR1 + 18, y: yTop },
      label: 'R_s', labelOffset: { x: 0, y: -10 } },
    { kind: 'wire', points: [{ x: xR1 + 18, y: yTop }, { x: xR2, y: yTop }, { x: xR2, y: cy - 18 }] },
    { kind: 'resistor', from: { x: xR2, y: cy - 18 }, to: { x: xR2, y: cy + 18 },
      label: 'R_p', labelOffset: { x: 10, y: 0 } },
    { kind: 'wire', points: [{ x: xR2, y: cy + 18 }, { x: xR2, y: yBot }] },
    { kind: 'wire', points: [{ x: xR2, y: yTop }, { x: xA, y: yTop }] },
    { kind: 'wire', points: [{ x: xS, y: yBot }, { x: xA, y: yBot }] },
    { kind: 'wire', points: [{ x: xS, y: yTop }, { x: xS, y: cy - 14 }] },
    { kind: 'wire', points: [{ x: xS, y: cy + 14 }, { x: xS, y: yBot }] },
    { kind: 'battery', at: { x: xS, y: cy }, label: 'V_s', leadLength: 50 },
    { kind: 'node', at: { x: xA, y: yTop }, radius: 4, color: 'rgba(255,107,42,0.95)',
      label: 'A', labelColor: 'rgba(255,255,255,0.9)', labelOffset: { x: 8, y: -2 } },
    { kind: 'node', at: { x: xA, y: yBot }, radius: 4, color: 'rgba(255,107,42,0.95)',
      label: 'B', labelColor: 'rgba(255,255,255,0.9)', labelOffset: { x: 8, y: -2 } },
  ];
  drawCircuit(ctx, { elements });
  ctx.restore();
}

function drawThev(
  ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number,
  Voc: number, RTh: number, RL: number,
) {
  ctx.save();
  ctx.translate(x0, y0);
  ctx.fillStyle = 'rgba(160,158,149,0.85)';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Thévenin equivalent + load', w / 2, 12);

  const cy = h / 2;
  const xS = 26;
  const xR = 70;
  const xA = w - 60;
  const xL = w - 30;
  const yTop = cy - 50;
  const yBot = cy + 50;

  // Thévenin equivalent: V_Th in series with R_Th feeding R_L.
  const elements: CircuitElement[] = [
    { kind: 'wire', points: [{ x: xS, y: yTop }, { x: xR - 18, y: yTop }] },
    { kind: 'resistor', from: { x: xR - 18, y: yTop }, to: { x: xR + 18, y: yTop },
      label: `R_Th=${RTh.toFixed(1)}Ω`, labelOffset: { x: 0, y: -10 } },
    { kind: 'wire', points: [{ x: xR + 18, y: yTop }, { x: xA, y: yTop }, { x: xA, y: cy - 18 }] },
    { kind: 'resistor', from: { x: xA, y: cy - 18 }, to: { x: xA, y: cy + 18 },
      label: `R_L=${RL.toFixed(1)}Ω`, labelOffset: { x: 10, y: 0 } },
    { kind: 'wire', points: [{ x: xA, y: cy + 18 }, { x: xA, y: yBot }, { x: xS, y: yBot }] },
    { kind: 'wire', points: [{ x: xS, y: yTop }, { x: xS, y: cy - 14 }] },
    { kind: 'wire', points: [{ x: xS, y: cy + 14 }, { x: xS, y: yBot }] },
    { kind: 'battery', at: { x: xS, y: cy }, label: `V_Th=${Voc.toFixed(2)}V`, leadLength: 50 },
    { kind: 'node', at: { x: xA, y: yTop }, radius: 4, color: 'rgba(255,107,42,0.95)',
      label: 'A', labelColor: 'rgba(255,255,255,0.9)', labelOffset: { x: 8, y: -2 } },
    { kind: 'node', at: { x: xA, y: yBot }, radius: 4, color: 'rgba(255,107,42,0.95)',
      label: 'B', labelColor: 'rgba(255,255,255,0.9)', labelOffset: { x: 8, y: -2 } },
  ];
  drawCircuit(ctx, { elements });
  // load-line marker
  void xL;
  ctx.restore();
}

function drawNort(
  ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number,
  IN: number, RN: number, RL: number,
) {
  ctx.save();
  ctx.translate(x0, y0);
  ctx.fillStyle = 'rgba(160,158,149,0.85)';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Norton equivalent + load', w / 2, 12);

  const cy = h / 2;
  const xS = 36;
  const xR = 84;
  const xA = w - 50;
  const yTop = cy - 50;
  const yBot = cy + 50;

  // Norton equivalent: I_N in parallel with R_N feeding R_L.
  const elements: CircuitElement[] = [
    { kind: 'wire', points: [{ x: xS, y: yTop }, { x: xS, y: cy - 18 }] },
    { kind: 'wire', points: [{ x: xS, y: cy + 18 }, { x: xS, y: yBot }] },
    { kind: 'currentSource', at: { x: xS, y: cy },
      label: `I_N=${IN.toFixed(2)}A`, labelOffset: { x: -20, y: 0 }, radius: 16 },
    { kind: 'wire', points: [{ x: xS, y: yTop }, { x: xR, y: yTop }, { x: xR, y: cy - 18 }] },
    { kind: 'resistor', from: { x: xR, y: cy - 18 }, to: { x: xR, y: cy + 18 },
      label: `R_N=${RN.toFixed(1)}Ω`, labelOffset: { x: 10, y: 0 } },
    { kind: 'wire', points: [{ x: xR, y: cy + 18 }, { x: xR, y: yBot }, { x: xS, y: yBot }] },
    { kind: 'wire', points: [{ x: xR, y: yTop }, { x: xA, y: yTop }, { x: xA, y: cy - 18 }] },
    { kind: 'resistor', from: { x: xA, y: cy - 18 }, to: { x: xA, y: cy + 18 },
      label: `R_L=${RL.toFixed(1)}Ω`, labelOffset: { x: 10, y: 0 } },
    { kind: 'wire', points: [{ x: xA, y: cy + 18 }, { x: xA, y: yBot }, { x: xR, y: yBot }] },
    { kind: 'node', at: { x: xA, y: yTop }, radius: 4, color: 'rgba(255,107,42,0.95)',
      label: 'A', labelColor: 'rgba(255,255,255,0.9)', labelOffset: { x: 8, y: -2 } },
    { kind: 'node', at: { x: xA, y: yBot }, radius: 4, color: 'rgba(255,107,42,0.95)',
      label: 'B', labelColor: 'rgba(255,255,255,0.9)', labelOffset: { x: 8, y: -2 } },
  ];
  drawCircuit(ctx, { elements });
  ctx.restore();
}
