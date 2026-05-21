/**
 * Demo 19.5 — PEM fuel cell
 *
 * H₂ feeds the anode; O₂ feeds the cathode; protons cross the Nafion
 * membrane; electrons take the external circuit; water is the product.
 *
 * Polarization curve V(I) drops with current — activation loss at low I,
 * ohmic in the middle, mass-transport at the top. Reader sweeps the load
 * current and sees the voltage drop.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawAxes, drawLinePlot, makePlotMappers } from '@/lib/drawPlot';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

const V_OCV = 1.0; // open-circuit volts (theoretical max ~1.23 V; practical ~1.0 V)
const I_LIMIT = 1.8; // limiting current density A/cm²

// Phenomenological polarization curve: activation + ohmic + mass-transport.
function V_of_I(i: number): number {
  const i_clipped = Math.max(0, Math.min(i, I_LIMIT - 0.001));
  const eta_act = 0.06 * Math.log(1 + i_clipped / 0.01); // activation
  const r_ohm = 0.18; // Ω·cm²
  const eta_ohm = r_ohm * i_clipped; // ohmic
  const eta_mass = -0.05 * Math.log(1 - i_clipped / I_LIMIT); // mass transport (rises steeply near limit)
  return Math.max(0, V_OCV - eta_act - eta_ohm - eta_mass);
}

export function FuelCellDemo({ figure }: Props) {
  const [i, setI] = useState(0.6); // A/cm²
  const V = V_of_I(i);
  const P = V * i; // power density W/cm²

  const stateRef = useSimState({ i, V });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const s = stateRef.current;
      phase += 0.04;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const splitX = W * 0.45;
      const cellX = 30;
      const cellW = splitX - 50;
      const cellY = 40;
      const cellH = H - 80;
      const anodeW = cellW * 0.3;
      const membraneW = cellW * 0.16;
      const cathodeW = cellW * 0.3;
      const flowW = (cellW - anodeW - membraneW - cathodeW) / 2;
      let x = cellX;
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = colors.blue;
      ctx.fillRect(x, cellY, flowW, cellH);
      ctx.restore();
      drawLabel(ctx, { text: 'H₂', x: x + flowW / 2, y: cellY + 4, color: colors.blue, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      x += flowW;
      ctx.fillStyle = '#444';
      ctx.fillRect(x, cellY, anodeW, cellH);
      drawLabel(ctx, { text: 'anode', x: x + anodeW / 2, y: cellY + 4, color: colors.text });
      x += anodeW;
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(x, cellY, membraneW, cellH);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.85;
      drawLabel(ctx, { text: 'Nafion', x: x + membraneW / 2, y: cellY + 4, color: colors.text });
      const ionCount = Math.max(0, Math.min(8, Math.floor(s.i * 6)));
      for (let j = 0; j < ionCount; j++) {
        const t = (phase + j * 0.2) % 1;
        const ix = x + t * membraneW;
        const iy = cellY + cellH * (0.2 + 0.7 * ((j * 0.31) % 1));
        drawLabel(ctx, {
          x: ix,
          y: iy,
          text: 'H⁺',
          color: colors.text,
          size: 9,
          align: 'center',
          baseline: 'middle',
          weight: 'bold',
        });
      }
      x += membraneW;
      ctx.restore();
      ctx.fillStyle = '#444';
      ctx.fillRect(x, cellY, cathodeW, cellH);
      drawLabel(ctx, { text: 'cathode', x: x + cathodeW / 2, y: cellY + 4, color: colors.text, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      x += cathodeW;
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(x, cellY, flowW, cellH);
      ctx.restore();
      drawLabel(ctx, { text: 'O₂', x: x + flowW / 2, y: cellY + 4, color: colors.accent });
      ctx.save();
      ctx.globalAlpha = 0.75;
      drawLabel(ctx, { text: 'H₂ → 2H⁺ + 2e⁻', x: cellX, y: cellY + cellH + 6, size: 9, font: '9px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: '½O₂ + 2H⁺ + 2e⁻ → H₂O', x: cellX + cellW, y: cellY + cellH + 6, align: 'right' });
      const pX = splitX + 16;
      const pY = 30;
      const pW = W - pX - 30;
      const pH = H - 60;
      ctx.restore();
      const rect = { x: pX, y: pY, w: pW, h: pH };
      // Original demo draws only the frame (no tick grid, no tick labels);
      // pass empty tick arrays to keep the same visual.
      drawAxes(ctx, rect, {
        xMin: 0,
        xMax: I_LIMIT,
        yMin: 0,
        yMax: V_OCV,
        xTicks: [],
        yTicks: [],
      });
      const { xOf: xI, yOf: yV } = makePlotMappers(rect, 0, I_LIMIT, 0, V_OCV);

      const curvePts: { x: number; y: number }[] = [];
      for (let k = 0; k <= 80; k++) {
        const ii = (k / 80) * (I_LIMIT - 0.01);
        curvePts.push({ x: ii, y: V_of_I(ii) });
      }
      drawLinePlot(ctx, rect, curvePts, 0, I_LIMIT, 0, V_OCV, {
        color: colors.teal,
        lineWidth: 1.8,
      });

      const opX = xI(s.i);
      const opY = yV(s.V);
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(opX, opY, 5, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, { text: 'V (V)', x: pX, y: 4, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: 'i (A/cm²)', x: pX + pW, y: pY + pH + 4, align: 'right', baseline: 'top' });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 19.5'}
      title="PEM fuel cell"
      question="A battery you keep refilling — how does it actually run?"
      caption={
        <>
          H₂ splits at the anode (<em>H₂ → 2H⁺ + 2e⁻</em>); the electrons go through the external
          load; the protons cross the Nafion membrane to the cathode where they combine with O₂ to
          form water. Theoretical open-circuit voltage is 1.23 V; practical cells start at ~1.0 V
          and drop with current as activation, ohmic, and mass-transport losses stack up.
        </>
      }
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="i"
          value={i}
          min={0.01}
          max={I_LIMIT - 0.05}
          step={0.01}
          format={(v) => v.toFixed(2) + ' A/cm²'}
          onChange={setI}
        />
        <MiniReadout label="V_cell" value={<Num value={V} />} unit="V" />
        <MiniReadout label="P density" value={<Num value={P} />} unit="W/cm²" />
      </DemoControls>
    </Demo>
  );
}
