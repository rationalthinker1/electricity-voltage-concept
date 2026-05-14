/**
 * Demo D10.6 — Three-phase
 *
 *   V_a(t) = V_pk cos(ωt)
 *   V_b(t) = V_pk cos(ωt − 2π/3)
 *   V_c(t) = V_pk cos(ωt − 4π/3)
 *
 * Their instantaneous sum is exactly zero — so the return current on a delta
 * three-wire system also sums to zero, and no neutral wire is needed.
 *
 * Right side: rotating phasor diagram showing the three vectors at 120° apart.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

const Vpk = 1;
const TAU3 = (2 * Math.PI) / 3;

export function ThreePhaseDemo({ figure }: Props) {
  const [f, setF] = useState(60);     // Hz (real grid)
  const stateRef = useRef({ f });
  useEffect(() => { stateRef.current.f = f; }, [f]);

  const Vrms = Vpk / Math.sqrt(2);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let simT = 0;
    let lastT = performance.now();
    const SCOPE_DURATION = 0.05;  // 50 ms window

    function draw() {
      const { f } = stateRef.current;
      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;
      // playback rate — slow down >120 Hz a bit so we can see waves
      const slow = f > 120 ? 120 / f : 1;
      simT += dt * slow;

      // Use the actual omega but with slowed virtual time
      const omega = 2 * Math.PI * f;
      const phase = omega * simT;
      const tStart = simT - SCOPE_DURATION;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Split: oscilloscope left, phasor right. Use a more generous left
      // share at narrow widths so the waveform labels don't crowd.
      const splitX = Math.max(w * 0.58, w - 240);

      // ── LEFT: scope of three waveforms
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, splitX, h); ctx.clip();

      const plotX = 36;
      const plotW = Math.max(80, splitX - 60);
      const plotY = 32;
      const plotH = h - 60;
      const cyP = plotY + plotH / 2;

      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(plotX, plotY, plotW, plotH);

      // Zero line
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.beginPath();
      ctx.moveTo(plotX, cyP); ctx.lineTo(plotX + plotW, cyP); ctx.stroke();

      const xT = (tt: number) => plotX + ((tt - tStart) / SCOPE_DURATION) * plotW;
      const yV = (v: number) => cyP - (v / Vpk) * (plotH / 2) * 0.85;
      const sampleCount = Math.max(160, Math.floor(plotW));
      const voltageAt = (t: number, offset: number) => Vpk * Math.cos(omega * t - offset);

      // Three traces
      const colors = [
        'rgba(255,59,110,0.95)',  // pink
        'rgba(108,197,194,0.95)', // teal
        'rgba(255,107,42,0.95)',  // amber
      ];
      const offsets = [0, TAU3, 2 * TAU3];
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = colors[k];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= sampleCount; i++) {
          const t = tStart + (i / sampleCount) * SCOPE_DURATION;
          const x = xT(t);
          const y = yV(voltageAt(t, offsets[k]));
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Sum trace (should hug zero)
      ctx.strokeStyle = 'rgba(236,235,229,0.95)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= sampleCount; i++) {
        const t = tStart + (i / sampleCount) * SCOPE_DURATION;
        const sumTrace = voltageAt(t, 0) + voltageAt(t, TAU3) + voltageAt(t, 2 * TAU3);
        const x = xT(t);
        const y = yV(sumTrace);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Legend
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = colors[0]; ctx.fillText('V_a', plotX + 4, plotY + 4);
      ctx.fillStyle = colors[1]; ctx.fillText('V_b', plotX + 36, plotY + 4);
      ctx.fillStyle = colors[2]; ctx.fillText('V_c', plotX + 68, plotY + 4);
      ctx.fillStyle = 'rgba(236,235,229,0.85)';
      ctx.fillText('Σ = 0', plotX + 100, plotY + 4);

      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${f.toFixed(0)} Hz — 120° apart`, plotX + plotW / 2, h - 14);

      ctx.restore();

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h); ctx.stroke();

      // ── RIGHT: phasor diagram
      ctx.save();
      ctx.beginPath(); ctx.rect(splitX, 0, w - splitX, h); ctx.clip();

      const pcx = splitX + (w - splitX) / 2;
      const pcy = h / 2 + 8;
      const pR = Math.max(50, Math.min((w - splitX) / 2 - 18, h / 2 - 36));

      // Reference circle
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pcx, pcy, pR, 0, Math.PI * 2); ctx.stroke();
      // Axes
      ctx.beginPath();
      ctx.moveTo(pcx - pR - 4, pcy); ctx.lineTo(pcx + pR + 4, pcy);
      ctx.moveTo(pcx, pcy - pR - 4); ctx.lineTo(pcx, pcy + pR + 4);
      ctx.stroke();

      // Three rotating phasors
      const angles = [phase, phase - TAU3, phase - 2 * TAU3];
      const cols = [colors[0], colors[1], colors[2]];
      const labels = ['a', 'b', 'c'];
      for (let k = 0; k < 3; k++) {
        const ax = pcx + Math.cos(angles[k]) * pR;
        const ay = pcy - Math.sin(angles[k]) * pR;
        ctx.strokeStyle = cols[k];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pcx, pcy); ctx.lineTo(ax, ay); ctx.stroke();
        // arrowhead
        const ang = Math.atan2(ay - pcy, ax - pcx);
        ctx.fillStyle = cols[k];
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 8 * Math.cos(ang - 0.4), ay - 8 * Math.sin(ang - 0.4));
        ctx.lineTo(ax - 8 * Math.cos(ang + 0.4), ay - 8 * Math.sin(ang + 0.4));
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = cols[k];
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[k], ax + 10 * Math.cos(ang), ay + 10 * Math.sin(ang));
      }

      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('phasors at 120°', pcx, 10);
      ctx.textBaseline = 'bottom';
      ctx.fillText(`Σ vectors → 0`, pcx, h - 8);

      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 10.6'}
      title="Three-phase — why the grid uses three wires"
      question="Three sinusoids, each 120° behind the previous. What's special about that sum?"
      caption={<>
        Three voltages 120° apart in phase add to exactly zero at every instant. That means a
        balanced three-phase delta system needs no neutral return wire — three wires carry
        all the power. The right panel shows the phasor picture: three vectors of equal length
        at 120°, summing geometrically to the origin.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="f"
          value={f} min={10} max={400} step={1}
          format={v => v.toFixed(0) + ' Hz'}
          onChange={setF}
        />
        <MiniReadout label="V_pk" value={Vpk.toFixed(2)} unit="V" />
        <MiniReadout label="V_rms = V_pk/√2" value={Vrms.toFixed(3)} unit="V" />
        <MiniReadout label="Phase offset" value="120°" />
      </DemoControls>
    </Demo>
  );
}
