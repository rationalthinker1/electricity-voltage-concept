/**
 * Demo D15.3 — Yagi-Uda array factor
 *
 * Plan-view of a Yagi: driven element, a single reflector behind, and N directors
 * in front. The composite radiation pattern (polar plot, normalised) is a forward
 * lobe that sharpens as more directors are added.
 *
 * Slider: number of directors (0–6).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function YagiArrayFactorDemo({ figure }: Props) {
  const [nDir, setNDir] = useState(3);

  const stateRef = useRef({ nDir });
  useEffect(() => { stateRef.current = { nDir }; }, [nDir]);

  // Approximate gain (dBi) for a Yagi vs director count — empirical fit
  // ≈ 2.15 dBi (lone dipole) + 4 dBi for 1 director, then ~1 dB per added director.
  function gainDbi(n: number) {
    if (n <= 0) return 4.5;          // dipole + reflector
    return 7.0 + 1.4 * Math.min(n, 6);
  }
  const Gdbi = gainDbi(nDir);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { nDir } = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Left half: plan view of the elements. Right half: polar pattern.
      const split = W * 0.42;

      // ── Plan view of elements
      const cyTop = H / 2;
      // x positions: reflector at xRef, driven at xDrv, directors spaced 0.2λ apart
      const baseX = 30;
      const spacing = 28;
      const xRef = baseX;
      const xDrv = baseX + spacing;
      const xDirs: number[] = [];
      for (let k = 0; k < nDir; k++) xDirs.push(baseX + (2 + k) * spacing);

      function drawElement(x: number, len: number, label: string, accent: boolean) {
        ctx.strokeStyle = accent ? 'rgba(255,107,42,0.95)' : 'rgba(160,158,149,0.85)';
        ctx.lineWidth = accent ? 2.5 : 1.8;
        ctx.beginPath();
        ctx.moveTo(x, cyTop - len / 2);
        ctx.lineTo(x, cyTop + len / 2);
        ctx.stroke();
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = getCanvasColors().textDim;
        ctx.textAlign = 'center';
        ctx.fillText(label, x, cyTop + len / 2 + 12);
      }
      drawElement(xRef, 78, 'refl', false);
      drawElement(xDrv, 70, 'driven', true);
      xDirs.forEach((x, i) => drawElement(x, 60 - i * 1.5, `D${i + 1}`, false));
      // Boom line connecting elements
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xRef, cyTop); ctx.lineTo(xDirs.length ? xDirs[xDirs.length - 1] : xDrv, cyTop);
      ctx.stroke();

      // Forward arrow
      ctx.fillStyle = getCanvasColors().accent;
      ctx.beginPath();
      const ax = split - 18;
      ctx.moveTo(ax, cyTop);
      ctx.lineTo(ax - 8, cyTop - 4);
      ctx.lineTo(ax - 8, cyTop + 4);
      ctx.closePath(); ctx.fill();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().accent;
      ctx.textAlign = 'right';
      ctx.fillText('forward →', ax - 12, cyTop - 6);

      // ── Polar pattern on the right side
      const cx = (split + W) / 2;
      const cy = H / 2;
      const R = Math.min((W - split) * 0.42, H * 0.42);

      // Concentric circles
      ctx.strokeStyle = getCanvasColors().border;
      ctx.lineWidth = 1;
      for (let f = 0.25; f <= 1.001; f += 0.25) {
        ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.stroke();
      }
      // Axes
      ctx.strokeStyle = getCanvasColors().border;
      ctx.beginPath();
      ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
      ctx.stroke();

      // Pattern: cos²ⁿ(φ/2) gives a forward-pointing lobe that sharpens with n.
      // φ measured from the forward direction (+x).
      const sharp = 1.5 + nDir * 0.9;
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.fillStyle = 'rgba(255,107,42,0.18)';
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
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'center';
      ctx.fillText('forward (+x)', cx + R + 12, cy + 4);
      ctx.fillText('back (−x)', cx - R - 12, cy + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 15.3'}
      title="A Yagi — driven element + parasitics"
      question="What does adding directors do to the radiation pattern?"
      caption={<>
        Plan view of a Yagi-Uda antenna: a single driven element, a slightly-longer reflector
        behind, and one or more slightly-shorter directors in front. The combined pattern is the
        element pattern multiplied by the array factor — a forward-pointing lobe that sharpens
        with each director added, at the cost of bandwidth.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider label="directors" value={nDir} min={0} max={6} step={1}
          format={v => v.toFixed(0)} onChange={v => setNDir(Math.round(v))} />
        <MiniReadout label="gain ≈" value={Gdbi.toFixed(1)} unit="dBi" />
      </DemoControls>
    </Demo>
  );
}
