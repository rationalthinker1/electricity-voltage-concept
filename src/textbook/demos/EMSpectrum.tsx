/**
 * Demo D7.6 — The electromagnetic spectrum
 *
 * Logarithmic frequency axis from radio (10^3 Hz) to gamma (10^24 Hz).
 * Draggable cursor selects a frequency; live readouts show λ and photon
 * energy. Preset tick marks for microwave oven, Wi-Fi, yellow light, and
 * diagnostic X-ray. Visible band rendered as a continuous HSL gradient.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { useSimLoop } from '@/lib/useSimLoop';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { PHYS } from '@/lib/physics';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

interface SimCtx {
  padL: number;
  padR: number;
  padT: number;
  padB: number;
  plotW: number;
  plotH: number;
}

const F_MIN = 1e3;
const F_MAX = 1e24;
const LOG_MIN = Math.log10(F_MIN);
const LOG_MAX = Math.log10(F_MAX);
const H_PLANCK = 6.62607015e-34; // J·s, exact 2019 SI
const EV_J = PHYS.e; // 1 eV in joules

const BANDS: { name: string; f0: number; f1: number }[] = [
  { name: 'radio', f0: 1e3, f1: 1e9 },
  { name: 'microwave', f0: 1e9, f1: 3e11 },
  { name: 'IR', f0: 3e11, f1: 4e14 },
  { name: 'visible', f0: 4e14, f1: 7.5e14 },
  { name: 'UV', f0: 7.5e14, f1: 3e16 },
  { name: 'X-ray', f0: 3e16, f1: 3e19 },
  { name: 'gamma', f0: 3e19, f1: 1e24 },
];

const PRESETS: { label: string; f: number }[] = [
  { label: 'microwave oven', f: 2.45e9 },
  { label: 'Wi-Fi 2.4 GHz', f: 2.4e9 },
  { label: 'Wi-Fi 5 GHz', f: 5e9 },
  { label: 'yellow light', f: 5.7e14 },
  { label: 'diagnostic X-ray', f: 3e18 },
];

function freqToX(f: number, left: number, plotW: number): number {
  const u = (Math.log10(f) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  return left + u * plotW;
}

function xToFreq(x: number, left: number, plotW: number): number {
  const u = (x - left) / plotW;
  const logF = LOG_MIN + u * (LOG_MAX - LOG_MIN);
  return Math.pow(10, Math.max(LOG_MIN, Math.min(LOG_MAX, logF)));
}

function formatFreq(f: number): string {
  if (f < 1e6) return f.toFixed(0) + ' Hz';
  if (f < 1e9) return (f / 1e6).toFixed(2) + ' MHz';
  if (f < 1e12) return (f / 1e9).toFixed(2) + ' GHz';
  if (f < 1e15) return (f / 1e12).toFixed(2) + ' THz';
  return (f / 1e15).toFixed(2) + ' PHz';
}

function visibleHue(f: number): number {
  // Map 4e14 Hz (red) → 0°, 7.5e14 Hz (violet) → 280°
  const t = (f - 4e14) / (7.5e14 - 4e14);
  return Math.max(0, Math.min(280, t * 280));
}

export function EMSpectrumDemo({ figure }: Props) {
  const [freq, setFreq] = useState(5.7e14); // default to yellow light

  const lambda = PHYS.c / freq;
  const ePhoton = H_PLANCK * freq;

  const stateRef = useSimState({ freq });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, _dt, _simTime, ctx0: SimCtx) => {
      const { freq: f } = state;
      const { padL, padR, padT, padB: _padB, plotW, plotH } = ctx0;

      const cx = freqToX(f, padL, plotW);
      const lam = PHYS.c / f;
      const ep = H_PLANCK * f;

      // Background
      ctx.fillStyle = colors.canvasBg;
      ctx.fillRect(0, 0, w, h);

      // Band backgrounds
      const bandY0 = padT + plotH * 0.45;
      const bandH = plotH * 0.35;
      for (const band of BANDS) {
        const x0 = freqToX(band.f0, padL, plotW);
        const x1 = freqToX(band.f1, padL, plotW);
        ctx.fillStyle = colors.surface;
        ctx.fillRect(x0, bandY0, Math.max(1, x1 - x0), bandH);
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, bandY0, Math.max(1, x1 - x0), bandH);

        // Band label
        const cxBand = (x0 + x1) / 2;
        drawLabel(ctx, {
          x: cxBand,
          y: bandY0 + bandH + 14,
          text: band.name,
          align: 'center',
          size: 10,
          color: colors.textDim,
        });
      }

      // Visible gradient
      const vis = BANDS.find((b) => b.name === 'visible')!;
      const visX0 = freqToX(vis.f0, padL, plotW);
      const visX1 = freqToX(vis.f1, padL, plotW);
      const grad = ctx.createLinearGradient(visX0, 0, visX1, 0);
      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ff = vis.f0 + t * (vis.f1 - vis.f0);
        const hue = visibleHue(ff);
        grad.addColorStop(t, `hsl(${hue.toFixed(1)}, 90%, 55%)`);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(visX0, bandY0, Math.max(1, visX1 - visX0), bandH);

      // Main axis line
      const axisY = padT + plotH * 0.35;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padL, axisY);
      ctx.lineTo(w - padR, axisY);
      ctx.stroke();

      // Axis ticks (every decade)
      for (let logF = Math.ceil(LOG_MIN); logF <= Math.floor(LOG_MAX); logF++) {
        const tx = freqToX(Math.pow(10, logF), padL, plotW);
        ctx.strokeStyle = colors.borderStrong;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, axisY);
        ctx.lineTo(tx, axisY + 6);
        ctx.stroke();
        drawLabel(ctx, {
          x: tx,
          y: axisY + 20,
          text: `10^${logF}`,
          align: 'center',
          size: 9,
          color: colors.textMuted,
        });
      }

      // Preset tick marks
      for (const p of PRESETS) {
        const px = freqToX(p.f, padL, plotW);
        if (px < padL || px > w - padR) continue;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, axisY - 4);
        ctx.lineTo(px, axisY + 4);
        ctx.stroke();
        drawLabel(ctx, {
          x: px,
          y: axisY - 8,
          text: p.label,
          align: 'center',
          size: 8,
          color: colors.accent,
        });
      }

      // Cursor
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, padT);
      ctx.lineTo(cx, bandY0 + bandH);
      ctx.stroke();

      // Cursor dot
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(cx, axisY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Readout box near cursor
      const boxW = 148;
      const boxH = 58;
      let boxX = cx + 10;
      if (boxX + boxW > w - padR) boxX = cx - boxW - 10;
      const boxY = padT + 4;

      ctx.fillStyle = colors.cardBg;
      ctx.globalAlpha = 0.92;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      drawLabel(ctx, {
        x: boxX + 8,
        y: boxY + 16,
        text: formatFreq(f),
        size: 10,
        color: colors.text,
      });
      drawLabel(ctx, {
        x: boxX + 8,
        y: boxY + 32,
        text: `λ = ${(lam < 1e-6 ? lam * 1e9 : lam < 1 ? lam * 1e3 : lam).toFixed(1)} ${lam < 1e-6 ? 'nm' : lam < 1 ? 'mm' : 'm'}`,
        size: 9,
        color: colors.textDim,
      });
      drawLabel(ctx, {
        x: boxX + 8,
        y: boxY + 46,
        text: `E = ${(ep / EV_J).toFixed(2)} eV`,
        size: 9,
        color: colors.textDim,
      });
    },
     
    [],
    (info) => {
      const { canvas, w, h } = info;
      const padL = 48;
      const padR = 24;
      const padT = 24;
      const padB = 72;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      let dragging = false;

      function setFreqFromX(px: number) {
        const f = xToFreq(px, padL, plotW);
        setFreq(f);
      }

      function onPointerDown(ev: PointerEvent) {
        const rect = canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        if (x < padL - 10 || x > w - padR + 10) return;
        if (y < padT - 10 || y > h - padB + 10) return;
        dragging = true;
        setFreqFromX(x);
        canvas.setPointerCapture(ev.pointerId);
      }

      function onPointerMove(ev: PointerEvent) {
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        setFreqFromX(ev.clientX - rect.left);
      }

      function onPointerUp(ev: PointerEvent) {
        dragging = false;
        if (canvas.hasPointerCapture(ev.pointerId)) {
          canvas.releasePointerCapture(ev.pointerId);
        }
      }

      canvas.style.cursor = 'crosshair';
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);

      return {
        context: { padL, padR, padT, padB, plotW, plotH },
        cleanup: () => {
          canvas.removeEventListener('pointerdown', onPointerDown);
          canvas.removeEventListener('pointermove', onPointerMove);
          canvas.removeEventListener('pointerup', onPointerUp);
          canvas.removeEventListener('pointercancel', onPointerUp);
        },
      };
    },
  );

  const logF = Math.log10(freq);

  return (
    <Demo
      figure={figure}
      title="The electromagnetic spectrum"
      question="How do frequency, wavelength, and photon energy change across the EM spectrum?"
      caption={
        <>
          Drag the cursor or use the slider to explore the spectrum. Preset ticks mark the
          microwave oven (2.45 GHz), Wi-Fi bands, yellow light (~570 THz), and diagnostic X-rays
          (~3 EHz). The visible band is shown as a true hue gradient.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} ariaLabel="Electromagnetic spectrum chart" />
      <DemoControls>
        <MiniSlider
          label="frequency"
          value={logF}
          min={LOG_MIN}
          max={LOG_MAX}
          step={0.01}
          format={(v) => formatFreq(Math.pow(10, v))}
          onChange={(v) => setFreq(Math.pow(10, v))}
        />
        <MiniReadout
          label="wavelength λ"
          value={
            lambda < 1e-6 ? (
              <Num value={lambda * 1e9} digits={2} />
            ) : lambda < 1 ? (
              <Num value={lambda * 1e3} digits={2} />
            ) : (
              <Num value={lambda} digits={2} />
            )
          }
          unit={lambda < 1e-6 ? 'nm' : lambda < 1 ? 'mm' : 'm'}
        />
        <MiniReadout
          label="photon energy"
          value={<Num value={ePhoton / EV_J} digits={2} />}
          unit="eV"
        />
      </DemoControls>
      <EquationStrip
        leftLabel="wavelength"
        left={
          <InlineMath
            tex={`\\lambda = \\dfrac{c}{f} = \\dfrac{${PHYS.c.toExponential(2)}}{${freq.toExponential(2)}} = ${lambda.toExponential(2)} \\text{ m}`}
          />
        }
        rightLabel="photon energy"
        right={
          <InlineMath
            tex={`E = hf = (${H_PLANCK.toExponential(2)})(${freq.toExponential(2)}) = ${ePhoton.toExponential(2)} \\text{ J}`}
          />
        }
      />
    </Demo>
  );
}
