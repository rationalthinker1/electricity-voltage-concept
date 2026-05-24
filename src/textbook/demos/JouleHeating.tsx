/**
 * Demo D3.4 — Joule heating
 *
 * Sliders for I and R; live P = I²R. Wire color follows equilibrium
 * temperature from a Stefan–Boltzmann radiation balance with ε ≈ 0.4
 * over a fixed ~1 cm² surface area for the demo. Color ramp matches
 * the JouleLab convention (cold gray → cherry red → orange → white-hot).
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { pathRoundRect } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { PHYS, pretty, sciTeX } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const EMISSIVITY = 0.4;
const A_SURF = 1e-4;

interface Shim {
  x: number;
  y: number;
  life: number;
  vy: number;
  wob: number;
}

export function JouleHeatingDemo({ figure }: Props) {
  const [I, setI] = useState(2);
  const [R, setR] = useState(5);

  const P = I * I * R;
  const T_eq = stefanT(P);

  const stateRef = useSimState({ I, R });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, shimmer: Shim[]) => {
      const s = stateRef.current;
      const P_ = s.I * s.I * s.R;
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
        grd.addColorStop(0, withAlpha(colors.textDim, 0.1));
        grd.addColorStop(0.5, withAlpha(colors.textDim, 0.22));
        grd.addColorStop(1, withAlpha(colors.textDim, 0.1));
      }
      ctx.fillStyle = grd;
      pathRoundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 8);
      ctx.fill();

      if (visiblePower) {
        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${0.7 + 0.3 * col.glow})`;
        ctx.shadowColor = `rgba(${col.r},${col.g},${col.b},0.7)`;
        ctx.shadowBlur = 16 + col.glow * 22;
        ctx.lineWidth = 1.2;
        pathRoundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = colors.borderStrong;
        ctx.lineWidth = 1;
        pathRoundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 8);
        ctx.stroke();
      }

      // Battery terminals
      ctx.fillStyle = colors.pink;
      ctx.fillRect(wireLeft - 12, top - 4, 4, thickness + 8);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(wireRight + 8, top - 4, 4, thickness + 8);

      // Heat shimmer
      if (visiblePower) {
        if (shimmer.length === 0) {
          for (let i = 0; i < 50; i++) {
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
        for (const sh of shimmer) {
          sh.life -= 0.008;
          sh.y += sh.vy;
          sh.wob += 0.12;
          if (sh.life <= 0 || sh.y < top - 80) {
            sh.life = 1;
            sh.x = wireLeft + Math.random() * (wireRight - wireLeft);
            sh.y = top - Math.random() * 4;
            sh.vy = -0.3 - Math.random() * 0.5;
            sh.wob = Math.random() * Math.PI * 2;
          }
          const sx = sh.x + Math.sin(sh.wob) * 4;
          const alpha = sh.life * 0.45 * intensity;
          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sh.y, 1.2 + 1.4 * intensity, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        shimmer.length = 0;
      }

      // Overlays
      drawLabel(ctx, {
        text: `P = ${pretty(P_).replace(/<[^>]+>/g, '')} W`,
        x: 14,
        y: 12,
        color: colors.accent,
        size: 13,
        font: '13px "JetBrains Mono", monospace',
        baseline: 'top',
      });

      ctx.fillStyle = visiblePower
        ? `rgb(${col.r},${col.g},${col.b})`
        : withAlpha(colors.textDim, 0.85);
      drawLabel(ctx, {
        text: `T ≈ ${T.toFixed(0)} K`,
        x: w - 14,
        y: 12,
        size: 13,
        font: '13px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      drawLabel(ctx, {
        x: w - 14,
        y: 30,
        text: describeGlow(T, P_),
        color: colors.textDim,
      });

      drawLabel(ctx, {
        x: w / 2,
        y: bot + 14,
        text: `I = ${s.I.toFixed(2)} A   ·   R = ${s.R.toFixed(2)} Ω   ·   surface ≈ 1 cm²`,
        color: colors.textDim,
        align: 'center',
      });
    },
    [],
    () => ({ context: [] as Shim[] }),
  );

  return (
    <Demo
      figure={figure}
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
        <MiniReadout label="Equilibrium T" value={<Num value={T_eq} />} unit="K" />
      </DemoControls>
      <EquationStrip
        leftLabel="Joule heating"
        left={<M tex="P \;=\; I^{2}\, R" />}
        rightLabel="Live substitution"
        right={
          <M
            tex={
              `P \\;=\\; ${I.toFixed(2)}^{2} \\times ${R.toFixed(1)} ` +
              `\\;\\approx\\; ${sciTeX(P)}\\ \\text{W}`
            }
          />
        }
      />
    </Demo>
  );
}

function stefanT(P: number): number {
  const T4 = P / (EMISSIVITY * PHYS.sigma_SB * A_SURF);
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
