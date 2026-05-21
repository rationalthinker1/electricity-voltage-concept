/**
 * Demo D4.6 — Leyden jar replay
 *
 * Historical: a glass cylinder with inner and outer foil. A "charge" button
 * incrementally builds charge on the foils. A "discharge" button drops it
 * all at once, with a brief spark. Visual flavour, minimal interaction.
 */
import { useEffect, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls } from '@/components/Demo';
import { drawLabel } from '@/lib/canvasLayout';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function LeydenJarReplayDemo({ figure }: Props) {
  const [charge, setCharge] = useState(0); // 0..1
  const [sparkT, setSparkT] = useState(0); // animation time of the spark

  const stateRef = useSimState({ charge, sparkT });
  // Decay the spark visual over ~600 ms
  useEffect(() => {
    if (sparkT === 0) return;
    let raf = 0;
    const start = performance.now();
    function step() {
      const dt = (performance.now() - start) / 600;
      if (dt >= 1) {
        setSparkT(0);
        return;
      }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [sparkT]);

  const handleCharge = () => setCharge((c) => Math.min(1, c + 0.12));
  const handleDischarge = () => {
    if (stateRef.current.charge < 0.05) return;
    setSparkT(performance.now());
    setCharge(0);
  };

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const s = stateRef.current;
      phase += 0.02;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const cx = W * 0.42;
      const cy = H / 2 + 20;
      const jarW = 110;
      const jarH = 200;
      const xL = cx - jarW / 2;
      const xR = cx + jarW / 2;
      const yT = cy - jarH / 2;
      const yB = cy + jarH / 2;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(xL - 4, yT + 30);
      ctx.lineTo(xL - 4, yB - 8);
      ctx.moveTo(xR + 4, yT + 30);
      ctx.lineTo(xR + 4, yB - 8);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = colors.teal;
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = colors.teal;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xL, yT + 20);
      ctx.lineTo(xL, yB - 8);
      ctx.quadraticCurveTo(xL, yB, xL + 10, yB);
      ctx.lineTo(xR - 10, yB);
      ctx.quadraticCurveTo(xR, yB, xR, yB - 8);
      ctx.lineTo(xR, yT + 20);
      ctx.lineTo(xR - 16, yT + 8);
      ctx.lineTo(xR - 16, yT);
      ctx.lineTo(xL + 16, yT);
      ctx.lineTo(xL + 16, yT + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      const innerCharge = s.charge;
      ctx.restore();
      ctx.fillStyle = withAlpha(colors.pink, 0.15 + innerCharge * 0.6);
      ctx.fillRect(xL + 10, yT + 25, jarW - 20, jarH - 35);
      ctx.fillStyle = colors.textDim;
      ctx.fillRect(cx - 3, yT - 60, 6, 60);
      ctx.beginPath();
      ctx.arc(cx, yT - 64, 11, 0, Math.PI * 2);
      ctx.fill();
      if (innerCharge > 0) {
        ctx.fillStyle = withAlpha(colors.pink, innerCharge * 0.6);
        ctx.beginPath();
        ctx.arc(cx, yT - 64, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      if (innerCharge > 0.05) {
        const r = 14 + 10 * innerCharge + Math.sin(phase * 6) * 1.5;
        const grd = ctx.createRadialGradient(cx, yT - 64, 8, cx, yT - 64, r);
        grd.addColorStop(0, withAlpha(colors.accent, 0.3 * innerCharge));
        grd.addColorStop(1, withAlpha(colors.accent, 0));
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, yT - 64, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = withAlpha(colors.pink, 0.5 + innerCharge * 0.5);
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 5; i++) {
        const y = yT + 50 + i * 28;
        ctx.fillText('+', cx, y);
      }
      ctx.fillStyle = withAlpha(colors.blue, 0.5 + innerCharge * 0.5);
      for (let i = 0; i < 4; i++) {
        const y = yT + 60 + i * 30;
        ctx.fillText('−', xL - 14, y);
        ctx.fillText('−', xR + 14, y);
      }
      const px = W * 0.78;
      const py = cy + 20;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(px, py - 70, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px, py - 61);
      ctx.lineTo(px, py - 10);
      ctx.moveTo(px, py - 10);
      ctx.lineTo(px - 10, py + 18);
      ctx.moveTo(px, py - 10);
      ctx.lineTo(px + 10, py + 18);
      ctx.moveTo(px, py - 50);
      ctx.lineTo(px + 18, py - 30);
      ctx.moveTo(px, py - 50);
      ctx.lineTo(px - 50, py - 70);
      ctx.stroke();
      if (s.sparkT > 0) {
        const age = (performance.now() - s.sparkT) / 600;
        if (age < 1) {
          const alpha = 1 - age;
          // Zigzag from (cx + 11, yT - 64) to (px - 50, py - 70)
          const lx = cx + 11,
            ly = yT - 64;
          const tx = px - 50,
            ty = py - 70;
          const sparkPts: { x: number; y: number }[] = [{ x: lx, y: ly }];
          for (let k = 1; k <= 8; k++) {
            const fr = k / 8;
            sparkPts.push({
              x: lx + (tx - lx) * fr + (Math.random() - 0.5) * 14,
              y: ly + (ty - ly) * fr + (Math.random() - 0.5) * 10,
            });
          }
          sparkPts.push({ x: tx, y: ty });
          drawGlowPath(ctx, sparkPts, {
            color: `rgba(255,255,200,${alpha})`,
            lineWidth: 2.5,
            glowColor: `rgba(255,200,80,${0.6 * alpha})`,
            glowWidth: 9,
          });
        }
      }
      ctx.restore();
      drawLabel(ctx, {
        x: 14,
        y: 12,
        text: 'Leyden jar  ·  Pieter van Musschenbroek, 1746',
        color: colors.textDim,
        baseline: 'top',
      });
      drawLabel(ctx, {
        x: 14,
        y: 28,
        text: `charge: ${(s.charge * 100).toFixed(0)}%`,
        color: colors.textDim,
        baseline: 'top',
      });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 4.6'}
      title="The Leyden jar"
      question="What did electricity look like before there were batteries?"
      caption={
        <>
          A glass cylinder lined with metal foil inside and out is a serviceable parallel-plate
          capacitor — the glass is the dielectric. Friction-charge the inner foil through the brass
          terminal and the outer foil pulls equal-and-opposite charge from ground. Touch the
          terminal and the charge dumps through you in a single bright spark. This was 1745, in
          Leiden — the first time anyone had stored static electricity for later use.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <button type="button" className="mini-toggle on" onClick={handleCharge}>
          Crank the friction wheel
        </button>
        <button type="button" className="mini-toggle" onClick={handleDischarge}>
          Discharge
        </button>
      </DemoControls>
    </Demo>
  );
}
