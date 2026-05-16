/**
 * Demo 18.2 — Daniell cell (1836)
 *
 * Zn rod in ZnSO₄ / Cu rod in CuSO₄, porous separator between them.
 * Reader connects a load resistor; current flows; Zn rod erodes, Cu rod
 * grows. Voltage reads ~1.10 V open-circuit and droops with load.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

const V_OC = 1.1; // V open-circuit
const R_INT = 1.0; // Ω internal resistance (a rough Daniell number)

export function DaniellCellDemo({ figure }: Props) {
  const [loaded, setLoaded] = useState(true);
  const [R_L, setR_L] = useState(10);
  const [erosion, setErosion] = useState(0); // 0..1 progress

  const I = loaded ? V_OC / (R_INT + R_L) : 0;
  const V_term = loaded ? (V_OC * R_L) / (R_INT + R_L) : V_OC;

  // Slowly advance erosion when loaded
  useEffect(() => {
    if (!loaded) return;
    const id = window.setInterval(() => {
      setErosion((e) => Math.min(1, e + I * 0.02));
    }, 80);
    return () => window.clearInterval(id);
  }, [loaded, I]);

  const stateRef = useRef({ loaded, V_term, I, erosion });
  useEffect(() => {
    stateRef.current = { loaded, V_term, I, erosion };
  }, [loaded, V_term, I, erosion]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const s = stateRef.current;
      phase += 0.04;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Two beakers side by side
      const beakerW = Math.min(160, (W - 80) / 2);
      const beakerH = H - 90;
      const beakerY = 60;
      const leftX = W / 2 - beakerW - 12;
      const rightX = W / 2 + 12;

      drawBeaker(ctx, leftX, beakerY, beakerW, beakerH, 'rgba(91,174,248,0.18)', 'ZnSO₄');
      drawBeaker(ctx, rightX, beakerY, beakerW, beakerH, 'rgba(255,107,42,0.18)', 'CuSO₄');

      // Porous separator (vertical bar between)
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillRect(W / 2 - 6, beakerY + 20, 12, beakerH - 30);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('porous', W / 2, beakerY + beakerH - 8);

      // Zn rod (erodes — narrows as erosion ↑)
      const znRodWBase = 16;
      const znRodW = znRodWBase * (1 - 0.5 * s.erosion);
      const rodX_Zn = leftX + beakerW / 2 - znRodW / 2;
      ctx.fillStyle = '#c4c8cc';
      ctx.fillRect(rodX_Zn, beakerY + 10, znRodW, beakerH - 30);
      ctx.fillStyle = 'rgba(196,200,204,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Zn', leftX + beakerW / 2, beakerY - 6);

      // Cu rod (grows — widens as erosion ↑, with bumpy crystals on it)
      const cuRodW = 16 + 12 * s.erosion;
      const rodX_Cu = rightX + beakerW / 2 - cuRodW / 2;
      ctx.fillStyle = '#b87333';
      ctx.fillRect(rodX_Cu, beakerY + 10, cuRodW, beakerH - 30);
      // Crystal nodules
      if (s.erosion > 0.05) {
        ctx.fillStyle = '#d18a4a';
        for (let i = 0; i < Math.floor(s.erosion * 18); i++) {
          const cy = beakerY + 14 + Math.random() * (beakerH - 36);
          const cxOffset = (Math.random() - 0.5) * cuRodW;
          ctx.beginPath();
          ctx.arc(rodX_Cu + cuRodW / 2 + cxOffset, cy, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = 'rgba(184,115,51,0.95)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Cu', rightX + beakerW / 2, beakerY - 6);

      // External wire + load
      const wireY = beakerY - 22;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = getCanvasColors().text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftX + beakerW / 2, beakerY);
      ctx.lineTo(leftX + beakerW / 2, wireY);
      ctx.lineTo(W / 2 - 22, wireY);
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(W / 2 + 22, wireY);
      ctx.lineTo(rightX + beakerW / 2, wireY);
      ctx.lineTo(rightX + beakerW / 2, beakerY);
      ctx.stroke();

      // Resistor box (zigzag) or open gap
      if (s.loaded) {
        ctx.strokeStyle = getCanvasColors().accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        const x0 = W / 2 - 22,
          x1 = W / 2 + 22;
        const zigs = 6;
        for (let i = 0; i <= zigs; i++) {
          const x = x0 + ((x1 - x0) * i) / zigs;
          const y = wireY + (i % 2 === 0 ? -4 : 4);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Open switch tick
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = getCanvasColors().textDim;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 22, wireY);
        ctx.lineTo(W / 2 + 14, wireY - 12);
        ctx.stroke();
        ctx.restore();
      }

      // Electron flow arrows along the wire (left → right externally)
      if (s.loaded && s.I > 0.001) {
        const arrowCount = 4;
        for (let i = 0; i < arrowCount; i++) {
          const frac = (phase * 0.6 + i / arrowCount) % 1;
          const xa = leftX + beakerW / 2 + frac * (rightX + beakerW / 2 - (leftX + beakerW / 2));
          ctx.fillStyle = getCanvasColors().blue;
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('e⁻ →', xa, wireY - 10);
        }
      }

      // Half-reactions
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('anode: Zn → Zn²⁺ + 2e⁻', 10, H - 24);
      ctx.textAlign = 'right';
      ctx.fillText('cathode: Cu²⁺ + 2e⁻ → Cu', W - 10, H - 24);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.2'}
      title="The Daniell cell"
      question="What chemistry produces a steady 1.10 V?"
      caption={
        <>
          Zinc dissolves at the anode (<em>Zn → Zn²⁺ + 2e⁻</em>); copper plates onto the cathode (
          <em>Cu²⁺ + 2e⁻ → Cu</em>). The electrons travel through the wire; the SO₄²⁻ ions migrate
          across the porous barrier to balance charge. Open-circuit voltage{' '}
          <strong>≈ 1.10 V</strong> = E°(Cu) − E°(Zn) = +0.34 V − (−0.76 V).
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={loaded ? 'Load connected' : 'Open circuit'}
          checked={loaded}
          onChange={setLoaded}
        />
        <MiniSlider
          label="R_load"
          value={R_L}
          min={0.5}
          max={50}
          step={0.5}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setR_L}
        />
        <MiniReadout label="V_term" value={<Num value={V_term} />} unit="V" />
        <MiniReadout label="I" value={<Num value={I} />} unit="A" />
        <button type="button" className="mini-toggle" onClick={() => setErosion(0)}>
          Reset rods
        </button>
      </DemoControls>
    </Demo>
  );
}

function drawBeaker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fluidColor: string,
  label: string,
) {
  // Glass body
  ctx.strokeStyle = getCanvasColors().borderStrong;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  // Fluid fill
  ctx.fillStyle = fluidColor;
  ctx.fillRect(x + 2, y + 12, w - 4, h - 14);
  // Fluid label
  ctx.fillStyle = getCanvasColors().textDim;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, x + w / 2, y + h - 4);
}
