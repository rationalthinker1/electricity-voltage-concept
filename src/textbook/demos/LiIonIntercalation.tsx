/**
 * Demo 19.2 — Lithium-ion intercalation
 *
 * Atomic-scale Li-ion cell: graphite anode on the left, LiCoO₂-style cathode
 * on the right, electrolyte in between. As SOC drops from 100% to 0%, the
 * Li⁺ ions migrate from anode (charged state) to cathode (discharged) —
 * neither host lattice gets disrupted; the Li⁺ slides between the layers.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';

interface Props { figure?: string }

const N_LI = 28; // total Li ions in the system

export function LiIonIntercalationDemo({ figure }: Props) {
  const [soc, setSoc] = useState(1.0);

  // ions on anode (graphite) = soc * N; ions on cathode = (1 - soc) * N
  const nAnode = Math.round(soc * N_LI);
  const nCathode = N_LI - nAnode;
  const V = 3.0 + 0.9 * soc; // rough OCV from ~3.0 V empty to ~4.0 V full (NMC-ish)

  const stateRef = useRef({ soc, nAnode, nCathode });
  useEffect(() => { stateRef.current = { soc, nAnode, nCathode }; }, [soc, nAnode, nCathode]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const s = stateRef.current;
      phase += 0.03;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      const anodeX = 40;
      const anodeW = (W - 80) * 0.35;
      const cathodeX = W - 40 - anodeW;
      const electrolyteX = anodeX + anodeW;
      const electrolyteW = cathodeX - electrolyteX;
      const topY = 40;
      const botY = H - 40;
      const colH = botY - topY;

      // Anode (graphite) — horizontal layered slabs
      drawLayers(ctx, anodeX, topY, anodeW, colH, '#3a3a3a', 'rgba(160,158,149,0.7)', 'graphite');

      // Cathode (LiCoO₂ / NMC) — layered slabs different colour
      drawLayers(ctx, cathodeX, topY, anodeW, colH, '#2a1a1a', 'rgba(184,115,51,0.8)', 'LiCoO₂');

      // Electrolyte — faint amber wash
      ctx.fillStyle = 'rgba(255,107,42,0.06)';
      ctx.fillRect(electrolyteX, topY, electrolyteW, colH);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(anodeX, topY, anodeW, colH);
      ctx.strokeRect(cathodeX, topY, anodeW, colH);

      // Draw Li⁺ ions intercalated in the slabs
      function drawIonsIn(x: number, w: number, count: number) {
        ctx.fillStyle = '#5baef8';
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

      // In-flight ions: a few that look like they're shuttling
      const shuttling = Math.max(0, Math.min(3, Math.round(Math.abs(0.5 - s.soc) * 6)));
      for (let j = 0; j < shuttling; j++) {
        const t = ((phase + j * 0.33) % 1);
        // direction depends on discharge (soc decreasing) — here just show motion
        const dir = s.soc < 0.5 ? -1 : +1;
        const xx = electrolyteX + (dir > 0 ? t : 1 - t) * electrolyteW;
        const yy = topY + colH * (0.25 + 0.5 * ((j * 0.37) % 1));
        ctx.fillStyle = 'rgba(91,174,248,0.9)';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Li⁺', xx, yy);
      }

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,0.9)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('anode (graphite)', anodeX + anodeW / 2, topY - 4);
      ctx.fillText('cathode (LiCoO₂)', cathodeX + anodeW / 2, topY - 4);
      ctx.textBaseline = 'top';
      ctx.fillText('electrolyte', electrolyteX + electrolyteW / 2, botY + 4);

      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.textAlign = 'left';
      ctx.fillText(`SOC = ${(s.soc * 100).toFixed(0)} %`, 10, 10);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.2'}
      title="Lithium-ion: ions that shuttle through a host"
      question="Why is Li-ion rechargeable when so many older chemistries weren't?"
      caption={
        <>
          Charging pushes Li⁺ ions out of the LiCoO₂ cathode lattice and into the gaps between graphite layers; discharging
          reverses the trip. Neither host lattice gets disrupted — the Li⁺ just slides between the layers. That's the
          intercalation trick that gives Li-ion ~500–2000 cycles before significant fade.
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="SOC"
          value={soc} min={0} max={1} step={0.01}
          format={v => (v * 100).toFixed(0) + ' %'}
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
  x: number, y: number, w: number, h: number,
  fillColor: string, strokeColor: string, _label: string,
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
