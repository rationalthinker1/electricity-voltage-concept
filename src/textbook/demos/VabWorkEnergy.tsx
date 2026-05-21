/**
 * Demo D2.2 — V_ab, W = qV, and ΔU = qV in one parallel-plate accelerator
 *
 * Canvas: a horizontal channel between two terminals at V_a (left) and
 * V_b (right). A uniform E-field fills the gap, pointing from the higher
 * potential to the lower one. A signed test charge q is released at rest
 * at the high-PE end and accelerates across the gap under F = qE, hitting
 * the far wall with kinetic energy KE = qV_ab. As the trip progresses, a
 * stacked PE / KE bar at the bottom drains potential energy and fills
 * kinetic energy, both summing to the constant |qV_ab|. The transit time
 * scales like 1/√(qV_ab), so cranking V or q visibly speeds the charge up.
 *
 * Pedagogical thrust: three identities in one moving picture.
 *   • V_ab = V_b − V_a is the gap voltage label.
 *   • W = qV_ab is the height of the KE bar at impact.
 *   • ΔU = qV_ab is the height the PE bar drained from.
 * Flip the sign of q and the same gap reverses the trip — the charge
 * starts from the other wall and falls the other way, while the energy
 * numbers stay positive.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { drawArrow, drawHalo } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

// Empirical visual constant: maps the dimensionful product |q (in µC) × V_ab|
// onto a normalised acceleration so a "typical" trip (q ≈ 1 µC, V_ab ≈ 6 V)
// takes about 2 seconds at d = 1 in canvas-relative units. Pure visual choice.
const ACCEL_SCALE = 0.085;

export function VabWorkEnergyDemo({ figure }: Props) {
  const [Va, setVa] = useState(2); // volts (left plate)
  const [Vb, setVb] = useState(8); // volts (right plate)
  const [qMicro, setQMicro] = useState(1); // µC, signed

  // Real values for readouts and equation strip.
  const q = qMicro * 1e-6; // C
  const Vab = Vb - Va; // V
  const W = q * Vab; // J
  const dPE = Math.abs(W); // J

  const stateRef = useSimState({ Va, Vb, qMicro });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, _simTime, phys) => {
      const s = stateRef.current;
      const { Va: Va_, Vb: Vb_, qMicro: qM } = s;
      const Vab_now = Vb_ - Va_;
      const dPE_uJ = Math.abs(qM * Vab_now);
      const PE_a = qM * Va_;
      const PE_b = qM * Vb_;
      const startsLeft = PE_a > PE_b;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Layout
      const padX = 24;
      const wallW = 14;
      const wallTop = 56;
      const wallBot = h - 110;
      const channelTop = wallTop + 20;
      const channelBot = wallBot - 20;
      const channelMidY = (channelTop + channelBot) / 2;
      const leftWallLeft = padX;
      const leftWallRight = padX + wallW;
      const rightWallRight = w - padX;
      const rightWallLeft = w - padX - wallW;
      const channelLeft = leftWallRight;
      const channelRight = rightWallLeft;
      const channelLen = channelRight - channelLeft;

      // Wall colours
      const leftIsHigh = Va_ > Vb_;
      const leftColor = leftIsHigh ? colors.accent : colors.teal;
      const rightColor = leftIsHigh ? colors.teal : colors.accent;

      // Draw walls
      const drawWall = (
        xLeft: number,
        xRight: number,
        color: string,
        label: string,
        Vval: number,
        labelSide: 'left' | 'right',
      ) => {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.18;
        ctx.fillRect(xLeft, wallTop, xRight - xLeft, wallBot - wallTop);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(xLeft, wallTop, xRight - xLeft, wallBot - wallTop);
        ctx.fillStyle = color;
        if (labelSide === 'left') {
          drawLabel(ctx, { text: `${label} = ${Vval.toFixed(1)} V`, x: xLeft, y: wallTop - 6 });
        } else {
          drawLabel(ctx, { text: `${label} = ${Vval.toFixed(1)} V`, x: xRight, y: wallTop - 6, align: 'right' });
        }
      };
      drawWall(leftWallLeft, leftWallRight, leftColor, 'V_a', Va_, 'left');
      drawWall(rightWallLeft, rightWallRight, rightColor, 'V_b', Vb_, 'right');

      // E-field arrows in the gap
      const Eabs = Math.abs(Vab_now);
      const Enorm = Math.min(1, Eabs / 12);
      const eAlpha = 0.2 + 0.6 * Enorm;
      if (Eabs > 0.01) {
        const Ndir = leftIsHigh ? 1 : -1;
        const arrowsPerRow = 4;
        const arrowLen = 36 + 18 * Enorm;
        const yRow1 = channelMidY - 42;
        const yRow2 = channelMidY + 42;
        for (let i = 0; i < arrowsPerRow; i++) {
          const xMid = channelLeft + ((i + 0.5) / arrowsPerRow) * channelLen;
          for (const yA of [yRow1, yRow2]) {
            drawArrow(
              ctx,
              { x: xMid - (Ndir * arrowLen) / 2, y: yA },
              { x: xMid + (Ndir * arrowLen) / 2, y: yA },
              {
                color: `rgba(255,107,42,${eAlpha.toFixed(3)})`,
                lineWidth: 1.4,
                headLength: 8,
                headWidth: 5,
              },
            );
          }
        }
        ctx.fillStyle = `rgba(255,107,42,${(eAlpha + 0.2).toFixed(3)})`;
        drawLabel(ctx, { text: `E points high V → low V    (|V_ab| = ${Eabs.toFixed(1)} V drives it)`, x: (channelLeft + channelRight) / 2, y: channelTop - 4, font: 'italic 11px "STIX Two Text", serif', align: 'center', baseline: 'bottom' });
      } else {
        drawLabel(ctx, { text: 'V_a = V_b — no field, no motion', x: (channelLeft + channelRight) / 2, y: channelMidY, font: 'italic 11px "STIX Two Text", serif', align: 'center', baseline: 'middle' });
      }

      // Physics update
      const a = ACCEL_SCALE * dPE_uJ;
      if (a > 1e-6 && Math.abs(qM) > 1e-3) {
        phys.v += a * dt;
        phys.s += phys.v * dt;
        if (phys.s >= 1) {
          phys.s = 0;
          phys.v = 0;
        }
      } else {
        phys.s = 0;
        phys.v = 0;
      }

      // Test charge
      const dir = startsLeft ? 1 : -1;
      const startX = startsLeft ? channelLeft + 12 : channelRight - 12;
      const xC = startX + dir * phys.s * (channelLen - 24);
      const yC = channelMidY;
      const positive = qM >= 0;
      const radius = 9 + Math.min(7, Math.abs(qM) * 1.1);
      const fillCol = positive ? colors.pink : colors.blue;

      // Comet trail
      if (phys.v > 0.005) {
        const trailLen = Math.min(60, phys.v * 80);
        const tx = xC - dir * trailLen;
        const grad = ctx.createLinearGradient(tx, yC, xC, yC);
        const trailRGB = positive ? '255,59,110' : '91,174,248';
        grad.addColorStop(0, `rgba(${trailRGB},0)`);
        grad.addColorStop(1, `rgba(${trailRGB},0.55)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = radius * 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tx, yC);
        ctx.lineTo(xC, yC);
        ctx.stroke();
      }

      // Halo + body
      drawHalo(ctx, {
        x: xC,
        y: yC,
        radius: radius * 2.5,
        color: positive ? withAlpha(colors.pink, 0.55) : withAlpha(colors.blue, 0.55),
        alpha: 1,
        extent: 1,
      });
      ctx.fillStyle = fillCol;
      ctx.beginPath();
      ctx.arc(xC, yC, radius, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, { text: positive ? '+' : '−', x: xC, y: yC + 1, color: colors.bg, align: 'center', baseline: 'middle' });

      // Energy bar: PE + KE = constant
      const barTop = wallBot + 18;
      const barH = 22;
      const barLeft = channelLeft;
      const barRight = channelRight;
      const barW = barRight - barLeft;

      const peFrac = 1 - phys.s;
      const keFrac = phys.s;

      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.strokeRect(barLeft, barTop, barW, barH);

      const pePx = barW * peFrac;
      ctx.fillStyle = `rgba(108,197,194,${(0.55 + 0.25 * peFrac).toFixed(3)})`;
      ctx.fillRect(barLeft, barTop, pePx, barH);

      const kePx = barW * keFrac;
      ctx.fillStyle = `rgba(255,107,42,${(0.55 + 0.25 * keFrac).toFixed(3)})`;
      ctx.fillRect(barLeft + pePx, barTop, kePx, barH);
      const labelY = barTop + barH / 2;
      drawLabel(ctx, { text: `total energy |qV_ab| = ${dPE_uJ.toFixed(2)} µJ`, x: barLeft, y: barTop - 4, font: '10px "JetBrains Mono", monospace', baseline: 'bottom' });
      const pe_uJ = dPE_uJ * peFrac;
      const ke_uJ = dPE_uJ * keFrac;
      if (pePx > 60) {
        drawLabel(ctx, { text: `PE  ${pe_uJ.toFixed(2)} µJ`, x: barLeft + 6, y: labelY, color: colors.text });
      }
      if (kePx > 60) {
        drawLabel(ctx, { text: `KE  ${ke_uJ.toFixed(2)} µJ`, x: barLeft + barW - 6, y: labelY, color: colors.bg, align: 'right' });
      }

      drawLabel(ctx, {
        x: (barLeft + barRight) / 2,
        y: barTop + barH + 6,
        text: "PE drains, KE fills — both sum to |qV_ab| = the trip's W = ΔU",
        color: colors.textDim,
        align: 'center',
        baseline: 'top',
      });
    },
    [],
    () => ({ context: { s: 0, v: 0 } }),
  );

  // Pretty-print the work / energy readouts.
  const fmtJ = (j: number) => {
    const aj = Math.abs(j);
    if (aj < 1e-3) return `${(j * 1e6).toFixed(2)} µJ`;
    if (aj < 1) return `${(j * 1e3).toFixed(2)} mJ`;
    return `${j.toFixed(3)} J`;
  };

  return (
    <Demo
      figure={figure ?? 'Fig. 2.2'}
      title="Voltage, work, and energy in one picture"
      question="Release a charge q in the gap. How fast does it cross, and how much energy does it carry when it arrives?"
      caption={
        <>
          The two walls sit at{' '}
          <em>
            V<sub>a</sub>
          </em>{' '}
          and{' '}
          <em>
            V<sub>b</sub>
          </em>
          ; the field in the gap points from high V to low V, with magnitude tracking{' '}
          <em>
            |V<sub>ab</sub>|
          </em>
          . A test charge released at rest at the high-PE wall accelerates across under{' '}
          <em>F = qE</em>, arriving with kinetic energy{' '}
          <em>
            KE = qV<sub>ab</sub>
          </em>
          . The bar below shows the trade: potential energy drains, kinetic energy fills, and the
          total never changes. Flip the sign of <em>q</em> and the same gap launches the charge from
          the opposite wall in the opposite direction — the energy numbers stay the same.
        </>
      }
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={340} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_a"
          value={Va}
          min={0}
          max={12}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVa}
        />
        <MiniSlider
          label="V_b"
          value={Vb}
          min={0}
          max={12}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVb}
        />
        <MiniSlider
          label="q"
          value={qMicro}
          min={-10}
          max={10}
          step={0.1}
          format={(v) => (v >= 0 ? '+' : '') + v.toFixed(2) + ' µC'}
          onChange={setQMicro}
        />
        <MiniReadout
          label="V_ab = V_b − V_a"
          value={(Vab >= 0 ? '+' : '') + Vab.toFixed(2)}
          unit="V"
        />
        <MiniReadout label="W = q V_ab" value={fmtJ(W)} />
        <MiniReadout label="|ΔU| traded" value={fmtJ(dPE)} />
      </DemoControls>
      <EquationStrip
        leftLabel="Voltage between the two points"
        left={
          <InlineMath
            tex={
              `V_{ab} \\;=\\; V_{b} - V_{a} \\;=\\; ` +
              `${Vb.toFixed(1)} - ${Va.toFixed(1)} \\;=\\; ` +
              `${Vab >= 0 ? '+' : ''}${Vab.toFixed(2)}\\ \\text{V}`
            }
          />
        }
        rightLabel="Work and energy across the trip"
        right={
          <div className="flex flex-col items-center gap-1">
            <InlineMath tex={`W \\;=\\; q\\,V_{ab} \\;=\\; \\Delta U`} />
            <InlineMath
              tex={
                `=\\; (${qMicro >= 0 ? '+' : ''}${qMicro.toFixed(2)}\\times 10^{-6})` +
                `(${Vab >= 0 ? '+' : ''}${Vab.toFixed(2)}) ` +
                `\\;\\approx\\; ${(W * 1e6).toFixed(2)}\\ \\mu\\text{J}`
              }
            />
          </div>
        }
      />
    </Demo>
  );
}
