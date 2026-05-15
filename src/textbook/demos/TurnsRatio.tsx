/**
 * Demo D18.2 — Turns-ratio oscilloscope
 *
 * A single slider for the turns ratio n = N_s/N_p. Two waveforms overlaid:
 * the primary voltage V_p(t) (a fixed 170 V peak sinusoid) and the secondary
 * V_s(t) = n · V_p(t). The reader sweeps the ratio and watches V_s scale
 * while phase stays locked.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const VP_PEAK = 170;     // 170 V peak ≈ 120 V_rms
const F_HZ = 60;          // 60 Hz line

export function TurnsRatioDemo({ figure }: Props) {
  const [ratio, setRatio] = useState(0.1);    // step-down 10:1 by default

  const stateRef = useRef({ ratio });
  useEffect(() => { stateRef.current.ratio = ratio; }, [ratio]);

  const computed = useMemo(() => {
    const Vs = VP_PEAK * ratio;
    const VsRms = Vs / Math.sqrt(2);
    return { Vs, VsRms };
  }, [ratio]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let t0 = performance.now();

    function draw() {
      const { ratio } = stateRef.current;
      const t = (performance.now() - t0) / 1000;
      // visual time scaling: show 60 Hz cycles at ~2 Hz so eye can track
      const tVis = t * (2 / F_HZ);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 30;
      const padT = 24, padB = 30;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const cy = padT + plotH / 2;

      // Frame
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // Zero line
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(padL, cy); ctx.lineTo(padL + plotW, cy);
      ctx.stroke();

      // Y-axis voltage scale: full window = ±200 V
      const yMax = 200;
      const yScale = (plotH / 2) * 0.92 / yMax;

      // Gridlines at ±100 V, ±50 V
      ctx.strokeStyle = colors.border;
      [-150, -100, -50, 50, 100, 150].forEach(v => {
        const y = cy - v * yScale;
        ctx.beginPath();
        ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y);
        ctx.stroke();
      });

      // y labels
      ctx.fillStyle = 'rgba(160,158,149,0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [-150, 0, 150].forEach(v => {
        const y = cy - v * yScale;
        ctx.fillText((v > 0 ? '+' : '') + v.toFixed(0), padL - 6, y);
      });

      // Time window: 2 full 60-Hz cycles
      const tWindow = 2 / F_HZ;
      const samples = 320;
      const omega = 2 * Math.PI * F_HZ;

      // V_p in pink
      ctx.strokeStyle = colors.pink;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const tau = (i / samples) * tWindow;
        const v = VP_PEAK * Math.sin(omega * (tVis + tau));
        const x = padL + (i / samples) * plotW;
        const y = cy - v * yScale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // V_s in amber
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const tau = (i / samples) * tWindow;
        const v = VP_PEAK * ratio * Math.sin(omega * (tVis + tau));
        const x = padL + (i / samples) * plotW;
        const y = cy - v * yScale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Legend
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = colors.pink;
      ctx.fillText('— V_p (170 V peak)', padL + 8, padT + 6);
      ctx.fillStyle = colors.accent;
      ctx.fillText(`— V_s = n · V_p`, padL + 8, padT + 22);

      // x-axis label
      ctx.fillStyle = 'rgba(160,158,149,0.6)';
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText('t (60 Hz · 2 cycles)', padL + plotW, padT + plotH + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.2'}
      title="Turns ratio sets the voltage scale"
      question="One knob. The secondary scales. The frequency and phase don't."
      caption={<>
        Two traces of <em>V(t) = V_peak · sin(ωt)</em>: the primary at fixed 170 V peak, the secondary at
        <em> n · V_peak</em> where <em>n = N_s/N_p</em>. Slide n from 0.01 (huge step-down) through 1 (1:1
        isolation) to ~3 (step-up). The waveforms stay perfectly phase-locked — that's what "ideal" means.
      </>}
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="n = N_s/N_p"
          value={ratio} min={0.01} max={1.2} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setRatio}
        />
        <MiniReadout label="V_s,peak" value={<Num value={computed.Vs} digits={2} />} unit="V" />
        <MiniReadout label="V_s,rms" value={<Num value={computed.VsRms} digits={2} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}
