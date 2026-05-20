/**
 * Demo D2.5 — AC electron jitter
 *
 * Visualises a single conduction electron in a 60 Hz wall-outlet wire.
 * The electron oscillates sinusoidally about a fixed lattice site, with
 * peak displacement
 *     x_peak = (√2 · I_rms) / (n e A · ω)
 * where ω = 2π × 60 rad/s. For a few amps through 14-gauge copper this
 * works out to a few hundred nanometres — comparable to the wavelength
 * of visible light, less than the diameter of a human hair by 100×.
 *
 * Meanwhile the wire still delivers tens or hundreds of watts of real
 * power (P = V_rms · I_rms at unity power factor).
 *
 * Time is shown at 1/60 wall-clock-to-real so the 60 Hz oscillation
 * looks like 1 Hz on screen.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { MATERIALS, PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

const F_GRID = 60; // Hz
const OMEGA = 2 * Math.PI * F_GRID;
const V_RMS = 120; // standard US line voltage
const A_WIRE = 2.08e-6; // 14 AWG, m² — typical lamp cord
const TIME_SLOWDOWN = 60; // display 1 Hz instead of 60 Hz

// Reference lengths (m) used in the scale strip.
const REFERENCES: { label: string; m: number }[] = [
  { label: 'Cu atom spacing', m: 0.256e-9 }, // nearest-neighbour distance in fcc copper
  { label: 'transistor gate', m: 5e-9 },
  { label: 'visible-light λ', m: 550e-9 },
  { label: 'red blood cell', m: 7e-6 },
];

function formatRatio(x: number, ref: number): string {
  if (!isFinite(x) || !isFinite(ref) || x <= 0 || ref <= 0) return '—';
  const r = x / ref;
  if (r >= 1000) return '>1000×';
  if (r >= 10) return `${Math.round(r)}×`;
  if (r >= 1) return `${r.toFixed(1)}×`;
  const inv = 1 / r;
  if (inv >= 1000) return '<1/1000';
  if (inv >= 10) return `1/${Math.round(inv)}`;
  return `1/${inv.toFixed(1)}`;
}

export function ACElectronJitterDemo({ figure }: Props) {
  const [Irms, setIrms] = useState(5); // amperes RMS

  const n = MATERIALS.copper.n;

  const { v_peak, x_peak, P_avg } = useMemo(() => {
    const v_peak = (Math.sqrt(2) * Irms) / (n * PHYS.e * A_WIRE);
    const x_peak = v_peak / OMEGA;
    const P_avg = V_RMS * Irms;
    return { v_peak, x_peak, P_avg };
  }, [Irms, n]);

  const stateRef = useRef({ x_peak });
  useEffect(() => {
    stateRef.current = { x_peak };
  }, [x_peak]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    const startTime = performance.now();

    function draw() {
      const colors = getCanvasColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const { x_peak } = stateRef.current;

      // Visible window: ±1500 nm horizontal, regardless of current. The
      // electron's trace stays well inside this range up to ~15 A.
      const windowNm = 1500;
      const cx = w / 2;
      const cy = h * 0.52;
      const innerLeft = 60;
      const innerRight = w - 60;
      const pxPerNm = (innerRight - innerLeft) / 2 / windowNm;

      // Centre baseline — the electron's mean position (zero on the scale).
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(innerLeft, cy);
      ctx.lineTo(innerRight, cy);
      ctx.stroke();

      // Peak-amplitude markers (the envelope of the oscillation).
      const ampPx = x_peak * 1e9 * pxPerNm;
      ctx.save();
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - ampPx, cy - 28);
      ctx.lineTo(cx - ampPx, cy + 28);
      ctx.moveTo(cx + ampPx, cy - 28);
      ctx.lineTo(cx + ampPx, cy + 28);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.85;
      ctx.fillText(`±${(x_peak * 1e9).toFixed(0)} nm`, cx + ampPx + 4, cy - 32);
      ctx.restore();

      // Current electron position. Time is slowed by TIME_SLOWDOWN so a
      // 60 Hz oscillation animates at 1 Hz on-screen.
      const tWall = (performance.now() - startTime) / 1000;
      const tReal = tWall / TIME_SLOWDOWN;
      const xReal = x_peak * Math.sin(OMEGA * tReal);
      const electronX = cx + xReal * 1e9 * pxPerNm;

      // The electron — pinkish-blue disk with "−" inside, matching the
      // electron icon used elsewhere in the chapter.
      ctx.beginPath();
      ctx.fillStyle = colors.blue;
      ctx.arc(electronX, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colors.bg;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('−', electronX, cy + 1);
      ctx.textBaseline = 'alphabetic';

      // Scale-bar tickmarks: ±500 nm and ±1000 nm.
      ctx.strokeStyle = colors.textDim;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (const tick of [-1000, -500, 0, 500, 1000]) {
        const tx = cx + tick * pxPerNm;
        if (tx < innerLeft || tx > innerRight) continue;
        ctx.beginPath();
        ctx.moveTo(tx, cy + 24);
        ctx.lineTo(tx, cy + 30);
        ctx.stroke();
        ctx.fillText(`${tick}`, tx, cy + 44);
      }
      ctx.fillText('position (nm)', cx, cy + 60);

      // Header callouts — "60 Hz AC, 14-AWG copper" and the time
      // dilation note.
      ctx.fillStyle = colors.textDim;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('60 Hz AC · 14-AWG copper · one electron', innerLeft, 22);
      ctx.textAlign = 'right';
      ctx.fillText(`shown at 1/${TIME_SLOWDOWN} real speed`, innerRight, 22);

      // Reference strip across the top: how the peak swing compares to
      // a handful of familiar lengths (log-scale conceptually, labelled
      // with the real values).
      const stripY = 56;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'left';
      ctx.fillText('for scale:', innerLeft, stripY);
      let sx = innerLeft + 60;
      for (const ref of REFERENCES) {
        const refNm = ref.m * 1e9;
        const label =
          refNm < 1
            ? `${ref.label} (${refNm.toFixed(2)} nm)`
            : refNm < 1000
              ? `${ref.label} (${refNm.toFixed(0)} nm)`
              : `${ref.label} (${(refNm / 1000).toFixed(0)} µm)`;
        const ratioStr = formatRatio(x_peak, ref.m);
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(label, sx, stripY);
        ctx.fillStyle = colors.accent;
        ctx.fillText(ratioStr, sx, stripY + 14);
        sx += ctx.measureText(label).width + 22;
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 2.5'}
      title="A single electron in a 60 Hz wall outlet"
      question="If the current reverses 120 times a second, how far does any one electron actually go?"
      caption={
        <>
          At 5 A through a 14-gauge copper lamp cord, each conduction electron oscillates with a
          peak displacement of about <strong>650 nm</strong> — comparable to the wavelength of green
          light, smaller than a single bacterium. Yet the wire delivers
          <strong> ~600 W</strong> the whole time. The energy isn't riding the electrons; it's
          flowing through the surrounding field (Chapter 8).
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="current I_rms"
          value={Irms}
          min={0.5}
          max={15}
          step={0.1}
          format={(v) => v.toFixed(1) + ' A'}
          onChange={setIrms}
        />
        <MiniReadout label="peak swing" value={(x_peak * 1e9).toFixed(0)} unit="nm" />
        <MiniReadout label="peak v" value={<Num value={v_peak} />} unit="m/s" />
        <MiniReadout label="real power" value={P_avg.toFixed(0)} unit="W" />
      </DemoControls>
      <EquationStrip
        leftLabel="Peak excursion at 60 Hz"
        left={<InlineMath tex="x_{\text{peak}} \;=\; \dfrac{v_{\text{peak}}}{\omega} \;=\; \dfrac{\sqrt{2}\, I_{\text{rms}}}{n\, q\, A\, \omega}" />}
        rightLabel="Live substitution (14-AWG Cu)"
        right={
          <InlineMath
            tex={
              `x_{\\text{peak}} \\;=\\; \\dfrac{${v_peak.toExponential(2)}}{2\\pi\\cdot 60} ` +
              `\\;\\approx\\; ${(x_peak * 1e9).toFixed(0)}\\ \\text{nm}`
            }
          />
        }
      />
    </Demo>
  );
}
