/**
 * Demo D6.4 — Poynting inflow (the punchline)
 *
 * Cylindrical wire in slight 3D perspective:
 *   pink E (axial inside) × teal B (circumferential around) =
 *     amber S streaming radially inward, absorbed at the surface.
 *
 * Sliders for I and V. Live readouts |S| at surface and the totals
 *   P_surf = ∮S·dA  vs  P_VI = V·I.
 * Their ratio sits at exactly 1.000 by construction. That number is
 * the rest of the chapter, written down in one line.
 *
 * Drawing logic adapted from src/labs/PoyntingLab.tsx — same wire viz,
 * smaller, and with the readouts trimmed down to the punchline.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { Num } from '@/components/Num';
import { PHYS, pretty } from '@/lib/physics';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure?: string;
}

interface InflowParticle {
  theta: number;
  t: number;
  r: number;
}

interface SimCtx {
  inflow: InflowParticle[];
  getWireGeom(): { wireXL: number; wireXR: number; wireCY: number; r: number };
  spawnInflow(S: number): void;
}

function fmtLatex(n: number, digits = 2): string {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs >= 1e-2 && abs < 1e6) return n.toFixed(digits);
  const s = n.toExponential(digits);
  const [m, e] = s.split('e');
  return `${m} \\times 10^{${parseInt(e!, 10)}}`;
}

export function PoyntingInflowDemo({ figure }: Props) {
  const [I, setI] = useState(5);
  const [V, setV] = useState(12);
  // Geometry held fixed for this demo to keep the readouts focused.
  const a_mm = 1.5;
  const L = 1.0;

  const computed = useMemo(() => {
    const a_m = a_mm * 1e-3;
    const E = V / L;
    const B = (PHYS.mu_0 * I) / (2 * Math.PI * a_m);
    const S = (E * B) / PHYS.mu_0;
    const Asurf = 2 * Math.PI * a_m * L;
    const P_surf = S * Asurf;
    const P_vi = V * I;
    const match = P_surf / P_vi;
    return { E, B, S, Asurf, P_surf, P_vi, match };
  }, [I, V]);

  const stateRef = useSimState({ I, V, computed });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, state, _dt, _simT, context: SimCtx) => {
      const { computed } = state;
      const out = computed;
      const { inflow, getWireGeom, spawnInflow } = context;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      const g = getWireGeom();
      const r = g.r;
      const ellipseRatio = 0.35;
      const er = r * ellipseRatio;

      // BACK-half B-field ellipses
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.1;
      const nB = 7;
      for (let i = 0; i < nB; i++) {
        const t = (i + 0.5) / nB;
        const cx = g.wireXL + t * (g.wireXR - g.wireXL);
        ctx.beginPath();
        ctx.ellipse(cx, g.wireCY, er * 1.6, r * 1.6, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      // Inflow particles
      spawnInflow(out.S);
      for (let i = inflow.length - 1; i >= 0; i--) {
        const p = inflow[i]!;
        p.r -= 0.008 + Math.min(0.04, Math.log10(out.S + 10) * 0.005);
        if (p.r <= 0.02) {
          inflow.splice(i, 1);
          continue;
        }

        const cx = g.wireXL + p.t * (g.wireXR - g.wireXL);
        const distFromAxis = r + p.r * r * 4;
        const xOff = Math.sin(p.theta) * distFromAxis * ellipseRatio;
        const yOff = -Math.cos(p.theta) * distFromAxis;
        const px = cx + xOff;
        const py = g.wireCY + yOff;

        const back = p.theta > Math.PI;
        const alpha = (back ? 0.4 : 0.95) * (1 - p.r * 0.3);

        const innerR = r + (p.r - 0.05) * r * 4;
        const tx = cx + Math.sin(p.theta) * innerR * ellipseRatio;
        const ty = g.wireCY - Math.cos(p.theta) * innerR;

        ctx.strokeStyle = withAlpha(colors.accent, alpha);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.fillStyle = withAlpha(colors.accent, alpha);
        ctx.beginPath();
        ctx.arc(tx, ty, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wire body
      const sideGrd = ctx.createLinearGradient(0, g.wireCY - r, 0, g.wireCY + r);
      sideGrd.addColorStop(0, withAlpha(colors.accent, 0.14));
      sideGrd.addColorStop(0.5, withAlpha(colors.accent, 0.32));
      sideGrd.addColorStop(1, withAlpha(colors.accent, 0.14));
      ctx.restore();
      ctx.fillStyle = sideGrd;
      ctx.beginPath();
      ctx.moveTo(g.wireXL, g.wireCY - r);
      ctx.lineTo(g.wireXR, g.wireCY - r);
      ctx.ellipse(g.wireXR, g.wireCY, er, r, 0, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(g.wireXL, g.wireCY + r);
      ctx.ellipse(g.wireXL, g.wireCY, er, r, 0, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(g.wireXL, g.wireCY - r);
      ctx.lineTo(g.wireXR, g.wireCY - r);
      ctx.moveTo(g.wireXL, g.wireCY + r);
      ctx.lineTo(g.wireXR, g.wireCY + r);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(g.wireXL, g.wireCY, er, r, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(g.wireXR, g.wireCY, er, r, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Surface glow
      drawGlowPath(
        ctx,
        [
          { x: g.wireXL, y: g.wireCY - r },
          { x: g.wireXR, y: g.wireCY - r },
        ],
        {
          color: withAlpha(colors.accent, 0.4),
          lineWidth: 0.5,
          glowColor: withAlpha(colors.accent, 0.35),
          glowWidth: 10,
        },
      );
      drawGlowPath(
        ctx,
        [
          { x: g.wireXL, y: g.wireCY + r },
          { x: g.wireXR, y: g.wireCY + r },
        ],
        {
          color: withAlpha(colors.accent, 0.4),
          lineWidth: 0.5,
          glowColor: withAlpha(colors.accent, 0.35),
          glowWidth: 10,
        },
      );

      // E axial arrows
      ctx.restore();
      ctx.strokeStyle = colors.pink;
      ctx.fillStyle = colors.pink;
      ctx.lineWidth = 2;
      const nE = 5;
      const arrLen = 50;
      for (let i = 0; i < nE; i++) {
        const t = (i + 0.5) / nE;
        const cx = g.wireXL + t * (g.wireXR - g.wireXL) - arrLen / 2;
        const cy = g.wireCY;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + arrLen, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + arrLen, cy);
        ctx.lineTo(cx + arrLen - 8, cy - 5);
        ctx.lineTo(cx + arrLen - 8, cy + 5);
        ctx.closePath();
        ctx.fill();
      }

      // FRONT-half B ellipses with arrowheads
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < nB; i++) {
        const t = (i + 0.5) / nB;
        const cx = g.wireXL + t * (g.wireXR - g.wireXL);
        ctx.beginPath();
        ctx.ellipse(cx, g.wireCY, er * 1.6, r * 1.6, 0, 0, Math.PI);
        ctx.stroke();
        const ax = cx + er * 1.6;
        const ay = g.wireCY;
        ctx.fillStyle = colors.teal;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 6, ay - 4);
        ctx.lineTo(ax - 6, ay + 4);
        ctx.closePath();
        ctx.fill();
      }

      // Terminals
      ctx.fillStyle = colors.pink;
      ctx.fillRect(g.wireXL - 22, g.wireCY - r - 4, 4, 2 * r + 8);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(g.wireXR + 18, g.wireCY - r - 4, 4, 2 * r + 8);
      ctx.fillStyle = colors.pink;
      drawLabel(ctx, { text: '+', x: g.wireXL - 36, y: g.wireCY, weight: 'bold', size: 14, font: 'bold 14px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      ctx.fillStyle = colors.blue;
      drawLabel(ctx, { text: '−', x: g.wireXR + 36, y: g.wireCY, weight: 'bold', size: 14, font: 'bold 14px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });

      // Numerics overlay
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, { text: `|S| = ${pretty(out.S)} W/m²`, x: 18, y: 14, size: 11, font: '11px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.fillStyle = colors.pink;
      drawLabel(ctx, { text: `E = ${pretty(out.E)} V/m`, x: 18, y: 30, size: 11, font: '11px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.fillStyle = colors.teal;
      drawLabel(ctx, { text: `B = ${pretty(out.B)} T`, x: 18, y: 46, size: 11, font: '11px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: `a = ${a_mm.toFixed(2)} mm   L = ${L.toFixed(2)} m`, x: W - 18, y: 14 });
      ctx.restore();
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, { text: `P_surf / P_VI = ${out.match.toFixed(3)}`, x: W - 18, y: 30 });
    },
    [],
    (info) => {
      const { w: W, h: H } = info;
      const inflow: InflowParticle[] = [];
      const MAX_INFLOW = 160;

      function getWireGeom() {
        const margin = 80;
        const wireXL = margin;
        const wireXR = W - margin;
        const wireCY = H * 0.55;
        const r_px = Math.min(W, H) * 0.1;
        const r_px_clamped = Math.max(24, Math.min(60, r_px));
        return { wireXL, wireXR, wireCY, r: r_px_clamped };
      }

      function spawnInflow(S: number) {
        const rate = Math.min(6, Math.max(0.5, Math.log10(S + 10) - 1));
        for (let k = 0; k < rate; k++) {
          if (inflow.length >= MAX_INFLOW) break;
          inflow.push({
            theta: Math.random() * Math.PI * 2,
            t: Math.random(),
            r: 1.0,
          });
        }
      }

      return { context: { inflow, getWireGeom, spawnInflow } };
    },
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 8.4'}
      title="∮ S · dA = V I, exactly"
      question="So how much energy actually flows through the wire's surface per second?"
      caption={
        <>
          Pink axial <strong>E</strong> × teal circumferential <strong>B</strong> = amber radial{' '}
          <strong>S</strong>, absorbed at the wire's surface. Integrating <strong>S</strong> over
          the lateral surface gives <em>VI</em> — exactly. The ratio P<sub>surf</sub>/P<sub>VI</sub>
          sits at <strong>1.000</strong> for any sliders you choose. That equality is the punchline
          of the entire chapter.
        </>
      }
      deeperLab={{ slug: 'poynting', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="I"
          value={I}
          min={0.1}
          max={50}
          step={0.1}
          format={(v) => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="V"
          value={V}
          min={0.1}
          max={48}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniReadout label="|S| at surface" value={<Num value={computed.S} />} unit="W/m²" />
        <MiniReadout label="P_surf = ∮S·dA" value={<Num value={computed.P_surf} />} unit="W" />
        <MiniReadout label="P_VI = V·I" value={<Num value={computed.P_vi} />} unit="W" />
        <MiniReadout label="match" value={computed.match.toFixed(3)} unit="×" />
      </DemoControls>
      <EquationStrip
        leftLabel="Poynting vector magnitude"
        left={
          <InlineMath
            tex={
              `|S| = \\dfrac{E B}{\\mu_0} = \\dfrac{(${fmtLatex(computed.E, 1)})(${fmtLatex(computed.B, 2)})}{\\mu_0} \\approx ${fmtLatex(computed.S, 2)} \\text{ W/m}^2`
            }
          />
        }
        rightLabel="Power balance"
        right={
          <InlineMath
            tex={`P_{\\text{surf}} = P_{VI} = V I = ${fmtLatex(computed.P_vi, 2)} \\text{ W}`}
          />
        }
      />
    </Demo>
  );
}
