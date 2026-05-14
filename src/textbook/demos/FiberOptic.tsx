/**
 * Demo D14.5 — Total internal reflection in an optical fiber
 *
 * A long horizontal glass cylinder (core, n_core) clad in a slightly lower-
 * index sheath (n_clad). Reader sets the input angle. Below the critical
 * angle for the core–clad interface, the ray zig-zags down the fiber by TIR;
 * above it, the ray refracts into the cladding and is lost.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function FiberOpticDemo({ figure }: Props) {
  // Angle to the fiber axis (not to the normal) — how steeply the ray strikes the wall
  // measured from the axis. Larger value → more steeply, less likely to TIR.
  const [angleAxis, setAngleAxis] = useState(15); // degrees from axis
  const [nCore, setNCore] = useState(1.48);
  const [nClad, setNClad] = useState(1.46);

  const stateRef = useRef({ angleAxis, nCore, nClad });
  useEffect(() => { stateRef.current = { angleAxis, nCore, nClad }; }, [angleAxis, nCore, nClad]);

  // Critical angle, measured from the normal to the wall
  // sin θ_c = n_clad / n_core
  const sinCrit = nClad / nCore;
  const critFromNormal = Math.asin(Math.min(1, sinCrit)) * (180 / Math.PI);
  // Equivalent angle from the axis: 90° − critFromNormal
  const critFromAxis = 90 - critFromNormal;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { angleAxis, nCore, nClad } = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const top = H / 2 - 50;
      const bot = H / 2 + 50;
      const left = 30;
      const right = W - 18;

      // Cladding (light tint above & below)
      ctx.fillStyle = 'rgba(91,174,248,0.10)';
      ctx.fillRect(left, top - 30, right - left, 30);
      ctx.fillRect(left, bot, right - left, 30);
      // Core (slightly brighter teal)
      ctx.fillStyle = 'rgba(108,197,194,0.10)';
      ctx.fillRect(left, top, right - left, bot - top);

      // Walls
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(left, top); ctx.lineTo(right, top);
      ctx.moveTo(left, bot); ctx.lineTo(right, bot);
      ctx.stroke();

      // Critical angle (from axis)
      const sinCrit_ = nClad / nCore;
      const critFromAxis_ = 90 - Math.asin(Math.min(1, sinCrit_)) * (180 / Math.PI);
      const escapes_ = angleAxis > critFromAxis_;

      // Bouncing ray (zig-zag) — direction angle from axis, alternating sign on each bounce
      const a = (angleAxis * Math.PI) / 180;
      const slope = Math.tan(a);
      let x = left;
      let y = (top + bot) / 2; // start on axis
      let dy = 1; // initial down
      const rayColor = escapes_ ? 'rgba(255,59,110,0.95)' : 'rgba(255,107,42,0.95)';
      ctx.strokeStyle = rayColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      let bounces = 0;
      while (x < right && bounces < 100) {
        // Distance until we hit a wall
        const remainingV = dy > 0 ? (bot - y) : (y - top);
        const dx = remainingV / slope;
        let nx = x + dx;
        let ny = dy > 0 ? bot : top;
        if (nx > right) {
          const dxx = right - x;
          ny = y + dy * dxx * slope;
          nx = right;
          ctx.lineTo(nx, ny);
          break;
        }
        ctx.lineTo(nx, ny);
        if (escapes_) {
          // Refract into cladding and stop
          // Outgoing angle from normal in cladding
          const sin1 = Math.cos(a); // sin θ_normal = cos θ_axis
          const sin2 = (nCore / nClad) * sin1;
          if (Math.abs(sin2) <= 1) {
            const th2 = Math.asin(sin2);
            // Slope after refraction (steepness from normal)
            const slope2 = Math.tan(Math.PI / 2 - th2);
            const escapeY = ny + dy * 25;
            const escapeX = nx + (escapeY - ny) / dy * 0 + 25 / slope2;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(escapeX, escapeY);
            ctx.stroke();
            ctx.fillStyle = getCanvasColors().pink;
            ctx.font = 'bold 11px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('LIGHT ESCAPES', W / 2, H - 14);
          }
          return;
        }
        // Otherwise reflect
        x = nx;
        y = ny;
        dy = -dy;
        bounces++;
      }
      ctx.stroke();

      // Labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'left';
      ctx.fillText(`core · n=${nCore.toFixed(3)}`, left + 4, (top + bot) / 2 + 3);
      ctx.fillText(`cladding · n=${nClad.toFixed(3)}`, left + 4, top - 12);
      if (!escapes_) {
        ctx.fillStyle = getCanvasColors().teal;
        ctx.textAlign = 'right';
        ctx.fillText('total internal reflection', right - 6, top - 12);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.5'}
      title="A fiber-optic strand traps light"
      question="What's the maximum angle the input ray can make to the axis?"
      caption={<>
        The ray bounces along the core by TIR so long as its angle to the wall (measured from the
        normal) exceeds the critical angle <strong>sin θ_c = n_clad/n_core</strong>. Equivalently,
        the angle to the fiber's axis must stay <em>below</em> <strong>90° − θ_c</strong>. Real
        single-mode silica fibers run at ~0.36 numerical aperture — about 10° of acceptance half-angle.
      </>}
    >
      <AutoResizeCanvas height={220} setup={setup} />
      <DemoControls>
        <MiniSlider label="angle to axis" value={angleAxis} min={0} max={35} step={0.25}
          format={v => v.toFixed(1) + '°'} onChange={setAngleAxis} />
        <MiniSlider label="n_core" value={nCore} min={1.40} max={1.60} step={0.005}
          format={v => v.toFixed(3)} onChange={setNCore} />
        <MiniSlider label="n_clad" value={nClad} min={1.30} max={1.55} step={0.005}
          format={v => v.toFixed(3)} onChange={setNClad} />
        <MiniReadout
          label="max acceptance"
          value={Number.isFinite(critFromAxis) ? critFromAxis.toFixed(2) : '—'}
          unit="°"
        />
      </DemoControls>
    </Demo>
  );
}
