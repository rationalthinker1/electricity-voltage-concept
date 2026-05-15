/**
 * Demo D3.2 — Area vs. resistance
 *
 * Vary cross-section A at fixed length and material. R = ρL/A — twice
 * the area is half the resistance. Visualization: wire thickness changes,
 * with a small inset showing the cross-section as a circle.
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

export function AreaVsResistanceDemo({ figure }: Props) {
  // Fixed length, fixed material — only A varies.
  const L = 1.0; // m
  const sigma = MATERIALS.copper!.sigma;

  const [Amm2, setAmm2] = useState(2.5);

  const stateRef = useRef({ Amm2 });
  useEffect(() => { stateRef.current = { Amm2 }; }, [Amm2]);

  const A_m2 = Amm2 * 1e-6;
  const R = L / (sigma * A_m2);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { Amm2 } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Wire thickness scales with sqrt(A) so visual width matches diameter
      // of equivalent cylinder. Range 0.1..10 mm² → ~14..120 px.
      const tFrac = Math.sqrt(Amm2 / 10);  // 0..1
      const thickness = 14 + tFrac * 90;

      const wireLeft = 80;
      const wireRight = w - 160;        // leave room for inset
      const wireCY = h / 2;
      const top = wireCY - thickness / 2;
      const bot = wireCY + thickness / 2;

      // Wire body
      const grd = ctx.createLinearGradient(0, top, 0, bot);
      grd.addColorStop(0, 'rgba(255,107,42,0.08)');
      grd.addColorStop(0.5, 'rgba(255,107,42,0.18)');
      grd.addColorStop(1, 'rgba(255,107,42,0.08)');
      ctx.fillStyle = grd;
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, Math.min(10, thickness * 0.45));
      ctx.fill();
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1;
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, Math.min(10, thickness * 0.45));
      ctx.stroke();

      // End caps
      ctx.fillStyle = colors.pink;
      ctx.fillRect(wireLeft - 10, top - 4, 4, thickness + 8);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(wireRight + 6, top - 4, 4, thickness + 8);

      // Cross-section inset (right side)
      const insetCX = w - 70;
      const insetCY = h / 2;
      const insetMaxR = Math.min(46, h / 2 - 30);
      const insetR = 8 + tFrac * (insetMaxR - 8);

      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(insetCX, insetCY, insetMaxR + 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(insetCX, insetCY, insetR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(insetCX, insetCY, insetR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('cross-section', insetCX, insetCY + insetMaxR + 18);
      ctx.fillText(`${Amm2.toFixed(2)} mm²`, insetCX, insetCY + insetMaxR + 30);

      // Label
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`COPPER  ·  L = ${L.toFixed(1)} m`, wireLeft, 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 3.2'}
      title="Area divides resistance"
      question="Fatten the wire — what happens to R?"
      caption="Hold length and material fixed. Resistance is inversely proportional to cross-section: doubling the area halves the resistance, because there are twice as many parallel paths for current."
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="A"
          value={Amm2} min={0.1} max={10} step={0.05}
          format={v => v.toFixed(2) + ' mm²'}
          onChange={setAmm2}
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
