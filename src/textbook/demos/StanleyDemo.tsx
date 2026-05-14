/**
 * Demo D18.3 — Why HV transmission won (the Stanley story)
 *
 * Block diagram: AC generator → step-up transformer → transmission line
 * (resistance R per length × distance) → step-down transformer → load.
 * Sliders: distance, transmission voltage. Live: line current, I²R loss,
 * delivered power fraction.
 *
 * Holds delivered power constant at P_load = 1 MW (so the comparison is
 * "to send the same kilowatt-hour to the same town, what voltage do you
 * use?"). The takeaway: I = P/V, so doubling V quarters the loss.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const P_LOAD_W = 1e6;             // 1 MW delivered to the town
const RHO_OHM_PER_KM = 0.1;       // ~ACSR 477 kcmil ≈ 0.1 Ω/km, both conductors

export function StanleyDemo({ figure }: Props) {
  const [distanceKm, setDistanceKm] = useState(100);
  const [Vline, setVline] = useState(4000);   // line voltage in V

  const stateRef = useRef({ distanceKm, Vline });
  useEffect(() => { stateRef.current = { distanceKm, Vline }; }, [distanceKm, Vline]);

  const computed = useMemo(() => {
    const R = RHO_OHM_PER_KM * distanceKm;       // total line resistance (both conductors)
    const I = P_LOAD_W / Vline;                  // line current
    const Ploss = I * I * R;                     // I²R loss
    const Pgen = P_LOAD_W + Ploss;               // generator must supply both
    const eff = P_LOAD_W / Pgen;
    return { R, I, Ploss, Pgen, eff };
  }, [distanceKm, Vline]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let t0 = performance.now();

    function draw() {
      const { distanceKm, Vline } = stateRef.current;
      const t = (performance.now() - t0) / 1000;
      const R = RHO_OHM_PER_KM * distanceKm;
      const I = P_LOAD_W / Vline;
      const Ploss = I * I * R;
      const eff = P_LOAD_W / (P_LOAD_W + Ploss);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const cy = h * 0.45;
      const padX = 30;
      const blockW = 56, blockH = 40;
      const positions = [
        { label: 'GEN', sub: '500 V', x: padX },
        { label: 'STEP-UP', sub: 'kV', x: padX + (w - 2 * padX - blockW) * 0.27 },
        { label: 'STEP-DOWN', sub: 'V', x: padX + (w - 2 * padX - blockW) * 0.73 },
        { label: 'LOAD', sub: '1 MW', x: w - padX - blockW },
      ];

      // Transmission line between idx 1 and idx 2
      const lineX0 = positions[1].x + blockW;
      const lineX1 = positions[2].x;
      // Heat colour proportional to loss fraction (1 - eff), clamped
      const hot = Math.min(1, (1 - eff) * 4);
      const lineColor = `rgba(${255}, ${107 - hot * 60}, ${42 - hot * 30}, ${0.5 + hot * 0.45})`;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2 + hot * 2;
      ctx.beginPath();
      ctx.moveTo(lineX0, cy - 8);
      ctx.lineTo(lineX1, cy - 8);
      ctx.moveTo(lineX0, cy + 8);
      ctx.lineTo(lineX1, cy + 8);
      ctx.stroke();
      // Animated current arrows on the line
      const dotCount = 8;
      for (let k = 0; k < dotCount; k++) {
        const u = ((k / dotCount + t * 0.3) % 1 + 1) % 1;
        const x = lineX0 + u * (lineX1 - lineX0);
        ctx.fillStyle = lineColor;
        ctx.beginPath(); ctx.arc(x, cy - 8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, cy + 8, 2, 0, Math.PI * 2); ctx.fill();
      }

      // Heat shimmer if loss is large
      if (hot > 0.3) {
        ctx.fillStyle = `rgba(255,107,42,${0.06 * hot})`;
        ctx.fillRect(lineX0, cy - 20, lineX1 - lineX0, 40);
      }

      // Draw blocks on top
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        ctx.fillStyle = '#16161a';
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.4;
        ctx.fillRect(p.x, cy - blockH / 2, blockW, blockH);
        ctx.strokeRect(p.x, cy - blockH / 2, blockW, blockH);
        ctx.fillStyle = colors.accent;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.label, p.x + blockW / 2, cy - 6);
        ctx.fillStyle = colors.textDim;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(p.sub, p.x + blockW / 2, cy + 8);
      }

      // Short wires between non-transmission blocks
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      for (let i = 0; i < positions.length - 1; i++) {
        if (i === 1) continue;          // skip transmission segment (already drawn)
        const a = positions[i].x + blockW;
        const b = positions[i + 1].x;
        ctx.beginPath();
        ctx.moveTo(a, cy); ctx.lineTo(b, cy); ctx.stroke();
      }

      // Labels: V_line above the transmission segment; distance below
      ctx.fillStyle = colors.teal;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      const lcx = (lineX0 + lineX1) / 2;
      ctx.fillText(`V_line = ${formatVoltage(Vline)}`, lcx, cy - 18);
      ctx.fillText(`I = ${formatCurrent(I)}`, lcx, cy - 32);
      ctx.fillStyle = colors.textDim;
      ctx.textBaseline = 'top';
      ctx.fillText(`${distanceKm} km · R = ${R.toFixed(1)} Ω`, lcx, cy + 24);

      // Efficiency bar
      const barX = padX, barY = h - 30, barW = w - 2 * padX, barH = 14;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = colors.teal;
      ctx.fillRect(barX, barY, barW * eff, barH);
      ctx.fillStyle = 'rgba(255,107,42,0.55)';
      ctx.fillRect(barX + barW * eff, barY, barW * (1 - eff), barH);
      ctx.fillStyle = colors.text;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`delivered: ${(eff * 100).toFixed(1)} %`, barX + 4, barY + barH / 2);
      ctx.textAlign = 'right';
      ctx.fillText(`lost as heat: ${((1 - eff) * 100).toFixed(1)} %`, barX + barW - 4, barY + barH / 2);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.3'}
      title="The Stanley argument — why high voltage wins long distance"
      question="Hold delivered power at 1 MW. Vary the line voltage. Watch the loss."
      caption={<>
        For a fixed delivered power P, the line current is I = P/V. The I²R loss in the conductors scales as
        <em> P² R / V²</em> — quadratic in 1/V. Double the transmission voltage, quarter the loss. This is the
        single most important fact in 19th-century electrical engineering: it is the reason your power grid is
        AC and not DC, and the reason the wires above your street carry 12 kV or 25 kV instead of 240 V.
      </>}
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="distance"
          value={distanceKm} min={5} max={500} step={5}
          format={v => Math.round(v) + ' km'}
          onChange={setDistanceKm}
        />
        <MiniSlider
          label="V_line"
          value={Vline} min={500} max={500000} step={500}
          format={v => formatVoltage(v)}
          onChange={setVline}
        />
        <MiniReadout label="I_line" value={<Num value={computed.I} digits={2} />} unit="A" />
        <MiniReadout label="P_loss" value={<Num value={computed.Ploss} digits={2} />} unit="W" />
        <MiniReadout label="efficiency" value={(computed.eff * 100).toFixed(2)} unit="%" />
      </DemoControls>
    </Demo>
  );
}

function formatVoltage(v: number): string {
  if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1) + ' kV';
  return Math.round(v) + ' V';
}
function formatCurrent(I: number): string {
  if (I >= 1000) return (I / 1000).toFixed(2) + ' kA';
  return I.toFixed(I >= 10 ? 0 : 1) + ' A';
}
