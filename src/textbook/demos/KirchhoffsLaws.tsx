/**
 * Demo D10.1 — Kirchhoff's laws on a two-loop network
 *
 * Network: a single battery V drives a circuit with three resistors arranged
 * so that two loops share a middle branch carrying R2.
 *
 *      +─R1──A──R3──+
 *      │      │     │
 *      V      R2    │
 *      │      │     │
 *      +──────B─────+
 *
 * KVL (left loop):  V − I1 R1 − I2 R2 = 0
 * KVL (right loop): I2 R2 − I3 R3 = 0
 * KCL (node A):     I1 = I2 + I3
 *
 * Solving:
 *   R_par = R2 R3 / (R2 + R3)
 *   I1    = V / (R1 + R_par)
 *   V_AB  = I1 · R_par
 *   I2    = V_AB / R2
 *   I3    = V_AB / R3
 *
 * Toggles overlay either KCL counts at node A or KVL drops around either loop.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { fmtCurrent } from '@/lib/formatters';
import { useCircuitCache } from '@/lib/useCircuitCache';

interface Props {
  figure?: string;
}

export function KirchhoffsLawsDemo({ figure }: Props) {
  const [V, setV] = useState(12);
  const [R1, setR1] = useState(10);
  const [R2, setR2] = useState(20);
  const [R3, setR3] = useState(30);
  const [showKCL, setShowKCL] = useState(false);
  const [showKVL, setShowKVL] = useState(false);

  const stateRef = useRef({ V, R1, R2, R3, showKCL, showKVL, t: 0 });
  useEffect(() => {
    stateRef.current = { ...stateRef.current, V, R1, R2, R3, showKCL, showKVL };
  }, [V, R1, R2, R3, showKCL, showKVL]);

  const Rpar = (R2 * R3) / (R2 + R3);
  const I1 = V / (R1 + Rpar);
  const VAB = I1 * Rpar;
  const I2 = VAB / R2;
  const I3 = VAB / R3;

  const colors = getCanvasColors();
  const getStaticSchematic = useCircuitCache(
    (sw, sh, _dpr) => {
      const padX = 60;
      const yTop = sh / 2 - 60;
      const yBot = sh / 2 + 60;
      const batX = padX;
      const outX = sw - padX;
      const nodeA_x = padX + (outX - padX) * 0.55;
      const nodeB_x = nodeA_x;
      const xR1 = padX + (nodeA_x - padX) * 0.3;
      const xR3 = nodeA_x + (outX - nodeA_x) * 0.5;
      const elements: CircuitElement[] = [
        {
          kind: 'wire',
          points: [
            { x: batX, y: yTop },
            { x: xR1 - 22, y: yTop },
          ],
        },
        {
          kind: 'resistor',
          from: { x: xR1 - 20, y: yTop },
          to: { x: xR1 + 20, y: yTop },
          label: `R1=${R1.toFixed(0)}Ω`,
          labelOffset: { x: 0, y: -12 },
        },
        {
          kind: 'wire',
          points: [
            { x: xR1 + 22, y: yTop },
            { x: nodeA_x, y: yTop },
          ],
        },
        {
          kind: 'wire',
          points: [
            { x: nodeA_x, y: yTop },
            { x: xR3 - 22, y: yTop },
          ],
        },
        {
          kind: 'resistor',
          from: { x: xR3 - 20, y: yTop },
          to: { x: xR3 + 20, y: yTop },
          label: `R3=${R3.toFixed(0)}Ω`,
          labelOffset: { x: 0, y: -12 },
        },
        {
          kind: 'wire',
          points: [
            { x: xR3 + 22, y: yTop },
            { x: outX, y: yTop },
            { x: outX, y: yBot },
            { x: nodeB_x, y: yBot },
            { x: batX, y: yBot },
          ],
        },
        {
          kind: 'wire',
          points: [
            { x: nodeA_x, y: yTop },
            { x: nodeA_x, y: sh / 2 - 22 },
          ],
        },
        {
          kind: 'resistor',
          from: { x: nodeA_x, y: sh / 2 - 20 },
          to: { x: nodeA_x, y: sh / 2 + 20 },
          label: `R2=${R2.toFixed(0)}Ω`,
          labelOffset: { x: 12, y: 0 },
        },
        {
          kind: 'wire',
          points: [
            { x: nodeA_x, y: sh / 2 + 22 },
            { x: nodeA_x, y: yBot },
          ],
        },
        {
          kind: 'battery',
          at: { x: batX, y: sh / 2 },
          label: `${V.toFixed(1)} V`,
          leadLength: 60,
        },
        { kind: 'node', at: { x: nodeA_x, y: yTop }, color: withAlpha(colors.accent, 0.95) },
        { kind: 'node', at: { x: nodeB_x, y: yBot }, color: withAlpha(colors.accent, 0.95) },
      ];
      return { elements };
    },
    [V, R1, R2, R3, colors.accent],
  );

  const setup = useCallback(
    (info: CanvasInfo) => {
      const colors = getCanvasColors();
      const { ctx, w, h, dpr } = info;
      let raf = 0;

      function draw() {
        const st = stateRef.current;
        st.t += 0.016;
        const { V, R1, R2, R3, showKCL, showKVL, t } = st;

        const Rpar = (R2 * R3) / (R2 + R3);
        const I1 = V / (R1 + Rpar);
        const VAB = I1 * Rpar;
        const I2 = VAB / R2;
        const I3 = VAB / R3;

        ctx.fillStyle = getCanvasColors().bg;
        ctx.fillRect(0, 0, w, h);

        const padX = 60;
        const yTop = h / 2 - 60;
        const yBot = h / 2 + 60;
        const batX = padX;
        const outX = w - padX;
        const nodeA_x = padX + (outX - padX) * 0.55;
        const nodeB_x = nodeA_x;

        const off = getStaticSchematic(w, h, dpr);
        if (off) ctx.drawImage(off, 0, 0, w, h);

        // Dynamic overlay: node identifier letters above each junction.
        ctx.save();
        ctx.globalAlpha = 0.8;
        drawLabel(ctx, { text: 'A', x: nodeA_x + 6, y: yTop - 4, color: colors.text, weight: 'bold', size: 11, font: 'bold 11px "JetBrains Mono", monospace', baseline: 'bottom' });
        drawLabel(ctx, { text: 'B', x: nodeB_x + 6, y: yBot + 6, color: colors.text, weight: 'bold', size: 11, font: 'bold 11px "JetBrains Mono", monospace', baseline: 'top' });

        // Dynamic overlay: animated current dots crawling along each branch.
        const maxI = Math.max(I1, 1e-9);
        // I1 across the top from battery to A
        drawCurrentDotsPath(
          ctx,
          t,
          [
            { x: batX, y: yTop },
            { x: nodeA_x, y: yTop },
          ],
          I1 / maxI,
        );
        // I3 from A to right then down and across bottom back to B
        drawCurrentDotsPath(
          ctx,
          t,
          [
            { x: nodeA_x, y: yTop },
            { x: outX, y: yTop },
            { x: outX, y: yBot },
            { x: nodeB_x, y: yBot },
          ],
          I3 / maxI,
        );
        // I2 down the middle from A to B
        drawCurrentDotsPath(
          ctx,
          t,
          [
            { x: nodeA_x, y: yTop },
            { x: nodeA_x, y: yBot },
          ],
          I2 / maxI,
        );
        // I1 back along the bottom from B to battery
        drawCurrentDotsPath(
          ctx,
          t,
          [
            { x: nodeB_x, y: yBot },
            { x: batX, y: yBot },
          ],
          I1 / maxI,
        );

        // Dynamic overlay: live current readouts next to each branch.
        ctx.restore();
        ctx.fillStyle = getCanvasColors().blue;
        drawLabel(ctx, { text: `I₁ = ${fmtCurrent(I1)}`, x: (batX + nodeA_x) / 2, y: yTop - 8, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
        drawLabel(ctx, { text: `I₃ = ${fmtCurrent(I3)}`, x: (nodeA_x + outX) / 2, y: yTop - 8, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
        drawLabel(ctx, { text: `I₂ = ${fmtCurrent(I2)}`, x: nodeA_x + 26, y: h / 2, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });

        // Dynamic overlay: KCL / KVL annotation boxes (toggled by the controls).
        if (showKCL) {
          // Highlight node A with a ring + show I1 = I2 + I3 box
          ctx.strokeStyle = getCanvasColors().accent;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(nodeA_x, yTop, 14, 0, Math.PI * 2);
          ctx.stroke();

          const boxX = 12;
          const boxY = h - 64;
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = colors.accent;
          ctx.fillRect(boxX, boxY, 230, 50);
          ctx.restore();
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = colors.accent;
          ctx.strokeRect(boxX, boxY, 230, 50);
          ctx.restore();
          ctx.fillStyle = getCanvasColors().accent;
          drawLabel(ctx, { text: 'KCL at node A:', x: boxX + 8, y: boxY + 6, weight: 'bold', font: 'bold 10px "JetBrains Mono", monospace', baseline: 'top' });
          drawLabel(ctx, {
            x: boxX + 8,
            y: boxY + 22,
            text: `I₁ = I₂ + I₃`,
            color: getCanvasColors().text,
            size: 11,
          });
          drawLabel(ctx, {
            x: boxX + 8,
            y: boxY + 36,
            text: `${fmtCurrent(I1)} = ${fmtCurrent(I2)} + ${fmtCurrent(I3)} ✓`,
            color: getCanvasColors().textDim,
          });
        }

        if (showKVL) {
          // Show both loop equations
          const boxX = w - 270;
          const boxY = h - 96;
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = colors.teal;
          ctx.fillRect(boxX, boxY, 258, 82);
          ctx.restore();
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = colors.teal;
          ctx.strokeRect(boxX, boxY, 258, 82);

          ctx.restore();
          ctx.fillStyle = getCanvasColors().teal;
          drawLabel(ctx, { text: 'KVL loops (sum of drops = 0):', x: boxX + 8, y: boxY + 6, weight: 'bold', font: 'bold 10px "JetBrains Mono", monospace', baseline: 'top' });
          ctx.fillStyle = getCanvasColors().text;
          drawLabel(ctx, { text: `Left:  V − I₁R₁ − I₂R₂ = 0`, x: boxX + 8, y: boxY + 22, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
          drawLabel(ctx, { text: `Right: I₂R₂ − I₃R₃ = 0`, x: boxX + 8, y: boxY + 36, font: '10px "JetBrains Mono", monospace', baseline: 'top' });

          const drop1 = I1 * R1;
          const drop2 = I2 * R2;
          const drop3 = I3 * R3;
          const lhsL = V - drop1 - drop2;
          const lhsR = drop2 - drop3;
          ctx.fillStyle = getCanvasColors().textDim;
          drawLabel(ctx, { text: `${V.toFixed(2)} − ${drop1.toFixed(2)} − ${drop2.toFixed(2)} = ${lhsL.toFixed(3)} ✓`, x: boxX + 8, y: boxY + 52, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
          drawLabel(ctx, { text: `${drop2.toFixed(2)} − ${drop3.toFixed(2)} = ${lhsR.toFixed(3)} ✓`, x: boxX + 8, y: boxY + 66, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
        }

        // Dynamic overlay: top-corner caption text.
        drawLabel(ctx, {
          x: 12,
          y: 10,
          text: 'Two-loop network: R₁ in series with (R₂ ∥ R₃)',
          color: getCanvasColors().textDim,
          baseline: 'top',
        });

        raf = requestAnimationFrame(draw);
      }
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    },
    [getStaticSchematic],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 10.1'}
      title="Kirchhoff's two laws on a two-loop network"
      question="Toggle KCL / KVL — every equation balances, every time."
      caption={
        <>
          One battery, three resistors. The middle branch (R₂) is shared between two loops.
          Kirchhoff's current law says everything flowing into node A must flow out; Kirchhoff's
          voltage law says the sum of drops around any closed loop is zero. Together they give three
          equations in three unknowns — enough to solve any DC circuit.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V"
          value={V}
          min={1}
          max={48}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniSlider
          label="R₁"
          value={R1}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR1}
        />
        <MiniSlider
          label="R₂"
          value={R2}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR2}
        />
        <MiniSlider
          label="R₃"
          value={R3}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR3}
        />
        <MiniToggle
          label={showKCL ? 'KCL: on' : 'KCL: off'}
          checked={showKCL}
          onChange={setShowKCL}
        />
        <MiniToggle
          label={showKVL ? 'KVL: on' : 'KVL: off'}
          checked={showKVL}
          onChange={setShowKVL}
        />
        <MiniReadout label="I₁" value={<Num value={I1} />} unit="A" />
        <MiniReadout label="I₂" value={<Num value={I2} />} unit="A" />
        <MiniReadout label="I₃" value={<Num value={I3} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}

function drawCurrentDotsPath(
  ctx: CanvasRenderingContext2D,
  t: number,
  pts: Array<{ x: number; y: number }>,
  Iscale: number,
) {
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
  const spacing = 26;
  const speed = 80;
  const offset = (t * speed) % spacing;
  const intensity = Math.max(0.15, Math.min(1, Iscale));
  ctx.fillStyle = `rgba(91,174,248,${0.4 + 0.5 * intensity})`;
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
        ctx.arc(x, y, 1.6 + 1.6 * intensity, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      acc += sg.len;
    }
  }
}
