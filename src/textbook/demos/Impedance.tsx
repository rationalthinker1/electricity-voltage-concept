/**
 * Demo D10.5 — Impedance in the complex plane
 *
 *   Z_R = R          (real axis)
 *   Z_L = jωL        (+imaginary)
 *   Z_C = 1/(jωC) = −j/(ωC)   (−imaginary)
 *
 * Head-to-tail vector sum gives Z = R + j(ωL − 1/(ωC)).
 * |Z| = magnitude; arg(Z) = phase shift between V and I.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function ImpedanceDemo({ figure }: Props) {
  const [R, setR] = useState(20);     // Ω
  const [Lmh, setLmh] = useState(20); // mH
  const [Cuf, setCuf] = useState(20); // µF
  const [f, setF] = useState(400);    // Hz

  const L = Lmh * 1e-3;
  const C = Cuf * 1e-6;
  const omega = 2 * Math.PI * f;
  const XL = omega * L;
  const XC = 1 / (omega * C);
  const Xnet = XL - XC;
  const Zmag = Math.sqrt(R * R + Xnet * Xnet);
  const phi = Math.atan2(Xnet, R);  // radians

  const stateRef = useRef({ R, XL, XC, Zmag, phi });
  useEffect(() => { stateRef.current = { R, XL, XC, Zmag, phi }; }, [R, XL, XC, Zmag, phi]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { R, XL, XC, Zmag, phi } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      // Auto-scale axes so we always see the vectors
      const span = Math.max(Math.abs(R), Math.abs(XL), Math.abs(XC), Zmag, 1) * 1.25;
      const half = Math.min(w, h) / 2 - 30;
      const scale = half / span;

      // Axes
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy);
      ctx.moveTo(cx, 20); ctx.lineTo(cx, h - 20);
      ctx.stroke();

      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Re (Ω)', w - 50, cy - 10);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('+jX (Ω)', cx + 38, 22);
      ctx.textBaseline = 'bottom';
      ctx.fillText('−jX (Ω)', cx + 38, h - 22);

      // Head-to-tail: start at origin
      //   step 1: R along +real
      //   step 2: +XL along +imag
      //   step 3: -XC along -imag (i.e. shift by XC down)
      const p0x = cx, p0y = cy;
      const p1x = cx + R * scale, p1y = cy;
      const p2x = p1x, p2y = p1y - XL * scale;  // y is flipped: up = +imag
      const p3x = p2x, p3y = p2y + XC * scale;  // down = -imag

      // R vector (pink)
      drawVector(ctx, p0x, p0y, p1x, p1y, 'rgba(255,59,110,0.95)', `R = ${R.toFixed(1)} Ω`);
      // jωL vector (teal, upward)
      drawVector(ctx, p1x, p1y, p2x, p2y, 'rgba(108,197,194,0.95)', `jωL = ${XL.toFixed(1)} Ω`);
      // 1/(jωC) vector (blue, downward)
      drawVector(ctx, p2x, p2y, p3x, p3y, 'rgba(91,174,248,0.95)', `1/(jωC) = ${XC.toFixed(1)} Ω`);

      // Resultant Z from origin to p3
      drawVector(ctx, p0x, p0y, p3x, p3y, 'rgba(255,107,42,0.95)', '', 2.2);

      // Magnitude / phase annotation
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const midX = (p0x + p3x) / 2 + 8;
      const midY = (p0y + p3y) / 2;
      ctx.fillText(`|Z| = ${Zmag.toFixed(2)} Ω`, midX, midY);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.text;
      ctx.fillText(`φ = ${(phi * 180 / Math.PI).toFixed(1)}°`, midX, midY + 14);

      // Phase arc from real axis to Z
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const arcR = 26;
      ctx.arc(cx, cy, arcR, 0, -phi, phi > 0);
      ctx.stroke();

      // Header
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Z = R + j(ωL − 1/ωC)`, 10, 8);
      ctx.textAlign = 'right';
      ctx.fillText(
        phi > 0.01 ? 'inductive (V leads I)' :
          phi < -0.01 ? 'capacitive (I leads V)' :
            'resistive (V, I in phase)',
        w - 10, 8
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 10.5'}
      title="Impedance — Ohm's law in the complex plane"
      question="Slide ω. Where do the three vectors point — and why does their sum lean?"
      caption={<>
        Each component contributes one vector: a resistor along the real axis, an inductor
        upward along +j, a capacitor downward along −j. Add them head-to-tail and you get
        Z = R + j(ωL − 1/ωC). The length |Z| is the AC "resistance"; the angle is the phase
        lag between voltage and current. At ω = ω₀ = 1/√(LC), the L and C contributions cancel
        and Z collapses onto R — resonance.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="R"
          value={R} min={1} max={100} step={1}
          format={v => v.toFixed(0) + ' Ω'}
          onChange={setR}
        />
        <MiniSlider
          label="L"
          value={Lmh} min={0.1} max={100} step={0.1}
          format={v => v.toFixed(1) + ' mH'}
          onChange={setLmh}
        />
        <MiniSlider
          label="C"
          value={Cuf} min={0.1} max={500} step={0.1}
          format={v => v.toFixed(1) + ' µF'}
          onChange={setCuf}
        />
        <MiniSlider
          label="f"
          value={f} min={10} max={5000} step={10}
          format={v => v < 1000 ? v.toFixed(0) + ' Hz' : (v / 1000).toFixed(2) + ' kHz'}
          onChange={setF}
        />
        <MiniReadout label="ωL" value={<Num value={XL} />} unit="Ω" />
        <MiniReadout label="1/(ωC)" value={<Num value={XC} />} unit="Ω" />
        <MiniReadout label="|Z|" value={<Num value={Zmag} />} unit="Ω" />
        <MiniReadout label="φ" value={(phi * 180 / Math.PI).toFixed(1)} unit="°" />
      </DemoControls>
    </Demo>
  );
}

function drawVector(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number,
  x1: number, y1: number,
  color: string,
  label: string,
  width = 1.6,
) {
  if (Math.hypot(x1 - x0, y1 - y0) < 1) return;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
  ctx.stroke();
  // arrowhead
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const al = 7;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - al * Math.cos(ang - 0.4), y1 - al * Math.sin(ang - 0.4));
  ctx.lineTo(x1 - al * Math.cos(ang + 0.4), y1 - al * Math.sin(ang + 0.4));
  ctx.closePath(); ctx.fill();
  if (label) {
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, x1 + 4, y1 - 4);
  }
}
