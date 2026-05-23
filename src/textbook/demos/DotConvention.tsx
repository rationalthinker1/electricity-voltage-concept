/**
 * Demo D22.3 — Dot convention
 *
 * Schematic of two coupled coils with dot marks. Reader toggles:
 * (a) which terminal carries the dot on coil 2 (top vs bottom)
 * (b) the direction of I1 (entering the dot of coil 1 vs entering the
 *     undotted terminal)
 *
 * Live readout: the sign of the mutual contribution to v2.
 *  - Both currents entering at the dot  -> mutual term is +M dI1/dt (aiding)
 *  - One at dot, one at non-dot         -> mutual term is -M dI1/dt (opposing)
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function DotConventionDemo({ figure }: Props) {
  const [c2DotTop, setC2DotTop] = useState(true); // dot on C2's top or bottom
  const [i1IntoDot, setI1IntoDot] = useState(true); // does I1 enter C1's dotted terminal?

  const stateRef = useSimState({ c2DotTop, i1IntoDot });
  // The "reference direction" for current in coil 2 is taken as entering at C2's TOP.
  // Mutual term sign = +1 if both currents enter at their respective dots, else -1.
  const sign = useMemo(() => {
    // I1 reference: entering at C1's top (dot is fixed at C1's top in this demo).
    // i1IntoDot = true means actual I1 flows in the reference direction.
    // c2DotTop = true means C2's dot is at the top, i.e., the reference current direction
    // for C2 happens to enter the dot.
    const i1AtDot = i1IntoDot ? +1 : -1;
    const i2RefAtDot = c2DotTop ? +1 : -1;
    return i1AtDot * i2RefAtDot;
  }, [c2DotTop, i1IntoDot]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { c2DotTop, i1IntoDot } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cy = h / 2;
      const c1x = w * 0.3;
      const c2x = w * 0.7;
      const coilH = 90;
      drawSchematicCoil(ctx, c1x, cy, coilH, 'C1', 'L₁');
      drawSchematicCoil(ctx, c2x, cy, coilH, 'C2', 'L₂');
      drawDot(ctx, c1x - 24, cy - coilH / 2 + 6);
      if (c2DotTop) drawDot(ctx, c2x + 24, cy - coilH / 2 + 6);
      else drawDot(ctx, c2x + 24, cy + coilH / 2 - 6);
      drawCurrentArrow(
        ctx,
        c1x - 70,
        cy - (i1IntoDot ? coilH / 2 + 14 : -coilH / 2 + -14),
        c1x - 26,
        cy - (i1IntoDot ? coilH / 2 - 4 : -coilH / 2 + -4),
        'I₁',
      );
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(c1x + 24, cy);
      ctx.lineTo(c2x - 24, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawLabel(ctx, {
        x: (c1x + c2x) / 2,
        y: cy - 8,
        text: 'M',
        color: colors.teal,
        align: 'center',
      });
      const signLabel =
        sign > 0
          ? 'mutual term: + M dI₁/dt   (fluxes ADD — aiding)'
          : 'mutual term: − M dI₁/dt   (fluxes SUBTRACT — opposing)';
      drawLabel(ctx, {
        x: w / 2,
        y: h - 24,
        text: signLabel,
        color: sign > 0 ? withAlpha(colors.accent, 0.95) : withAlpha(colors.blue, 0.95),
        size: 11,
        align: 'center',
        baseline: 'top',
        weight: 'bold',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 22.3'}
      title="The dot convention"
      question="Two coils carry currents — when does the mutual term add, and when does it subtract?"
      caption={
        <>
          The dot tells you which way each coil is wound. <em>Rule of thumb:</em> if both currents
          enter at the dotted terminals, the mutual flux adds to the self-flux (mutual term is{' '}
          <InlineMath tex="+M\,dI/dt" />
          ). If one enters at the dot and the other at the non-dot, the mutual flux opposes — minus
          sign.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={`C2 dot: ${c2DotTop ? 'top' : 'bottom'}`}
          checked={c2DotTop}
          onChange={setC2DotTop}
        />
        <MiniToggle
          label={`I₁ enters: ${i1IntoDot ? 'dot' : 'non-dot'}`}
          checked={i1IntoDot}
          onChange={setI1IntoDot}
        />
        <MiniReadout label="mutual sign" value={sign > 0 ? '+ M dI₁/dt' : '− M dI₁/dt'} />
      </DemoControls>
      <EquationStrip
        leftLabel="coil 2 voltage"
        left={<InlineMath tex="v_2=L_2\frac{dI_2}{dt}\pm M\frac{dI_1}{dt}" />}
        rightLabel="current sign"
        right={<InlineMath tex={`\\text{mutual term}=${sign > 0 ? '+' : '-'}M\\frac{dI_1}{dt}`} />}
      />
    </Demo>
  );
}

function drawSchematicCoil(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  h: number,
  label: string,
  valueLabel: string,
) {
  // Schematic-style: three half-loops on the right side of a vertical wire
  ctx.strokeStyle = getCanvasColors().accent;
  ctx.lineWidth = 1.6;
  const top = cy - h / 2;
  const bot = cy + h / 2;
  // Vertical lead
  ctx.beginPath();
  ctx.moveTo(cx - 24, top);
  ctx.lineTo(cx - 24, top + 6);
  ctx.moveTo(cx - 24, bot - 6);
  ctx.lineTo(cx - 24, bot);
  ctx.stroke();
  // Three loops
  const loops = 4;
  const dy = (h - 12) / loops;
  ctx.beginPath();
  for (let i = 0; i < loops; i++) {
    const y0 = top + 6 + i * dy;
    const yMid = y0 + dy / 2;
    ctx.moveTo(cx - 24, y0);
    ctx.arc(cx - 14, yMid, dy / 2, Math.PI, 0, true);
    ctx.lineTo(cx - 24, y0 + dy);
  }
  ctx.stroke();
  // Right side lead (the other terminal)
  ctx.beginPath();
  ctx.moveTo(cx + 24, top);
  ctx.lineTo(cx + 24, bot);
  ctx.stroke();

  // Connect tops/bottoms with short horizontal stubs
  ctx.beginPath();
  ctx.moveTo(cx - 50, top);
  ctx.lineTo(cx - 24, top);
  ctx.moveTo(cx - 50, bot);
  ctx.lineTo(cx - 24, bot);
  ctx.moveTo(cx + 24, top);
  ctx.lineTo(cx + 50, top);
  ctx.moveTo(cx + 24, bot);
  ctx.lineTo(cx + 50, bot);
  ctx.stroke();

  // Labels
  drawLabel(ctx, {
    x: cx - 5,
    y: cy + h / 2 + 16,
    text: label,
    color: getCanvasColors().accent,
    size: 11,
    align: 'center',
    baseline: 'middle',
    weight: 'bold',
  });
  ctx.save();
  ctx.globalAlpha = 0.75;
  drawLabel(ctx, {
    x: cx - 5,
    y: cy,
    text: valueLabel,
    color: getCanvasColors().textDim,
  });
  ctx.restore();
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = getCanvasColors().accent;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawCurrentArrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  label: string,
) {
  ctx.fillStyle = getCanvasColors().blue;
  ctx.lineWidth = 1.6;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = getCanvasColors().blue;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
  // arrowhead
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const al = 8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - al * Math.cos(ang - 0.4), y1 - al * Math.sin(ang - 0.4));
  ctx.lineTo(x1 - al * Math.cos(ang + 0.4), y1 - al * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
  drawLabel(ctx, {
    text: label,
    x: x0 - 4,
    y: y0,
    font: '10px "JetBrains Mono", monospace',
    align: 'right',
    baseline: 'middle',
  });
}
