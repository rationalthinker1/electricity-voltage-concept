/**
 * Demo D6.1 — Where does the energy flow?
 *
 * A schematic battery + bulb circuit. The reader toggles between two
 * pictures of where the energy goes from the battery to the bulb:
 *
 *   "Old picture" — electrons stream along the wire from + terminal
 *     to bulb to − terminal, carrying energy with them. (Wrong.)
 *   "Real picture" — energy lives in the field outside the wire and
 *     flows in radially through the bulb's surrounding space. The
 *     wire just guides the field. (Right.)
 *
 * No sliders; this is a contrast viz. The whole point is the side-by-side
 * mental flip when you switch the toggle.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { drawCircuit, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useCanvasCache } from '@/lib/useCanvasCache';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

interface Carrier {
  s: number;
  jitter: number;
}
interface Inflow {
  theta: number;
  r: number;
}

interface SimCtx {
  batteryX: number;
  bulbX: number;
  cyTop: number;
  cyBot: number;
  bulbR: number;
  carriers: Carrier[];
  inflow: Inflow[];
  pointAt(s: number): [number, number];
  spawnInflow(): void;
}

export function WhereDoesEnergyFlowDemo({ figure }: Props) {
  const [realPicture, setRealPicture] = useState(false);

  const stateRef = useSimState({ realPicture });

  // Static backdrop: loop wire + battery + polarity glyphs + bulb glass /
  // glow / filament squiggle. Doesn't fit useCircuitCache because the bulb's
  // radial gradient + 60-point filament polyline aren't expressible as
  // CircuitElement[]. Stays static across all React state — no deps.
  const getStatic = useCanvasCache((octx, sw, sh, _dpr) => {
    const batteryX = 90;
    const bulbX = sw - 100;
    const cyTop = sh * 0.32;
    const cyBot = sh * 0.78;
    const bulbR = 30;
    const path: Array<[number, number]> = [
      [batteryX + 18, cyTop],
      [bulbX - bulbR, cyTop],
      [bulbX, cyTop],
      [bulbX, cyBot],
      [bulbX - bulbR, cyBot],
      [batteryX + 18, cyBot],
    ];
    const wirePath = path.map(([x, y]) => ({ x, y }));

    const colors = getCanvasColors();
    const schematic: CircuitElement[] = [
      {
        kind: 'wire',
        points: wirePath,
        color: withAlpha(colors.accent, 0.55),
        lineWidth: 3.5,
      },
      {
        kind: 'battery',
        at: { x: batteryX, y: (cyTop + cyBot) / 2 },
        color: withAlpha(colors.text, 0),
        label: 'battery',
        labelOffset: { x: 0, y: 0 },
        leadLength: (cyBot - cyTop) / 2,
        negativeColor: colors.text,
        negativePlateLength: 20,
        plateGap: (cyBot - cyTop) / 2,
        positiveColor: colors.text,
        positivePlateLength: 36,
      },
    ];
    drawCircuit(octx, { elements: schematic });

    // Battery polarity glyphs.
    octx.fillStyle = colors.pink;
    octx.font = 'bold 16px "JetBrains Mono", monospace';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText('+', batteryX - 30, cyTop);
    octx.fillStyle = colors.blue;
    octx.fillText('−', batteryX - 30, cyBot);

    // Bulb (glow halo, glass envelope, filament squiggle, label).
    const cy = (cyTop + cyBot) / 2;
    const glow = octx.createRadialGradient(bulbX, cy, 0, bulbX, cy, bulbR * 2.6);
    glow.addColorStop(0, withAlpha(colors.accent, 0.35));
    glow.addColorStop(1, withAlpha(colors.accent, 0));
    octx.fillStyle = glow;
    octx.beginPath();
    octx.arc(bulbX, cy, bulbR * 2.6, 0, Math.PI * 2);
    octx.fill();
    octx.strokeStyle = withAlpha(colors.accent, 0.85);
    octx.lineWidth = 1.5;
    octx.beginPath();
    octx.arc(bulbX, cy, bulbR, 0, Math.PI * 2);
    octx.stroke();
    octx.strokeStyle = withAlpha(colors.accent, 0.95);
    octx.lineWidth = 1.8;
    octx.beginPath();
    const turns = 6;
    for (let i = 0; i <= 60; i++) {
      const f = i / 60;
      const yy = cyTop + 8 + (cyBot - cyTop - 16) * f;
      const xx = bulbX + Math.sin(f * turns * Math.PI) * 8;
      if (i === 0) octx.moveTo(xx, yy);
      else octx.lineTo(xx, yy);
    }
    octx.stroke();
    octx.fillStyle = withAlpha(colors.accent, 0.85);
    octx.font = '10px "JetBrains Mono", monospace';
    octx.textAlign = 'center';
    octx.textBaseline = 'top';
    octx.fillText('bulb', bulbX, cy + bulbR + 8);
  }, []);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, dpr, colors }, state, _dt, _simT, context: SimCtx) => {
      const { realPicture } = state;
      const { batteryX: _batteryX, bulbX, cyTop, cyBot, bulbR, carriers, inflow, pointAt, spawnInflow } = context;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const off = getStatic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Per-frame overlay: header label whose color and text toggle with the picture mode.
      drawLabel(ctx, {
        x: 18,
        y: 14,
        text: realPicture
          ? 'Real picture — energy flows through the field, into the bulb from outside'
          : 'Old picture — electrons stream along the wire, carrying energy',
        color: realPicture ? colors.accent : colors.textDim,
        size: 11,
        baseline: 'top',
      });

      if (!realPicture) {
        // Old picture: carriers drifting along the loop.
        ctx.fillStyle = colors.blue;
        for (const c of carriers) {
          c.s += 0.0025;
          if (c.s > 1) c.s -= 1;
          const [px, py] = pointAt(c.s);
          // perp jitter using path tangent
          const [px2, py2] = pointAt((c.s + 0.001) % 1);
          const tx = px2 - px,
            ty = py2 - py;
          const len = Math.hypot(tx, ty) || 1;
          const nx = -ty / len,
            ny = tx / len;
          const x = px + nx * c.jitter;
          const y = py + ny * c.jitter;
          ctx.beginPath();
          ctx.arc(x, y, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Real picture: field arrows streaming inward toward the bulb.
        const cy = (cyTop + cyBot) / 2;
        spawnInflow();
        for (let i = inflow.length - 1; i >= 0; i--) {
          const p = inflow[i]!;
          p.r -= 0.012;
          if (p.r <= 0.0) {
            inflow.splice(i, 1);
            continue;
          }
          const distFar = bulbR + p.r * bulbR * 5;
          const distNear = bulbR + Math.max(0, p.r - 0.05) * bulbR * 5;
          const fx = bulbX + Math.cos(p.theta) * distFar;
          const fy = cy + Math.sin(p.theta) * distFar;
          const tx = bulbX + Math.cos(p.theta) * distNear;
          const ty = cy + Math.sin(p.theta) * distNear;
          const alpha = 0.9 * (1 - p.r * 0.4);
          ctx.strokeStyle = withAlpha(colors.accent, alpha);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.fillStyle = withAlpha(colors.accent, alpha);
          ctx.beginPath();
          ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    [getStatic],
    (info) => {
      const { w, h } = info;
      const batteryX = 90;
      const bulbX = w - 100;
      const cyTop = h * 0.32;
      const cyBot = h * 0.78;
      const bulbR = 30;

      const path: Array<[number, number]> = [
        [batteryX + 18, cyTop],
        [bulbX - bulbR, cyTop],
        [bulbX, cyTop],
        [bulbX, cyBot],
        [bulbX - bulbR, cyBot],
        [batteryX + 18, cyBot],
      ];
      const segLen: number[] = [];
      let totalLen = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i]!;
        const b = path[i + 1]!;
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        segLen.push(d);
        totalLen += d;
      }
      function pointAt(s: number): [number, number] {
        let dist = s * totalLen;
        for (let i = 0; i < segLen.length; i++) {
          if (dist <= segLen[i]!) {
            const a = path[i]!;
            const b = path[i + 1]!;
            const f = dist / segLen[i]!;
            return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
          }
          dist -= segLen[i]!;
        }
        const last = path[path.length - 1]!;
        return [last[0], last[1]];
      }

      const carriers: Carrier[] = [];
      for (let i = 0; i < 60; i++) {
        carriers.push({ s: i / 60, jitter: (Math.random() - 0.5) * 4 });
      }
      const inflow: Inflow[] = [];
      const MAX_INFLOW = 90;
      function spawnInflow() {
        while (inflow.length < MAX_INFLOW) {
          inflow.push({
            theta: Math.random() * Math.PI * 2,
            r: 1.0 + Math.random() * 0.4,
          });
        }
      }

      return { context: { batteryX, bulbX, cyTop, cyBot, bulbR, carriers, inflow, pointAt, spawnInflow } };
    },
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 8.1'}
      title="Where does the energy go?"
      question="From battery to bulb — does the energy travel through the wire, or through the space around it?"
      caption={
        <>
          Toggle the picture. In the <strong>old</strong> view, energy hitches a ride on the
          drifting electrons and rides along the copper. In the <strong>real</strong> view, energy
          lives in the electromagnetic field that fills the surrounding space, and pours radially
          inward into the resistive parts (here, the bulb's filament) on every side at once. The
          rest of the chapter is the proof.
        </>
      }
      deeperLab={{ slug: 'poynting', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={realPicture ? 'Real picture (field inflow)' : 'Old picture (electrons carry it)'}
          checked={realPicture}
          onChange={setRealPicture}
        />
      </DemoControls>
      <EquationStrip
        leftLabel="Old picture"
        left={<InlineMath tex={`P = I^2 R`} />}
        rightLabel="Real picture"
        right={
          <InlineMath
            tex={`\\vec{S} = \\dfrac{1}{\\mu_0} \\vec{E} \\times \\vec{B}`}
          />
        }
      />
    </Demo>
  );
}
