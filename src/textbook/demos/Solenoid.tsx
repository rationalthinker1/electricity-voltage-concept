/**
 * Demo D4.4 — Solenoid (axial B field)
 *
 * Horizontal solenoid drawn in slight 3D perspective: each turn is an
 * ellipse, with the back-arc (top half) drawn faintly and the front-arc
 * (bottom half) drawn solid to give a helical look. Inside the coil:
 * uniform axial B-field arrows pointing along the solenoid's axis.
 * Outside: faint return-loop arrows curving back around.
 *
 * Sliders for N (total turns over the solenoid's length) and current I.
 * Live readout B = μ₀ n I where n = N / L.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS, pretty } from '@/lib/physics';

interface Props { figure?: string }

export function SolenoidDemo({ figure }: Props) {
  const [N, setN] = useState(50);             // total turns
  const [I, setI] = useState(2);              // amps
  const [Lcm, setLcm] = useState(20);         // solenoid length in cm

  const stateRef = useRef({ N, I, Lcm });
  useEffect(() => { stateRef.current = { N, I, Lcm }; }, [N, I, Lcm]);

  const L_m = Lcm * 1e-2;
  const n = N / L_m;
  const B_in = PHYS.mu_0 * n * I;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let t0 = performance.now();

    function draw() {
      const now = performance.now();
      const dt = (now - t0) / 1000;
      const { N, I, Lcm } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Solenoid bounds (centered horizontally)
      const margin = 80;
      const sW = Math.min(w - margin * 2, 560);
      const sxL = (w - sW) / 2;
      const sxR = sxL + sW;
      const cy = h / 2;
      const ringRy = 60;        // visual ellipse height (y-radius)
      const ringRx = 12;        // ellipse x-radius (perspective squish)

      // Draw N turns evenly spaced. Cap the visual count to avoid clutter.
      const Nvis = Math.min(N, 30);
      const opTurn = Math.min(0.85, 0.35 + I / 30);
      // Back arcs first (so front arcs overlap them)
      for (let i = 0; i < Nvis; i++) {
        const x = sxL + (i / (Nvis - 1 || 1)) * sW;
        ctx.strokeStyle = `rgba(255,107,42,${(opTurn * 0.35).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x, cy, ringRx, ringRy, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }
      // Inside field arrows (axial)
      const I_norm = Math.max(0, Math.min(1, I / 10));
      const arrowsN = 7;
      for (let i = 0; i < arrowsN; i++) {
        const ax = sxL + 28 + (i / (arrowsN - 1)) * (sW - 56);
        const ay = cy;
        const aLen = 36 + I_norm * 14;
        const phase = (dt * 1.4 + i * 0.15) % 1;
        const op = 0.6 + 0.3 * Math.sin(phase * Math.PI * 2);
        ctx.strokeStyle = `rgba(108,197,194,${op.toFixed(3)})`;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax - aLen / 2, ay);
        ctx.lineTo(ax + aLen / 2, ay);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax + aLen / 2, ay);
        ctx.lineTo(ax + aLen / 2 - 7, ay - 4);
        ctx.lineTo(ax + aLen / 2 - 7, ay + 4);
        ctx.closePath();
        ctx.fill();
      }
      // Front arcs on top
      for (let i = 0; i < Nvis; i++) {
        const x = sxL + (i / (Nvis - 1 || 1)) * sW;
        ctx.strokeStyle = `rgba(255,107,42,${opTurn.toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(x, cy, ringRx, ringRy, 0, 0, Math.PI);
        ctx.stroke();
        // tiny arrow on front-bottom of each turn to show current direction
        // current "comes out" on the bottom-front and "goes in" at the top-back.
        if (i % 3 === 0) {
          ctx.fillStyle = `rgba(255,107,42,${opTurn.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(x + 5, cy + ringRy);
          ctx.lineTo(x - 1, cy + ringRy - 3);
          ctx.lineTo(x - 1, cy + ringRy + 3);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Faint exterior return-loop arrows (above and below)
      ctx.strokeStyle = colors.tealSoft;
      ctx.lineWidth = 1;
      const yOff = ringRy + 36;
      for (const yDir of [-1, +1]) {
        const yy = cy + yDir * yOff;
        const segs = 14;
        for (let i = 0; i < segs; i++) {
          const x1 = sxL + (i / segs) * sW;
          const x2 = sxL + ((i + 0.7) / segs) * sW;
          // Arrow direction outside: opposite to inside arrows (returns).
          ctx.beginPath();
          ctx.moveTo(x2, yy);
          ctx.lineTo(x1, yy);
          ctx.stroke();
          ctx.fillStyle = 'rgba(108,197,194,0.30)';
          ctx.beginPath();
          ctx.moveTo(x1, yy);
          ctx.lineTo(x1 + 5, yy - 2.5);
          ctx.lineTo(x1 + 5, yy + 2.5);
          ctx.closePath();
          ctx.fill();
        }
        // Curve hints at the ends (left turnaround going up-and-in, right turnaround going down-and-in)
        ctx.strokeStyle = colors.tealSoft;
        ctx.beginPath();
        ctx.moveTo(sxL, yy);
        ctx.quadraticCurveTo(sxL - 30, cy, sxL, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sxR, cy);
        ctx.quadraticCurveTo(sxR + 30, cy, sxR, yy);
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`L = ${Lcm.toFixed(1)} cm  ·  N = ${N}  ·  n = ${pretty(N / (Lcm * 1e-2), 2)} /m`, w / 2, h - 18);
      ctx.fillStyle = colors.teal;
      ctx.fillText(`B (inside) = ${pretty(PHYS.mu_0 * (N / (Lcm * 1e-2)) * I, 3)} T`, w / 2, 24);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.4'}
      title="Solenoid: a controllable magnet"
      question="What if you wrap the wire around itself?"
      caption={<>
        Inside a long solenoid the field is uniform and axial:
        <em> B = μ₀ n I</em>, with <em>n = N/L</em> turns per meter. Outside it's nearly zero
        (the return field threads back through everything else). This is the canonical
        electromagnet — and the inductor we'll meet in Chapter&nbsp;5.
      </>}
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N"
          value={N} min={5} max={500} step={1}
          format={v => `${v.toFixed(0)} turns`}
          onChange={setN}
        />
        <MiniSlider
          label="I"
          value={I} min={0.01} max={10} step={0.01}
          format={v => v.toFixed(2) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="L"
          value={Lcm} min={5} max={50} step={0.5}
          format={v => v.toFixed(1) + ' cm'}
          onChange={setLcm}
        />
        <MiniReadout label="n = N/L" value={<Num value={n} digits={3} />} unit="/m" />
        <MiniReadout label="B (inside)" value={<Num value={B_in} digits={3} />} unit="T" />
      </DemoControls>
    </Demo>
  );
}
