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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
} from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawArrow } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';

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

  const stateRef = useRef({ Va, Vb, qMicro });
  useEffect(() => {
    stateRef.current = { Va, Vb, qMicro };
  }, [Va, Vb, qMicro]);

  // Real values for readouts and equation strip.
  const q = qMicro * 1e-6; // C
  const Vab = Vb - Va; // V
  const W = q * Vab; // J — work done by the field on q across the gap (= ΔU loss)
  const dPE = Math.abs(W); // J — total energy traded; never negative for bar widths

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let last = performance.now();
    // Position fraction along the channel, measured from the START wall
    // (which end is "start" depends on the sign of q and which V is larger).
    // s ∈ [0, 1] — 0 = start (full PE, zero KE), 1 = arrival (full KE).
    let s = 0;
    let v = 0; // velocity in s-units per second

    function draw(now: number) {
      const colors = getCanvasColors();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { Va, Vb, qMicro } = stateRef.current;
      const Vab_now = Vb - Va;
      const q_now = qMicro * 1e-6;
      // Total energy traded across the trip, in µJ for the bar maths.
      const dPE_uJ = Math.abs(qMicro * Vab_now);
      // Which wall is the high-PE wall? PE = qV.
      // qV_a > qV_b ⇔ starts at a (left) and moves rightwards.
      const PE_a = qMicro * Va;
      const PE_b = qMicro * Vb;
      const startsLeft = PE_a > PE_b;

      // ── Background ──────────────────────────────────────────────────
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // ── Layout ──────────────────────────────────────────────────────
      const padX = 24;
      const wallW = 14;
      const wallTop = 56;
      const wallBot = h - 110; // leave room for the energy bar + caption
      const channelTop = wallTop + 20;
      const channelBot = wallBot - 20;
      const channelMidY = (channelTop + channelBot) / 2;
      // Walls sit symmetrically inside the canvas. The wall rectangles
      // span [leftWallLeft, leftWallRight] and [rightWallLeft, rightWallRight].
      const leftWallLeft = padX;
      const leftWallRight = padX + wallW;
      const rightWallRight = w - padX;
      const rightWallLeft = w - padX - wallW;
      const channelLeft = leftWallRight;
      const channelRight = rightWallLeft;
      const channelLen = channelRight - channelLeft;

      // Wall colours by which side is higher V.
      const leftIsHigh = Va > Vb;
      const leftColor = leftIsHigh ? colors.accent : colors.teal;
      const rightColor = leftIsHigh ? colors.teal : colors.accent;

      // ── Plates / walls ──────────────────────────────────────────────
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
        // Label anchored on the channel-facing side of the wall so it can
        // never fall off the canvas. Sits just above the wall.
        ctx.fillStyle = color;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textBaseline = 'bottom';
        if (labelSide === 'left') {
          ctx.textAlign = 'left';
          ctx.fillText(`${label} = ${Vval.toFixed(1)} V`, xLeft, wallTop - 6);
        } else {
          ctx.textAlign = 'right';
          ctx.fillText(`${label} = ${Vval.toFixed(1)} V`, xRight, wallTop - 6);
        }
      };
      drawWall(leftWallLeft, leftWallRight, leftColor, 'V_a', Va, 'left');
      drawWall(rightWallLeft, rightWallRight, rightColor, 'V_b', Vb, 'right');

      // ── E-field arrows in the gap ───────────────────────────────────
      // Points high V → low V. Opacity scales with |V_ab|. Two clean
      // rows — one above, one below the charge's midline — so the field
      // doesn't visually overlap the charge as it crosses.
      const Eabs = Math.abs(Vab_now);
      const Enorm = Math.min(1, Eabs / 12);
      const eAlpha = 0.2 + 0.6 * Enorm;
      if (Eabs > 0.01) {
        const Ndir = leftIsHigh ? 1 : -1; // arrow direction sign
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
        // "E" label sits between the two arrow rows on the channel-mid line,
        // out of the way of the moving charge.
        ctx.fillStyle = `rgba(255,107,42,${(eAlpha + 0.2).toFixed(3)})`;
        ctx.font = 'italic 11px "STIX Two Text", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(
          `E points high V → low V    (|V_ab| = ${Eabs.toFixed(1)} V drives it)`,
          (channelLeft + channelRight) / 2,
          channelTop - 4,
        );
      } else {
        ctx.fillStyle = colors.textDim;
        ctx.font = 'italic 11px "STIX Two Text", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          'V_a = V_b — no field, no motion',
          (channelLeft + channelRight) / 2,
          channelMidY,
        );
      }

      // ── Physics update ──────────────────────────────────────────────
      // Acceleration magnitude scaled for visual transit. dPE_uJ = |q·V_ab|
      // in µC·V = µJ; treating it as a unitless "energy" and scaling.
      const a = ACCEL_SCALE * dPE_uJ;
      if (a > 1e-6 && Math.abs(qMicro) > 1e-3) {
        v += a * dt;
        s += v * dt;
        if (s >= 1) {
          s = 0;
          v = 0;
        }
      } else {
        // No field or no charge: rest at the start wall.
        s = 0;
        v = 0;
      }

      // ── Test charge ─────────────────────────────────────────────────
      // Map s along the channel in the appropriate direction.
      const dir = startsLeft ? 1 : -1;
      const startX = startsLeft ? channelLeft + 12 : channelRight - 12;
      const xC = startX + dir * s * (channelLen - 24);
      const yC = channelMidY;
      const positive = qMicro >= 0;
      const radius = 9 + Math.min(7, Math.abs(qMicro) * 1.1);
      const fillCol = positive ? colors.pink : colors.blue;

      // Comet trail — short streak behind, length scales with current speed.
      if (v > 0.005) {
        const trailLen = Math.min(60, v * 80);
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

      // Halo + body.
      const grd = ctx.createRadialGradient(xC, yC, 0, xC, yC, radius * 2.5);
      grd.addColorStop(0, positive ? 'rgba(255,59,110,.55)' : 'rgba(91,174,248,.55)');
      grd.addColorStop(1, positive ? 'rgba(255,59,110,0)' : 'rgba(91,174,248,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(xC, yC, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fillCol;
      ctx.beginPath();
      ctx.arc(xC, yC, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = `bold ${Math.max(11, Math.round(radius))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(positive ? '+' : '−', xC, yC + 1);

      // ── Energy bar: PE + KE = constant (|qV_ab|) ────────────────────
      const barTop = wallBot + 18;
      const barH = 22;
      const barLeft = channelLeft;
      const barRight = channelRight;
      const barW = barRight - barLeft;

      // The bar's total width represents |qV_ab|. PE fraction = (1 − s),
      // KE fraction = s — energy traded smoothly across the trip.
      const peFrac = 1 - s;
      const keFrac = s;

      // Background outline (the "total energy" envelope).
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.strokeRect(barLeft, barTop, barW, barH);

      // PE segment on the left (teal — drains).
      const pePx = barW * peFrac;
      ctx.fillStyle = `rgba(108,197,194,${(0.55 + 0.25 * peFrac).toFixed(3)})`;
      ctx.fillRect(barLeft, barTop, pePx, barH);

      // KE segment on the right (amber — fills).
      const kePx = barW * keFrac;
      ctx.fillStyle = `rgba(255,107,42,${(0.55 + 0.25 * keFrac).toFixed(3)})`;
      ctx.fillRect(barLeft + pePx, barTop, kePx, barH);

      // Labels on each segment.
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      const labelY = barTop + barH / 2;
      // Total-energy caption above the bar.
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        `total energy |qV_ab| = ${dPE_uJ.toFixed(2)} µJ`,
        barLeft,
        barTop - 4,
      );
      ctx.textBaseline = 'middle';

      const pe_uJ = dPE_uJ * peFrac;
      const ke_uJ = dPE_uJ * keFrac;
      // PE label inside its segment if there's room.
      if (pePx > 60) {
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'left';
        ctx.fillText(`PE  ${pe_uJ.toFixed(2)} µJ`, barLeft + 6, labelY);
      }
      if (kePx > 60) {
        ctx.fillStyle = colors.bg;
        ctx.textAlign = 'right';
        ctx.fillText(`KE  ${ke_uJ.toFixed(2)} µJ`, barLeft + barW - 6, labelY);
      }

      // Sub-caption below the bar.
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(
        'PE drains, KE fills — both sum to |qV_ab| = the trip\'s W = ΔU',
        (barLeft + barRight) / 2,
        barTop + barH + 6,
      );

      // Suppress unused warnings on q_now.
      void q_now;

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

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
          The two walls sit at <em>V<sub>a</sub></em> and <em>V<sub>b</sub></em>; the field in the
          gap points from high V to low V, with magnitude tracking{' '}
          <em>|V<sub>ab</sub>|</em>. A test charge released at rest at the high-PE wall accelerates
          across under <em>F = qE</em>, arriving with kinetic energy{' '}
          <em>KE = qV<sub>ab</sub></em>. The bar below shows the trade: potential energy drains, kinetic
          energy fills, and the total never changes. Flip the sign of <em>q</em> and the same gap
          launches the charge from the opposite wall in the opposite direction — the energy numbers
          stay the same.
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
