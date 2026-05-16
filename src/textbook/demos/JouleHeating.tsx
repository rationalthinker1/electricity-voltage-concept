/**
 * Demo D3.4 — Joule heating
 *
 * Sliders for I and R; live P = I²R. Wire color follows equilibrium
 * temperature from a Stefan–Boltzmann radiation balance with ε ≈ 0.4
 * over a fixed ~1 cm² surface area for the demo. Color ramp matches
 * the JouleLab convention (cold gray → cherry red → orange → white-hot).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS, pretty } from '@/lib/physics';

interface Props {
  figure?: string;
}

const EMISSIVITY = 0.4;
const A_SURF = 1e-4; // m² ≈ 1 cm² of radiating surface

export function JouleHeatingDemo({ figure }: Props) {
  const [I, setI] = useState(2);
  const [R, setR] = useState(5);

  const stateRef = useRef({ I, R });
  useEffect(() => {
    stateRef.current = { I, R };
  }, [I, R]);

  const P = I * I * R;
  const T_eq = stefanT(P);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    type Shim = { x: number; y: number; life: number; vy: number; wob: number };
    const shimmer: Shim[] = [];
    const N_SHIM = 50;

    function draw() {
      const { I, R } = stateRef.current;
      const P_ = I * I * R;
      const T = stefanT(P_);
      const col = tempToColor(T);
      const visiblePower = P_ > 0.05 && T > 600;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const wireLeft = 80;
      const wireRight = w - 80;
      const wireCY = h / 2;
      const thickness = 36;
      const top = wireCY - thickness / 2;
      const bot = wireCY + thickness / 2;

      // Halo
      if (visiblePower) {
        const haloR = 50 + col.glow * 80;
        const grd = ctx.createRadialGradient(
          (wireLeft + wireRight) / 2,
          wireCY,
          thickness * 0.6,
          (wireLeft + wireRight) / 2,
          wireCY,
          haloR,
        );
        grd.addColorStop(0, `rgba(${col.r},${col.g},${col.b},${0.12 + 0.22 * col.glow})`);
        grd.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(wireLeft - 200, wireCY - haloR, wireRight - wireLeft + 400, haloR * 2);
      }

      // Wire body
      const grd = ctx.createLinearGradient(0, top, 0, bot);
      if (visiblePower) {
        const cr = col.r,
          cg = col.g,
          cb = col.b;
        grd.addColorStop(0, `rgba(${cr},${cg},${cb},${0.2 + col.glow * 0.5})`);
        grd.addColorStop(
          0.5,
          `rgba(${Math.min(255, cr + 20)},${Math.min(255, cg + 30)},${Math.min(255, cb + 40)},${0.55 + col.glow * 0.45})`,
        );
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},${0.2 + col.glow * 0.5})`);
      } else {
        grd.addColorStop(0, 'rgba(180,180,185,0.10)');
        grd.addColorStop(0.5, 'rgba(180,180,185,0.22)');
        grd.addColorStop(1, 'rgba(180,180,185,0.10)');
      }
      ctx.fillStyle = grd;
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 8);
      ctx.fill();

      if (visiblePower) {
        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${0.7 + 0.3 * col.glow})`;
        ctx.shadowColor = `rgba(${col.r},${col.g},${col.b},0.7)`;
        ctx.shadowBlur = 16 + col.glow * 22;
        ctx.lineWidth = 1.2;
        roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = colors.borderStrong;
        ctx.lineWidth = 1;
        roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 8);
        ctx.stroke();
      }

      // Battery terminals
      ctx.fillStyle = colors.pink;
      ctx.fillRect(wireLeft - 12, top - 4, 4, thickness + 8);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(wireRight + 8, top - 4, 4, thickness + 8);

      // Heat shimmer above the wire
      if (visiblePower) {
        if (shimmer.length === 0) {
          for (let i = 0; i < N_SHIM; i++) {
            shimmer.push({
              x: wireLeft + Math.random() * (wireRight - wireLeft),
              y: top - Math.random() * 6,
              life: Math.random(),
              vy: -0.3 - Math.random() * 0.5,
              wob: Math.random() * Math.PI * 2,
            });
          }
        }
        const intensity = Math.min(1, col.glow * 1.5);
        for (const s of shimmer) {
          s.life -= 0.008;
          s.y += s.vy;
          s.wob += 0.12;
          if (s.life <= 0 || s.y < top - 80) {
            s.life = 1;
            s.x = wireLeft + Math.random() * (wireRight - wireLeft);
            s.y = top - Math.random() * 4;
            s.vy = -0.3 - Math.random() * 0.5;
            s.wob = Math.random() * Math.PI * 2;
          }
          const sx = s.x + Math.sin(s.wob) * 4;
          const alpha = s.life * 0.45 * intensity;
          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, s.y, 1.2 + 1.4 * intensity, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        shimmer.length = 0;
      }

      // Overlays
      ctx.textBaseline = 'top';
      ctx.fillStyle = colors.accent;
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`P = ${pretty(P_).replace(/<[^>]+>/g, '')} W`, 14, 12);

      ctx.fillStyle = visiblePower ? `rgb(${col.r},${col.g},${col.b})` : 'rgba(160,158,149,0.85)';
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`T ≈ ${T.toFixed(0)} K`, w - 14, 12);
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(describeGlow(T, P_), w - 14, 30);

      // Bottom: I, R labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `I = ${I.toFixed(2)} A   ·   R = ${R.toFixed(2)} Ω   ·   surface ≈ 1 cm²`,
        w / 2,
        bot + 14,
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 3.4'}
      title="Power becomes heat"
      question="Crank up I or R — when does the wire start to glow?"
      caption="The dissipated power is P = I²R. For a fixed radiating surface (~1 cm² here) the wire's equilibrium temperature solves P = εσ_SB A T⁴ with ε ≈ 0.4. Below ~600 K the wire is just warm; past that it goes red, orange, and white-hot."
      deeperLab={{ slug: 'joule', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={220} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="I"
          value={I}
          min={0}
          max={10}
          step={0.05}
          format={(v) => v.toFixed(2) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="R"
          value={R}
          min={0.1}
          max={100}
          step={0.1}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setR}
        />
        <MiniReadout label="Power" value={<Num value={P} />} unit="W" />
        <MiniReadout label="Equilibrium T" value={T_eq.toFixed(0)} unit="K" />
      </DemoControls>
    </Demo>
  );
}

function stefanT(P: number): number {
  const T4 = P / (EMISSIVITY * PHYS.sigma_SB * A_SURF);
  // 300 K floor so cold wire reads room T
  return Math.pow(Math.max(T4, Math.pow(300, 4)), 0.25);
}

function describeGlow(T: number, P: number): string {
  if (P < 0.05) return 'cold';
  if (T < 600) return 'warm (no visible glow)';
  if (T < 900) return 'dull red';
  if (T < 1300) return 'cherry red';
  if (T < 1700) return 'orange';
  if (T < 2200) return 'yellow';
  if (T < 3000) return 'white hot';
  return 'beyond melting';
}

function tempToColor(T: number) {
  if (T < 600) return { r: 200, g: 200, b: 200, glow: 0 };
  const t = Math.max(0, Math.min(1, (T - 600) / 2900));
  let r: number, g: number, b: number;
  if (t < 0.3) {
    const k = t / 0.3;
    r = 140 + k * 115;
    g = 20 + k * 30;
    b = 10 + k * 10;
  } else if (t < 0.6) {
    const k = (t - 0.3) / 0.3;
    r = 255;
    g = 50 + k * 130;
    b = 20 + k * 20;
  } else if (t < 0.85) {
    const k = (t - 0.6) / 0.25;
    r = 255;
    g = 180 + k * 60;
    b = 40 + k * 100;
  } else {
    const k = (t - 0.85) / 0.15;
    r = 255;
    g = 240 + k * 15;
    b = 140 + k * 115;
  }
  return { r: r | 0, g: g | 0, b: b | 0, glow: t };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
