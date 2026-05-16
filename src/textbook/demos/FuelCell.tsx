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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

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

  const stateRef = useRef({ i, V });
  useEffect(() => {
    stateRef.current = { i, V };
  }, [i, V]);

  const setup = useCallback((info: CanvasInfo) => {
    const colors = getCanvasColors();
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const s = stateRef.current;
      phase += 0.04;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Left half: cell schematic
      const splitX = W * 0.45;

      // Layout: H₂ inlet (left), anode, membrane, cathode, O₂ inlet (right of cell)
      const cellX = 30;
      const cellW = splitX - 50;
      const cellY = 40;
      const cellH = H - 80;

      const anodeW = cellW * 0.3;
      const membraneW = cellW * 0.16;
      const cathodeW = cellW * 0.3;
      const flowW = (cellW - anodeW - membraneW - cathodeW) / 2;

      let x = cellX;
      // H₂ channel
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = colors.blue;
      ctx.fillRect(x, cellY, flowW, cellH);
      ctx.restore();
      ctx.fillStyle = getCanvasColors().blue;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('H₂', x + flowW / 2, cellY + 4);
      x += flowW;

      // Anode catalyst
      ctx.fillStyle = '#444';
      ctx.fillRect(x, cellY, anodeW, cellH);
      ctx.fillStyle = getCanvasColors().text;
      ctx.fillText('anode', x + anodeW / 2, cellY + 4);
      x += anodeW;

      // Membrane (Nafion) — pink-ish wash
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(x, cellY, membraneW, cellH);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = colors.text;
      ctx.fillText('Nafion', x + membraneW / 2, cellY + 4);

      // H⁺ ions crossing membrane (anode → cathode)
      const ionCount = Math.max(0, Math.min(8, Math.floor(s.i * 6)));
      for (let j = 0; j < ionCount; j++) {
        const t = (phase + j * 0.2) % 1;
        const ix = x + t * membraneW;
        const iy = cellY + cellH * (0.2 + 0.7 * ((j * 0.31) % 1));
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H⁺', ix, iy);
      }

      x += membraneW;

      // Cathode catalyst
      ctx.restore();
      ctx.fillStyle = '#444';
      ctx.fillRect(x, cellY, cathodeW, cellH);
      ctx.fillStyle = getCanvasColors().text;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('cathode', x + cathodeW / 2, cellY + 4);
      x += cathodeW;

      // O₂ channel
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(x, cellY, flowW, cellH);
      ctx.restore();
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText('O₂', x + flowW / 2, cellY + 4);

      // Reaction labels at bottom
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('H₂ → 2H⁺ + 2e⁻', cellX, cellY + cellH + 6);
      ctx.textAlign = 'right';
      ctx.fillText('½O₂ + 2H⁺ + 2e⁻ → H₂O', cellX + cellW, cellY + cellH + 6);

      // Right half: polarization curve V vs i
      const pX = splitX + 16;
      const pY = 30;
      const pW = W - pX - 30;
      const pH = H - 60;
      ctx.restore();
      ctx.strokeStyle = getCanvasColors().border;
      ctx.strokeRect(pX, pY, pW, pH);

      const xI = (ii: number) => pX + (ii / I_LIMIT) * pW;
      const yV = (vv: number) => pY + pH - (vv / V_OCV) * pH;

      // Polarization curve
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let k = 0; k <= 80; k++) {
        const ii = (k / 80) * (I_LIMIT - 0.01);
        const vv = V_of_I(ii);
        const px = xI(ii);
        const py = yV(vv);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Operating point
      const opX = xI(s.i);
      const opY = yV(s.V);
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(opX, opY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('V (V)', pX, 4);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('i (A/cm²)', pX + pW, pY + pH + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

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
