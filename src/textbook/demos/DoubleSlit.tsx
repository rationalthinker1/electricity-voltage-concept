/**
 * Demo D14.6 — Young's double-slit interference
 *
 * Two slits separated by d. Distant screen at distance L. The two waves
 * add at every point on the screen; the resulting intensity is the
 * classic cos²(πd sinθ/λ) fringes. We show the intensity vs. position
 * on the screen, with bright maxima at sin θ = m λ/d.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

export function DoubleSlitDemo({ figure }: Props) {
  const [lamNm, setLamNm] = useState(550);
  const [dMicron, setDMicron] = useState(50); // slit separation, µm
  const [LMm, setLMm] = useState(500);

  const stateRef = useRef({ lamNm, dMicron, LMm });
  useEffect(() => { stateRef.current = { lamNm, dMicron, LMm }; }, [lamNm, dMicron, LMm]);

  // Fringe spacing on screen: Δy = λ L / d
  const lam = lamNm * 1e-9;
  const d = dMicron * 1e-6;
  const L = LMm * 1e-3;
  const fringeMm = (lam * L) / d * 1000;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { lamNm, dMicron, LMm } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      const lam_ = lamNm * 1e-9;
      const d_ = dMicron * 1e-6;
      const L_ = LMm * 1e-3;
      const fringe = (lam_ * L_) / d_;

      // Left section: slit-and-screen schematic. Right section: intensity strip + plot.
      const slitX = 40;
      const screenX = W * 0.55;
      const padTop = 30;
      const padBot = 30;
      const cy = H / 2;

      // Slit baseline
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(slitX, padTop); ctx.lineTo(slitX, H - padBot); ctx.stroke();

      // Two slits — black gaps in the line
      const halfSlit = 22;
      const slitTop = { x: slitX, y: cy - halfSlit };
      const slitBot = { x: slitX, y: cy + halfSlit };
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(slitX - 3, slitTop.y - 4, 6, 8);
      ctx.fillRect(slitX - 3, slitBot.y - 4, 6, 8);
      ctx.strokeStyle = 'rgba(108,197,194,0.95)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(slitX - 3, slitTop.y - 4, 6, 8);
      ctx.strokeRect(slitX - 3, slitBot.y - 4, 6, 8);

      // Screen line
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(screenX, padTop); ctx.lineTo(screenX, H - padBot); ctx.stroke();

      // Compute intensity along the screen.
      // Position on screen y_phys. Angle θ ≈ y/L. Phase difference π d sin θ / λ.
      const screenHalfMm = 25; // visualize ±25 mm on the screen
      const Nrows = H - padTop - padBot;
      const intensities: number[] = [];
      for (let i = 0; i < Nrows; i++) {
        const u = (i / (Nrows - 1)) - 0.5;
        const y_m = u * screenHalfMm * 2 * 1e-3;
        const sinTh = y_m / Math.sqrt(L_ * L_ + y_m * y_m);
        const phi = (Math.PI * d_ * sinTh) / lam_;
        const I = Math.cos(phi) ** 2;
        intensities.push(I);
      }

      // Draw bright stripes along the screen
      const [r, g, b] = wavelengthRGB(lamNm);
      for (let i = 0; i < Nrows; i++) {
        const I = intensities[i];
        const alpha = 0.05 + 0.95 * I;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillRect(screenX - 5, padTop + i, 10, 1);
      }

      // Plot intensity to the right of the screen
      const plotL = screenX + 12;
      const plotR = W - 20;
      const plotW = plotR - plotL;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(plotL, padTop); ctx.lineTo(plotL, H - padBot); ctx.stroke();
      ctx.strokeStyle = `rgba(${r},${g},${b},0.95)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < Nrows; i++) {
        const I = intensities[i];
        const xx = plotL + I * plotW;
        const yy = padTop + i;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();

      // Rays from slits to centre of screen
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(slitTop.x, slitTop.y); ctx.lineTo(screenX, cy);
      ctx.moveTo(slitBot.x, slitBot.y); ctx.lineTo(screenX, cy);
      ctx.stroke();

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(160,158,149,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText('slits', slitX, padTop - 8);
      ctx.fillText('screen', screenX, padTop - 8);
      ctx.fillText('I(y)', (plotL + plotR) / 2, H - 8);
      ctx.fillText(`fringe Δy = ${(fringe * 1000).toFixed(2)} mm`, screenX + 4, H - padBot + 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.6'}
      title="Young's double slit — two beams interfere"
      question="What sets the spacing between bright fringes?"
      caption={<>
        Two slits separated by <strong>d</strong>, screen at distance <strong>L</strong>. The
        beams from the two slits travel slightly different distances to each point on the screen,
        and the phase difference modulates their sum into the classic cos² fringes. Bright maxima
        sit at angles <strong>sin θ = m λ/d</strong>, with spacing <strong>Δy ≈ λ L / d</strong> on
        the screen.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider label="λ" value={lamNm} min={400} max={700} step={5}
          format={v => v.toFixed(0) + ' nm'} onChange={setLamNm} />
        <MiniSlider label="d" value={dMicron} min={20} max={200} step={1}
          format={v => v.toFixed(0) + ' µm'} onChange={setDMicron} />
        <MiniSlider label="L" value={LMm} min={200} max={1500} step={10}
          format={v => v.toFixed(0) + ' mm'} onChange={setLMm} />
        <MiniReadout label="fringe Δy" value={fringeMm.toFixed(2)} unit="mm" />
      </DemoControls>
    </Demo>
  );
}

function wavelengthRGB(lam: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (lam >= 380 && lam < 440) { r = -(lam - 440) / 60; g = 0; b = 1; }
  else if (lam < 490) { r = 0; g = (lam - 440) / 50; b = 1; }
  else if (lam < 510) { r = 0; g = 1; b = -(lam - 510) / 20; }
  else if (lam < 580) { r = (lam - 510) / 70; g = 1; b = 0; }
  else if (lam < 645) { r = 1; g = -(lam - 645) / 65; b = 0; }
  else if (lam <= 740) { r = 1; g = 0; b = 0; }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
