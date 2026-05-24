/**
 * Demo D15.3 — Yagi-Uda array factor
 *
 * Plan-view of a Yagi: driven element, a single reflector behind, and N directors
 * in front. The composite radiation pattern (polar plot, normalised) is a forward
 * lobe that sharpens as more directors are added.
 *
 * Slider: number of directors (0–6).
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function YagiArrayFactorDemo({ figure }: Props) {
  const [nDir, setNDir] = useState(3);

  const stateRef = useSimState({ nDir });
  // Approximate gain (dBi) for a Yagi vs director count — empirical fit
  // ≈ 2.15 dBi (lone dipole) + 4 dBi for 1 director, then ~1 dB per added director.
  function gainDbi(n: number) {
    if (n <= 0) return 4.5; // dipole + reflector
    return 7.0 + 1.4 * Math.min(n, 6);
  }
  const Gdbi = gainDbi(nDir);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
      const { nDir } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const split = W * 0.42;
      const cyTop = H / 2;
      const baseX = 30;
      const spacing = 28;
      const xRef = baseX;
      const xDrv = baseX + spacing;
      const xDirs: number[] = [];
      for (let k = 0; k < nDir; k++) xDirs.push(baseX + (2 + k) * spacing);
      function drawElement(x: number, len: number, label: string, accent: boolean) {
        ctx.strokeStyle = accent ? withAlpha(colors.accent, 0.95) : withAlpha(colors.textDim, 0.85);
        ctx.lineWidth = accent ? 2.5 : 1.8;
        ctx.beginPath();
        ctx.moveTo(x, cyTop - len / 2);
        ctx.lineTo(x, cyTop + len / 2);
        ctx.stroke();
        drawLabel(ctx, {
          x: x,
          y: cyTop + len / 2 + 12,
          text: label,
          color: colors.textDim,
          size: 9,
          align: 'center',
        });
      }
      drawElement(xRef, 78, 'refl', false);
      drawElement(xDrv, 70, 'driven', true);
      xDirs.forEach((x, i) => drawElement(x, 60 - i * 1.5, `D${i + 1}`, false));
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xRef, cyTop);
      ctx.lineTo(xDirs.length ? xDirs[xDirs.length - 1] : xDrv, cyTop);
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      const ax = split - 18;
      ctx.moveTo(ax, cyTop);
      ctx.lineTo(ax - 8, cyTop - 4);
      ctx.lineTo(ax - 8, cyTop + 4);
      ctx.closePath();
      ctx.fill();
      drawLabel(ctx, {
        text: 'forward →',
        x: ax - 12,
        y: cyTop - 6,
        color: colors.accent,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
      });
      const cx = (split + W) / 2;
      const cy = H / 2;
      const R = Math.min((W - split) * 0.42, H * 0.42);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let f = 0.25; f <= 1.001; f += 0.25) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();
      const sharp = 1.5 + nDir * 0.9;
      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = withAlpha(colors.accent, 0.18);
      ctx.lineWidth = 2;
      ctx.beginPath();
      const N = 360;
      for (let i = 0; i <= N; i++) {
        const phi = (i / N) * 2 * Math.PI;
        // Forward direction in screen-space is +x (to the right).
        const r = Math.pow(Math.max(0, Math.cos(phi / 2)), 2 * sharp);
        // Add small back-lobe so the pattern isn't pathologically zero on the back
        const rb = 0.08 * Math.max(0, Math.cos((phi - Math.PI) / 2)) ** 2;
        const rN = Math.min(1, r + rb);
        const x = cx + R * rN * Math.cos(phi);
        const y = cy + R * rN * Math.sin(phi);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: 'forward (+x)',
        x: cx + R + 12,
        y: cy + 4,
        font: '10px "JetBrains Mono", monospace',
        align: 'center',
      });
      drawLabel(ctx, {
        text: 'back (−x)',
        x: cx - R - 12,
        y: cy + 4,
        font: '10px "JetBrains Mono", monospace',
        align: 'center',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="A Yagi — driven element + parasitics"
      question="What does adding directors do to the radiation pattern?"
      caption={
        <>
          Plan view of a Yagi-Uda antenna: a single driven element, a slightly-longer reflector
          behind, and one or more slightly-shorter directors in front. The combined pattern is the
          element pattern multiplied by the array factor — a forward-pointing lobe that sharpens
          with each director added, at the cost of bandwidth.
        </>
      }
      deeperLab={{ slug: 'antenna-radiation', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="directors"
          value={nDir}
          min={0}
          max={6}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={(v) => setNDir(Math.round(v))}
        />
        <MiniReadout label="gain ≈" value={Gdbi.toFixed(1)} unit="dBi" />
      </DemoControls>
      <EquationStrip
        leftLabel="Yagi gain (empirical)"
        left={<M tex="G \approx 7.0 + 1.4\,N_{\text{dir}}\;\text{dBi}" />}
        rightLabel={`N_dir = ${nDir}`}
        right={<M tex={`G(${nDir}) \\approx ${Gdbi.toFixed(1)}\\,\\text{dBi}`} />}
      />
    </Demo>
  );
}
