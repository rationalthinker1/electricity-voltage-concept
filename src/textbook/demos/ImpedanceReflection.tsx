/**
 * Demo D18.4 — Impedance reflection through a transformer
 *
 * 8 Ω speaker on the secondary; what does the primary side see?
 * Z_p = (N_p / N_s)² · Z_s. Slider for the turns ratio; readouts for the
 * reflected impedance Z_p and for a few "would this match my source?" hints.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { getCanvasColors } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

const Z_LOAD = 8; // Ω (speaker)

export function ImpedanceReflectionDemo({ figure }: Props) {
  const [ratio, setRatio] = useState(20); // N_p / N_s

  const stateRef = useSimState({ ratio });
  const computed = useMemo(() => {
    const Zp = ratio * ratio * Z_LOAD;
    return { Zp };
  }, [ratio]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { ratio } = stateRef.current;
      const Zp = ratio * ratio * Z_LOAD;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cy = h / 2;
      const padX = 24;
      const srcX = padX;
      const srcW = 80,
        srcH = 50;
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.4;
      ctx.fillRect(srcX, cy - srcH / 2, srcW, srcH);
      ctx.strokeRect(srcX, cy - srcH / 2, srcW, srcH);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawLabel(ctx, { text: 'TUBE AMP', x: srcX + srcW / 2, y: cy - 8, color: colors.accent, weight: 'bold', font: 'bold 10px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: '~5 kΩ plate', x: srcX + srcW / 2, y: cy + 8, size: 9, font: '9px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      const trX = w * 0.45;
      const trW = 100,
        trH = 70;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(trX, cy - trH / 2, trW, trH);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = colors.textDim;
      ctx.fillRect(trX + 30, cy - trH / 2 + 6, 8, trH - 12);
      ctx.fillRect(trX + 62, cy - trH / 2 + 6, 8, trH - 12);
      drawCoilCol(
        ctx,
        trX + 16,
        cy - 22,
        cy + 22,
        Math.min(14, Math.max(3, Math.round(ratio * 1.4))),
      );
      drawCoilCol(
        ctx,
        trX + trW - 16,
        cy - 22,
        cy + 22,
        Math.max(
          2,
          Math.round(
            ((Math.min(14, Math.max(3, Math.round(ratio * 1.4))) / Math.max(ratio, 1)) * ratio) /
              ratio +
              2,
          ),
        ),
      );
      ctx.restore();
      drawLabel(ctx, { text: `N_p : N_s = ${ratio.toFixed(0)} : 1`, x: trX + trW / 2, y: cy + trH / 2 + 4, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      const ldX = w - padX - 80;
      const ldW = 80,
        ldH = 50;
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.4;
      ctx.fillRect(ldX, cy - ldH / 2, ldW, ldH);
      ctx.strokeRect(ldX, cy - ldH / 2, ldW, ldH);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawLabel(ctx, { text: 'SPEAKER', x: ldX + ldW / 2, y: cy - 8, color: colors.teal, weight: 'bold', font: 'bold 10px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: '8 Ω', x: ldX + ldW / 2, y: cy + 8, size: 9, font: '9px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(srcX + srcW, cy - 6);
      ctx.lineTo(trX, cy - 6);
      ctx.moveTo(srcX + srcW, cy + 6);
      ctx.lineTo(trX, cy + 6);
      ctx.moveTo(trX + trW, cy - 6);
      ctx.lineTo(ldX, cy - 6);
      ctx.moveTo(trX + trW, cy + 6);
      ctx.lineTo(ldX, cy + 6);
      ctx.stroke();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      drawLabel(ctx, { text: `looking in: Z_p = ${formatZ(Zp)}`, x: (srcX + srcW + trX) / 2, y: cy - 16, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      drawLabel(ctx, { text: `secondary: Z_s = 8 Ω`, x: (trX + trW + ldX) / 2, y: cy - 16, color: colors.teal, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      const target = 5000;
      const ratioDiff = Math.abs(Math.log10(Math.max(Zp, 1) / target));
      const match = Math.max(0, 1 - ratioDiff * 2);
      drawLabel(ctx, {
        x: 12,
        y: h - 18,
        text:
          match > 0.8
            ? 'matched to a 5 kΩ source'
            : Zp < target
              ? 'still too low for a tube plate'
              : 'now too high for a tube plate',
        color: `rgba(108,197,194,${0.3 + 0.7 * match})`,
        size: 9,
        baseline: 'top',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 18.4'}
      title="Impedance reflection — what the primary sees"
      question="An 8 Ω speaker. How do you make it look like 5 kΩ?"
      caption={
        <>
          A load Z_s on the secondary looks like <em>Z_p = (N_p/N_s)² · Z_s</em> from the primary.
          To match an 8 Ω speaker to a tube-plate impedance of ~5 kΩ, you need{' '}
          <em>N_p/N_s ≈ √(5000/8) ≈ 25:1</em>. That's exactly what a guitar-amp output transformer
          does — and the same reason every RF stage has its own little matching transformer or LC
          match network.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N_p/N_s"
          value={ratio}
          min={1}
          max={50}
          step={1}
          format={(v) => Math.round(v) + ':1'}
          onChange={(v) => setRatio(Math.max(1, Math.round(v)))}
        />
        <MiniReadout
          label="Z_p reflected"
          value={<Num value={computed.Zp} digits={2} />}
          unit="Ω"
        />
        <MiniReadout label="Z_s (load)" value={Z_LOAD.toFixed(0)} unit="Ω" />
      </DemoControls>
    </Demo>
  );
}

function drawCoilCol(
  ctx: CanvasRenderingContext2D,
  cx: number,
  yTop: number,
  yBot: number,
  turns: number,
) {
  const dy = (yBot - yTop) / Math.max(turns, 1);
  for (let i = 0; i < turns; i++) {
    const y = yTop + (i + 0.5) * dy;
    ctx.strokeStyle = getCanvasColors().accent;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, y, 8, dy * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function formatZ(z: number): string {
  if (z >= 1000) return (z / 1000).toFixed(2) + ' kΩ';
  return z.toFixed(0) + ' Ω';
}
