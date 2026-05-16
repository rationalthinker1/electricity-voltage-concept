/**
 * Demo D12.7b — Superposition in a two-source linear network
 *
 *   Network: V1 — R1 — (node A) — R3 — (node B) — R2 — V2
 *            with R_m from node A to ground (and node B = top of V2).
 *
 *   We solve the simpler "bridge" topology:
 *       V1 in series with R1 feeds node A.
 *       V2 in series with R2 feeds node A from the other side.
 *       R3 from node A to ground.
 *
 *   By nodal analysis at A:   (V1 − V_A)/R1 + (V2 − V_A)/R2 = V_A/R3
 *       → V_A = (V1/R1 + V2/R2) / (1/R1 + 1/R2 + 1/R3)
 *
 *   With only V1 on (V2 = 0):
 *       V_A' = V1 / R1 · 1/(1/R1 + 1/R2 + 1/R3)
 *   With only V2 on (V1 = 0):
 *       V_A'' = V2 / R2 · 1/(1/R1 + 1/R2 + 1/R3)
 *
 *   And superposition says V_A = V_A' + V_A''. Branch currents follow:
 *       I_R1 = (V1 − V_A)/R1     etc.
 *
 *   The demo shows three side-by-side bar charts: V1-only, V2-only, both.
 *   The reader toggles which source is on; the "both" panel always shows
 *   the algebraic sum of the per-source contributions.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

interface Currents {
  V_A: number;
  I1: number;
  I2: number;
  I3: number;
}

function solve(V1: number, V2: number, R1: number, R2: number, R3: number): Currents {
  const G = 1 / R1 + 1 / R2 + 1 / R3;
  const V_A = (V1 / R1 + V2 / R2) / G;
  const I1 = (V1 - V_A) / R1;
  const I2 = (V2 - V_A) / R2;
  const I3 = V_A / R3;
  return { V_A, I1, I2, I3 };
}

export function SuperpositionDemo({ figure }: Props) {
  const [V1, setV1] = useState(9);
  const [V2, setV2] = useState(5);
  const [R1k, setR1k] = useState(1);
  const [R2k, setR2k] = useState(2);
  const [R3k, setR3k] = useState(1.5);
  const [v1on, setV1on] = useState(true);
  const [v2on, setV2on] = useState(true);

  const R1 = R1k * 1e3;
  const R2 = R2k * 1e3;
  const R3 = R3k * 1e3;

  const both = solve(v1on ? V1 : 0, v2on ? V2 : 0, R1, R2, R3);
  const onlyV1 = solve(V1, 0, R1, R2, R3);
  const onlyV2 = solve(0, V2, R1, R2, R3);

  const stateRef = useRef({ onlyV1, onlyV2, both, v1on, v2on });
  useEffect(() => {
    stateRef.current = { onlyV1, onlyV2, both, v1on, v2on };
  }, [
    onlyV1.V_A,
    onlyV1.I1,
    onlyV1.I2,
    onlyV1.I3,
    onlyV2.V_A,
    onlyV2.I1,
    onlyV2.I2,
    onlyV2.I3,
    both.V_A,
    both.I1,
    both.I2,
    both.I3,
    v1on,
    v2on,
  ]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { onlyV1, onlyV2, both, v1on, v2on } = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      const colW = w / 3;
      drawPanel(ctx, 0, 0, colW, h, 'V1 only (V2 → short)', onlyV1, 'rgba(255,59,110,0.85)');
      drawPanel(ctx, colW, 0, colW, h, 'V2 only (V1 → short)', onlyV2, 'rgba(91,174,248,0.85)');

      const label =
        v1on && v2on
          ? 'Both on (live)'
          : v1on
            ? 'Live: V1 only'
            : v2on
              ? 'Live: V2 only'
              : 'Both off';
      drawPanel(ctx, 2 * colW, 0, colW, h, label, both, 'rgba(255,107,42,0.95)');

      // Sum-arrow header
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('+', colW, 4);
      ctx.fillText('=', 2 * colW, 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.7b'}
      title="Superposition — the engine behind Thévenin"
      question="Turn V1 and V2 on independently. The live currents add up exactly."
      caption={
        <>
          A linear three-resistor bridge with two voltage sources. With V<sub>2</sub> shorted, V
          <sub>1</sub>
          alone produces some set of branch currents I'. With V<sub>1</sub> shorted, V<sub>2</sub>
          produces a different set I''. With both alive, every branch current is exactly I' + I'' —
          the algebraic sum. Superposition is what makes the entire chapter's complex-impedance
          machinery work, and it is the engine of the Thévenin theorem.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V₁"
          value={V1}
          min={0}
          max={20}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV1}
        />
        <MiniSlider
          label="V₂"
          value={V2}
          min={0}
          max={20}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV2}
        />
        <MiniSlider
          label="R₁"
          value={R1k}
          min={0.1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' kΩ'}
          onChange={setR1k}
        />
        <MiniSlider
          label="R₂"
          value={R2k}
          min={0.1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' kΩ'}
          onChange={setR2k}
        />
        <MiniSlider
          label="R₃"
          value={R3k}
          min={0.1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' kΩ'}
          onChange={setR3k}
        />
        <MiniToggle label={v1on ? 'V₁ on' : 'V₁ off'} checked={v1on} onChange={setV1on} />
        <MiniToggle label={v2on ? 'V₂ on' : 'V₂ off'} checked={v2on} onChange={setV2on} />
        <MiniReadout
          label="V_A (sum check)"
          value={<Num value={onlyV1.V_A + onlyV2.V_A} digits={3} />}
          unit="V"
        />
        <MiniReadout
          label="V_A (full solve)"
          value={<Num value={solve(V1, V2, R1, R2, R3).V_A} digits={3} />}
          unit="V"
        />
      </DemoControls>
    </Demo>
  );
}

/* ─── Panel: one source-state's bar chart of branch currents ──────────── */

