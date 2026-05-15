/**
 * Demo D18.4 — Impedance reflection through a transformer
 *
 * 8 Ω speaker on the secondary; what does the primary side see?
 * Z_p = (N_p / N_s)² · Z_s. Slider for the turns ratio; readouts for the
 * reflected impedance Z_p and for a few "would this match my source?" hints.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

const Z_LOAD = 8; // Ω (speaker)

export function ImpedanceReflectionDemo({ figure }: Props) {
  const [ratio, setRatio] = useState(20);    // N_p / N_s

  const stateRef = useRef({ ratio });
  useEffect(() => { stateRef.current.ratio = ratio; }, [ratio]);

  const computed = useMemo(() => {
    const Zp = ratio * ratio * Z_LOAD;
    return { Zp };
  }, [ratio]);

  const setup = useCallback((info: CanvasInfo) => {
    const colors = getCanvasColors();
    const { ctx, w, h, } = info;
    let raf = 0;

    function draw() {
      const { ratio } = stateRef.current;
      const Zp = ratio * ratio * Z_LOAD;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Layout: source box on left, transformer in middle, load on right.
      const cy = h / 2;
      const padX = 24;

      // Source box (tube amp)
      const srcX = padX;
      const srcW = 80, srcH = 50;
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.lineWidth = 1.4;
      ctx.fillRect(srcX, cy - srcH / 2, srcW, srcH);
      ctx.strokeRect(srcX, cy - srcH / 2, srcW, srcH);
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('TUBE AMP', srcX + srcW / 2, cy - 8);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('~5 kΩ plate', srcX + srcW / 2, cy + 8);

      // Transformer (simplified two-coil box) center
      const trX = w * 0.45;
      const trW = 100, trH = 70;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(trX, cy - trH / 2, trW, trH);
      // Two short vertical bars suggest core
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = colors.textDim;
      ctx.fillRect(trX + 30, cy - trH / 2 + 6, 8, trH - 12);
      ctx.fillRect(trX + 62, cy - trH / 2 + 6, 8, trH - 12);
      // Primary coil (left bar)
      drawCoilCol(ctx, trX + 16, cy - 22, cy + 22, Math.min(14, Math.max(3, Math.round(ratio * 1.4))));
      // Secondary coil (right bar)
      drawCoilCol(ctx, trX + trW - 16, cy - 22, cy + 22, Math.max(2, Math.round(Math.min(14, Math.max(3, Math.round(ratio * 1.4))) / Math.max(ratio, 1) * ratio / ratio + 2)));
      // Labels for N_p / N_s as a ratio
      ctx.restore();
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(`N_p : N_s = ${ratio.toFixed(0)} : 1`, trX + trW / 2, cy + trH / 2 + 4);

      // Load (speaker)
      const ldX = w - padX - 80;
      const ldW = 80, ldH = 50;
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.lineWidth = 1.4;
      ctx.fillRect(ldX, cy - ldH / 2, ldW, ldH);
      ctx.strokeRect(ldX, cy - ldH / 2, ldW, ldH);
      ctx.fillStyle = getCanvasColors().teal;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SPEAKER', ldX + ldW / 2, cy - 8);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('8 Ω', ldX + ldW / 2, cy + 8);

      // Wires
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(srcX + srcW, cy - 6); ctx.lineTo(trX, cy - 6);
      ctx.moveTo(srcX + srcW, cy + 6); ctx.lineTo(trX, cy + 6);
      ctx.moveTo(trX + trW, cy - 6); ctx.lineTo(ldX, cy - 6);
      ctx.moveTo(trX + trW, cy + 6); ctx.lineTo(ldX, cy + 6);
      ctx.stroke();

      // Z arrows / annotations
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(`looking in: Z_p = ${formatZ(Zp)}`, (srcX + srcW + trX) / 2, cy - 16);
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillText(`secondary: Z_s = 8 Ω`, (trX + trW + ldX) / 2, cy - 16);

      // Match indicator: how close to ~5 kΩ source impedance?
      const target = 5000;
      const ratioDiff = Math.abs(Math.log10(Math.max(Zp, 1) / target));
      const match = Math.max(0, 1 - ratioDiff * 2); // 1.0 = perfect, 0 at 100× off
      ctx.fillStyle = `rgba(108,197,194,${0.3 + 0.7 * match})`;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(
        match > 0.8 ? 'matched to a 5 kΩ source' :
        Zp < target ? 'still too low for a tube plate' : 'now too high for a tube plate',
        12, h - 18,
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.4'}
      title="Impedance reflection — what the primary sees"
      question="An 8 Ω speaker. How do you make it look like 5 kΩ?"
      caption={<>
        A load Z_s on the secondary looks like <em>Z_p = (N_p/N_s)² · Z_s</em> from the primary. To match an 8 Ω
        speaker to a tube-plate impedance of ~5 kΩ, you need <em>N_p/N_s ≈ √(5000/8) ≈ 25:1</em>. That's exactly
        what a guitar-amp output transformer does — and the same reason every RF stage has its own little
        matching transformer or LC match network.
      </>}
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N_p/N_s"
          value={ratio} min={1} max={50} step={1}
          format={v => Math.round(v) + ':1'}
          onChange={v => setRatio(Math.max(1, Math.round(v)))}
        />
        <MiniReadout label="Z_p reflected" value={<Num value={computed.Zp} digits={2} />} unit="Ω" />
        <MiniReadout label="Z_s (load)" value={Z_LOAD.toFixed(0)} unit="Ω" />
      </DemoControls>
    </Demo>
  );
}

function drawCoilCol(
  ctx: CanvasRenderingContext2D,
  cx: number, yTop: number, yBot: number, turns: number,
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
