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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniToggle } from '@/components/Demo';

interface Props { figure?: string }

export function DotConventionDemo({ figure }: Props) {
  const [c2DotTop, setC2DotTop] = useState(true);    // dot on C2's top or bottom
  const [i1IntoDot, setI1IntoDot] = useState(true);  // does I1 enter C1's dotted terminal?

  const stateRef = useRef({ c2DotTop, i1IntoDot });
  useEffect(() => { stateRef.current = { c2DotTop, i1IntoDot }; }, [c2DotTop, i1IntoDot]);

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

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { c2DotTop, i1IntoDot } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cy = h / 2;
      const c1x = w * 0.30;
      const c2x = w * 0.70;
      const coilH = 90;

      drawSchematicCoil(ctx, c1x, cy, coilH, 'C1', 'L₁');
      drawSchematicCoil(ctx, c2x, cy, coilH, 'C2', 'L₂');

      // Dot on C1: fixed at top
      drawDot(ctx, c1x - 24, cy - coilH / 2 + 6);
      // Dot on C2: top or bottom depending on toggle
      if (c2DotTop) drawDot(ctx, c2x + 24, cy - coilH / 2 + 6);
      else drawDot(ctx, c2x + 24, cy + coilH / 2 - 6);

      // Arrow for I1 — enters at the dot if i1IntoDot, else at the bottom
      drawCurrentArrow(ctx, c1x - 70, cy - (i1IntoDot ? coilH / 2 + 14 : -coilH / 2 + -14), c1x - 26, cy - (i1IntoDot ? coilH / 2 - 4 : -coilH / 2 + -4), 'I₁');

      // Coupling line between coils
      ctx.strokeStyle = 'rgba(108,197,194,0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(c1x + 24, cy);
      ctx.lineTo(c2x - 24, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(108,197,194,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('M', (c1x + c2x) / 2, cy - 8);

      // Mutual-term sign label
      const signLabel = sign > 0
        ? 'mutual term: + M dI₁/dt   (fluxes ADD — aiding)'
        : 'mutual term: − M dI₁/dt   (fluxes SUBTRACT — opposing)';
      ctx.fillStyle = sign > 0 ? 'rgba(255,107,42,0.95)' : 'rgba(91,174,248,0.95)';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(signLabel, w / 2, h - 24);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [sign]);

  return (
    <Demo
      figure={figure ?? 'Fig. 22.3'}
      title="The dot convention"
      question="Two coils carry currents — when does the mutual term add, and when does it subtract?"
      caption={
        <>
          The dot tells you which way each coil is wound. <em>Rule of thumb:</em> if both currents enter at the
          dotted terminals, the mutual flux adds to the self-flux (mutual term is +M dI/dt). If one enters at the
          dot and the other at the non-dot, the mutual flux opposes — minus sign.
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
        <MiniReadout
          label="mutual sign"
          value={sign > 0 ? '+ M dI₁/dt' : '− M dI₁/dt'}
        />
      </DemoControls>
    </Demo>
  );
}

function drawSchematicCoil(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, h: number, label: string, valueLabel: string,
) {
  // Schematic-style: three half-loops on the right side of a vertical wire
  ctx.strokeStyle = 'rgba(255,107,42,0.95)';
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
  ctx.moveTo(cx - 50, top); ctx.lineTo(cx - 24, top);
  ctx.moveTo(cx - 50, bot); ctx.lineTo(cx - 24, bot);
  ctx.moveTo(cx + 24, top); ctx.lineTo(cx + 50, top);
  ctx.moveTo(cx + 24, bot); ctx.lineTo(cx + 50, bot);
  ctx.stroke();

  // Labels
  ctx.fillStyle = 'rgba(255,107,42,0.85)';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx - 5, cy + h / 2 + 16);
  ctx.fillStyle = 'rgba(160,158,149,0.75)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText(valueLabel, cx - 5, cy);
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = 'rgba(255,107,42,1)';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawCurrentArrow(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, x1: number, y1: number, label: string,
) {
  ctx.strokeStyle = 'rgba(91,174,248,0.9)';
  ctx.fillStyle = 'rgba(91,174,248,0.9)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  // arrowhead
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const al = 8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - al * Math.cos(ang - 0.4), y1 - al * Math.sin(ang - 0.4));
  ctx.lineTo(x1 - al * Math.cos(ang + 0.4), y1 - al * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x0 - 4, y0);
}
