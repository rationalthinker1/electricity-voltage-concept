/**
 * Demo 19.2 — Lithium-ion intercalation
 *
 * Atomic-scale Li-ion cell: graphite anode on the left, LiCoO₂-style cathode
 * on the right, electrolyte in between. As SOC drops from 100% to 0%, the
 * Li⁺ ions migrate from anode (charged state) to cathode (discharged) —
 * neither host lattice gets disrupted; the Li⁺ slides between the layers.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const N_LI = 28; // total Li ions in the system

export function LiIonIntercalationDemo({ figure }: Props) {
  const [soc, setSoc] = useState(1.0);

  // ions on anode (graphite) = soc * N; ions on cathode = (1 - soc) * N
  const nAnode = Math.round(soc * N_LI);
  const nCathode = N_LI - nAnode;
  const V = 3.0 + 0.9 * soc; // rough OCV from ~3.0 V empty to ~4.0 V full (NMC-ish)

  const stateRef = useSimState({ soc, nAnode, nCathode });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const s = stateRef.current;
      phase += 0.03;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const anodeX = 40;
      const anodeW = (W - 80) * 0.35;
      const cathodeX = W - 40 - anodeW;
      const electrolyteX = anodeX + anodeW;
      const electrolyteW = cathodeX - electrolyteX;
      const topY = 40;
      const botY = H - 40;
      const colH = botY - topY;
      drawLayers(
        ctx,
        anodeX,
        topY,
        anodeW,
        colH,
        '#3a3a3a',
        withAlpha(colors.textDim, 0.7),
        'graphite',
      );
      drawLayers(ctx, cathodeX, topY, anodeW, colH, '#2a1a1a', 'rgba(184,115,51,0.8)', 'LiCoO₂');
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(electrolyteX, topY, electrolyteW, colH);
      ctx.restore();
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(anodeX, topY, anodeW, colH);
      ctx.strokeRect(cathodeX, topY, anodeW, colH);
      function drawIonsIn(x: number, w: number, count: number) {
        ctx.fillStyle = colors.blue;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cols = 4;
        const rows = Math.ceil(N_LI / cols);
        for (let i = 0; i < count; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const ix = x + (w * (c + 0.5)) / cols;
          const iy = topY + (colH * (r + 0.5)) / rows;
          ctx.fillText('Li⁺', ix, iy);
        }
      }
      drawIonsIn(anodeX, anodeW, s.nAnode);
      drawIonsIn(cathodeX, anodeW, s.nCathode);
      const shuttling = Math.max(0, Math.min(3, Math.round(Math.abs(0.5 - s.soc) * 6)));
      for (let j = 0; j < shuttling; j++) {
        const t = (phase + j * 0.33) % 1;
        // direction depends on discharge (soc decreasing) — here just show motion
        const dir = s.soc < 0.5 ? -1 : +1;
        const xx = electrolyteX + (dir > 0 ? t : 1 - t) * electrolyteW;
        const yy = topY + colH * (0.25 + 0.5 * ((j * 0.37) % 1));
        drawLabel(ctx, {
          x: xx,
          y: yy,
          text: 'Li⁺',
          color: colors.blue,
          size: 11,
          align: 'center',
          baseline: 'middle',
          weight: 'bold',
        });
      }
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      drawLabel(ctx, { text: 'anode (graphite)', x: anodeX + anodeW / 2, y: topY - 4, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      drawLabel(ctx, { text: 'cathode (LiCoO₂)', x: cathodeX + anodeW / 2, y: topY - 4, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      ctx.textBaseline = 'top';
      drawLabel(ctx, { text: 'electrolyte', x: electrolyteX + electrolyteW / 2, y: botY + 4, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: `SOC = ${(s.soc * 100).toFixed(0)} %`, x: 10, y: 10, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Lithium-ion: ions that shuttle through a host"
      question="Why is Li-ion rechargeable when so many older chemistries weren't?"
      caption={
        <>
          Charging pushes Li⁺ ions out of the LiCoO₂ cathode lattice and into the gaps between
          graphite layers; discharging reverses the trip. Neither host lattice gets disrupted — the
          Li⁺ just slides between the layers. That's the intercalation trick that gives Li-ion
          ~500–2000 cycles before significant fade.
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="SOC"
          value={soc}
          min={0}
          max={1}
          step={0.01}
          format={(v) => (v * 100).toFixed(0) + ' %'}
          onChange={setSoc}
        />
        <MiniReadout label="V_cell (typical)" value={V.toFixed(2)} unit="V" />
        <MiniReadout label="Li⁺ in graphite" value={nAnode.toString()} />
        <MiniReadout label="Li⁺ in cathode" value={nCathode.toString()} />
      </DemoControls>
    </Demo>
  );
}

function drawLayers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor: string,
  strokeColor: string,
  _label: string,
) {
  const layers = 6;
  const layerH = h / layers;
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 0.8;
  for (let i = 1; i < layers; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + i * layerH);
    ctx.lineTo(x + w, y + i * layerH);
    ctx.stroke();
  }
}
