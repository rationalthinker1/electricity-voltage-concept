/**
 * Demo D7.1 — Maxwell's prediction
 *
 * The phase speed of an EM wave in a medium is v = 1 / √(εᵣ μᵣ ε₀ μ₀).
 * In vacuum (εᵣ = μᵣ = 1) this is exactly c.
 *
 * Two sliders for εᵣ and μᵣ. The animation shows two side-by-side sine
 * pulses: a reference pulse at the top, propagating at c; the comparison
 * pulse below it, propagating at v(εᵣ, μᵣ). Slow it down with glass-like
 * εᵣ ≈ 2.25 and watch it lag.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';

interface Props { figure?: string }

export function SpeedOfLightDemo({ figure }: Props) {
  const [er, setEr] = useState(1.0);
  const [mr, setMr] = useState(1.0);

  // True physical value
  const v = 1 / Math.sqrt(er * mr * PHYS.eps_0 * PHYS.mu_0);
  const n = Math.sqrt(er * mr);
  const ratio = v / PHYS.c;

  const stateRef = useRef({ er, mr });
  useEffect(() => { stateRef.current = { er, mr }; }, [er, mr]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    const tStart = performance.now() / 1000;

    function draw() {
      const t = performance.now() / 1000 - tStart;
      const { er, mr } = stateRef.current;
      const ratio = 1 / Math.sqrt(er * mr);          // v / c, normalised

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      const xL = 60;
      const xR = W - 30;
      const lineLen = xR - xL;
      const cycleTime = 5;                            // seconds for the reference pulse to cross
      const C_PX_S = lineLen / cycleTime;             // pixels / simulation-second at "c"

      // Reference (vacuum) lane
      const yA = H * 0.32;
      drawLane(ctx, xL, xR, yA, 'vacuum · v = c', 'rgba(160,158,149,0.85)');
      const xRef = xL + ((C_PX_S * t) % lineLen);
      drawPulse(ctx, xRef, yA, 'rgba(255,107,42,0.85)');

      // Comparison lane (in medium)
      const yB = H * 0.7;
      drawLane(ctx, xL, xR, yB, `medium · v = c / √(εᵣ μᵣ) = c / ${Math.sqrt(er * mr).toFixed(2)}`, 'rgba(160,158,149,0.85)');
      const xMed = xL + ((C_PX_S * ratio * t) % lineLen);
      drawPulse(ctx, xMed, yB, 'rgba(108,197,194,0.85)');

      // Vertical guide showing how much the medium pulse has lagged the reference
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(xRef, yA); ctx.lineTo(xRef, yB); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xMed, yA); ctx.lineTo(xMed, yB); ctx.stroke();
      ctx.setLineDash([]);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 7.1'}
      title="Maxwell's prediction · v = 1/√(εᵣ μᵣ ε₀ μ₀)"
      question="What sets the speed of light?"
      caption={<>
        Two pulses racing. The top one is the reference (vacuum, v = c). The bottom one is the
        same kind of wave travelling through a medium with relative permittivity εᵣ and relative
        permeability μᵣ. Set εᵣ = μᵣ = 1 and they keep pace exactly. Set εᵣ ≈ 2.25 (window glass)
        and the bottom pulse arrives a factor of √2.25 = 1.5 too late. <strong>The refractive
        index n = √(εᵣ μᵣ)</strong> is just this slowdown factor.
      </>}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="εᵣ"
          value={er} min={1} max={80} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setEr}
        />
        <MiniSlider
          label="μᵣ"
          value={mr} min={0.99} max={5} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setMr}
        />
        <MiniReadout label="v" value={<Num value={v} />} unit="m/s" />
        <MiniReadout label="n = √(εᵣ μᵣ)" value={n.toFixed(3)} />
        <MiniReadout label="v/c" value={ratio.toFixed(3)} unit="×" />
      </DemoControls>
    </Demo>
  );
}

function drawLane(
  ctx: CanvasRenderingContext2D,
  xL: number, xR: number, y: number,
  label: string, color: string,
) {
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(xL, y); ctx.lineTo(xR, y); ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label, xL, y - 10);
}

function drawPulse(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, color: string,
) {
  // Gaussian-modulated sine
  const W = 70;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = -W; i <= W; i++) {
    const env = Math.exp(-(i * i) / 800);
    const y = cy - Math.sin(i * 0.4) * env * 22;
    const px = cx + i;
    if (i === -W) ctx.moveTo(px, y); else ctx.lineTo(px, y);
  }
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
}
