/**
 * Demo D8.1 — Gauss's law for E
 *
 * A small 2D "box" — meant as a cross-section of a closed Gaussian surface —
 * with one charge inside. Slider sets Q_enc from −10 to +10 nC. Field arrows
 * are drawn radiating from / converging on the charge; arrows crossing the
 * box outline contribute signed flux. Readout shows ∮E·dA = Q_enc/ε₀ — and
 * by construction the relationship is exact and linear in Q_enc.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawHalo } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure?: string;
}

export function GaussELawDemo({ figure }: Props) {
  const [qNC, setQNC] = useState(5); // enclosed charge, nC
  const [outside, setOutside] = useState(false); // put charge *outside* the box?

  const stateRef = useSimState({ qNC, outside });
  // Flux ∮E·dA = Q_enc / ε₀ — exact by Gauss. If the charge sits outside the
  // box, by the divergence theorem the enclosed charge is zero, so flux is 0.
  const Q = qNC * 1e-9;
  const flux = outside ? 0 : Q / PHYS.eps_0;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { qNC, outside } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;
      const bw = Math.min(w * 0.48, 360);
      const bh = Math.min(h * 0.6, 200);
      const bx = cx - bw / 2;
      const by = cy - bh / 2;
      const chargeX = outside ? bx - bw * 0.35 : cx;
      const chargeY = cy;
      const sign = Math.sign(qNC) || 1;
      const mag = Math.abs(qNC);
      const step = 28;
      for (let x = step / 2; x < w; x += step) {
        for (let y = step / 2; y < h; y += step) {
          const dx = x - chargeX,
            dy = y - chargeY;
          const r = Math.hypot(dx, dy);
          if (r < 14) continue;
          const ux = dx / r,
            uy = dy / r;
          // length scales with log(|q|/r²); cap for sanity
          const intensity = Math.log10((mag * 1e3) / (r * r) + 1) * 6;
          const L = Math.max(2, Math.min(14, intensity));
          // Color: pink if positive (out), blue if negative (in)
          const color = sign > 0 ? '255,107,42' : '108,197,194';
          // Direction reverses for negative charge
          const dir = sign;
          ctx.strokeStyle = `rgba(${color},0.55)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - ux * L * dir * 0.5, y - uy * L * dir * 0.5);
          ctx.lineTo(x + ux * L * dir * 0.5, y + uy * L * dir * 0.5);
          ctx.stroke();
          // small arrowhead
          const hx = x + ux * L * dir * 0.5;
          const hy = y + uy * L * dir * 0.5;
          const nx = -uy * dir,
            ny = ux * dir;
          ctx.fillStyle = `rgba(${color},0.55)`;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx - ux * dir * 3 + nx * 2, hy - uy * dir * 3 + ny * 2);
          ctx.lineTo(hx - ux * dir * 3 - nx * 2, hy - uy * dir * 3 - ny * 2);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.6;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);
      drawLabel(ctx, { text: 'Gaussian surface', x: bx + 8, y: by - 16, color: colors.accent, size: 11, font: '11px "JetBrains Mono", monospace', baseline: 'top' });
      const cR = 10 + Math.min(8, Math.abs(qNC) * 0.6);
      const cColor = qNC >= 0 ? '#ff3b6e' : '#5baef8';
      drawHalo(ctx, {
        x: chargeX,
        y: chargeY,
        radius: cR * 3,
        color: cColor,
        alpha: 1,
        extent: 1,
      });
      ctx.fillStyle = cColor;
      ctx.beginPath();
      ctx.arc(chargeX, chargeY, cR, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `bold ${cR}px JetBrains Mono`;
      drawLabel(ctx, { text: qNC >= 0 ? '+' : '−', x: chargeX, y: chargeY, color: colors.bg, align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: outside ? 'Q outside → no net flux' : `Q_enc = ${qNC.toFixed(1)} nC inside`, x: chargeX, y: chargeY + cR + 10, color: colors.text, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: '∮E·dA = Q_enc / ε₀', x: 14, y: 14 });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 8.1'}
      title="Gauss's law for E"
      question="What does ∮E·dA = Q/ε₀ actually look like?"
      caption={
        <>
          The dashed box is an imaginary closed surface — a Gaussian surface. The total electric
          flux through it equals the enclosed charge divided by <strong>ε₀</strong>. Slide the
          charge; flux scales linearly. Move it outside the box and the net flux drops to zero —
          every field line that enters one side leaves through another.
        </>
      }
      deeperLab={{ slug: 'gauss', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="Q_enc"
          value={qNC}
          min={-10}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' nC'}
          onChange={setQNC}
        />
        <MiniToggle
          label={outside ? 'charge outside' : 'charge inside'}
          checked={outside}
          onChange={setOutside}
        />
        <MiniReadout label="∮E·dA" value={<Num value={flux} digits={2} />} unit="V·m" />
      </DemoControls>
    </Demo>
  );
}
