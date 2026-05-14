/**
 * Demo D16.9 — Motor efficiency map
 *
 * 2D heatmap of η(τ, ω) for a chosen motor type. The map combines:
 *   • Copper loss   ∝ I²·R   ≈ (τ/k_t)²·R       — grows with torque
 *   • Iron loss     ∝ ω^1.5  (eddy + hysteresis) — grows with speed
 *   • Friction     ∝ ω       (bearings, windage) — grows with speed
 *   • Magnetic loss ∝ ω² for PMSM at high speed
 *
 * Reader picks among four motor types and reads off η at a movable
 * operating point. The "sweet spot" sits at ~80% rated torque and
 * ~70% rated speed for a typical PMSM, near 95% for premium machines.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

type MotorType = 'pmsm' | 'induction' | 'bldc' | 'brushed';

interface MotorParams {
  name: string;
  copperK: number;  // (τ/τ_rated)² coefficient
  ironK: number;    // (ω/ω_rated)^1.5 coefficient
  fricK: number;    // (ω/ω_rated) coefficient
  pmK: number;      // (ω/ω_rated)² PM eddy / iron at high speed
  etaPeak: number;  // peak achievable efficiency (datasheet)
  outAtRated: number; // P_out at τ_rated × ω_rated, normalised to 1
}

const MOTORS: Record<MotorType, MotorParams> = {
  pmsm:      { name: 'PMSM',         copperK: 0.07, ironK: 0.04, fricK: 0.015, pmK: 0.025, etaPeak: 0.96, outAtRated: 1.0 },
  induction: { name: 'induction',    copperK: 0.10, ironK: 0.05, fricK: 0.02,  pmK: 0.00,  etaPeak: 0.93, outAtRated: 1.0 },
  bldc:      { name: 'BLDC (6-step)', copperK: 0.09, ironK: 0.05, fricK: 0.015, pmK: 0.03,  etaPeak: 0.92, outAtRated: 1.0 },
  brushed:   { name: 'brushed DC',   copperK: 0.12, ironK: 0.06, fricK: 0.04,  pmK: 0.00,  etaPeak: 0.85, outAtRated: 1.0 },
};

function efficiency(motor: MotorParams, tauPU: number, omegaPU: number): number {
  // Mechanical output (normalised). 1 = rated point.
  const pOut = tauPU * omegaPU * motor.outAtRated;
  if (pOut < 1e-4) return 0;
  // Losses, all normalised to rated output = 1.
  const lossCu = motor.copperK * tauPU * tauPU;
  const lossFe = motor.ironK * Math.pow(omegaPU, 1.5);
  const lossFr = motor.fricK * omegaPU;
  const lossPm = motor.pmK * omegaPU * omegaPU;
  const lossTot = lossCu + lossFe + lossFr + lossPm;
  const eta = pOut / (pOut + lossTot);
  // Cap at the motor's plausible peak.
  return Math.min(eta, motor.etaPeak);
}

export function MotorEfficiencyMapDemo({ figure }: Props) {
  const [motorType, setMotorType] = useState<MotorType>('pmsm');
  const [tauOp, setTauOp] = useState(0.7);     // op point, per-unit τ
  const [omegaOp, setOmegaOp] = useState(0.6); // op point, per-unit ω

  const stateRef = useRef({ motorType, tauOp, omegaOp });
  useEffect(() => { stateRef.current = { motorType, tauOp, omegaOp }; }, [motorType, tauOp, omegaOp]);

  const computed = useMemo(() => {
    const eta = efficiency(MOTORS[motorType], tauOp, omegaOp);
    return { eta };
  }, [motorType, tauOp, omegaOp]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { motorType, tauOp, omegaOp } = stateRef.current;
      const motor = MOTORS[motorType];

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 56, padR = 100, padT = 22, padB = 38;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // Heatmap: discretise into cells.
      const cellsX = 40;
      const cellsY = 30;
      const cw = plotW / cellsX;
      const ch = plotH / cellsY;
      for (let i = 0; i < cellsX; i++) {
        for (let j = 0; j < cellsY; j++) {
          const om = ((i + 0.5) / cellsX);
          const ta = (1 - (j + 0.5) / cellsY);  // top = high τ
          const e = efficiency(motor, ta, om);
          // Map e ∈ [0, 0.96] to color: dark → amber → white.
          const t = Math.min(1, Math.max(0, (e - 0.4) / 0.55));
          // Amber palette
          const r = Math.round(20 + t * 235);
          const g = Math.round(20 + t * 130);
          const b = Math.round(30 + t * 30);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(padL + i * cw, padT + j * ch, cw + 1, ch + 1);
        }
      }

      // Frame
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // Operating point marker
      const opX = padL + omegaOp * plotW;
      const opY = padT + (1 - tauOp) * plotH;
      ctx.strokeStyle = colors.blue;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(opX, opY, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(opX - 12, opY); ctx.lineTo(opX + 12, opY);
      ctx.moveTo(opX, opY - 12); ctx.lineTo(opX, opY + 12);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('speed (per unit) →', padL + plotW / 2, padT + plotH + 18);
      ctx.save();
      ctx.translate(16, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle';
      ctx.fillText('torque (per unit) →', 0, 0);
      ctx.restore();

      // Tick marks
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let i = 0; i <= 4; i++) {
        const x = padL + (i / 4) * plotW;
        ctx.fillText((i / 4).toFixed(2), x, padT + plotH + 4);
      }
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let j = 0; j <= 4; j++) {
        const y = padT + (j / 4) * plotH;
        ctx.fillText((1 - j / 4).toFixed(2), padL - 6, y);
      }

      // Color bar
      const cbX = padL + plotW + 16;
      const cbW = 16;
      const cbH = plotH;
      for (let j = 0; j < cbH; j++) {
        const t = 1 - (j / cbH);
        const r = Math.round(20 + t * 235);
        const g = Math.round(20 + t * 130);
        const b = Math.round(30 + t * 30);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(cbX, padT + j, cbW, 1);
      }
      ctx.strokeStyle = colors.borderStrong;
      ctx.strokeRect(cbX, padT, cbW, cbH);

      // Color bar labels
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('η = 0.95', cbX + cbW + 4, padT + 2);
      ctx.fillText('0.80', cbX + cbW + 4, padT + cbH * 0.4);
      ctx.fillText('0.60', cbX + cbW + 4, padT + cbH * 0.75);
      ctx.fillText('0.40', cbX + cbW + 4, padT + cbH - 2);

      // Title
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(motor.name + ' — efficiency map', padL + 6, padT + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 16.9'}
      title="The efficiency sweet spot"
      question="A motor isn't equally efficient everywhere on its torque–speed plane. Where's the good place to operate?"
      caption={<>
        Efficiency map η(τ, ω) for four motor families. Bright zone = peak efficiency (~0.95 for PMSM,
        ~0.93 for induction, ~0.85 for brushed DC). Light loads and low speeds are penalised by
        speed-dependent iron and friction losses that don't scale with output. EV gearbox ratios are
        chosen to keep the motor inside its bright zone for the typical cruise operating point.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        {(['pmsm', 'induction', 'bldc', 'brushed'] as MotorType[]).map(m => (
          <button
            key={m}
            type="button"
            className={`mini-toggle${motorType === m ? ' on' : ''}`}
            onClick={() => setMotorType(m)}
            aria-pressed={motorType === m}
          >
            {MOTORS[m].name}
          </button>
        ))}
        <MiniSlider
          label="τ (pu)"
          value={tauOp} min={0.05} max={1} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setTauOp}
        />
        <MiniSlider
          label="ω (pu)"
          value={omegaOp} min={0.05} max={1} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setOmegaOp}
        />
        <MiniReadout label="η at op-point" value={<Num value={computed.eta} digits={3} />} />
      </DemoControls>
    </Demo>
  );
}
