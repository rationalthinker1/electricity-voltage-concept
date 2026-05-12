/**
 * Lab 4.1 — Capacitance
 *
 *   C = ε₀ εᵣ A / d     U = ½ C V²     u_E = ½ ε₀ εᵣ E²
 *
 * Parallel-plate capacitor. Sliders pick area, gap, voltage, and dielectric.
 * The canvas shows the two plates (+/-) with E-field arrows in the gap and
 * ± charge dots whose density scales with surface charge σ = Q/A. Capacitance
 * is the highlighted "punchline" readout.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { PHYS, eng } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'capacitance';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function CapacitanceLab() {
  const [A_cm2, setACm2] = useState(100);
  const [d_mm, setDMm] = useState(1.0);
  const [V, setV] = useState(12);
  const [er, setEr] = useState(1.0);

  const computed = useMemo(() => {
    const A_m2 = A_cm2 * 1e-4; // cm² → m²
    const d_m = d_mm * 1e-3;   // mm → m
    const C = (PHYS.eps_0 * er * A_m2) / d_m;
    const Q = C * V;
    const E = V / d_m;
    const sigma = Q / A_m2;
    const U = 0.5 * C * V * V;
    const uE = 0.5 * PHYS.eps_0 * er * E * E;
    return { C, Q, E, sigma, U, uE };
  }, [A_cm2, d_mm, V, er]);

  const stateRef = useRef({ A_cm2, d_mm, V, er, computed });
  useEffect(() => {
    stateRef.current = { A_cm2, d_mm, V, er, computed };
  }, [A_cm2, d_mm, V, er, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function plateGrad(x: number, y: number, w: number, h: number, color: string) {
      const grd = ctx.createLinearGradient(x, y, x, y + h);
      grd.addColorStop(0, color);
      grd.addColorStop(1, color + '99');
      ctx.fillStyle = grd;
      ctx.shadowColor = color + 'a0';
      ctx.shadowBlur = 14;
      roundRect(x, y, w, h, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function drawCharges(xL: number, y: number, plateW: number, count: number, sym: string, color: string) {
      ctx.fillStyle = color;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < count; i++) {
        const x = xL + 10 + ((plateW - 20) * (i + 0.5)) / count;
        ctx.fillText(sym, x, y);
      }
    }

    function drawBattery(x: number, y: number, topY: number, botY: number) {
      ctx.strokeStyle = 'rgba(236,235,229,0.7)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x - 14, y - 12);
      ctx.lineTo(x + 14, y - 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 7, y + 4);
      ctx.lineTo(x + 7, y + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x, topY + 3);
      ctx.lineTo(x + 38, topY + 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + 4);
      ctx.lineTo(x, botY - 3);
      ctx.lineTo(x + 38, botY - 3);
      ctx.stroke();

      ctx.fillStyle = '#ff3b6e';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', x + 22, y - 18);
      ctx.fillStyle = '#5baef8';
      ctx.fillText('−', x + 18, y + 16);
    }

    function draw() {
      const s = stateRef.current;
      const out = s.computed;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);
      phase += 0.018;

      // Geometry
      const refW = Math.min(W * 0.62, 640);
      const wScale = Math.sqrt(s.A_cm2 / 1000);
      const plateW = Math.max(120, refW * (0.35 + 0.65 * wScale));
      const gMin = 18, gMax = H * 0.55;
      const dNorm = (Math.log10(s.d_mm) - Math.log10(0.01)) / (Math.log10(10) - Math.log10(0.01));
      const gap = gMin + (gMax - gMin) * dNorm;
      const cx = W / 2, cy = H / 2;
      const plateThick = 7;
      const topY = cy - gap / 2 - plateThick / 2;
      const botY = cy + gap / 2 + plateThick / 2;
      const xL = cx - plateW / 2;

      // Energy-density haze
      const hazeAlpha = Math.max(0.06, Math.min(0.55, Math.log10(out.uE + 1) * 0.10 + 0.10));
      const hazeGrd = ctx.createLinearGradient(0, topY + plateThick, 0, botY - plateThick);
      hazeGrd.addColorStop(0, `rgba(255,107,42,${hazeAlpha * 0.45})`);
      hazeGrd.addColorStop(0.5, `rgba(255,107,42,${hazeAlpha})`);
      hazeGrd.addColorStop(1, `rgba(255,107,42,${hazeAlpha * 0.45})`);
      ctx.fillStyle = hazeGrd;
      ctx.fillRect(xL, topY + plateThick, plateW, botY - topY - plateThick * 2);

      // E-field arrows
      const usableSpanRaw = botY - topY - plateThick * 2 - 16;
      if (usableSpanRaw > 8) {
        const nE = Math.max(4, Math.min(28, Math.round(Math.log10(out.E + 10) * 6)));
        const baseY = topY + plateThick + 8;
        const arrLen = Math.min(22, usableSpanRaw * 0.45);
        for (let i = 0; i < nE; i++) {
          const fx = xL + 18 + ((plateW - 36) * (i + 0.5)) / nE;
          const cycle = (phase * 80 + i * 7) % usableSpanRaw;
          const y1 = baseY + cycle;
          const y0 = y1 - arrLen;
          ctx.strokeStyle = 'rgba(255,59,110,0.85)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(fx, Math.max(baseY, y0));
          ctx.lineTo(fx, y1);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,59,110,0.95)';
          ctx.beginPath();
          ctx.moveTo(fx, y1);
          ctx.lineTo(fx - 3.5, y1 - 6);
          ctx.lineTo(fx + 3.5, y1 - 6);
          ctx.closePath();
          ctx.fill();
        }
      }

      plateGrad(xL, topY, plateW, plateThick, '#ff3b6e');
      plateGrad(xL, botY - plateThick, plateW, plateThick, '#5baef8');

      // Charge dot count scales with σ (capped)
      const target = Math.min(60, Math.max(6, Math.round(Math.log10(out.sigma * 1e8 + 1) * 12)));
      drawCharges(xL, topY - 7, plateW, target, '+', '#ff3b6e');
      drawCharges(xL, botY + plateThick + 7, plateW, target, '−', '#5baef8');

      drawBattery(xL - 70, cy, topY, botY);

      ctx.strokeStyle = 'rgba(236,235,229,0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(xL - 38, topY + plateThick / 2);
      ctx.lineTo(xL, topY + plateThick / 2);
      ctx.moveTo(xL - 38, botY - plateThick / 2);
      ctx.lineTo(xL, botY - plateThick / 2);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`C = ${eng(out.C, 3, 'F')}`, 24, 28);
      ctx.fillStyle = '#ff3b6e';
      ctx.fillText(`V = ${s.V.toFixed(1)} V`, 24, 48);
      ctx.fillText(`E = ${eng(out.E, 3, 'V/m')}`, 24, 66);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.textAlign = 'right';
      ctx.fillText(
        `A = ${s.A_cm2.toFixed(0)} cm²   d = ${s.d_mm.toFixed(2)} mm   εr = ${s.er.toFixed(1)}`,
        W - 24, 28,
      );

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={460} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)">+ charge / E field</LegendItem>
          <LegendItem swatchColor="var(--blue)">− charge</LegendItem>
          <LegendItem swatchColor="var(--accent)">Stored energy density</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>
            ↳ Energy lives between the plates, not on them
          </LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="A" label="Plate area"
            value={A_cm2} min={1} max={1000} step={1}
            format={(v) => v.toFixed(0) + ' cm²'}
            metaLeft="1 cm²" metaRight="1000 cm²"
            onChange={setACm2}
          />
          <Slider
            sym="d" label="Plate separation"
            value={d_mm} min={0.01} max={10} step={0.01}
            format={(v) => v.toFixed(2) + ' mm'}
            metaLeft="0.01 mm" metaRight="10 mm"
            onChange={setDMm}
          />
          <Slider
            sym="V" label="Applied voltage"
            value={V} min={0.1} max={1000} step={0.1}
            format={(v) => v.toFixed(1) + ' V'}
            metaLeft="0.1 V" metaRight="1000 V"
            onChange={setV}
          />
          <Slider
            sym="ε<sub>r</sub>" label="Dielectric (rel. permittivity)"
            value={er} min={1} max={100} step={0.1}
            format={(v) => v.toFixed(1)}
            metaLeft="1 (vacuum)" metaRight="100 (ceramic)"
            onChange={setEr}
          />
        </>
      }
      outputs={
        <>
          <Readout sym="C" label="Capacitance" valueHTML={eng(computed.C, 3, 'F')} highlight />
          <Readout sym="Q" label="Stored charge" valueHTML={eng(computed.Q, 3, 'C')} />
          <Readout sym="E" label="Field between plates" valueHTML={eng(computed.E, 3, 'V/m')} />
          <Readout sym="σ" label="Surface charge density" valueHTML={eng(computed.sigma, 3, 'C/m²')} />
          <Readout sym="U" label="Stored energy" valueHTML={eng(computed.U, 3, 'J')} />
          <Readout sym={<>u<sub>E</sub></>} label="Field energy density" valueHTML={eng(computed.uE, 3, 'J/m³')} />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>What “capacity” even means</h3>
      <p>
        A capacitor is a device whose voltage across its terminals rises in proportion to the charge you pile on its plates. The proportionality
        constant is its <strong>capacitance</strong>:
      </p>
      <MathBlock>C = Q / V</MathBlock>
      <p>
        Read it backward: it takes <strong>V</strong> volts of work per coulomb to add one more coulomb's worth of charges to the plates against
        the repulsion of the charges already there. Big capacitance means it costs little voltage to add charge — the plates accept a lot
        of <strong>Q</strong> before the voltage climbs. A farad is one coulomb per volt, which is so much charge per volt that real-world
        capacitors are usually picofarads up to a few millifarads<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Parallel plates from Gauss</h3>
      <p>
        Two flat conductive plates of area <strong>A</strong>, separated by a gap <strong>d</strong>, with charge <strong>+Q</strong> on the top
        and <strong>−Q</strong> on the bottom. Draw a Gaussian pillbox enclosing the inner face of the top plate. Gauss's law gives<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <MathBlock>E · A = σ A / ε<sub>0</sub> &nbsp;⇒&nbsp; E = σ / ε<sub>0</sub> = Q / (ε<sub>0</sub> A)</MathBlock>
      <p>
        Inside the gap, that field is uniform — constant magnitude, perpendicular to the plates, pointing from the + plate to the − one.
        The voltage between the plates is then:
      </p>
      <MathBlock>V = E · d = Q d / (ε<sub>0</sub> A)</MathBlock>
      <p>Rearranging Q/V isolates the geometry-only piece:</p>
      <MathBlock>C = ε<sub>0</sub> A / d</MathBlock>
      <p>
        Stick an insulator (a <em>dielectric</em>) into the gap and its molecules polarize: each dipole sets up a tiny counter-field that
        partially cancels the applied one. The net field drops by a factor <strong>ε<sub>r</sub></strong>, the relative permittivity,
        so the voltage drops by the same factor, so the capacitance climbs by it<Cite id="jackson-1999" in={SOURCES} />:
      </p>
      <MathBlock>C = ε<sub>0</sub> ε<sub>r</sub> A / d</MathBlock>

      <h3>Energy: not in the plates, in the field</h3>
      <p>
        Build the charge up from zero. At intermediate charge <strong>q</strong>, the voltage is <strong>v(q) = q/C</strong>, and the work to
        shove a tiny <strong>dq</strong> from one plate to the other is <strong>dW = v dq</strong>. Integrate from 0 to Q:
      </p>
      <MathBlock>U = ∫<sub>0</sub><sup>Q</sup> (q / C) dq = Q² / (2C) = ½ C V²</MathBlock>
      <p>
        Where does that energy actually live? It is distributed throughout the volume of the gap, at a density that depends only on the
        local field<Cite id="jackson-1999" in={SOURCES} />:
      </p>
      <MathBlock>u<sub>E</sub> = ½ ε<sub>0</sub> ε<sub>r</sub> E²</MathBlock>
      <p>
        Multiply by the gap volume <strong>A d</strong> and you recover the same ½CV² from the work integral. <em>The plates
        don't store the energy</em> — they only hold the boundary conditions. The energy lives in the field they create. This is the
        same idea that will run rampant in the Poynting lab two doors down: fields carry energy in their own right<Cite id="feynman-II-2" in={SOURCES} />.
      </p>

      <Pullout>
        A capacitor doesn't store charge. The plates always have <em>+Q on one and −Q on the other</em>, the total being zero. What's
        stored is the separation — and the field that fills the space because of it.
      </Pullout>

      <h3>Why dielectrics matter</h3>
      <p>
        Capacitance per unit volume is the only metric that matters when you're trying to fit thousands of capacitors onto a chip. Boost
        <strong> ε<sub>r</sub></strong> and you boost C without growing A. Water comes in around 80; common ceramics push past 1000<Cite id="jackson-1999" in={SOURCES} />.
        The catch is that all of these have voltage limits — push the field too high and the dielectric breaks down, ionizes, and arcs. The
        design space is a fight between ε<sub>r</sub>, breakdown strength, and physical thinness.
      </p>

      <h4>Three timescales</h4>
      <p>
        Hook a capacitor up through a resistor <strong>R</strong> to a battery <strong>V</strong>. The voltage on the cap approaches its
        asymptote as <strong>v(t) = V (1 − e<sup>−t/RC</sup>)</strong>. Discharge it through the same resistor and it falls the
        same way. The product <strong>τ = RC</strong> is the time-constant of any RC circuit<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h4>One last sanity check</h4>
      <p>
        The lab above shows the field between an <em>idealized</em> pair of plates — uniform, abruptly ending at the edges. Real plates
        have fringing fields that bulge outward near the rim. For aspect ratios where A ≫ d² (almost always, in practice), the fringing
        contribution to C is a small correction<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Parallel-Plate Capacitor"
      labId="capacitance-4.1 / C = εA/d"
      labContent={labContent}
      prose={prose}
    />
  );
}
