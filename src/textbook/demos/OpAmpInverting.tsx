/**
 * Demo D12.11 — Inverting op-amp
 *
 * Ideal op-amp inverting topology:
 *   V_out = − (R_f / R_in) · V_in
 * clipped to the ±V_sup rails when the math says |V_out| > V_sup.
 *
 * Display: V_in and V_out as overlaid sine traces on a scope-like
 * plot.  When V_out hits a rail, that part of the trace flattens.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { drawGlowPath } from '@/lib/canvasPrimitives';

interface Props { figure?: string }

const V_SUP = 10;  // ±10 V rails

export function OpAmpInvertingDemo({ figure }: Props) {
  const [RinK, setRinK] = useState(10);    // kΩ
  const [RfK, setRfK] = useState(100);     // kΩ
  const [Vamp, setVamp] = useState(0.5);   // V peak

  const gain = -(RfK / RinK);
  const Vout_peak = gain * Vamp;
  const railed = Math.abs(Vout_peak) > V_SUP;

  const stateRef = useRef({ gain, Vamp });
  useEffect(() => { stateRef.current = { gain, Vamp }; }, [gain, Vamp]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    const t0 = performance.now();

    function draw() {
      const { gain, Vamp } = stateRef.current;
      const tnow = (performance.now() - t0) / 1000;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 30, padT = 24, padB = 24;
      const plotX = padL, plotY = padT;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(plotX, plotY, plotW, plotH);

      // Voltage axis ±V_SUP
      const yV = (v: number) =>
        plotY + plotH / 2 - (v / V_SUP) * (plotH / 2 - 6);

      // gridlines & rails
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for (let v = -10; v <= 10; v += 2) {
        const y = yV(v);
        ctx.beginPath(); ctx.moveTo(plotX, y); ctx.lineTo(plotX + plotW, y); ctx.stroke();
      }
      // zero line
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      const y0 = yV(0);
      ctx.beginPath(); ctx.moveTo(plotX, y0); ctx.lineTo(plotX + plotW, y0); ctx.stroke();
      // rails
      ctx.strokeStyle = 'rgba(255,59,110,0.35)';
      ctx.setLineDash([4, 4]);
      const yPos = yV(V_SUP);
      const yNeg = yV(-V_SUP);
      ctx.beginPath(); ctx.moveTo(plotX, yPos); ctx.lineTo(plotX + plotW, yPos); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(plotX, yNeg); ctx.lineTo(plotX + plotW, yNeg); ctx.stroke();
      ctx.setLineDash([]);

      // Trace duration: 2 cycles of a 2 Hz sine across the window
      const freq = 2.0;
      const N = 400;
      // V_in (blue)
      ctx.strokeStyle = 'rgba(91,174,248,0.9)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const t = u * 2 / freq - tnow * 0;  // static window
        const vin = Vamp * Math.sin(2 * Math.PI * freq * t + tnow * 2 * Math.PI * 0.5);
        const x = plotX + u * plotW;
        const y = yV(vin);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // V_out (orange), with rail clipping
      const voutPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const t = u * 2 / freq;
        const vin = Vamp * Math.sin(2 * Math.PI * freq * t + tnow * 2 * Math.PI * 0.5);
        let vout = gain * vin;
        if (vout > V_SUP) vout = V_SUP;
        else if (vout < -V_SUP) vout = -V_SUP;
        voutPts.push({ x: plotX + u * plotW, y: yV(vout) });
      }
      drawGlowPath(ctx, voutPts, {
        color: 'rgba(255,107,42,0.95)',
        lineWidth: 1.8,
        glowColor: 'rgba(255,107,42,0.35)',
        glowWidth: 5,
      });

      // Y axis labels
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('+10 V', plotX - 4, yPos);
      ctx.fillText('0', plotX - 4, y0);
      ctx.fillText('-10 V', plotX - 4, yNeg);

      // Header
      ctx.fillStyle = 'rgba(91,174,248,0.9)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('V_in', plotX + 4, plotY + 4);
      ctx.fillStyle = 'rgba(255,107,42,0.9)';
      ctx.fillText('V_out', plotX + 40, plotY + 4);
      ctx.fillStyle = 'rgba(236,235,229,0.9)';
      ctx.textAlign = 'right';
      ctx.fillText(`gain = ${gain.toFixed(1)}×`, plotX + plotW - 4, plotY + 4);

      // Rail clipping warning
      const peakOut = Math.abs(gain * Vamp);
      if (peakOut > V_SUP) {
        ctx.fillStyle = 'rgba(255,59,110,0.95)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('RAILED — V_out clipped to ±10 V supply', plotX + plotW / 2, plotY + plotH - 4);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.9'}
      title="Inverting op-amp"
      question="V_out = −(R_f/R_in)·V_in. Push V_in past the limit and the rails clip."
      caption={<>
        Blue: input sinusoid V<sub>in</sub>. Orange: output V<sub>out</sub> = −(R<sub>f</sub>/R<sub>in</sub>)
        × V<sub>in</sub>, inverted and amplified by the resistor ratio. The dashed lines at ±10 V are
        the supply rails — once the math wants to push V<sub>out</sub> past either, the real
        op-amp saturates and the waveform flattens against the rail.
      </>}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider label="R_in" value={RinK} min={1} max={100} step={1}
          format={v => v.toFixed(0) + ' kΩ'} onChange={setRinK} />
        <MiniSlider label="R_f" value={RfK} min={1} max={1000} step={1}
          format={v => v < 1000 ? v.toFixed(0) + ' kΩ' : (v / 1000).toFixed(1) + ' MΩ'}
          onChange={setRfK} />
        <MiniSlider label="V_in peak" value={Vamp} min={0.05} max={5} step={0.05}
          format={v => v.toFixed(2) + ' V'} onChange={setVamp} />
        <MiniReadout label="Gain" value={gain.toFixed(2)} unit="V/V" />
        <MiniReadout label="V_out peak" value={Vout_peak.toFixed(2)} unit="V" />
        <MiniReadout label="State" value={railed ? 'railed' : 'linear'} />
      </DemoControls>
    </Demo>
  );
}