function drawPanel(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  w: number,
  h: number,
  title: string,
  c: Currents,
  accent: string,
) {
  ctx.save();
  ctx.translate(x0, y0);

  const padL = 36,
    padR = 12,
    padT = 28,
    padB = 26;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // Title
  ctx.fillStyle = getCanvasColors().textDim;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(title, w / 2, 8);

  // Frame
  ctx.strokeStyle = getCanvasColors().border;
  ctx.strokeRect(padL, padT, plotW, plotH);

  // Find common scale across the three currents
  const Imax = Math.max(Math.abs(c.I1), Math.abs(c.I2), Math.abs(c.I3), 1e-6);
  const yMid = padT + plotH / 2;
  const yOf = (I: number) => yMid - (I / Imax) * (plotH / 2 - 6);

  // Zero line
  ctx.strokeStyle = getCanvasColors().borderStrong;
  ctx.beginPath();
  ctx.moveTo(padL, yMid);
  ctx.lineTo(padL + plotW, yMid);
  ctx.stroke();

  // Three vertical bars: I1, I2, I3
  const labels = ['I₁', 'I₂', 'I₃'];
  const values = [c.I1, c.I2, c.I3];
  const barW = Math.min(18, plotW / 6);
  const slots = 3;

  for (let i = 0; i < slots; i++) {
    const xC = padL + ((i + 0.5) / slots) * plotW;
    const y0b = yMid;
    const y1b = yOf(values[i]);
    const top = Math.min(y0b, y1b);
    const hgt = Math.max(Math.abs(y1b - y0b), 1);
    ctx.fillStyle = accent;
    ctx.fillRect(xC - barW / 2, top, barW, hgt);

    ctx.fillStyle = getCanvasColors().text;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labels[i], xC, padT + plotH + 4);
    ctx.textBaseline = values[i] >= 0 ? 'bottom' : 'top';
    const ly = values[i] >= 0 ? top - 2 : top + hgt + 2;
    ctx.fillText(`${(values[i] * 1000).toFixed(2)} mA`, xC, ly);
  }

  // Scale ticks
  ctx.fillStyle = 'rgba(160,158,149,0.65)';
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+${(Imax * 1000).toFixed(2)} mA`, padL - 4, yOf(Imax));
  ctx.fillText('0', padL - 4, yMid);
  ctx.fillText(`−${(Imax * 1000).toFixed(2)} mA`, padL - 4, yOf(-Imax));

  // V_A annotation
  ctx.fillStyle = getCanvasColors().accent;
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`V_A = ${c.V_A.toFixed(3)} V`, padL, padT + 4);

  ctx.restore();
}
