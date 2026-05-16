/**
 * Demo D11.5 — Susceptibility bar chart
 *
 * Side-by-side: electric susceptibility χ_e (left) and magnetic susceptibility
 * χ_m (right) for a handful of representative materials, plotted on a log
 * scale of |χ|. χ_m for diamagnets is negative — that branch is drawn below
 * the axis (sign-aware log).
 *
 * No interaction needed — this is a pure visualization. Toggle between linear
 * and log scaling.
 *
 * Numbers: |χ_e| from standard tables (Jackson Ch.4; Griffiths Ch.4 Table 4.2):
 *   vacuum 0, air 5.4×10⁻⁴, glass ~4–10 (take 5), water 79, ferroelectric (BaTiO₃) >1000.
 * |χ_m| from Griffiths Ch.6 Table 6.1 / CRC Handbook:
 *   vacuum 0, copper −9.7×10⁻⁶, aluminum +2.2×10⁻⁵, iron ~5000 (soft-iron μ_r ~5000+).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniToggle } from '@/components/Demo';

interface Props {
  figure?: string;
}

interface Bar {
  label: string;
  chi: number; // signed susceptibility
  color: string;
}

const ELECTRIC: Bar[] = [
  { label: 'vacuum', chi: 0, color: 'rgba(160,158,149,0.6)' },
  { label: 'air', chi: 5.4e-4, color: 'rgba(108,197,194,0.85)' },
  { label: 'glass', chi: 5, color: 'rgba(108,197,194,0.85)' },
  { label: 'water', chi: 79, color: 'rgba(255,107,42,0.85)' },
  { label: 'BaTiO₃', chi: 1500, color: 'rgba(255,59,110,0.85)' },
];

const MAGNETIC: Bar[] = [
  { label: 'vacuum', chi: 0, color: 'rgba(160,158,149,0.6)' },
  { label: 'copper', chi: -9.7e-6, color: 'rgba(91,174,248,0.85)' },
  { label: 'aluminum', chi: 2.2e-5, color: 'rgba(108,197,194,0.85)' },
  { label: 'iron (soft)', chi: 5000, color: 'rgba(255,107,42,0.85)' },
];

export function SusceptibilityDemo({ figure }: Props) {
  const [log, setLog] = useState(true);
  const stateRef = useRef({ log });
  useEffect(() => {
    stateRef.current = { log };
  }, [log]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function drawBars(bars: Bar[], x0: number, panelW: number, title: string) {
      const { log } = stateRef.current;
      const top = 40;
      const baseY = h - 40;
      const usableH = baseY - top;
      const slot = panelW / bars.length;

      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(title, x0 + 4, top - 14);

      // Axis baseline
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(x0, baseY);
      ctx.lineTo(x0 + panelW, baseY);
      ctx.stroke();

      // Determine scaling
      const absMax = bars.reduce((m, b) => Math.max(m, Math.abs(b.chi)), 0);
      const logMaxExp = absMax > 0 ? Math.ceil(Math.log10(absMax)) : 0;
      const logMinExp = -7; // floor for log-axis
      const linMax = absMax || 1;

      for (let i = 0; i < bars.length; i++) {
        const b = bars[i];
        const cx = x0 + (i + 0.5) * slot;
        const barW = slot * 0.55;
        const abs = Math.abs(b.chi);
        let frac = 0;
        if (abs > 0) {
          if (log) {
            const lg = Math.log10(abs);
            frac = (lg - logMinExp) / (logMaxExp - logMinExp);
            frac = Math.max(0, Math.min(1, frac));
          } else {
            frac = abs / linMax;
          }
        }
        const barH = frac * usableH;
        // Sign: positive up from baseline, negative down (small dip even on log axis)
        const sign = b.chi < 0 ? -1 : 1;
        const yTop = sign > 0 ? baseY - barH : baseY + Math.min(40, barH * 0.25);
        const yH = sign > 0 ? barH : Math.min(40, barH * 0.25);
        ctx.fillStyle = b.color;
        ctx.fillRect(cx - barW / 2, yTop, barW, yH);

        // Bar label
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, cx, baseY + 14);
        // Value label above bar
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '9px "JetBrains Mono", monospace';
        const valStr = formatChi(b.chi);
        ctx.fillText(valStr, cx, sign > 0 ? yTop - 4 : baseY + 32);
      }

      // Log-scale axis ticks on the left side
      if (log) {
        ctx.fillStyle = 'rgba(160,158,149,0.55)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        for (let e = logMinExp; e <= logMaxExp; e++) {
          const frac = (e - logMinExp) / (logMaxExp - logMinExp);
          const y = baseY - frac * usableH;
          ctx.strokeStyle = colors.border;
          ctx.beginPath();
          ctx.moveTo(x0, y);
          ctx.lineTo(x0 + panelW, y);
          ctx.stroke();
          ctx.fillText(`10^${e}`, x0 - 3, y + 3);
        }
      }
    }

    function formatChi(v: number) {
      if (v === 0) return '0';
      const a = Math.abs(v);
      if (a >= 100) return v.toFixed(0);
      if (a >= 1) return v.toFixed(1);
      if (a >= 1e-3) return v.toExponential(1);
      return v.toExponential(1);
    }

    function draw() {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const pad = 36;
      const panelW = (w - 3 * pad) / 2;
      drawBars(ELECTRIC, pad, panelW, 'χₑ  (electric susceptibility)');
      drawBars(MAGNETIC, pad * 2 + panelW, panelW, 'χₘ  (magnetic susceptibility)');

      // Divider
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(pad + panelW + pad / 2, 14);
      ctx.lineTo(pad + panelW + pad / 2, h - 14);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 11.5'}
      title="One number per material, per response"
      question="How big is the response — and how spread out is the range?"
      caption={
        <>
          Two susceptibilities, three orders of magnitude each. Air is so weakly polar that ε
          <sub>r</sub> ≈ 1.0005 — for almost any engineering purpose, air is "vacuum-like." Water
          sits at ε<sub>r</sub> ≈ 80 because of its permanent molecular dipoles. A soft-iron core's
          χₘ ≈ 5000 is what lets it concentrate magnetic flux thousands of times more than the same
          volume of air, which is the whole point of a transformer or an electromagnet. Copper is
          feebly diamagnetic — note the small dip below zero.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle label={log ? 'log scale' : 'linear scale'} checked={log} onChange={setLog} />
      </DemoControls>
    </Demo>
  );
}
