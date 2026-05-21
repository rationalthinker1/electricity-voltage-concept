/**
 * Demo D15.4 — Friis link-budget calculator
 *
 * Two antennas at distance d, with linear gains G_t and G_r at frequency f.
 * P_r = P_t · G_t · G_r · (λ / 4π d)²
 *
 * Cartoon: transmitter on the left, receiver on the right, with a 1/r²
 * cone fading visually with distance.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { PHYS } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function FriisLinkBudgetDemo({ figure }: Props) {
  const [Ptmw, setPtmw] = useState(100); // mW
  const [GtDbi, setGtDbi] = useState(5);
  const [GrDbi, setGrDbi] = useState(5);
  const [fMHz, setFmhz] = useState(5000); // MHz
  const [dM, setDm] = useState(10); // m

  const stateRef = useSimState({ Ptmw, GtDbi, GrDbi, fMHz, dM });
  const Pt = Ptmw * 1e-3;
  const Gt = Math.pow(10, GtDbi / 10);
  const Gr = Math.pow(10, GrDbi / 10);
  const f = fMHz * 1e6;
  const lam = PHYS.c / f;
  const fspl = Math.pow(lam / (4 * Math.PI * dM), 2);
  const Pr = Pt * Gt * Gr * fspl;
  const Pr_dBm = 10 * Math.log10(Pr / 1e-3);
  const fsplDb = 10 * Math.log10(fspl);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
      const { Ptmw, GtDbi, GrDbi, fMHz, dM } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const cy = H / 2;
      const txX = 60;
      const rxX = W - 60;
      const Pt_ = Ptmw * 1e-3;
      const f_ = fMHz * 1e6;
      const lam_ = PHYS.c / f_;
      const fspl_ = Math.pow(lam_ / (4 * Math.PI * dM), 2);
      const Pr_ = Pt_ * Math.pow(10, GtDbi / 10) * Math.pow(10, GrDbi / 10) * fspl_;
      const PrdBm = 10 * Math.log10(Pr_ / 1e-3);
      const t = performance.now() / 1000;
      const ringSpeedPxPerSec = 80;
      const spacing = 60;
      for (let i = 0; i < 8; i++) {
        const phase = (t * ringSpeedPxPerSec + i * spacing) % (rxX - txX);
        const r = phase;
        if (r < 5) continue;
        const alpha = Math.max(0, 0.55 - (r / (rxX - txX)) * 0.4);
        ctx.strokeStyle = `rgba(255,107,42,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(txX, cy, r, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      }
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(txX, cy - 22);
      ctx.lineTo(txX, cy + 22);
      ctx.stroke();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.restore();
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      drawLabel(ctx, { text: `TX · ${Ptmw.toFixed(0)} mW`, x: txX, y: cy + 40, color: colors.accent, align: 'center' });
      drawLabel(ctx, { text: `G_t = ${GtDbi.toFixed(1)} dBi`, x: txX, y: cy + 54, color: colors.accent, align: 'center' });
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rxX, cy - 22);
      ctx.lineTo(rxX, cy + 22);
      ctx.stroke();
      ctx.fillStyle = colors.teal;
      drawLabel(ctx, { text: `RX`, x: rxX, y: cy + 40, color: colors.teal, align: 'center' });
      drawLabel(ctx, { text: `G_r = ${GrDbi.toFixed(1)} dBi`, x: rxX, y: cy + 54, color: colors.teal, align: 'center' });
      ctx.strokeStyle = colors.borderStrong;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(txX, cy);
      ctx.lineTo(rxX, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabel(ctx, { text: `d = ${dM.toFixed(1)} m, f = ${fMHz.toFixed(0)} MHz, λ = ${((PHYS.c / (fMHz * 1e6)) * 1000).toFixed(1)} mm`, x: (txX + rxX) / 2, y: cy - 14, align: 'center' });
      drawLabel(ctx, {
        x: (txX + rxX) / 2,
        y: 22,
        text: `P_r ≈ ${PrdBm.toFixed(1)} dBm`,
        color: '#ffd040',
        size: 12,
        weight: 'bold',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 15.4'}
      title="Friis transmission — a link budget"
      question="How much signal arrives at the far end?"
      caption={
        <>
          <strong>P_r = P_t · G_t · G_r · (λ/4πd)²</strong>. Every doubling of distance is 6 dB of
          free-space path loss, every doubling of frequency adds another 6 dB. Real systems add fade
          margin, atmospheric loss, and antenna mismatch on top.
        </>
      }
    >
      <AutoResizeCanvas height={220} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="P_t"
          value={Ptmw}
          min={0.1}
          max={1000}
          step={1}
          format={(v) => v.toFixed(0) + ' mW'}
          onChange={setPtmw}
        />
        <MiniSlider
          label="G_t"
          value={GtDbi}
          min={0}
          max={30}
          step={0.5}
          format={(v) => v.toFixed(1) + ' dBi'}
          onChange={setGtDbi}
        />
        <MiniSlider
          label="G_r"
          value={GrDbi}
          min={0}
          max={30}
          step={0.5}
          format={(v) => v.toFixed(1) + ' dBi'}
          onChange={setGrDbi}
        />
        <MiniSlider
          label="f"
          value={fMHz}
          min={100}
          max={30000}
          step={10}
          format={(v) => v.toFixed(0) + ' MHz'}
          onChange={setFmhz}
        />
        <MiniSlider
          label="d"
          value={dM}
          min={1}
          max={10000}
          step={1}
          format={(v) => v.toFixed(0) + ' m'}
          onChange={setDm}
        />
        <MiniReadout label="P_r" value={<Num value={Pr} />} unit="W" />
        <MiniReadout label="P_r" value={Pr_dBm.toFixed(1)} unit="dBm" />
        <MiniReadout label="FSPL" value={fsplDb.toFixed(1)} unit="dB" />
      </DemoControls>
    </Demo>
  );
}
