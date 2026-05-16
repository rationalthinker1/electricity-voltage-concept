/**
 * Demo D14.4 — Thin-film interference
 *
 * A film of variable thickness t and refractive index n₂ between air (above)
 * and water (below). Light reflects off both the top and bottom interfaces
 * and interferes; constructive interference at wavelengths satisfying
 * 2 n₂ t = (m + ½) λ in normal incidence accounting for the π phase shift
 * at the air→film boundary. The resulting reflected colour is the
 * superposition.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

export function ThinFilmDemo({ figure }: Props) {
  const [thickNm, setThickNm] = useState(280);
  const [n2, setN2] = useState(1.33); // soap film ≈ water
  const n1 = 1.0;
  const n3 = 1.33; // water below

  const stateRef = useRef({ thickNm, n2, n1, n3 });
  useEffect(() => {
    stateRef.current = { thickNm, n2, n1, n3 };
  }, [thickNm, n2, n1, n3]);

  // For readout — first constructive maximum in visible
  // 2 n₂ t = (m + ½) λ when the top interface flips phase (n1 < n2) and
  // the bottom does not (n2 ≈ n3 — actually n2 < n3 → also flips, no extra π).
  // Soap film in air: only top flips → factor ½ shifts.
  // For air-film-water with n_film < n_water both flip → no net half shift.
  // Use net half-wave shift only when exactly one interface flips:
  const halfShift = n1 < n2 !== n2 < n3;
  function constructiveLambda(m: number) {
    return halfShift ? (4 * n2 * thickNm) / (2 * m + 1) : (2 * n2 * thickNm) / m;
  }
  // First visible constructive maximum
  let peakLambda = NaN;
  for (let m = 0; m < 8; m++) {
    const lam = constructiveLambda(halfShift ? m : m + 1);
    if (lam >= 380 && lam <= 740) {
      peakLambda = lam;
      break;
    }
  }

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { thickNm, n2, n1, n3 } = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Spectrum strip at the top showing R(λ) for the film
      const stripTop = 20;
      const stripH = 32;
      const stripLeft = 70;
      const stripRight = W - 20;
      const stripW = stripRight - stripLeft;

      const halfFlip = n1 < n2 !== n2 < n3;
      function reflectance(lamNm: number) {
        const lam = lamNm; // both in nm
        // Phase difference 2π · (2 n₂ t)/λ plus net π if halfFlip.
        const phi = (2 * Math.PI * 2 * n2 * thickNm) / lam + (halfFlip ? Math.PI : 0);
        // Equal-amplitude two-beam interference: R ∝ (1 - cos φ) / 2
        const R = (1 - Math.cos(phi)) / 2;
        return R;
      }

      // Spectrum bar — for each wavelength, draw a thin column tinted to that colour and modulated
      // by R(λ).
      for (let x = 0; x < stripW; x++) {
        const lam = 380 + (x / stripW) * (740 - 380);
        const R = reflectance(lam);
        const [r, g, b] = wavelengthRGB(lam);
        const alpha = 0.15 + 0.85 * R;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillRect(stripLeft + x, stripTop, 1, stripH);
      }
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.strokeRect(stripLeft, stripTop, stripW, stripH);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'right';
      ctx.fillText('R(λ)', stripLeft - 6, stripTop + 18);
      ctx.textAlign = 'left';
      ctx.fillText('380 nm', stripLeft, stripTop + stripH + 12);
      ctx.textAlign = 'right';
      ctx.fillText('740 nm', stripRight, stripTop + stripH + 12);

      // Cross-section illustration below: air / film / water sandwich
      const sectionY = 110;
      const sectionH = 130;
      ctx.fillStyle = 'rgba(91,174,248,0.10)';
      ctx.fillRect(stripLeft, sectionY, stripW, 40); // air
      // Film thickness proportional to thickNm
      const filmPxH = Math.max(6, Math.min(40, thickNm / 12));
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(stripLeft, sectionY + 40, stripW, filmPxH);
      ctx.fillStyle = 'rgba(108,197,194,0.18)';
      ctx.fillRect(stripLeft, sectionY + 40 + filmPxH, stripW, sectionH - 40 - filmPxH);

      // Boundary lines
      ctx.strokeStyle = getCanvasColors().textDim;
      ctx.beginPath();
      ctx.moveTo(stripLeft, sectionY + 40);
      ctx.lineTo(stripRight, sectionY + 40);
      ctx.moveTo(stripLeft, sectionY + 40 + filmPxH);
      ctx.lineTo(stripRight, sectionY + 40 + filmPxH);
      ctx.stroke();

      // Labels
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'left';
      ctx.fillText(`air · n=${n1.toFixed(2)}`, stripLeft + 6, sectionY + 18);
      ctx.fillText(
        `film · n=${n2.toFixed(2)}, t=${thickNm.toFixed(0)} nm`,
        stripLeft + 6,
        sectionY + 40 + filmPxH / 2 + 3,
      );
      ctx.fillText(`water · n=${n3.toFixed(2)}`, stripLeft + 6, sectionY + 40 + filmPxH + 18);

      // Cartoon rays: incident + two reflections
      const rx0 = stripLeft + 70;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(rx0 - 18, sectionY + 8);
      ctx.lineTo(rx0, sectionY + 40);
      ctx.stroke();
      // First reflection at top boundary
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.beginPath();
      ctx.moveTo(rx0, sectionY + 40);
      ctx.lineTo(rx0 + 18, sectionY + 8);
      ctx.stroke();
      // Transmitted ray going down + reflection from bottom
      ctx.strokeStyle = 'rgba(160,158,149,0.6)';
      ctx.beginPath();
      ctx.moveTo(rx0, sectionY + 40);
      ctx.lineTo(rx0 + 8, sectionY + 40 + filmPxH);
      ctx.stroke();
      // Second reflection back up
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.beginPath();
      ctx.moveTo(rx0 + 8, sectionY + 40 + filmPxH);
      ctx.lineTo(rx0 + 26, sectionY + 8);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.4'}
      title="Soap-bubble colours — thin-film interference"
      question="Why do soap bubbles look iridescent?"
      caption={
        <>
          Reflection off the top and bottom of a thin film interferes. With normal incidence,
          constructive maxima at <strong>2 n₂ t = (m + ½) λ</strong> when exactly one interface
          flips phase, or <strong>2 n₂ t = m λ</strong> when both (or neither) do. As you drag the
          film's thickness, the wavelength of peak reflectance slides through the visible — the same
          effect that gives soap films their swirling colours and oil slicks their rainbows.
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="t"
          value={thickNm}
          min={50}
          max={800}
          step={5}
          format={(v) => v.toFixed(0) + ' nm'}
          onChange={setThickNm}
        />
        <MiniSlider
          label="n_film"
          value={n2}
          min={1.0}
          max={1.8}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setN2}
        />
        <MiniReadout
          label="first peak λ"
          value={Number.isFinite(peakLambda) ? peakLambda.toFixed(0) : '—'}
          unit={Number.isFinite(peakLambda) ? 'nm' : ''}
        />
      </DemoControls>
    </Demo>
  );
}

// Simple wavelength → sRGB tint for 380–740 nm
function wavelengthRGB(lam: number): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;
  if (lam >= 380 && lam < 440) {
    r = -(lam - 440) / 60;
    g = 0;
    b = 1;
  } else if (lam < 490) {
    r = 0;
    g = (lam - 440) / 50;
    b = 1;
  } else if (lam < 510) {
    r = 0;
    g = 1;
    b = -(lam - 510) / 20;
  } else if (lam < 580) {
    r = (lam - 510) / 70;
    g = 1;
    b = 0;
  } else if (lam < 645) {
    r = 1;
    g = -(lam - 645) / 65;
    b = 0;
  } else if (lam <= 740) {
    r = 1;
    g = 0;
    b = 0;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
