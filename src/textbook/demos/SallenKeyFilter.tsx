/**
 * Demo D13.0 — Sallen-Key 2nd-order active low-pass filter
 *
 * Equal-component Sallen-Key low-pass:
 *   R1 = R2 = R,  C1 = C2 = C,  non-inverting gain K = 1 + Rf/Rg
 *
 *   H(jω) = K / (1 − (ω/ω₀)² + j(ω/ω₀)(3 − K))
 *
 * where ω₀ = 1/(RC). For this equal-component design the Q factor is
 *   Q = 1 / (3 − K)
 *
 * so K = 1 → Q = 1/2 (Butterworth-like, no peaking) and K → 3 → Q → ∞
 * (instability at the boundary).
 *
 * Far above ω₀ the magnitude rolls off at −40 dB/decade — the steeper
 * second-order skirt that distinguishes Sallen-Key from a passive RC.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

export function SallenKeyFilterDemo({ figure }: Props) {
  const [Rk, setRk] = useState(10); // kΩ
  const [Cnf, setCnf] = useState(10); // nF
  const [K, setK] = useState(1.59); // gain (must stay below 3 for stability)

  const R = Rk * 1e3;
  const C = Cnf * 1e-9;
  const f0 = 1 / (2 * Math.PI * R * C);
  const Q = 1 / Math.max(3 - K, 1e-3);

  const stateRef = useRef({ f0, K, Q });
  useEffect(() => {
    stateRef.current = { f0, K, Q };
  }, [f0, K, Q]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { f0, K, Q } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50,
        padR = 40,
        padT = 22,
        padB = 22;
      const totalH = h - padT - padB - 14;
      const magH = totalH * 0.58;
      const phH = totalH * 0.42;
      const magY0 = padT;
      const phY0 = padT + magH + 14;
      const plotX = padL;
      const plotW = w - padL - padR;

      // Frequency range: 0.01·f0 .. 100·f0
      const logMin = Math.log10(Math.max(f0 / 100, 1));
      const logMax = Math.log10(Math.max(f0 * 100, 100));

      const dBmin = -60,
        dBmax = 30;
      const yMag = (db: number) => magY0 + magH - ((db - dBmin) / (dBmax - dBmin)) * magH;

      const phMin = -190,
        phMax = 10;
      const yPh = (p: number) => phY0 + phH - ((p - phMin) / (phMax - phMin)) * phH;

      // Frames
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(plotX, magY0, plotW, magH);
      ctx.strokeRect(plotX, phY0, plotW, phH);

      // Gridlines (mag every 20 dB, phase every 45°)
      ctx.strokeStyle = colors.border;
      for (let db = dBmin; db <= dBmax; db += 20) {
        const y = yMag(db);
        ctx.beginPath();
        ctx.moveTo(plotX, y);
        ctx.lineTo(plotX + plotW, y);
        ctx.stroke();
      }
      for (let p = phMin; p <= phMax; p += 45) {
        const y = yPh(p);
        ctx.beginPath();
        ctx.moveTo(plotX, y);
        ctx.lineTo(plotX + plotW, y);
        ctx.stroke();
      }

      // Decade x ticks
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
        ctx.moveTo(x, phY0);
        ctx.lineTo(x, phY0 + phH);
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = colors.textDim;
        ctx.fillText(fmtFreqShort(f), x, phY0 + phH + 4);
        ctx.restore();
      }

      // f0 marker
      const xf0 = plotX + ((Math.log10(f0) - logMin) / (logMax - logMin)) * plotW;
      ctx.restore();
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xf0, magY0);
      ctx.lineTo(xf0, magY0 + magH);
      ctx.moveTo(xf0, phY0);
      ctx.lineTo(xf0, phY0 + phH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Magnitude and phase curves
      const N = 280;
      // Magnitude
      const magPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const lf = logMin + u * (logMax - logMin);
        const f = Math.pow(10, lf);
        const r = f / f0;
        // H = K / ((1 - r²) + j r (3 − K))
        const re = 1 - r * r;
        const im = r * (3 - K);
        const mag = K / Math.sqrt(re * re + im * im);
        const dB = 20 * Math.log10(Math.max(mag, 1e-6));
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

      // Reference passive RC (slope -20 dB/dec) for comparison
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.textDim;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const lf = logMin + u * (logMax - logMin);
        const f = Math.pow(10, lf);
        const r = f / f0;
        const mag = 1 / Math.sqrt(1 + r * r);
        const dB = 20 * Math.log10(Math.max(mag, 1e-6));
        const x = plotX + u * plotW;
        const y = yMag(Math.max(dBmin, Math.min(dBmax, dB)));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Phase
      const phPts: { x: number; y: number }[] = [];
      let lastPhase = 0;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const lf = logMin + u * (logMax - logMin);
        const f = Math.pow(10, lf);
        const r = f / f0;
        const re = 1 - r * r;
        const im = r * (3 - K);
        // arg(1/(re+j·im)) = -atan2(im, re)
        let ph = (-Math.atan2(im, re) * 180) / Math.PI;
        // Unwrap toward continuous negative angles past r > 1
        while (ph - lastPhase > 90) ph -= 360;
        while (lastPhase - ph > 90) ph += 360;
        lastPhase = ph;
        phPts.push({
          x: plotX + u * plotW,
          y: yPh(Math.max(phMin, Math.min(phMax, ph))),
        });
      }
      drawGlowPath(ctx, phPts, {
        color: 'rgba(108,197,194,0.95)',
        lineWidth: 1.6,
        glowColor: 'rgba(108,197,194,0.35)',
        glowWidth: 5,
      });

      // Axis labels
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('+20 dB', plotX - 4, yMag(20));
      ctx.fillText('0', plotX - 4, yMag(0));
      ctx.fillText('-40', plotX - 4, yMag(-40));
      ctx.fillText('0°', plotX - 4, yPh(0));
      ctx.fillText('-90°', plotX - 4, yPh(-90));
      ctx.fillText('-180°', plotX - 4, yPh(-180));

      // Headers
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('|H(jω)|  [dB]   (dashed = 1st-order RC reference)', plotX + 4, magY0 + 4);
      ctx.fillStyle = colors.teal;
      ctx.fillText('arg H(jω)  [deg]', plotX + 4, phY0 + 4);

      ctx.fillStyle = colors.text;
      ctx.textAlign = 'right';
      ctx.fillText(
        `K = ${K.toFixed(2)},  Q = ${Q.toFixed(2)},  f₀ = ${fmtFreqShort(f0)}`,
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
      figure={figure ?? 'Fig. 13.0'}
      title="Sallen-Key active low-pass — Q from gain alone"
      question="Push the gain K up from 1 toward 3. Watch the peak at f₀ sharpen — then ring."
      caption={
        <>
          Equal-component Sallen-Key low-pass with R<sub>1</sub> = R<sub>2</sub> = R and C
          <sub>1</sub> = C<sub>2</sub> = C around one op-amp configured for non-inverting gain K = 1
          + R<sub>f</sub>/R<sub>g</sub>. Cutoff f<sub>0</sub> = 1/(2π RC). Quality factor Q = 1/(3 −
          K). Far above f<sub>0</sub> the magnitude rolls off at −40 dB/decade — twice the slope of
          the passive RC reference. Cascade two of these (Q = 0.54 and Q = 1.31) and you have a
          4th-order Butterworth.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
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
          max={1000}
          step={1}
          format={(v) => (v < 1000 ? v.toFixed(0) + ' nF' : (v / 1000).toFixed(2) + ' µF')}
          onChange={setCnf}
        />
        <MiniSlider
          label="K"
          value={K}
          min={1}
          max={2.95}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setK}
        />
        <MiniReadout label="f₀ = 1/(2πRC)" value={<Num value={f0} />} unit="Hz" />
        <MiniReadout label="Q = 1/(3−K)" value={Q.toFixed(2)} />
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
