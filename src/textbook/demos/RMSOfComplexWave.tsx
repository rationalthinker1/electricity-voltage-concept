/**
 * Demo 15.5 — RMS of a complex wave
 *
 * Reader builds up a waveform from a unit-peak fundamental plus adjustable
 * amplitudes of 2nd, 3rd, and 5th harmonics. Live readouts: peak,
 * peak-to-peak, mean, RMS (computed both from Parseval — analytic — and
 * from the sampled waveform numerically), form factor, crest factor.
 *
 * Demonstrates that V_rms = V_peak/√2 holds only for a pure sine; once you
 * stack harmonics the relation breaks.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';

export function RMSOfComplexWaveDemo() {
  const [a1] = useState(1);     // fundamental fixed at unit peak
  const [a2, setA2] = useState(0);   // 2nd harmonic peak amplitude
  const [a3, setA3] = useState(0.3); // 3rd harmonic peak amplitude
  const [a5, setA5] = useState(0);   // 5th harmonic peak amplitude

  const stateRef = useRef({ a1, a2, a3, a5 });
  useEffect(() => { stateRef.current = { a1, a2, a3, a5 }; }, [a1, a2, a3, a5]);

  // Parseval: V_rms² = (1/2)·Σ a_n² (no DC term here)
  const rmsParseval = Math.sqrt((a1 * a1 + a2 * a2 + a3 * a3 + a5 * a5) / 2);

  // Numerical peak + mean of |y| over one cycle
  const { peakNum, peakToPeakNum, meanAbs, rmsNum } = useMemo(() => {
    const N = 2048;
    let mx = -Infinity, mn = Infinity, sAbs = 0, sSq = 0;
    for (let i = 0; i < N; i++) {
      const t = (i / N) * 2 * Math.PI;
      const y = a1 * Math.sin(t) + a2 * Math.sin(2 * t) + a3 * Math.sin(3 * t) + a5 * Math.sin(5 * t);
      if (y > mx) mx = y;
      if (y < mn) mn = y;
      sAbs += Math.abs(y);
      sSq += y * y;
    }
    return {
      peakNum: mx,
      peakToPeakNum: mx - mn,
      meanAbs: sAbs / N,
      rmsNum: Math.sqrt(sSq / N),
    };
  }, [a1, a2, a3, a5]);

  const formFactor = meanAbs > 0 ? rmsNum / meanAbs : 0;
  const crestFactor = rmsNum > 0 ? peakNum / rmsNum : 0;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    function draw() {
      const { a1, a2, a3, a5 } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padX = 36;
      const padY = 16;
      const midY = h / 2;
      const halfH = (h - 2 * padY) / 2 * 0.9;

      ctx.strokeStyle = colors.border;
      ctx.beginPath(); ctx.moveTo(padX, midY); ctx.lineTo(w - padX, midY); ctx.stroke();

      // Scale: max possible peak = 1 + |a2| + |a3| + |a5|
      const ymax = 1 + Math.abs(a2) + Math.abs(a3) + Math.abs(a5);
      const scale = halfH / ymax;

      // Plot fundamental dim
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      const samples = 500;
      const cycles = 2;
      for (let i = 0; i <= samples; i++) {
        const x = padX + (i / samples) * (w - 2 * padX);
        const t = (i / samples) * cycles * 2 * Math.PI;
        const y = midY - a1 * Math.sin(t) * scale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Composite wave
      ctx.restore();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const x = padX + (i / samples) * (w - 2 * padX);
        const t = (i / samples) * cycles * 2 * Math.PI;
        const y_ = a1 * Math.sin(t) + a2 * Math.sin(2 * t) + a3 * Math.sin(3 * t) + a5 * Math.sin(5 * t);
        const y = midY - y_ * scale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // RMS reference line
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.pink;
      ctx.setLineDash([4, 4]);
      const yRms = midY - rmsParseval * scale;
      ctx.beginPath(); ctx.moveTo(padX, yRms); ctx.lineTo(w - padX, yRms); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.fillStyle = colors.pink;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('+V_rms', padX + 2, yRms - 3);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [rmsParseval]);

  return (
    <Demo
      figure="Fig. 15.5"
      title="RMS of a wave with harmonics"
      question="When does V_rms = V_peak/√2 stop being true?"
      caption={
        <>
          For a pure sine, V_rms = V_peak/√2 ≈ 0.707·V_peak. Add even a small third harmonic and the relation breaks —
          peak and RMS change at different rates. Parseval's theorem gives V_rms = √[(1/2)·Σ a_n²] directly from the
          harmonic amplitudes; the form factor V_rms/V_avg and crest factor V_peak/V_rms are how a meter or a power
          spec captures the shape of a non-sinusoidal wave.
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="2nd harm a₂"
          value={a2} min={0} max={1} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setA2}
        />
        <MiniSlider
          label="3rd harm a₃"
          value={a3} min={0} max={1} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setA3}
        />
        <MiniSlider
          label="5th harm a₅"
          value={a5} min={0} max={1} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setA5}
        />
        <MiniReadout label="V_peak" value={peakNum.toFixed(3)} />
        <MiniReadout label="V_pp" value={peakToPeakNum.toFixed(3)} />
        <MiniReadout label="V_rms (Parseval)" value={rmsParseval.toFixed(3)} />
        <MiniReadout label="V_avg (|·|)" value={meanAbs.toFixed(3)} />
        <MiniReadout label="form factor" value={formFactor.toFixed(3)} />
        <MiniReadout label="crest factor" value={crestFactor.toFixed(3)} />
      </DemoControls>
    </Demo>
  );
}
