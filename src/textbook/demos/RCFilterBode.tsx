/**
 * Demo D12.9 — RC filter and Bode plot
 *
 * Low-pass:   H(jω) = 1 / (1 + jωRC),    |H| = 1/√(1+(ω/ωc)²), ωc = 1/RC
 * High-pass:  H(jω) = jωRC / (1 + jωRC), |H| = (ω/ωc)/√(1+(ω/ωc)²)
 *
 * Two stacked log-log plots: |H| in dB versus frequency on a logarithmic
 * axis (top), and arg(H) in degrees versus log-f (bottom). A marker sits
 * at the cutoff f_c.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

type Mode = 'low' | 'high';

export function RCFilterBodeDemo({ figure }: Props) {
  const [Rk, setRk] = useState(1.6); // kΩ
  const [Cnf, setCnf] = useState(100); // nF
  const [mode, setMode] = useState<Mode>('low');

  const R = Rk * 1e3;
  const C = Cnf * 1e-9;
  const fc = 1 / (2 * Math.PI * R * C);

  const stateRef = useRef({ R, C, fc, mode });
  useEffect(() => {
    stateRef.current = { R, C, fc, mode };
  }, [R, C, fc, mode]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { fc, mode } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Frequency range: 0.01·fc .. 100·fc (log)
      const logMin = Math.log10(Math.max(fc / 100, 1));
      const logMax = Math.log10(Math.max(fc * 100, 100));

      // Two stacked plots: magnitude on top half, phase on bottom half
      const padL = 50,
        padR = 40,
        padT = 24,
        padB = 24;
      const totalPlotH = h - padT - padB - 16; // 16 px gap
      const magH = totalPlotH * 0.55;
      const phaseH = totalPlotH * 0.45;
      const magY0 = padT;
      const phaseY0 = padT + magH + 16;
      const plotX = padL;
      const plotW = w - padL - padR;

      // Magnitude plot frame
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(plotX, magY0, plotW, magH);
      ctx.strokeRect(plotX, phaseY0, plotW, phaseH);

      // y-axis: magnitude in dB from -40 to +10
      const dBmin = -40,
        dBmax = 10;
      const yMag = (db: number) => magY0 + magH - ((db - dBmin) / (dBmax - dBmin)) * magH;

      // y-axis: phase from -100° to +100°
      const phMin = -100,
        phMax = 100;
      const yPh = (p: number) => phaseY0 + phaseH - ((p - phMin) / (phMax - phMin)) * phaseH;

      // gridlines
      ctx.strokeStyle = colors.border;
      for (let db = dBmin; db <= dBmax; db += 10) {
        const y = yMag(db);
        ctx.beginPath();
        ctx.moveTo(plotX, y);
        ctx.lineTo(plotX + plotW, y);
        ctx.stroke();
      }
      for (let p = phMin; p <= phMax; p += 30) {
        const y = yPh(p);
        ctx.beginPath();
        ctx.moveTo(plotX, y);
        ctx.lineTo(plotX + plotW, y);
        ctx.stroke();
      }

      // x-axis: decade ticks
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let lf = Math.ceil(logMin); lf <= Math.floor(logMax); lf++) {
        const f = Math.pow(10, lf);
        const x = plotX + ((lf - logMin) / (logMax - logMin)) * plotW;
        ctx.strokeStyle = colors.border;
        ctx.beginPath();
        ctx.moveTo(x, magY0);
        ctx.lineTo(x, magY0 + magH);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, phaseY0);
        ctx.lineTo(x, phaseY0 + phaseH);
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = colors.textDim;
        ctx.fillText(fmtFreqShort(f), x, phaseY0 + phaseH + 4);
        ctx.restore();
      }

      // f_c marker
      const xfc = plotX + ((Math.log10(fc) - logMin) / (logMax - logMin)) * plotW;
      ctx.restore();
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xfc, magY0);
      ctx.lineTo(xfc, magY0 + magH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xfc, phaseY0);
      ctx.lineTo(xfc, phaseY0 + phaseH);
      ctx.stroke();
      ctx.setLineDash([]);
      // -3 dB line
      const yM3 = yMag(-3);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.pink;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(plotX, yM3);
      ctx.lineTo(plotX + plotW, yM3);
      ctx.stroke();
      ctx.setLineDash([]);

      // Magnitude curve
      const N = 220;
      const magPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const lf = logMin + u * (logMax - logMin);
        const f = Math.pow(10, lf);
        const r = f / fc;
        const Hmag = mode === 'low' ? 1 / Math.sqrt(1 + r * r) : r / Math.sqrt(1 + r * r);
        const dB = 20 * Math.log10(Math.max(Hmag, 1e-6));
        magPts.push({
          x: plotX + u * plotW,
          y: yMag(Math.max(dBmin, Math.min(dBmax, dB))),
        });
      }
      drawGlowPath(ctx, magPts, {
        color: 'rgba(255,107,42,0.95)',
        lineWidth: 1.8,
        glowColor: 'rgba(255,107,42,0.4)',
        glowWidth: 7,
      });

      // Phase curve
      const phPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const lf = logMin + u * (logMax - logMin);
        const f = Math.pow(10, lf);
        const r = f / fc;
        // low-pass phase: −atan(r);   high-pass: +90° − atan(r) = atan(1/r)
        const phaseDeg =
          mode === 'low'
            ? (-Math.atan(r) * 180) / Math.PI
            : ((Math.PI / 2 - Math.atan(r)) * 180) / Math.PI;
        phPts.push({ x: plotX + u * plotW, y: yPh(phaseDeg) });
      }
      drawGlowPath(ctx, phPts, {
        color: 'rgba(108,197,194,0.95)',
        lineWidth: 1.6,
        glowColor: 'rgba(108,197,194,0.35)',
        glowWidth: 5,
      });

      // Y-axis labels
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('0 dB', plotX - 4, yMag(0));
      ctx.fillText('-20', plotX - 4, yMag(-20));
      ctx.fillText('-40', plotX - 4, yMag(-40));
      ctx.fillText('0°', plotX - 4, yPh(0));
      ctx.fillText('-90°', plotX - 4, yPh(-90));
      ctx.fillText('+90°', plotX - 4, yPh(90));

      // Header labels
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('|H(jω)|  [dB]', plotX + 4, magY0 + 4);
      ctx.fillStyle = colors.teal;
      ctx.fillText('arg H(jω)  [deg]', plotX + 4, phaseY0 + 4);

      ctx.fillStyle = colors.text;
      ctx.textAlign = 'right';
      ctx.fillText(
        `${mode === 'low' ? 'low-pass' : 'high-pass'}  f_c = ${fmtFreqShort(fc)}`,
        plotX + plotW - 4,
        magY0 + 4,
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.7'}
      title="RC filter — magnitude and phase Bode plots"
      question="Cross the cutoff and the slope hits −20 dB/decade. Why exactly that?"
      caption={
        <>
          Top: magnitude of the transfer function in dB on a log-frequency axis. Below f<sub>c</sub>
          the filter passes the signal flat; above f<sub>c</sub> it rolls off at{' '}
          <strong>−20 dB/decade</strong> (a factor of 10 in frequency drops the output by 10).
          Bottom: phase ramps from 0° down to −90° as ω crosses ω<sub>c</sub>. The cutoff f
          <sub>c</sub> = 1/(2π RC) is where |H| has fallen by exactly 3 dB.
        </>
      }
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={mode === 'low' ? 'Low-pass' : 'High-pass'}
          checked={mode === 'low'}
          onChange={(on) => setMode(on ? 'low' : 'high')}
        />
        <MiniSlider
          label="R"
          value={Rk}
          min={0.1}
          max={100}
          step={0.1}
          format={(v) => (v < 1 ? (v * 1000).toFixed(0) + ' Ω' : v.toFixed(2) + ' kΩ')}
          onChange={setRk}
        />
        <MiniSlider
          label="C"
          value={Cnf}
          min={1}
          max={10000}
          step={1}
          format={(v) => (v < 1000 ? v.toFixed(0) + ' nF' : (v / 1000).toFixed(2) + ' µF')}
          onChange={setCnf}
        />
        <MiniReadout label="f_c = 1/(2πRC)" value={<Num value={fc} />} unit="Hz" />
        <MiniReadout label="ω_c" value={<Num value={2 * Math.PI * fc} />} unit="rad/s" />
      </DemoControls>
    </Demo>
  );
}

function fmtFreqShort(f: number): string {
  if (!isFinite(f)) return '—';
  if (f >= 1e6) return (f / 1e6).toFixed(0) + 'M';
  if (f >= 1e3) return (f / 1e3).toFixed(0) + 'k';
  if (f >= 1) return f.toFixed(0);
  return f.toFixed(2);
}
