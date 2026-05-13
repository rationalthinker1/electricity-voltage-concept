/**
 * Demo D3.1 — Length vs. resistance
 *
 * Vary the length L of a copper wire at fixed cross-section. Resistance
 * R = ρL/A grows linearly. The visualization is a horizontal wire whose
 * drawn length changes with L; tick marks every meter give scale.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { MATERIALS } from '@/lib/physics';

interface Props {
  figure?: string;
}

export function LengthVsResistanceDemo({ figure }: Props) {
  // Fixed cross-section, fixed material — only L varies.
  const A_mm2 = 2.5;
  const A_m2 = A_mm2 * 1e-6;
  const sigma = MATERIALS.copper!.sigma;

  const [L, setL] = useState(1.0);

  const stateRef = useRef({ L });
  useEffect(() => { stateRef.current = { L }; }, [L]);

  const R = L / (sigma * A_m2);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { L } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Layout: full canvas spans 10 m of physical scale; wire occupies
      // (L / 10) of that span, centered. Always at least 30 px wide.
      const marginX = 60;
      const usableW = w - marginX * 2;
      const pxPerM = usableW / 10;
      const wireLen = Math.max(30, L * pxPerM);
      const wireCY = h / 2;
      const wireLeft = (w - wireLen) / 2;
      const wireRight = wireLeft + wireLen;
      const thickness = 36;
      const top = wireCY - thickness / 2;
      const bot = wireCY + thickness / 2;

      // Tick marks every meter
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const nTicks = Math.floor(L) + 1;
      for (let i = 0; i <= nTicks; i++) {
        const m = Math.min(i, L);
        const x = wireLeft + m * pxPerM;
        ctx.beginPath();
        ctx.moveTo(x, bot + 8);
        ctx.lineTo(x, bot + 16);
        ctx.stroke();
        ctx.fillText(`${m.toFixed(0)} m`, x, bot + 28);
      }

      // Wire body
      const grd = ctx.createLinearGradient(0, top, 0, bot);
      grd.addColorStop(0, 'rgba(255,107,42,0.08)');
      grd.addColorStop(0.5, 'rgba(255,107,42,0.18)');
      grd.addColorStop(1, 'rgba(255,107,42,0.08)');
      ctx.fillStyle = grd;
      roundRect(ctx, wireLeft, top, wireLen, thickness, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      roundRect(ctx, wireLeft, top, wireLen, thickness, 8);
      ctx.stroke();

      // End caps
      ctx.fillStyle = '#ff3b6e';
      ctx.fillRect(wireLeft - 10, top - 4, 4, thickness + 8);
      ctx.fillStyle = '#5baef8';
      ctx.fillRect(wireRight + 6, top - 4, 4, thickness + 8);

      // Label
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`COPPER  ·  A = ${A_mm2.toFixed(1)} mm²`, w / 2, top - 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 3.1'}
      title="Length adds resistance"
      question="Stretch the wire — what does R do?"
      caption="Hold the cross-section fixed. Resistance scales linearly with length: R = ρL/A. Twice the wire, twice the resistance."
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={220} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="L"
          value={L} min={0.1} max={10} step={0.1}
          format={v => v.toFixed(1) + ' m'}
          onChange={setL}
        />
        <MiniReadout label="Resistance" value={<Num value={R} />} unit="Ω" />
      </DemoControls>
    </Demo>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
