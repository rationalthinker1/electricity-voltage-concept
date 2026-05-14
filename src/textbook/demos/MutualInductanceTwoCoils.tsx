/**
 * Demo D22.1 — Mutual inductance between two coils
 *
 * Two parallel coils side by side. Reader adjusts separation and the
 * relative tilt of coil 2's axis. The demo draws field lines from coil 1
 * and shows how many of those lines thread coil 2, then reports M and the
 * coupling coefficient k = M / sqrt(L1 L2).
 *
 * Numbers are schematic but physically plausible: each coil is treated as
 * a short solenoid with fixed L1 = L2 = 1 mH and a geometric coupling
 * factor that drops with distance and the cosine of the tilt angle.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

const L1 = 1e-3;   // 1 mH for both coils
const L2 = 1e-3;

function couplingK(distanceCm: number, tiltDeg: number): number {
  // Drop with distance: roughly a decaying exponential plus geometric falloff.
  // At touching (d=0): k_max ~ 0.9. At d = 20 cm: k -> ~0.05.
  // Tilt multiplies by |cos(theta)| — perpendicular axes decouple.
  const distanceTerm = Math.exp(-distanceCm / 6) * 0.9;
  const tiltTerm = Math.abs(Math.cos((tiltDeg * Math.PI) / 180));
  return Math.max(0, Math.min(0.99, distanceTerm * tiltTerm));
}

export function MutualInductanceTwoCoilsDemo({ figure }: Props) {
  const [distanceCm, setDistanceCm] = useState(4);
  const [tiltDeg, setTiltDeg] = useState(0);

  const stateRef = useRef({ distanceCm, tiltDeg });
  useEffect(() => { stateRef.current = { distanceCm, tiltDeg }; }, [distanceCm, tiltDeg]);

  const computed = useMemo(() => {
    const k = couplingK(distanceCm, tiltDeg);
    const M = k * Math.sqrt(L1 * L2); // henries
    return { k, M };
  }, [distanceCm, tiltDeg]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, } = info;
    let raf = 0;

    function draw() {
      const { distanceCm, tiltDeg } = stateRef.current;
      const k = couplingK(distanceCm, tiltDeg);

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Coil 1 on the left, coil 2 on the right.
      const cy = h / 2;
      const c1x = w * 0.32;
      // Map: 0 cm -> coil edges touching (~ c1x + 80), 20 cm -> ~ c1x + 280
      const c2x = c1x + 70 + distanceCm * 9;

      // Field lines from coil 1
      drawFieldLines(ctx, c1x, cy, c2x, cy, tiltDeg, k);

      // Coil 1 (vertical, fixed)
      drawCoil(ctx, c1x, cy, 0, 'C1');
      // Coil 2 (tilted by tiltDeg about its own center)
      drawCoil(ctx, c2x, cy, tiltDeg, 'C2');

      // Readout strip at the bottom: how many lines thread C2
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`k = ${k.toFixed(3)}   |   M ≈ ${(k * Math.sqrt(L1 * L2) * 1e6).toFixed(0)} µH`, 12, h - 8);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 22.1'}
      title="Mutual inductance between two coils"
      question="How much of coil 1's flux actually reaches coil 2?"
      caption={
        <>
          Move the coils apart and watch the linking flux drop. Tilt coil 2 by 90° and the coupling collapses to
          zero even at zero distance — orthogonal coils don't share flux. The product L₁L₂ caps M from above; k is
          just M expressed as a fraction of that cap.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="separation"
          value={distanceCm} min={0} max={20} step={0.5}
          format={v => v.toFixed(1) + ' cm'}
          onChange={setDistanceCm}
        />
        <MiniSlider
          label="tilt of C2"
          value={tiltDeg} min={0} max={90} step={1}
          format={v => v.toFixed(0) + '°'}
          onChange={setTiltDeg}
        />
        <MiniReadout label="coupling k" value={computed.k.toFixed(3)} />
        <MiniReadout label="M" value={<Num value={computed.M} digits={2} />} unit="H" />
      </DemoControls>
    </Demo>
  );
}

function drawCoil(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, tiltDeg: number, label: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((tiltDeg * Math.PI) / 180);
  // Draw 6 turns as horizontal ellipses, vertical column ~ 80 px tall
  const turns = 6;
  const rx = 18;
  const colH = 76;
  const dy = colH / turns;
  ctx.strokeStyle = getCanvasColors().accent;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < turns; i++) {
    const y = -colH / 2 + (i + 0.5) * dy;
    ctx.beginPath();
    ctx.ellipse(0, y, rx, dy * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Label
  ctx.fillStyle = getCanvasColors().accent;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, colH / 2 + 14);
  ctx.restore();
}

function drawFieldLines(
  ctx: CanvasRenderingContext2D,
  c1x: number, c1y: number, c2x: number, c2y: number,
  tiltDeg: number, k: number,
) {
  // Draw a handful of teardrop-shaped flux loops emerging from C1's axis.
  // Lines that "thread" C2 are amber and solid; lines that miss are pale dashed.
  ctx.lineWidth = 1;
  const linesCount = 9;
  const dx = c2x - c1x;
  const halfH = 38; // canvas-coil half-height
  for (let i = 0; i < linesCount; i++) {
    // Each line emerges at y offset from coil axis
    const yOff = (i - (linesCount - 1) / 2) * 6;
    // The line bulges outward over the gap and returns
    const arcAmp = Math.max(20, 40 + Math.abs(yOff) * 0.6);
    // Whether this line threads C2 — depends on the tilt and the residual k
    const linkFrac = Math.abs(Math.cos((tiltDeg * Math.PI) / 180));
    const threads = (Math.abs(yOff) < 14) && (Math.random() < 1) && (k * linkFrac > 0.1) && Math.abs(yOff) < halfH * 0.7;
    if (threads) {
      ctx.strokeStyle = `rgba(255,107,42,${0.35 + 0.55 * k})`;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = 'rgba(160,158,149,0.22)';
      ctx.setLineDash([3, 4]);
    }
    ctx.beginPath();
    // Above axis: bulge up; below: bulge down
    const sign = yOff < 0 ? -1 : 1;
    const start = { x: c1x, y: c1y + yOff };
    const end = { x: c2x, y: c2y + yOff };
    const mid = { x: (c1x + c2x) / 2, y: c1y + yOff - sign * arcAmp };
    // Quadratic curve
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(mid.x, mid.y, end.x, end.y);
    // Return path on the other side to suggest a closed loop
    const mid2 = { x: (c1x + c2x) / 2, y: c1y - yOff + sign * arcAmp };
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(mid2.x, mid2.y, end.x, end.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Direction arrow on coil 1
  ctx.fillStyle = getCanvasColors().accent;
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('I₁', c1x, c1y - 56);

  // Hint that dx exists to silence unused
  void dx;
}
