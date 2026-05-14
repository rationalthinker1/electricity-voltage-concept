/**
 * Demo D8.2 — Gauss's law for B (no monopoles)
 *
 * A box, and inside it either nothing or a bar magnet. In either case the net
 * magnetic flux through the surface is zero, because every B-field line is a
 * closed loop: it enters the box exactly as many times as it leaves.
 *
 * The toggle puts a bar magnet inside the box. The visualization shows the
 * looping field lines explicitly. There is no "single pole" option — that's
 * the entire point.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniToggle } from '@/components/Demo';

interface Props { figure?: string }

export function GaussBLawDemo({ figure }: Props) {
  const [hasMagnet, setHasMagnet] = useState(true);

  const stateRef = useRef({ hasMagnet });
  useEffect(() => { stateRef.current = { hasMagnet }; }, [hasMagnet]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { hasMagnet } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;
      const bw = Math.min(w * 0.6, 460);
      const bh = Math.min(h * 0.7, 240);
      const bx = cx - bw / 2;
      const by = cy - bh / 2;

      if (hasMagnet) {
        // Bar magnet centred at (cx, cy), N pole on right (pink), S on left (blue)
        const magW = 110, magH = 28;
        const nx = cx + magW / 2, sx = cx - magW / 2;

        // Draw closed field loops: emerging from N (right side), looping over
        // and around to S (left side). Parametric ellipses centred at cx,cy.
        const nLines = 9;
        for (let i = 0; i < nLines; i++) {
          const t = (i + 1) / (nLines + 1);
          // Loop semi-axis size
          const rx = magW / 2 + 30 + t * 130;
          const ry = 18 + t * 110;
          // Two loops: upper and lower (mirror)
          for (const side of [-1, 1]) {
            ctx.strokeStyle = `rgba(108,197,194,${(0.6 - 0.04 * i).toFixed(2)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            // ellipse, half above/below
            const start = side > 0 ? Math.PI : 0;
            const end = side > 0 ? 2 * Math.PI : Math.PI;
            ctx.ellipse(cx, cy, rx, ry, 0, start, end);
            ctx.stroke();

            // arrowhead at top/bottom of loop — show direction (N → S externally)
            const tipAngle = side > 0 ? 1.5 * Math.PI : 0.5 * Math.PI;
            const tipX = cx + Math.cos(tipAngle) * rx;
            const tipY = cy + Math.sin(tipAngle) * ry * (side > 0 ? 1 : 1);
            // The flow direction along the loop, going from N(right) over top
            // to S(left), so dx/dθ at θ=3π/2 (top) is positive (rx·-sin(3π/2)=rx).
            // Actually d/dθ of x = -rx sin θ; at θ=3π/2 that's +rx ≥ 0 → moving right.
            // We want the arrow pointing left (from N over top back to S), so flip.
            // Simpler: just draw a small triangle pointing leftward for upper loop
            // (top of loop, where field goes from N over to S = leftward direction),
            // and rightward for the lower loop is actually still leftward externally...
            // Cleaner: external field always points N→S, so on top of bar (upper loop),
            // the tangent at the apex points LEFT. On the bottom apex of lower loop,
            // tangent also points LEFT. Both arrows point left.
            ctx.fillStyle = `rgba(108,197,194,${(0.7 - 0.04 * i).toFixed(2)})`;
            ctx.beginPath();
            ctx.moveTo(tipX - 6, tipY);
            ctx.lineTo(tipX + 1, tipY - 3);
            ctx.lineTo(tipX + 1, tipY + 3);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Inside the magnet: field lines go S → N (internal direction is opposite
        // to external direction, making the loop closed).
        ctx.strokeStyle = 'rgba(108,197,194,0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        for (let i = -2; i <= 2; i++) {
          const yo = i * 5;
          ctx.beginPath();
          ctx.moveTo(sx + 4, cy + yo);
          ctx.lineTo(nx - 4, cy + yo);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Bar magnet body
        const grd = ctx.createLinearGradient(sx, cy, nx, cy);
        grd.addColorStop(0, '#5baef8');
        grd.addColorStop(0.5, '#5baef8');
        grd.addColorStop(0.5, '#ff3b6e');
        grd.addColorStop(1, '#ff3b6e');
        ctx.fillStyle = grd;
        ctx.fillRect(sx, cy - magH / 2, magW, magH);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx, cy - magH / 2, magW, magH);
        ctx.fillStyle = '#0a0a0b';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('S', sx + magW / 4, cy);
        ctx.fillText('N', nx - magW / 4, cy);

        // Animated dots travelling along one loop, showing closure
        const period = 4000;
        phase = (performance.now() / period) % 1;
        const t = phase;
        const rx = magW / 2 + 60, ry = 60;
        // upper loop
        const a1 = Math.PI + t * Math.PI;       // π → 2π (N over top to S)
        ctx.fillStyle = 'rgba(255,107,42,0.95)';
        ctx.beginPath();
        ctx.arc(cx + rx * Math.cos(a1), cy + ry * Math.sin(a1), 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // No source inside. Just a uniform externally-imposed B (e.g., far from
        // any source) — every line that enters one side leaves the other.
        const yLines = 7;
        for (let i = 0; i < yLines; i++) {
          const y = by + (i + 0.5) * (bh / yLines);
          // Outside lines on both sides too, to make it clear they pass through.
          ctx.strokeStyle = `rgba(108,197,194,0.55)`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(bx - 80, y);
          ctx.lineTo(bx + bw + 80, y);
          ctx.stroke();
          // arrowhead on right
          ctx.fillStyle = 'rgba(108,197,194,0.85)';
          const tipX = bx + bw + 60;
          ctx.beginPath();
          ctx.moveTo(tipX + 6, y);
          ctx.lineTo(tipX, y - 3);
          ctx.lineTo(tipX, y + 3);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(160,158,149,0.7)';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('uniform B — same lines in, same lines out', cx, by - 20);
      }

      // The Gaussian box
      ctx.strokeStyle = 'rgba(255,107,42,0.85)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.6;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,107,42,0.85)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Gaussian surface', bx + 8, by - 16);

      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.fillText('∮B·dA = 0  (always)', 14, 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 8.2'}
      title="Gauss's law for B"
      question="What goes in must come out — for every B-field line, always."
      caption={<>
        Toggle the bar magnet in or out of the box. With the magnet inside, look carefully: every field line that
        leaves the N pole loops around in space and re-enters at the S pole — and continues through the magnet body
        back to N. The line never ends. The net flux through any closed surface is therefore zero — no magnetic monopoles.
      </>}
      deeperLab={{ slug: 'gauss', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={hasMagnet ? 'bar magnet inside' : 'no source inside'}
          checked={hasMagnet}
          onChange={setHasMagnet}
        />
        <MiniReadout label="∮B·dA" value="0" unit="T·m²" />
      </DemoControls>
    </Demo>
  );
}
