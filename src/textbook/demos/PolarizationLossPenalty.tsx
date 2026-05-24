/**
 * Demo D15.7 — Polarization mismatch loss
 *
 * Two dipoles: a transmitter fixed vertical, a receiver that the reader
 * rotates around the line of sight. The receiver only picks up the
 * E-field component along its axis, so the received power scales as
 *   P_r / P_r,max = cos²(α)
 * where α is the angle between transmitter and receiver dipoles. Same
 * Malus's law as in optics, because an antenna is a polarisation filter.
 *
 * The polarization-loss factor in dB is also displayed.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function PolarizationLossPenaltyDemo({ figure }: Props) {
  const [alphaDeg, setAlphaDeg] = useState(30);

  const stateRef = useSimState({ alphaDeg });
  const frac = Math.cos((alphaDeg * Math.PI) / 180) ** 2;
  const lossDb = frac > 1e-6 ? -10 * Math.log10(frac) : Infinity;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime, ctx0) => {
      let tAnim = ctx0.tAnim;
      const { alphaDeg } = stateRef.current;
      tAnim += 0.05;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const colW = W / 3;
      const cy = H / 2;
      const Rt = Math.min(colW * 0.32, H * 0.35);
      function dipole(cx: number, axisDeg: number, color: string, label: string) {
        const a = (axisDeg * Math.PI) / 180;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - Rt * Math.sin(a), cy + Rt * Math.cos(a));
        ctx.lineTo(cx + Rt * Math.sin(a), cy - Rt * Math.cos(a));
        ctx.stroke();
        // End "balls"
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx + Rt * Math.sin(a), cy - Rt * Math.cos(a), 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - Rt * Math.sin(a), cy + Rt * Math.cos(a), 4, 0, Math.PI * 2);
        ctx.fill();
        drawLabel(ctx, {
          x: cx,
          y: H - 14,
          text: label,
          color: colors.textDim,
          align: 'center',
        });
      }
      dipole(colW * 0.5, 0, withAlpha(colors.accent, 0.95), 'TX (vertical)');
      dipole(colW * 2.5, alphaDeg, withAlpha(colors.teal, 0.95), `RX (α = ${alphaDeg}°)`);
      const wcx = colW * 1.5;
      const Rmid = Math.min(colW * 0.3, H * 0.32);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(wcx, cy, Rmid, 0, Math.PI * 2);
      ctx.stroke();
      const ampPhase = Math.cos(tAnim * 2);
      const E = Rmid * 0.85 * ampPhase;
      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = colors.accent;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(wcx, cy);
      ctx.lineTo(wcx, cy - E);
      ctx.stroke();
      const dir = E >= 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(wcx, cy - E);
      ctx.lineTo(wcx - 4, cy - E + 6 * dir);
      ctx.lineTo(wcx + 4, cy - E + 6 * dir);
      ctx.closePath();
      ctx.fill();
      drawLabel(ctx, { text: 'E-field (vertical)', x: wcx, y: cy + Rmid + 14, font: '10px "JetBrains Mono", monospace', align: 'center' });
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(colW * 0.5 + Rt + 6, cy);
      ctx.lineTo(wcx - Rmid - 4, cy);
      ctx.moveTo(wcx + Rmid + 4, cy);
      ctx.lineTo(colW * 2.5 - Rt - 6, cy);
      ctx.stroke();
      const a = (alphaDeg * Math.PI) / 180;
      const projAmp = Rmid * 0.85 * ampPhase * Math.cos(a);
      const ux = Math.sin(a);
      const uy = -Math.cos(a);
      const rxCx = colW * 2.5;
      ctx.strokeStyle = colors.teal;
      ctx.fillStyle = colors.teal;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rxCx, cy);
      ctx.lineTo(rxCx + projAmp * ux, cy + projAmp * uy);
      ctx.stroke();
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: `P_r / P_r,max = cos²(α) = ${frac.toFixed(3)}`, x: 12, y: 18, size: 11, font: '11px "JetBrains Mono", monospace' });
      const lossLabel = Number.isFinite(lossDb) ? `loss = ${lossDb.toFixed(2)} dB` : 'loss = ∞';
      drawLabel(ctx, { text: lossLabel, x: W - 12, y: 18, size: 11, font: '11px "JetBrains Mono", monospace', align: 'right' });
      ctx0.tAnim = tAnim;
    },
    [],
    () => ({ context: { tAnim: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Polarization mismatch — Malus's law for antennas"
      question="What does it cost to misalign two linear antennas?"
      caption={
        <>
          A dipole antenna couples only to the E-field component along its axis. With the
          transmitter vertical and the receiver tilted by angle <strong>α</strong>, the received
          power is
          <strong> cos²(α)</strong> times its co-polar maximum — exactly Malus's law for optics.
          Cross-polarised (α = 90°) is a complete null on paper; in practice 20–40 dB of
          suppression, more than enough to break a link. GPS and SatCom avoid the problem by using
          circular polarisation, which costs only a fixed 3 dB regardless of orientation.
        </>
      }
      deeperLab={{ slug: 'antenna-radiation', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="α"
          value={alphaDeg}
          min={0}
          max={90}
          step={1}
          format={(v) => v.toFixed(0) + '°'}
          onChange={setAlphaDeg}
        />
        <MiniReadout label="cos²α" value={frac.toFixed(3)} />
        <MiniReadout
          label="loss"
          value={Number.isFinite(lossDb) ? lossDb.toFixed(1) : '∞'}
          unit={Number.isFinite(lossDb) ? 'dB' : ''}
        />
      </DemoControls>
      <EquationStrip
        leftLabel="Polarization mismatch (Malus's law)"
        left={<InlineMath tex="P_r / P_{r,\max} = \cos^2\alpha" />}
        rightLabel={`α = ${alphaDeg}°`}
        right={
          <InlineMath
            tex={`\\cos^2(${alphaDeg}^\\circ) = ${frac.toFixed(3)}\\quad(${Number.isFinite(lossDb) ? lossDb.toFixed(1) + '\\,\\text{dB loss}' : '\\infty\\,\\text{dB}'})`}
          />
        }
      />
    </Demo>
  );
}
