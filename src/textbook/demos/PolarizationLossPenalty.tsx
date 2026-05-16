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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

export function PolarizationLossPenaltyDemo({ figure }: Props) {
  const [alphaDeg, setAlphaDeg] = useState(30);

  const stateRef = useRef({ alphaDeg });
  useEffect(() => {
    stateRef.current = { alphaDeg };
  }, [alphaDeg]);

  const frac = Math.cos((alphaDeg * Math.PI) / 180) ** 2;
  const lossDb = frac > 1e-6 ? -10 * Math.log10(frac) : Infinity;

  const setup = useCallback(
    (info: CanvasInfo) => {
      const { ctx, w: W, h: H } = info;
      let raf = 0;
      let tAnim = 0;
      function draw() {
        const { alphaDeg } = stateRef.current;
        tAnim += 0.05;
        ctx.fillStyle = getCanvasColors().bg;
        ctx.fillRect(0, 0, W, H);

        // Three columns: Tx | propagating wave | Rx
        const colW = W / 3;
        const cy = H / 2;
        const Rt = Math.min(colW * 0.32, H * 0.35);

        // Tx dipole — vertical
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
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = getCanvasColors().textDim;
          ctx.textAlign = 'center';
          ctx.fillText(label, cx, H - 14);
        }
        dipole(colW * 0.5, 0, 'rgba(255,107,42,0.95)', 'TX (vertical)');
        dipole(colW * 2.5, alphaDeg, 'rgba(108,197,194,0.95)', `RX (α = ${alphaDeg}°)`);

        // Propagating wave between them — show E-vector oscillating vertically as it crosses the middle column.
        const wcx = colW * 1.5;
        const Rmid = Math.min(colW * 0.3, H * 0.32);
        // Bounding box
        ctx.strokeStyle = getCanvasColors().border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(wcx, cy, Rmid, 0, Math.PI * 2);
        ctx.stroke();
        // Animated vertical E-vector
        const ampPhase = Math.cos(tAnim * 2);
        const E = Rmid * 0.85 * ampPhase;
        ctx.strokeStyle = getCanvasColors().accent;
        ctx.fillStyle = getCanvasColors().accent;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(wcx, cy);
        ctx.lineTo(wcx, cy - E);
        ctx.stroke();
        // Arrowhead
        const dir = E >= 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(wcx, cy - E);
        ctx.lineTo(wcx - 4, cy - E + 6 * dir);
        ctx.lineTo(wcx + 4, cy - E + 6 * dir);
        ctx.closePath();
        ctx.fill();
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = getCanvasColors().textDim;
        ctx.textAlign = 'center';
        ctx.fillText('E-field (vertical)', wcx, cy + Rmid + 14);

        // Connecting arrows
        ctx.strokeStyle = getCanvasColors().borderStrong;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(colW * 0.5 + Rt + 6, cy);
        ctx.lineTo(wcx - Rmid - 4, cy);
        ctx.moveTo(wcx + Rmid + 4, cy);
        ctx.lineTo(colW * 2.5 - Rt - 6, cy);
        ctx.stroke();

        // Show component projection on RX
        // Rx axis vector: along (sin α, -cos α). Component of E onto Rx axis:
        const a = (alphaDeg * Math.PI) / 180;
        const projAmp = Rmid * 0.85 * ampPhase * Math.cos(a);
        const ux = Math.sin(a);
        const uy = -Math.cos(a);
        const rxCx = colW * 2.5;
        ctx.strokeStyle = getCanvasColors().teal;
        ctx.fillStyle = getCanvasColors().teal;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rxCx, cy);
        ctx.lineTo(rxCx + projAmp * ux, cy + projAmp * uy);
        ctx.stroke();

        // Header
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = getCanvasColors().textDim;
        ctx.textAlign = 'left';
        ctx.fillText(`P_r / P_r,max = cos²(α) = ${frac.toFixed(3)}`, 12, 18);
        ctx.textAlign = 'right';
        const lossLabel = Number.isFinite(lossDb) ? `loss = ${lossDb.toFixed(2)} dB` : 'loss = ∞';
        ctx.fillText(lossLabel, W - 12, 18);

        raf = requestAnimationFrame(draw);
      }
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    },
    [frac, lossDb],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 15.7'}
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
    </Demo>
  );
}
