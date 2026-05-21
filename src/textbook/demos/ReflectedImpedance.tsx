/**
 * Demo D22.5 — Reflected impedance through a coupled pair
 *
 * Primary on the left driven by an AC source at angular frequency ω.
 * Secondary on the right closed by an adjustable resistive load R_L.
 *
 * Reader adjusts: ω, M (via k), L1, L2, R_L.
 *
 * Displayed: Z_in seen at the primary terminals, decomposed as
 *
 *   Z_in = jωL1 + (ωM)² / (R_L + jωL2)
 *
 * The |Z_in| and arg(Z_in) are shown numerically; the cartoon visualises
 * the "reflected" piece as a ghost impedance drawn on the primary side.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { getCanvasColors } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function ReflectedImpedanceDemo({ figure }: Props) {
  const [omegaKrad, setOmegaKrad] = useState(1000); // krad/s — range 100 - 10000
  const [k, setK] = useState(0.7);
  const [L1mH, setL1mH] = useState(1);
  const [L2mH, setL2mH] = useState(1);
  const [RLOhm, setRLOhm] = useState(50);

  const stateRef = useSimState({ omegaKrad, k, L1mH, L2mH, RLOhm });
  const computed = useMemo(() => {
    const omega = omegaKrad * 1000;
    const L1 = L1mH * 1e-3;
    const L2 = L2mH * 1e-3;
    const M = k * Math.sqrt(L1 * L2);

    // Z_2 = R_L + j ω L_2
    const z2re = RLOhm;
    const z2im = omega * L2;
    const z2magSq = z2re * z2re + z2im * z2im;

    // Reflected: (ωM)² / Z_2 = (ωM)² * conj(Z_2) / |Z_2|²
    const num = omega * M * omega * M;
    const reflRe = (num * z2re) / z2magSq;
    const reflIm = -(num * z2im) / z2magSq;

    // Z_in = jωL1 + reflected
    const zinRe = reflRe;
    const zinIm = omega * L1 + reflIm;

    const mag = Math.sqrt(zinRe * zinRe + zinIm * zinIm);
    const phaseDeg = (Math.atan2(zinIm, zinRe) * 180) / Math.PI;
    return { M, omega, reflRe, reflIm, zinRe, zinIm, mag, phaseDeg };
  }, [omegaKrad, k, L1mH, L2mH, RLOhm]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { omegaKrad, k, L1mH, L2mH, RLOhm } = stateRef.current;
      const omega = omegaKrad * 1000;
      const L1 = L1mH * 1e-3;
      const L2 = L2mH * 1e-3;
      const M = k * Math.sqrt(L1 * L2);
      const z2re = RLOhm;
      const z2im = omega * L2;
      const z2magSq = z2re * z2re + z2im * z2im;
      const reflRe = (omega * M * omega * M * z2re) / z2magSq;
      const reflIm = -(omega * M * omega * M * z2im) / z2magSq;
      const zinRe = reflRe;
      const zinIm = omega * L1 + reflIm;
      const mag = Math.sqrt(zinRe * zinRe + zinIm * zinIm);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cy = h / 2;
      const srcX = 24;
      const srcW = 70,
        srcH = 60;
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.4;
      ctx.fillRect(srcX, cy - srcH / 2, srcW, srcH);
      ctx.strokeRect(srcX, cy - srcH / 2, srcW, srcH);
      drawLabel(ctx, { text: 'AC', x: srcX + srcW / 2, y: cy - 8, color: colors.accent, weight: 'bold', font: 'bold 10px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: `ω = ${omegaKrad} krad/s`, x: srcX + srcW / 2, y: cy + 8, size: 9, font: '9px "JetBrains Mono", monospace' });
      const c1x = srcX + srcW + 50;
      drawCoilTwo(ctx, c1x, cy, 'L₁', `${L1mH.toFixed(1)} mH`);
      const c2x = c1x + 100;
      drawCoilTwo(ctx, c2x, cy, 'L₂', `${L2mH.toFixed(1)} mH`);
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(srcX + srcW, cy - 6);
      ctx.lineTo(c1x - 22, cy - 6);
      ctx.moveTo(srcX + srcW, cy + 6);
      ctx.lineTo(c1x - 22, cy + 6);
      ctx.stroke();
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(c1x + 22, cy);
      ctx.lineTo(c2x - 22, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabel(ctx, { text: `M = ${(M * 1e6).toFixed(0)} µH`, x: (c1x + c2x) / 2, y: cy - 30, color: colors.teal, font: '10px "JetBrains Mono", monospace', align: 'center' });
      const ldX = c2x + 50;
      const ldW = 70,
        ldH = 60;
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.4;
      ctx.fillRect(ldX, cy - ldH / 2, ldW, ldH);
      ctx.strokeRect(ldX, cy - ldH / 2, ldW, ldH);
      drawLabel(ctx, { text: 'R_L', x: ldX + ldW / 2, y: cy - 8, color: colors.teal, weight: 'bold', font: 'bold 10px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: `${RLOhm.toFixed(0)} Ω`, x: ldX + ldW / 2, y: cy + 8, size: 9, font: '9px "JetBrains Mono", monospace' });
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(c2x + 22, cy - 6);
      ctx.lineTo(ldX, cy - 6);
      ctx.moveTo(c2x + 22, cy + 6);
      ctx.lineTo(ldX, cy + 6);
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 12px "STIX Two Text", "Fraunces", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `|Z_in| = ${mag.toFixed(1)} Ω    Z_in = ${zinRe.toFixed(1)} + j ${zinIm.toFixed(1)} Ω`,
        w / 2,
        6,
      );
      drawLabel(ctx, {
        x: 12,
        y: h - 8,
        text: `reflected: (${reflRe.toFixed(1)}) + j (${reflIm.toFixed(1)}) Ω`,
        color: colors.textDim,
        size: 9,
        baseline: 'bottom',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 22.5'}
      title="Reflected impedance"
      question="What does the source see when the secondary is loaded?"
      caption={
        <>
          The secondary load and L₂ form a series impedance Z₂. The primary sees its own jωL₁ in
          series with (ωM)²/Z₂. Short the secondary (R_L → 0) and the reflected piece blows up; open
          it (R_L → ∞) and the reflected piece vanishes — the primary degenerates back to just its
          own inductor.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ω"
          value={omegaKrad}
          min={50}
          max={5000}
          step={10}
          format={(v) => v.toFixed(0) + ' krad/s'}
          onChange={setOmegaKrad}
        />
        <MiniSlider
          label="k"
          value={k}
          min={0}
          max={0.99}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setK}
        />
        <MiniSlider
          label="L₁ = L₂"
          value={L1mH}
          min={0.1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' mH'}
          onChange={(v) => {
            setL1mH(v);
            setL2mH(v);
          }}
        />
        <MiniSlider
          label="R_L"
          value={RLOhm}
          min={1}
          max={1000}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setRLOhm}
        />
        <MiniReadout label="|Z_in|" value={<Num value={computed.mag} digits={2} />} unit="Ω" />
        <MiniReadout label="phase" value={computed.phaseDeg.toFixed(0)} unit="°" />
      </DemoControls>
    </Demo>
  );
}

function drawCoilTwo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  value: string,
) {
  const turns = 5;
  const rx = 14;
  const colH = 60;
  const dy = colH / turns;
  ctx.strokeStyle = getCanvasColors().accent;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < turns; i++) {
    const y = cy - colH / 2 + (i + 0.5) * dy;
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, dy * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawLabel(ctx, {
    x: cx,
    y: cy + colH / 2 + 4,
    text: label,
    color: getCanvasColors().accent,
    align: 'center',
    baseline: 'top',
    weight: 'bold',
  });
  ctx.save();
  ctx.globalAlpha = 0.75;
  drawLabel(ctx, {
    x: cx,
    y: cy + colH / 2 + 18,
    text: value,
    color: getCanvasColors().textDim,
    size: 9,
  });
  ctx.restore();
}
