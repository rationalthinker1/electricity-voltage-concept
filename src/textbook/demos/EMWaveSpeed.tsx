/**
 * Demo D8.6 — EM wave speed from ε₀ and μ₀
 *
 * Traveling plane wave whose propagation speed c = 1/√(μ₀ε₀) is set by two
 * sliders spanning ±1 decade around the vacuum values. Toggle between fixing
 * ω (wavelength stretches/compresses) and fixing k (wave slows down/speeds
 * up). Readouts show predicted c, exact c, and their ratio.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { PHYS } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { withAlpha } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

const C_EXACT = PHYS.c;
const EPS_MIN = PHYS.eps_0 * 0.1;
const EPS_MAX = PHYS.eps_0 * 10;
const MU_MIN = PHYS.mu_0 * 0.1;
const MU_MAX = PHYS.mu_0 * 10;

// Visual base speed in px/s when c_predicted == c_exact
const C_VIS_BASE = 80;

export function EMWaveSpeedDemo({ figure }: Props) {
  const [eps, setEps] = useState<number>(PHYS.eps_0);
  const [mu, setMu] = useState<number>(PHYS.mu_0);
  const [fixOmega, setFixOmega] = useState(true);

  const cPredicted = 1 / Math.sqrt(mu * eps);
  const ratio = cPredicted / C_EXACT;

  const stateRef = useSimState({ eps, mu, fixOmega });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, simTime) => {
      const { eps: e, mu: m, fixOmega: fo } = stateRef.current;
      const cPred = 1 / Math.sqrt(m * e);
      const rat = cPred / C_EXACT;
      const cVis = C_VIS_BASE * rat;

      ctx.fillStyle = colors.canvasBg;
      ctx.fillRect(0, 0, W, H);

      const xL = 50;
      const xR = W - 20;
      const lineLen = xR - xL;
      const cy = H * 0.55;

      // Fixed parameters
      const omegaFix = (2 * Math.PI * C_VIS_BASE) / 160; // rad/s, gives ~160 px λ at vacuum
      const kFix = (2 * Math.PI) / 160; // rad/px

      const kVis = fo ? omegaFix / Math.max(cVis, 1e-6) : kFix;
      const omegaVis = fo ? omegaFix : cVis * kFix;

      // Axis
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xL, cy);
      ctx.lineTo(xR, cy);
      ctx.stroke();

      // Direction arrow
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.moveTo(xR, cy);
      ctx.lineTo(xR - 10, cy - 5);
      ctx.lineTo(xR - 10, cy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      drawLabel(ctx, {
        text: 'x · direction of propagation',
        x: xR - 200,
        y: cy + 16,
        font: '10px "JetBrains Mono", monospace',
        color: colors.textMuted,
      });

      // Wave curve
      const amp = Math.min(60, H * 0.25);
      ctx.strokeStyle = withAlpha(colors.pink, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      const N = 400;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const x = xL + u * lineLen;
        const phase = kVis * (x - xL) - omegaVis * simTime;
        const y = cy - Math.sin(phase) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Wavelength bracket (only meaningful when fix-ω, since λ changes)
      if (fo) {
        const lambdaPx = (2 * Math.PI) / kVis;
        if (lambdaPx < lineLen * 1.5 && lambdaPx > 10) {
          const bracketY = cy + amp + 18;
          const x0 = xL + 20;
          const x1 = x0 + lambdaPx;
          ctx.strokeStyle = withAlpha(colors.teal, 0.7);
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(x0, bracketY - 4);
          ctx.lineTo(x0, bracketY);
          ctx.lineTo(x1, bracketY);
          ctx.lineTo(x1, bracketY - 4);
          ctx.stroke();
          ctx.setLineDash([]);
          drawLabel(ctx, {
            text: `λ ≈ ${lambdaPx.toFixed(0)} px`,
            x: (x0 + x1) / 2,
            y: bracketY + 12,
            align: 'center',
            size: 9,
            color: colors.teal,
          });
        }
      }

      // Mode label
      drawLabel(ctx, {
        text: fo ? 'fix ω — λ changes with c' : 'fix k — speed changes with c',
        x: 14,
        y: 18,
        size: 10,
        color: colors.textDim,
      });

      // Speed readout on canvas
      drawLabel(ctx, {
        text: `c = ${cPred.toExponential(3)} m/s`,
        x: 14,
        y: 36,
        size: 10,
        color: colors.accent,
      });
    },
    [],
  );

  const epsStr = eps.toExponential(2);
  const muStr = mu.toExponential(2);
  const cPredStr = cPredicted.toExponential(3);

  return (
    <Demo
      figure={figure ?? 'Fig. 10.6'}
      title="Wave speed from ε₀ and μ₀"
      question="What happens to the wave when you change the vacuum constants?"
      caption={
        <>
          The propagation speed is <InlineMath>c = 1/√(μ₀ε₀)</InlineMath>. Drag the sliders to scale
          ε₀ and μ₀ by up to a decade each. In <strong>fix ω</strong> mode the temporal frequency is
          held constant and the wavelength stretches or compresses. In <strong>fix k</strong> mode the
          spatial wavelength is held constant and the wave slows down or speeds up.
        </>
      }
    >
      <AutoResizeCanvas height={280} setup={setup} ariaLabel="Traveling EM wave animation" />
      <DemoControls>
        <MiniSlider
          label="ε₀"
          value={eps}
          min={EPS_MIN}
          max={EPS_MAX}
          step={PHYS.eps_0 * 0.001}
          format={(v) => v.toExponential(2) + ' F/m'}
          onChange={setEps}
        />
        <MiniSlider
          label="μ₀"
          value={mu}
          min={MU_MIN}
          max={MU_MAX}
          step={PHYS.mu_0 * 0.001}
          format={(v) => v.toExponential(2) + ' T·m/A'}
          onChange={setMu}
        />
        <MiniToggle label={fixOmega ? 'fix ω' : 'fix k'} checked={fixOmega} onChange={setFixOmega} />
        <MiniReadout label="c predicted" value={<Num value={cPredicted} digits={3} />} unit="m/s" />
        <MiniReadout label="c exact" value={<Num value={C_EXACT} digits={3} />} unit="m/s" />
        <MiniReadout label="ratio" value={ratio.toFixed(3)} unit="×" />
      </DemoControls>
      <EquationStrip
        leftLabel="symbolic"
        left={<InlineMath tex="c = \\dfrac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}" />}
        rightLabel="with values"
        right={
          <InlineMath
            tex={`c = \\dfrac{1}{\\sqrt{(${muStr})(${epsStr})}} = ${cPredStr} \\text{ m/s}`}
          />
        }
      />
    </Demo>
  );
}
