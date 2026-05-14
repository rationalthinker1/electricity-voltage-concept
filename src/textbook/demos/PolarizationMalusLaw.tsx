/**
 * Demo D14.10 — Polarization and Malus's law
 *
 * Unpolarized light enters a first polarizer (transmission axis at θ₁),
 * emerging linearly polarised at θ₁ with intensity I₀/2 (a fixed half of
 * the incident intensity). It then hits a second polarizer (analyser)
 * with axis at θ₂. Malus: the transmitted intensity is
 *   I = (I₀/2) · cos²(θ₂ − θ₁).
 *
 * Two knob sliders rotate the two polarizer axes. The right side shows
 * the live E-vector orientation after each element, and the transmitted
 * fraction is read out.
 *
 * Optional quarter-wave plate toggle between the polarizers: inserts a
 * λ/4 retarder oriented at 45° to the first axis, converting linear
 * polarisation into circular. With the QWP active, the second polarizer
 * transmits exactly I₀/4 regardless of its angle.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { drawArrow } from '@/lib/canvasPrimitives';

interface Props { figure?: string }

export function PolarizationMalusLawDemo({ figure }: Props) {
  const [t1Deg, setT1Deg] = useState(0);
  const [t2Deg, setT2Deg] = useState(30);
  const [qwp, setQwp] = useState(false);

  const stateRef = useRef({ t1Deg, t2Deg, qwp });
  useEffect(() => { stateRef.current = { t1Deg, t2Deg, qwp }; }, [t1Deg, t2Deg, qwp]);

  // Fraction transmitted = 0.5 * cos²(Δθ) without QWP, 0.25 with QWP (circular)
  const dTheta = ((t2Deg - t1Deg) * Math.PI) / 180;
  const fracOut = qwp ? 0.25 : 0.5 * Math.cos(dTheta) ** 2;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let tAnim = 0;
    function draw() {
      const { t1Deg, t2Deg, qwp } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      tAnim += 0.04;

      // Three "panels" side by side: incoming unpolarised, between elements (post-P1),
      // after analyser (post-P2). Each panel shows an E-vector wheel.
      const panelW = W / 3;
      const cyMid = H / 2;
      const Rwheel = Math.min(panelW * 0.32, H * 0.34);

      function panel(idx: number, title: string, drawE: (cx: number, cy: number) => void, axisDeg: number | null) {
        const cx = panelW * idx + panelW / 2;
        const cy = cyMid;
        // Background wheel
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, Rwheel, 0, Math.PI * 2); ctx.stroke();
        // Polariser axis line, if any
        if (axisDeg !== null) {
          const a = (axisDeg * Math.PI) / 180;
          ctx.strokeStyle = 'rgba(108,197,194,0.85)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx - Rwheel * 1.1 * Math.cos(a), cy + Rwheel * 1.1 * Math.sin(a));
          ctx.lineTo(cx + Rwheel * 1.1 * Math.cos(a), cy - Rwheel * 1.1 * Math.sin(a));
          ctx.stroke();
        }
        // E-vector(s)
        drawE(cx, cy);
        // Title
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(160,158,149,0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(title, cx, cy + Rwheel + 22);
      }

      // (1) Unpolarised: draw 8 random-orientation arrows
      panel(0, 'unpolarised', (cx, cy) => {
        ctx.strokeStyle = 'rgba(255,107,42,0.85)';
        ctx.lineWidth = 1.5;
        const Nv = 8;
        for (let i = 0; i < Nv; i++) {
          // Use deterministic-but-varying angles per frame
          const ang = (i * Math.PI) / Nv + 0.4 * Math.sin(tAnim + i);
          const len = Rwheel * (0.55 + 0.25 * Math.cos(tAnim * 1.7 + i));
          ctx.beginPath();
          ctx.moveTo(cx - len * Math.cos(ang), cy + len * Math.sin(ang));
          ctx.lineTo(cx + len * Math.cos(ang), cy - len * Math.sin(ang));
          ctx.stroke();
        }
      }, null);

      // (2) After P1: linearly polarised along t1, with amplitude I₀/2 → sqrt of that.
      //     With QWP, it's circular: arrow rotates.
      panel(1, qwp ? 'after λ/4 plate' : `after P₁ @ ${t1Deg.toFixed(0)}°`, (cx, cy) => {
        if (qwp) {
          // Circular: rotating arrow at fixed amplitude r = Rwheel*0.7
          const ang = tAnim * 1.5;
          const r = Rwheel * 0.7;
          drawArrow(
            ctx,
            { x: cx, y: cy },
            { x: cx + r * Math.cos(ang), y: cy - r * Math.sin(ang) },
            { color: 'rgba(255,107,42,0.95)', lineWidth: 2 },
          );
        } else {
          const a = (t1Deg * Math.PI) / 180;
          const amp = Rwheel * 0.7;
          // Animate amplitude with a sinusoid to suggest oscillation
          const phase = Math.cos(tAnim * 2);
          drawArrow(
            ctx,
            { x: cx - amp * phase * Math.cos(a), y: cy + amp * phase * Math.sin(a) },
            { x: cx + amp * phase * Math.cos(a), y: cy - amp * phase * Math.sin(a) },
            { color: 'rgba(255,107,42,0.95)', lineWidth: 2 },
          );
        }
      }, t1Deg);

      // (3) After P2: linear along t2, with amplitude = √(2·frac)
      panel(2, `after P₂ @ ${t2Deg.toFixed(0)}°`, (cx, cy) => {
        const a = (t2Deg * Math.PI) / 180;
        const ampScale = Math.sqrt(2 * fracOut);     // 0 .. 1
        const amp = Rwheel * 0.7 * ampScale;
        const phase = Math.cos(tAnim * 2);
        if (amp > 0.5) {
          drawArrow(
            ctx,
            { x: cx - amp * phase * Math.cos(a), y: cy + amp * phase * Math.sin(a) },
            { x: cx + amp * phase * Math.cos(a), y: cy - amp * phase * Math.sin(a) },
            { color: 'rgba(108,197,194,0.95)', lineWidth: 2 },
          );
        }
      }, t2Deg);

      // Connecting arrows between panels
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelW * 0.95, cyMid); ctx.lineTo(panelW * 1.05, cyMid);
      ctx.moveTo(panelW * 1.95, cyMid); ctx.lineTo(panelW * 2.05, cyMid);
      ctx.stroke();

      // Header / readouts
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.textAlign = 'left';
      ctx.fillText(`I/I₀ = ${fracOut.toFixed(3)}`, 12, 18);
      ctx.textAlign = 'right';
      ctx.fillText(qwp ? 'λ/4 plate inserted between P₁ and P₂' : 'Δθ = ' + (t2Deg - t1Deg).toFixed(0) + '°', W - 12, 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [fracOut]);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.10'}
      title="Malus's law — two polarizers and an angle"
      question="What fraction of the original intensity gets through both polarizers?"
      caption={<>
        Unpolarised light loses half its intensity at the first polarizer (P₁), emerging linearly
        polarised along its axis. The second polarizer (P₂, the analyser) then transmits the
        component along its own axis: <strong>I = (I₀/2) cos²(θ₂ − θ₁)</strong>. Cross the two
        axes (Δθ = 90°) and nothing gets through. Insert a quarter-wave plate at 45° between them
        and the linear becomes circular — the analyser then transmits a flat <strong>I₀/4</strong>
        regardless of θ₂.
      </>}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider label="θ₁" value={t1Deg} min={-90} max={90} step={1}
          format={v => v.toFixed(0) + '°'} onChange={setT1Deg} />
        <MiniSlider label="θ₂" value={t2Deg} min={-90} max={90} step={1}
          format={v => v.toFixed(0) + '°'} onChange={setT2Deg} />
        <MiniToggle label={qwp ? 'λ/4 plate ON' : 'λ/4 plate OFF'} checked={qwp} onChange={setQwp} />
        <MiniReadout label="I/I₀" value={fracOut.toFixed(3)} />
      </DemoControls>
    </Demo>
  );
}
