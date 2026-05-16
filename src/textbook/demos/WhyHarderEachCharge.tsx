/**
 * Demo D4.2 — Why each charge is harder than the last
 *
 * Abstract diagram of a "worker" pushing one positive test charge from the
 * bottom plate to the top, against the field of the charges already on the
 * top plate. The work per charge is q·V — it grows linearly with how full the
 * cap already is.
 *
 *   • Slider: N = number of unit charges already on the top plate
 *   • Readouts: V_now, work to push the next nC across
 *   • Visual: a "work tape" gauge that fills proportionally to V, plus an
 *     animated arrow climbing from bottom plate to top.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

// One unit of charge on the plate = 1 nC, just to keep numbers friendly.
const Q_UNIT = 1e-9;

export function WhyHarderEachChargeDemo({ figure }: Props) {
  // Fixed reference geometry — focus is on N, not on the geometry tradeoff.
  const A_m2 = 100e-4; // 100 cm²
  const d_m = 1e-3; // 1 mm
  const C = (PHYS.eps_0 * A_m2) / d_m;

  const [N, setN] = useState(0);

  const Q_now = N * Q_UNIT;
  const V_now = Q_now / C;
  const workForNext = Q_UNIT * V_now;

  // Cumulative work to charge from 0 to N+1 (sum approximation; exact integral
  // for continuum is ½ C V², which we also display so the reader sees both).
  // Sum_{k=0..N} q · k · q / C  =  q²/C · N(N+1)/2
  const W_so_far = (((Q_UNIT * Q_UNIT) / C) * (N * (N - 1))) / 2; // work spent up to N
  const W_integral = 0.5 * C * V_now * V_now;

  const stateRef = useRef({ N, V_now, workForNext });
  useEffect(() => {
    stateRef.current = { N, V_now, workForNext };
  }, [N, V_now, workForNext]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const s = stateRef.current;
      phase += 0.012;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Two pads
      const plateW = Math.min(W * 0.45, 280);
      const cx = W * 0.32;
      const cy = H / 2;
      const gap = 130;
      const plateThick = 6;
      const xL = cx - plateW / 2;
      const topY = cy - gap / 2;
      const botY = cy + gap / 2;

      // Top plate already has N unit charges
      drawBar(ctx, xL, topY - plateThick, plateW, plateThick, '#ff3b6e');
      drawBar(ctx, xL, botY, plateW, plateThick, '#5baef8');

      // Render N existing charges on top plate
      const drawN = Math.min(40, s.N);
      ctx.fillStyle = getCanvasColors().pink;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < drawN; i++) {
        const x = xL + 10 + ((plateW - 20) * (i + 0.5)) / Math.max(drawN, 1);
        ctx.fillText('+', x, topY - plateThick - 8);
      }
      ctx.fillStyle = getCanvasColors().blue;
      for (let i = 0; i < drawN; i++) {
        const x = xL + 10 + ((plateW - 20) * (i + 0.5)) / Math.max(drawN, 1);
        ctx.fillText('−', x, botY + plateThick + 8);
      }

      // Field arrows in the gap (count grows with N)
      const usable = botY - topY - 16;
      const Nfield = Math.max(2, Math.min(16, Math.round(Math.log10(s.N + 1) * 7) + 1));
      const arrLen = 16;
      for (let i = 0; i < Nfield; i++) {
        const fx = xL + 18 + ((plateW - 36) * (i + 0.5)) / Nfield;
        const cycle = (phase * 80 + i * 13) % usable;
        const y1 = topY + 8 + cycle;
        ctx.strokeStyle = 'rgba(255,59,110,0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(fx, y1 - arrLen);
        ctx.lineTo(fx, y1);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,59,110,0.8)';
        ctx.beginPath();
        ctx.moveTo(fx, y1);
        ctx.lineTo(fx - 3, y1 - 5);
        ctx.lineTo(fx + 3, y1 - 5);
        ctx.closePath();
        ctx.fill();
      }

      // The "worker": animated test charge climbing from bottom plate to top.
      const climbPhase = (phase * 0.6) % 1;
      const wY = botY - climbPhase * (botY - topY);
      const wX = cx + plateW / 2 + 28;
      // Climb arrow
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wX, botY);
      ctx.lineTo(wX, wY);
      ctx.stroke();
      // Test charge dot
      ctx.fillStyle = getCanvasColors().accent;
      ctx.beginPath();
      ctx.arc(wX, wY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = getCanvasColors().bg;
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+q', wX, wY);

      // Effort label next to climber
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('push', wX + 12, (topY + botY) / 2);

      // Plate labels
      ctx.fillStyle = getCanvasColors().pink;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('top plate (+)', xL - 6, topY - 2);
      ctx.fillStyle = getCanvasColors().blue;
      ctx.fillText('bottom plate (−)', xL - 6, botY + 2);

      // ── Work-tape gauge on the right
      const tapeX = W * 0.74;
      const tapeY = 30;
      const tapeW = Math.min(W - tapeX - 24, 120);
      const tapeH = H - 60;

      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('Effort ∝ V', tapeX, tapeY - 4);

      ctx.strokeStyle = getCanvasColors().border;
      ctx.lineWidth = 1;
      ctx.strokeRect(tapeX, tapeY, tapeW, tapeH);

      // Fill height grows with V/Vmax_visual. Pick a reference of N=200.
      const Vmax_ref = (200 * Q_UNIT) / C;
      const fill = Math.max(0, Math.min(1, Math.abs(s.V_now) / Vmax_ref));
      const fillH = tapeH * fill;
      ctx.fillStyle = 'rgba(255,107,42,0.25)';
      ctx.fillRect(tapeX, tapeY + tapeH - fillH, tapeW, fillH);

      // Tick lines
      ctx.strokeStyle = getCanvasColors().border;
      for (let i = 1; i <= 4; i++) {
        const y = tapeY + (tapeH * i) / 5;
        ctx.beginPath();
        ctx.moveTo(tapeX, y);
        ctx.lineTo(tapeX + 8, y);
        ctx.stroke();
      }

      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`V = ${s.V_now.toFixed(2)} V`, tapeX + tapeW / 2, tapeY + tapeH + 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.2'}
      title="Why each charge is harder than the last"
      question="What does the (N+1)ᵗʰ charge actually push against?"
      caption={
        <>
          The orange test charge climbs the gap against the field already set up by the{' '}
          <strong>N</strong> charges sitting on the top plate. The work to lift it is{' '}
          <strong>q·V</strong>, and <strong>V</strong> grows linearly with N. Slide N up and the bar
          climbs: the (N+1)ᵗʰ charge pays linearly more in work than the first one did.
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N (charges already there)"
          value={N}
          min={0}
          max={200}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={(v) => setN(Math.round(v))}
        />
        <MiniReadout label="V now" value={<Num value={V_now} />} unit="V" />
        <MiniReadout label="work for next nC" value={<Num value={workForNext} />} unit="J" />
        <MiniReadout label="Σ work so far" value={<Num value={W_so_far} />} unit="J" />
        <MiniReadout label="½CV² (continuum)" value={<Num value={W_integral} />} unit="J" />
      </DemoControls>
    </Demo>
  );
}

function drawBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  const grd = ctx.createLinearGradient(x, y, x, y + h);
  grd.addColorStop(0, color);
  grd.addColorStop(1, color + '99');
  ctx.fillStyle = grd;
  ctx.shadowColor = color + '80';
  ctx.shadowBlur = 8;
  ctx.fillRect(x, y, w, h);
  ctx.shadowBlur = 0;
}
