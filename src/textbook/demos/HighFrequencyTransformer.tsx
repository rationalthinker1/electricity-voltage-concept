/**
 * Demo D18.9 — Transformer core volume vs operating frequency
 *
 * For a fixed power rating P at peak flux B_sat and turns N, the required
 * core cross-section scales as ~1/f (from V = 4.44 f N B A, holding V and
 * B fixed). Holding power = V · I fixed, total core volume tracks 1/f
 * over three orders of magnitude.
 *
 * Side-by-side: draw two cubes whose visual sizes are scaled to the cube
 * root of the relative core volume at the chosen frequency vs at 60 Hz.
 * Slider: operating frequency 50 Hz to 1 MHz.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

// Reference comparison: 100 W transformer at 60 Hz vs at the chosen frequency.

export function HighFrequencyTransformerDemo({ figure }: Props) {
  const [f, setF] = useState(60);

  const stateRef = useRef({ f });
  useEffect(() => {
    stateRef.current = { f };
  }, [f]);

  // Reference: 100 W, 60 Hz, silicon-steel transformer.
  // Pick a reasonable reference core volume: ~120 cm³ for a 100 W 50/60 Hz
  // unit (laminated EI core), and reference mass ~600 g. These are
  // ballpark figures consistent with off-the-shelf catalog data.
  const V_REF_CM3 = 120;
  const M_REF_G = 600;
  const F_REF = 60;

  const computed = useMemo(() => {
    // Volume scales as ~1/f (core area ∝ 1/f, window area roughly fixed,
    // overall volume tracks core area for a fixed copper-fill).
    const scale = F_REF / f;
    const Vcm3 = V_REF_CM3 * scale;
    const Mg = M_REF_G * scale;
    return { Vcm3, Mg, scale };
  }, [f]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { f } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Two boxes: left = 60 Hz reference, right = current frequency
      const cy = h * 0.5;
      const refSide = Math.min(h * 0.55, w * 0.18); // visual side at 60 Hz reference
      const scale = F_REF / f;
      // Visual size = cube root of volume ratio (so the box really looks
      // like its volume scales)
      const newSide = refSide * Math.cbrt(scale);

      const leftCX = w * 0.28;
      const rightCX = w * 0.72;

      // Reference cube (left)
      drawIsoCube(ctx, leftCX, cy, refSide, 'rgba(255,107,42,0.85)', 'rgba(255,107,42,0.18)');
      // Current cube (right)
      const accentColor = scale > 1 ? 'rgba(255,107,42,0.95)' : 'rgba(108,197,194,0.95)';
      const accentFill = scale > 1 ? 'rgba(255,107,42,0.20)' : 'rgba(108,197,194,0.18)';
      drawIsoCube(ctx, rightCX, cy, newSide, accentColor, accentFill);

      // Labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('60 Hz mains (Si steel)', leftCX, 12);
      ctx.fillText(`${formatHz(f)}`, rightCX, 12);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`V ≈ ${V_REF_CM3} cm³`, leftCX, cy + refSide / 2 + 24);
      ctx.fillText(`mass ≈ ${M_REF_G} g`, leftCX, cy + refSide / 2 + 38);

      ctx.fillStyle = colors.text;
      ctx.fillText(`V ≈ ${formatVol(V_REF_CM3 * scale)}`, rightCX, cy + refSide / 2 + 24);
      ctx.fillText(`mass ≈ ${formatMass(M_REF_G * scale)}`, rightCX, cy + refSide / 2 + 38);

      // Regime annotations
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('100 W reference', 8, h - 16);
      ctx.textAlign = 'right';
      ctx.fillText('V ∝ 1/f   (constant V, B_max, N)', w - 8, h - 16);

      // Regime tag on the right cube
      let tag = '';
      if (f < 100) tag = '1950s linear supply';
      else if (f < 1000) tag = 'mains transformer';
      else if (f < 30e3) tag = 'aircraft 400 Hz / audio';
      else if (f < 200e3) tag = 'modern SMPS / wall-wart';
      else tag = 'GaN / SiC high-density';
      ctx.restore();
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(tag, rightCX, h - 16);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.9'}
      title="Core size shrinks with frequency"
      question="Slide the frequency. For 100 W, how big is the transformer at 60 Hz vs 100 kHz?"
      caption={
        <>
          From V = 4.44 f N B A: hold V, N, and peak flux density B fixed and the required core area
          A scales as 1/f. Holding the copper window fixed, total core volume tracks the same 1/f
          scaling. Going from 60 Hz to 100 kHz shrinks a 100 W transformer by a factor of{' '}
          <strong>~1700×</strong>
          in volume — which is why every wall-wart since the 1990s has been a switching design.
          Above ~100 kHz the gains slow (winding losses from skin and proximity effects, and core
          losses from eddy currents within the ferrite material itself, both rise), and below ~50 Hz
          the core simply gets too big to carry.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="frequency f"
          value={Math.log10(f)}
          min={Math.log10(50)}
          max={Math.log10(1e6)}
          step={0.01}
          format={(v) => formatHz(Math.pow(10, v))}
          onChange={(v) => setF(Math.pow(10, v))}
        />
        <MiniReadout label="frequency" value={<Num value={f} digits={1} />} unit="Hz" />
        <MiniReadout
          label="core volume"
          value={<Num value={computed.Vcm3} digits={2} />}
          unit="cm³"
        />
        <MiniReadout label="core mass" value={<Num value={computed.Mg} digits={2} />} unit="g" />
        <MiniReadout label="vs 60 Hz" value={<Num value={computed.scale} digits={2} />} unit="×" />
      </DemoControls>
    </Demo>
  );
}

function drawIsoCube(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  side: number,
  stroke: string,
  fill: string,
) {
  // Simple isometric (cabinet projection): depth = 0.5 · side at 30°
  const s = side;
  const d = s * 0.45;
  const dx = d * Math.cos(Math.PI / 6);
  const dy = -d * Math.sin(Math.PI / 6);
  const x0 = cx - s / 2;
  const y0 = cy + s / 2;

  // Front face
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.rect(x0, y0 - s, s, s);
  ctx.fill();
  ctx.stroke();

  // Top face
  ctx.beginPath();
  ctx.moveTo(x0, y0 - s);
  ctx.lineTo(x0 + s, y0 - s);
  ctx.lineTo(x0 + s + dx, y0 - s + dy);
  ctx.lineTo(x0 + dx, y0 - s + dy);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();

  // Right face
  ctx.beginPath();
  ctx.moveTo(x0 + s, y0 - s);
  ctx.lineTo(x0 + s + dx, y0 - s + dy);
  ctx.lineTo(x0 + s + dx, y0 + dy);
  ctx.lineTo(x0 + s, y0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function formatHz(f: number): string {
  if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
  if (f >= 1e3) return (f / 1e3).toFixed(f >= 1e4 ? 0 : 1) + ' kHz';
  return f.toFixed(0) + ' Hz';
}

function formatVol(v: number): string {
  if (v < 0.1) return (v * 1000).toFixed(1) + ' mm³';
  if (v < 1) return v.toFixed(2) + ' cm³';
  if (v >= 1000) return (v / 1000).toFixed(2) + ' dm³';
  return v.toFixed(1) + ' cm³';
}

function formatMass(m: number): string {
  if (m < 0.1) return (m * 1000).toFixed(1) + ' mg';
  if (m < 1) return m.toFixed(2) + ' g';
  if (m >= 1000) return (m / 1000).toFixed(2) + ' kg';
  return m.toFixed(1) + ' g';
}
