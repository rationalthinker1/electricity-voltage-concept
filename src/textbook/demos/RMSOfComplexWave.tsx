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
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { drawAxes, drawHLine, drawLinePlot } from '@/lib/drawPlot';
import { getCanvasColors } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function RMSOfComplexWaveDemo({ figure }: Props) {
  const [a1] = useState(1); // fundamental fixed at unit peak
  const [a2, setA2] = useState(0); // 2nd harmonic peak amplitude
  const [a3, setA3] = useState(0.3); // 3rd harmonic peak amplitude
  const [a5, setA5] = useState(0); // 5th harmonic peak amplitude

  const stateRef = useSimState({ a1, a2, a3, a5 });

  // Parseval: V_rms² = (1/2)·Σ a_n² (no DC term here)
  const rmsParseval = Math.sqrt((a1 * a1 + a2 * a2 + a3 * a3 + a5 * a5) / 2);

  // Numerical peak + mean of |y| over one cycle
  const { peakNum, peakToPeakNum, meanAbs, rmsNum } = useMemo(() => {
    const N = 2048;
    let mx = -Infinity,
      mn = Infinity,
      sAbs = 0,
      sSq = 0;
    for (let i = 0; i < N; i++) {
      const t = (i / N) * 2 * Math.PI;
      const y =
        a1 * Math.sin(t) + a2 * Math.sin(2 * t) + a3 * Math.sin(3 * t) + a5 * Math.sin(5 * t);
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

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h }) => {
      const { a1, a2, a3, a5 } = stateRef.current;
      const colors = getCanvasColors();

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padX = 36;
      const padY = 16;
      const plotW = w - 2 * padX;
      const plotH = h - 2 * padY;
      const rect = { x: padX, y: padY, w: plotW, h: plotH };

      // Scale: max possible peak = 1 + |a2| + |a3| + |a5|
      const ymax = 1 + Math.abs(a2) + Math.abs(a3) + Math.abs(a5);

      drawAxes(ctx, rect, {
        xMin: 0,
        xMax: 4 * Math.PI,
        yMin: -ymax,
        yMax: ymax,
        xTicks: [],
        yTicks: [],
      });

      const yAt = (v: number) => padY + plotH - ((v + ymax) / (2 * ymax)) * plotH;

      // Center axis line
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(padX, yAt(0));
      ctx.lineTo(padX + plotW, yAt(0));
      ctx.stroke();

      const samples = 500;
      const cycles = 2;

      // Plot fundamental dim
      const fundPts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= samples; i++) {
        const x = (i / samples) * cycles * 2 * Math.PI;
        fundPts.push({ x, y: a1 * Math.sin(x) });
      }
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([3, 4]);
      drawLinePlot(ctx, rect, fundPts, 0, 4 * Math.PI, -ymax, ymax, {
        color: colors.teal,
        lineWidth: 1,
      });
      ctx.setLineDash([]);
      ctx.restore();

      // Composite wave
      const compPts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= samples; i++) {
        const x = (i / samples) * cycles * 2 * Math.PI;
        const y =
          a1 * Math.sin(x) + a2 * Math.sin(2 * x) + a3 * Math.sin(3 * x) + a5 * Math.sin(5 * x);
        compPts.push({ x, y });
      }
      drawLinePlot(ctx, rect, compPts, 0, 4 * Math.PI, -ymax, ymax, {
        color: colors.accent,
        lineWidth: 2,
      });

      // RMS reference line
      drawHLine(ctx, rect, rmsParseval, -ymax, ymax, {
        color: colors.pink,
        dash: [4, 4],
        alpha: 0.6,
      });
      drawLabel(ctx, {
        x: padX + 2,
        y: yAt(rmsParseval) - 3,
        text: '+V_rms',
        color: colors.pink,
        size: 9,
      });
    },
    [rmsParseval],
  );

  return (
    <Demo
      figure={figure}
      title="RMS of a wave with harmonics"
      question="When does V_rms = V_peak/√2 stop being true?"
      caption={
        <>
          For a pure sine, V_rms = V_peak/√2 ≈ 0.707·V_peak. Add even a small third harmonic and the
          relation breaks — peak and RMS change at different rates. Parseval's theorem gives V_rms =
          √((a₁² + a₂² + a₃² + a₅²)/2) no matter what the shape looks like. The numerical sampling
          (2048 pts/cycle) matches the analytic value to within rounding error.
        </>
      }
      deeperLab={{ slug: 'fourier-series', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="a₂"
          value={a2}
          min={0}
          max={0.6}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={setA2}
        />
        <MiniSlider
          label="a₃"
          value={a3}
          min={0}
          max={0.6}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={setA3}
        />
        <MiniSlider
          label="a₅"
          value={a5}
          min={0}
          max={0.4}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={setA5}
        />
        <MiniReadout label="peak" value={peakNum.toFixed(2)} />
        <MiniReadout label="peak-peak" value={peakToPeakNum.toFixed(2)} />
        <MiniReadout label="mean |y|" value={meanAbs.toFixed(3)} />
        <MiniReadout label="RMS (Parseval)" value={rmsParseval.toFixed(3)} />
        <MiniReadout label="RMS (numeric)" value={rmsNum.toFixed(3)} />
        <MiniReadout label="form factor" value={formFactor.toFixed(2)} />
        <MiniReadout label="crest factor" value={crestFactor.toFixed(2)} />
      </DemoControls>
      <EquationStrip
        leftLabel="Parseval's theorem"
        left={<InlineMath tex={`V_{\\text{rms}} = \\sqrt{\\tfrac{a_1^2 + a_2^2 + a_3^2 + a_5^2}{2}}`} />}
        rightLabel="Live values"
        right={<InlineMath tex={`\\sqrt{\\tfrac{${a1.toFixed(2)}^2 + ${a2.toFixed(2)}^2 + ${a3.toFixed(2)}^2 + ${a5.toFixed(2)}^2}{2}} = ${rmsParseval.toFixed(3)}`} />}
      />
    </Demo>
  );
}
