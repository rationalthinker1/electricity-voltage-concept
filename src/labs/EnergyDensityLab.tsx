/**
 * Lab 4.3 — Field Energy Density
 *
 *   u = ½ ε₀ E² + B² / (2 μ₀)
 *
 * Split canvas — E-field cube on the left, B-field cube on the right,
 * with a stacked u_E vs u_B comparison bar below. Sliders for E, B, and
 * the volume of the region. Total energy density u is the highlighted readout.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { Formula } from '@/components/Formula';
import { PHYS, eng, sci, engJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';
import { getCanvasColors } from '@/lib/canvasTheme';

const SLUG = 'energy-density';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

function makeComparison(U_J: number): string {
  if (U_J <= 0 || !isFinite(U_J)) return '—';
  if (U_J < 1e-6) return `${sci(U_J / 1.602e-19, 1)} eV`;
  if (U_J < 1) return `${eng(U_J, 2, 'J')} (LED for ${eng(U_J / 0.05, 2, 's')})`;
  if (U_J < 1e3) {
    const h_m = U_J / (1.0 * 9.81);
    return `1 kg falling ${h_m.toFixed(1)} m`;
  }
  if (U_J < 1e6) {
    const v_ms = Math.sqrt((2 * U_J) / 1.0);
    return `1 kg at ${v_ms.toFixed(0)} m/s`;
  }
  if (U_J < 1e9) {
    const kg_tnt = U_J / 4.184e6;
    return `${kg_tnt.toFixed(2)} kg of TNT`;
  }
  if (U_J < 1e12) {
    const kWh = U_J / 3.6e6;
    return eng(kWh, 2, 'kWh');
  }
  return `${sci(U_J / 4.184e9, 2)} tons TNT`;
}

export default function EnergyDensityLab() {
  const [E, setE] = useState(1e5);
  const [B, setB] = useState(0.5);
  const [Vol, setVol] = useState(1.0);

  const computed = useMemo(() => {
    const uE = 0.5 * PHYS.eps_0 * E * E;
    const uB = (B * B) / (2 * PHYS.mu_0);
    const u = uE + uB;
    const U = u * Vol;
    const EeqB = PHYS.c * B;
    const comp = makeComparison(U);
    return { uE, uB, u, U, EeqB, comp };
  }, [E, B, Vol]);

  const stateRef = useRef({ E, B, Vol, computed });
  useEffect(() => {
    stateRef.current = { E, B, Vol, computed };
  }, [E, B, Vol, computed]);

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

    function drawECube(cx: number, cy: number, size: number, Eval: number, uE: number) {
      const half = size / 2;
      const x0 = cx - half,
        y0 = cy - half;

      const intensity = Math.max(0.06, Math.min(0.6, Math.log10(uE + 1) * 0.1 + 0.05));
      ctx.save();
      ctx.globalAlpha = intensity;
      ctx.shadowColor = getCanvasColors().pink;
      ctx.shadowBlur = 28;
      ctx.save();
      ctx.globalAlpha = intensity * 0.18;
      ctx.fillStyle = getCanvasColors().pink;
      roundRect(x0, y0, size, size, 6);
      ctx.fill();
      ctx.restore();
      ctx.restore();
      ctx.shadowBlur = 0;

      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = getCanvasColors().pink;
      ctx.lineWidth = 1.4;
      roundRect(x0, y0, size, size, 6);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = getCanvasColors().pink;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 16, y0 - 14);
      ctx.moveTo(x0 + size, y0);
      ctx.lineTo(x0 + size + 16, y0 - 14);
      ctx.lineTo(x0 + size + 16, y0 + size - 14);
      ctx.lineTo(x0 + size, y0 + size);
      ctx.moveTo(x0 + 16, y0 - 14);
      ctx.lineTo(x0 + size + 16, y0 - 14);
      ctx.stroke();
      ctx.restore();

      const cols = Math.max(3, Math.min(9, Math.round(Math.log10(Math.abs(Eval) + 10) * 1.5)));
      const arrLen = size * 0.18;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < cols; j++) {
          const px = x0 + (i + 0.5) * (size / cols);
          const cycleH = size - 24;
          const baseY = y0 + 12;
          const cy_arr = baseY + ((phase * 30 + j * (cycleH / cols)) % cycleH);
          const tipY = cy_arr + arrLen / 2;
          const topY = cy_arr - arrLen / 2;
          ctx.save();
          ctx.globalAlpha = 0.7;
          ctx.strokeStyle = getCanvasColors().pink;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px, topY);
          ctx.lineTo(px, tipY);
          ctx.stroke();
          ctx.restore();
          ctx.fillStyle = getCanvasColors().pink;
          ctx.beginPath();
          ctx.moveTo(px, tipY);
          ctx.lineTo(px - 3, tipY - 5);
          ctx.lineTo(px + 3, tipY - 5);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.fillStyle = getCanvasColors().pink;
      ctx.font = 'italic 22px Fraunces, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('E field', cx, y0 - 26);

      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillText(`u_E = ${eng(uE, 2, 'J/m³')}`, cx, y0 + size + 26);
    }

    function drawBCube(cx: number, cy: number, size: number, _Bval: number, uB: number) {
      const half = size / 2;
      const x0 = cx - half,
        y0 = cy - half;

      const intensity = Math.max(0.06, Math.min(0.6, Math.log10(uB + 1) * 0.1 + 0.05));
      ctx.save();
      ctx.globalAlpha = intensity;
      ctx.shadowColor = getCanvasColors().teal;
      ctx.shadowBlur = 28;
      ctx.save();
      ctx.globalAlpha = intensity * 0.18;
      ctx.fillStyle = getCanvasColors().teal;
      roundRect(x0, y0, size, size, 6);
      ctx.fill();
      ctx.restore();
      ctx.restore();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = getCanvasColors().teal;
      ctx.lineWidth = 1.4;
      roundRect(x0, y0, size, size, 6);
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 16, y0 - 14);
      ctx.moveTo(x0 + size, y0);
      ctx.lineTo(x0 + size + 16, y0 - 14);
      ctx.lineTo(x0 + size + 16, y0 + size - 14);
      ctx.lineTo(x0 + size, y0 + size);
      ctx.moveTo(x0 + 16, y0 - 14);
      ctx.lineTo(x0 + size + 16, y0 - 14);
      ctx.stroke();
      ctx.restore();

      const rings = 4;
      for (let r = 1; r <= rings; r++) {
        const radius = (r / rings) * (size * 0.42);
        const dots = 10 + r * 4;
        const spin = phase * (0.3 + r * 0.05);
        ctx.save();
        ctx.globalAlpha = 0.18 + (0.12 * r) / rings;
        ctx.strokeStyle = getCanvasColors().teal;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        for (let i = 0; i < dots; i++) {
          const a = spin + (i / dots) * Math.PI * 2;
          const px = cx + Math.cos(a) * radius;
          const py = cy + Math.sin(a) * radius;
          ctx.save();
          ctx.globalAlpha = 0.4 + (0.5 * r) / rings;
          ctx.fillStyle = getCanvasColors().teal;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.fillStyle = getCanvasColors().teal;
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⊙', cx, cy);

      ctx.fillStyle = getCanvasColors().teal;
      ctx.font = 'italic 22px Fraunces, serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('B field', cx, y0 - 26);

      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillText(`u_B = ${eng(uB, 2, 'J/m³')}`, cx, y0 + size + 26);
    }

    function drawComparisonBar(cx: number, cy: number, totalW: number, uE: number, uB: number) {
      const total = uE + uB;
      if (total <= 0) {
        ctx.fillStyle = getCanvasColors().textDim;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('zero field — set E or B above', cx, cy);
        return;
      }
      const fracE = uE / total;
      const h = 12;
      const x0 = cx - totalW / 2;
      ctx.fillStyle = getCanvasColors().border;
      roundRect(x0, cy - h / 2, totalW, h, 6);
      ctx.fill();
      ctx.fillStyle = getCanvasColors().pink;
      roundRect(x0, cy - h / 2, totalW * fracE, h, 6);
      ctx.fill();
      ctx.fillStyle = getCanvasColors().teal;
      roundRect(x0 + totalW * fracE, cy - h / 2, totalW * (1 - fracE), h, 6);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `u_E : u_B  =  ${(fracE * 100).toFixed(1)}% : ${((1 - fracE) * 100).toFixed(1)}%`,
        cx,
        cy + 24,
      );
      ctx.restore();
    }

    function draw() {
      const s = stateRef.current;
      const out = s.computed;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);
      phase += 0.02;

      const cubeSize = Math.min(W * 0.32, H * 0.62);
      const yMid = H * 0.48;
      const xL_E = W * 0.25;
      const xL_B = W * 0.75;

      drawECube(xL_E, yMid, cubeSize, s.E, out.uE);
      drawBCube(xL_B, yMid, cubeSize, s.B, out.uB);
      drawComparisonBar(W / 2, H - 56, Math.min(W * 0.55, 520), out.uE, out.uB);

      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`u_total = ${eng(out.u, 3, 'J/m³')}`, 24, 28);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`U over ${eng(s.Vol, 2, 'm³')} = ${eng(out.U, 3, 'J')}`, 24, 48);

      ctx.textAlign = 'right';
      ctx.fillText(`E = ${eng(s.E, 2, 'V/m')}    B = ${s.B.toFixed(2)} T`, W - 24, 28);

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
          <LegendItem swatchColor="var(--pink)">E-field cube</LegendItem>
          <LegendItem swatchColor="var(--teal)">B-field cube</LegendItem>
          <LegendItem swatchColor="var(--accent)">Energy density (J/m³)</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>
            ↳ Field-squared is what costs you
          </LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="E"
            label="Electric field magnitude"
            value={E}
            min={0}
            max={1e7}
            step={1e3}
            format={(v) => sci(v, 1) + ' V/m'}
            metaLeft="0"
            metaRight="10⁷ V/m"
            onChange={setE}
          />
          <Slider
            sym="B"
            label="Magnetic field magnitude"
            value={B}
            min={0}
            max={5}
            step={0.01}
            format={(v) => v.toFixed(2) + ' T'}
            metaLeft="0 T"
            metaRight="5 T"
            onChange={setB}
          />
          <Slider
            sym="V"
            label="Volume of region"
            value={Vol}
            min={0.001}
            max={1000}
            step={0.001}
            format={(v) => eng(v, 3, 'm³')}
            metaLeft="10⁻³ m³"
            metaRight="10³ m³"
            onChange={setVol}
          />
        </>
      }
      outputs={
        <>
          <Readout
            sym={
              <>
                u<sub>E</sub>
              </>
            }
            label="Electric energy density"
            value={engJsx(computed.uE, 3, 'J/m³')}
          />
          <Readout
            sym={
              <>
                u<sub>B</sub>
              </>
            }
            label="Magnetic energy density"
            value={engJsx(computed.uB, 3, 'J/m³')}
          />
          <Readout
            sym="u"
            label="Total energy density"
            value={engJsx(computed.u, 3, 'J/m³')}
            highlight
          />
          <Readout sym="U" label="Energy in volume" value={engJsx(computed.U, 3, 'J')} />
          <Readout
            sym="E*"
            label="E to match this B (= c·B)"
            value={engJsx(computed.EeqB, 3, 'V/m')}
          />
          <Readout sym="≈" label="Friendly comparison" value={computed.comp} />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        You could, in principle, write electrostatics without fields at all — Coulomb's law alone,
        direct action between charges at a distance. The math would be uglier but consistent. The
        fields would just be bookkeeping.
      </p>
      <p className="mb-prose-3">
        The trouble starts when you ask: <em className="text-text italic">where is the energy?</em>{' '}
        Assemble charges from infinity. You do positive work against their repulsion. That work has
        to go somewhere. The charges haven't changed. What's changed is the field around them.
        Maxwell, and then Heaviside and Poynting, did the accounting and arrived at a conclusion
        that's no longer optional in any modern formulation: the energy lives in the field,
        distributed continuously through the volume of space the field occupies
        <Cite id="poynting-1884" in={SOURCES} />. This works for static fields, radiating fields,
        fields inside materials — anywhere E and B are defined.
      </p>
      <p className="mb-prose-3">
        Limits: the formula below is for fields in linear, isotropic vacuum or simple linear
        dielectrics/magnetic materials. In strongly nonlinear materials (saturating iron,
        ferroelectric crystals near phase transitions) the field energy isn't a simple quadratic;
        you have to integrate dU = E·dD + H·dB more carefully
        <Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Formula</h3>
      <MathBlock>
        u<sub>E</sub> = ½ ε<sub>0</sub> E² &nbsp;&emsp; u<sub>B</sub> = B² / (2µ<sub>0</sub>)
        &nbsp;&emsp; u = u<sub>E</sub> + u<sub>B</sub>
      </MathBlock>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">
          u<sub>E</sub>
        </strong>{' '}
        electric energy density (J/m³).{' '}
        <strong className="text-text font-medium">
          u<sub>B</sub>
        </strong>{' '}
        magnetic energy density (J/m³).
        <strong className="text-text font-medium">E</strong> electric field magnitude (V/m).{' '}
        <strong className="text-text font-medium">B</strong> magnetic field magnitude (T).{' '}
        <strong className="text-text font-medium">
          ε<sub>0</sub>
        </strong>
        and{' '}
        <strong className="text-text font-medium">
          µ<sub>0</sub>
        </strong>{' '}
        the permittivity and permeability of free space. Total energy in a region is the volume
        integral of u over that region.
      </p>

      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">
        The fields are not bookkeeping devices. They are physical, energetic, mass-equivalent,
        gravitating <em className="text-text italic">stuff</em>. Every cubic meter of space with a
        field in it carries joules just by virtue of the field being there. The amount per cubic
        meter is set by the field squared — doubling the field quadruples the density, the same way
        doubling speed quadruples kinetic energy. The squared dependence means strong fields cost
        dramatically more energy than weak ones, which is why magnets meant to store kilojoules per
        cubic meter require teslas, not gauss.
      </p>
      <Pullout>
        There is no such thing as "empty space" when there's a field there. Empty space is the cheap
        seats; field space is paying rent in
        <em className="text-text italic"> joules per cubic meter</em>.
      </Pullout>

      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        Why squared? Because the energy needed to <em className="text-text italic">build</em> a
        field is the integral of dW = E·dD (or H·dB), and in a linear medium the relation E = D/ε is
        linear. Integrating a linear function gives a quadratic. Same reason kinetic energy is ½mv²
        — work scales linearly with v, integrated over a linear v(t) gives v².
      </p>
      <p className="mb-prose-3">
        Why ε<sub>0</sub> in u<sub>E</sub> and 1/µ<sub>0</sub> in u<sub>B</sub>? Because these are
        the constants that connect field strength to the underlying sources. They set the conversion
        rate between "amount of field" and "amount of work it took to make that field"
        <Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Limit checks. As E → 0 or B → 0, energy density vanishes — no field, no rent. As the field
        gets huge, energy density grows without bound (in the linear-medium approximation), which is
        why the actual ceilings come from dielectric breakdown for E, and from material magnetic
        saturation, mechanical hoop stress, and quench dynamics for B. In a plane EM wave the two
        halves are exactly equal — u<sub>E</sub> = u<sub>B</sub> at every point — because Maxwell's
        equations enforce B = E/c.
      </p>

      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        Step one — start with a parallel-plate capacitor. Total stored energy is{' '}
        <strong className="text-text font-medium">U = ½CV²</strong>. Substitute the parallel-plate
        relations C = ε<sub>0</sub>A/d and V = Ed:
      </p>
      <Formula>
        U = ½ (ε<sub>0</sub> A/d) (Ed)² = ½ ε<sub>0</sub> E² · (A d)
      </Formula>
      <p className="mb-prose-3">
        Step two — recognize <strong className="text-text font-medium">Ad</strong> as the volume
        between the plates: precisely the region where the field lives. Energy per unit volume is
        therefore
        <Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula>
        u<sub>E</sub> = ½ ε<sub>0</sub> E²
      </Formula>
      <p className="mb-prose-3">
        Step three — magnetic dual. Take a long solenoid with U = ½LI², L = µ<sub>0</sub>N²A/ℓ, B =
        µ<sub>0</sub>nI. Algebra:
      </p>
      <Formula>
        U = ½ (µ<sub>0</sub> N² A / ℓ) (B / (µ<sub>0</sub> N/ℓ))² = (B² / 2µ<sub>0</sub>) · (A ℓ)
      </Formula>
      <p className="mb-prose-3">
        Again Aℓ is the interior volume of the solenoid — the region where B lives. So
        <Cite id="jackson-1999" in={SOURCES} />:
      </p>
      <Formula>
        u<sub>B</sub> = B² / (2 µ<sub>0</sub>)
      </Formula>
      <p className="mb-prose-3">
        Step four — generalize. Both expressions reference only the local field, not the sources
        that created it. Maxwell's full energy conservation theorem (Poynting's theorem) shows these
        formulas apply for <em className="text-text italic">any</em> electromagnetic field
        configuration in linear media, time-varying or static, in vacuum or in matter
        <Cite id="poynting-1884" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Worked problems</h3>

      <TryIt
        tag="Problem 4.3.1"
        question={
          <>
            Electric field at air-breakdown threshold,{' '}
            <strong className="text-text font-medium">E = 3×10⁶ V/m</strong>. What is u<sub>E</sub>?
          </>
        }
        answer={
          <>
            <Formula>
              u<sub>E</sub> = ½ ε<sub>0</sub> E² = ½ (8.854×10⁻¹²)(3×10⁶)² = ½ (8.854×10⁻¹²)(9×10¹²)
            </Formula>
            <Formula>
              u<sub>E</sub> ≈ <strong className="text-text font-medium">40 J/m³</strong>
            </Formula>
            <p className="mb-prose-3">
              The maximum energy density you can pack into an electric field in dry air at standard
              pressure. About the kinetic energy of a 1-kg book moving at 9 m/s, but spread over a
              whole cubic meter.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.2"
        question={
          <>
            A strong permanent magnet field of{' '}
            <strong className="text-text font-medium">B = 1 T</strong>. What is u<sub>B</sub>?
          </>
        }
        answer={
          <>
            <Formula>
              u<sub>B</sub> = B² / (2µ<sub>0</sub>) = 1 / (2 · 4π×10⁻⁷) ≈{' '}
              <strong className="text-text font-medium">3.98×10⁵ J/m³</strong> ≈ 400 kJ/m³
            </Formula>
            <p className="mb-prose-3">
              Four hundred kilojoules per cubic meter, just sitting there in the field. Roughly the
              energy of 100 g of TNT
              <Cite id="jackson-1999" in={SOURCES} />. This is why neodymium magnets need to be
              handled with care.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.3"
        question={
          <>
            Earth's magnetic field is roughly{' '}
            <strong className="text-text font-medium">50 µT = 5×10⁻⁵ T</strong>. Energy density?
          </>
        }
        answer={
          <>
            <Formula>
              u<sub>B</sub> = (5×10⁻⁵)² / (2 · 4π×10⁻⁷) = (2.5×10⁻⁹) / (2.513×10⁻⁶)
            </Formula>
            <Formula>
              u<sub>B</sub> ≈{' '}
              <strong className="text-text font-medium">1×10⁻³ J/m³ = 1 mJ/m³</strong>
            </Formula>
            <p className="mb-prose-3">
              A milli-joule per cubic meter — the whole magnetosphere, summed over Earth's volume,
              still totals only about 10¹⁸ J, roughly a year of human electricity use.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.4"
        question={
          <>
            Earth's fair-weather atmospheric E-field is about{' '}
            <strong className="text-text font-medium">100 V/m</strong> at the surface. u<sub>E</sub>
            ?
          </>
        }
        answer={
          <>
            <Formula>
              u<sub>E</sub> = ½(8.854×10⁻¹²)(100)² = ½(8.854×10⁻¹²)(10⁴) ≈{' '}
              <strong className="text-text font-medium">4.4×10⁻⁸ J/m³</strong>
            </Formula>
            <p className="mb-prose-3">
              About 44 nanojoules per cubic meter — orders of magnitude smaller than Earth's
              magnetic field energy density, which is why everyone learns about magnetic compasses
              and nobody talks about electric ones.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.5"
        question={
          <>
            Compare a 1 m³ box of E-field at air breakdown (3×10⁶ V/m) to a 1 m³ box of B-field at 1
            T. Which stores more energy?
          </>
        }
        hint="You computed both above."
        answer={
          <>
            <Formula>
              U<sub>E</sub> = 40 J &nbsp; vs &nbsp; U<sub>B</sub> = 400,000 J
            </Formula>
            <p className="mb-prose-3">
              <strong className="text-text font-medium">
                The magnetic field at 1 T stores 10,000× more energy than the electric field at its
                breakdown limit.
              </strong>
              The numerical asymmetry comes from ε<sub>0</sub> being tiny and 1/µ<sub>0</sub> being
              large. To balance them you'd need E = cB ≈ 3×10⁸ V/m — about 100× past breakdown
              <Cite id="jackson-1999" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.6"
        question={
          <>
            A parallel-plate capacitor with{' '}
            <strong className="text-text font-medium">A = 100 cm²</strong>,{' '}
            <strong className="text-text font-medium">d = 1 mm</strong>,{' '}
            <strong className="text-text font-medium">V = 100 V</strong>. Verify that{' '}
            <strong className="text-text font-medium">½CV²</strong> equals{' '}
            <strong className="text-text font-medium">
              ∫u<sub>E</sub> dV
            </strong>
            .
          </>
        }
        answer={
          <>
            <p className="mb-prose-3">
              From the formulas: C = ε<sub>0</sub> A/d, V = Ed.
            </p>
            <Formula>C = (8.854×10⁻¹²)(10⁻²) / (10⁻³) ≈ 88.5 pF</Formula>
            <Formula>
              ½ C V² = ½ (88.5×10⁻¹²)(10⁴) ≈{' '}
              <strong className="text-text font-medium">4.4×10⁻⁷ J</strong>
            </Formula>
            <Formula>
              E = V/d = 10⁵ V/m, &nbsp; u<sub>E</sub> = ½ε<sub>0</sub>E² ≈ 4.4×10⁻² J/m³
            </Formula>
            <Formula>
              U<sub>field</sub> = u<sub>E</sub> · (Ad) = (4.4×10⁻²)(10⁻⁵) ≈{' '}
              <strong className="text-text font-medium">4.4×10⁻⁷ J</strong>
            </Formula>
            <p className="mb-prose-3">
              Identical. The energy ½CV² <em className="text-text italic">is</em> the field energy
              in the gap.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.7"
        question={
          <>
            A solenoid: <strong className="text-text font-medium">n = 1000 turns/m</strong>,{' '}
            <strong className="text-text font-medium">I = 1 A</strong>, radius{' '}
            <strong className="text-text font-medium">r = 1 cm</strong>, length{' '}
            <strong className="text-text font-medium">ℓ = 10 cm</strong>. Verify ½LI² = ∫u
            <sub>B</sub> dV.
          </>
        }
        answer={
          <>
            <Formula>
              B = µ<sub>0</sub> n I = (4π×10⁻⁷)(1000)(1) ≈ 1.26×10⁻³ T
            </Formula>
            <Formula>
              u<sub>B</sub> = B²/(2µ<sub>0</sub>) ≈ (1.58×10⁻⁶) / (2.51×10⁻⁶) ≈ 0.628 J/m³
            </Formula>
            <Formula>
              V<sub>interior</sub> = π r² ℓ = π(10⁻⁴)(0.1) ≈ 3.14×10⁻⁵ m³
            </Formula>
            <Formula>
              U<sub>field</sub> ≈ 0.628 × 3.14×10⁻⁵ ≈{' '}
              <strong className="text-text font-medium">1.97×10⁻⁵ J</strong>
            </Formula>
            <p className="mb-prose-3">Cross-check by L: N = nℓ = 100, A = πr² = 3.14×10⁻⁴ m².</p>
            <Formula>
              L = µ<sub>0</sub>N²A/ℓ ≈ (4π×10⁻⁷)(10⁴)(3.14×10⁻⁴)/(0.1) ≈ 3.94×10⁻⁵ H
            </Formula>
            <Formula>
              ½ L I² = ½ (3.94×10⁻⁵)(1) ≈{' '}
              <strong className="text-text font-medium">1.97×10⁻⁵ J</strong>
            </Formula>
            <p className="mb-prose-3">
              Same number to within rounding
              <Cite id="griffiths-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.8"
        question={
          <>
            A clinical MRI scanner runs at{' '}
            <strong className="text-text font-medium">B = 3 T</strong>. What is the magnetic energy
            density inside the bore?
          </>
        }
        answer={
          <>
            <Formula>
              u<sub>B</sub> = (3)² / (2 · 4π×10⁻⁷) = 9 / (2.513×10⁻⁶) ≈{' '}
              <strong className="text-text font-medium">3.58×10⁶ J/m³ ≈ 3.6 MJ/m³</strong>
            </Formula>
            <p className="mb-prose-3">
              Three and a half million joules per cubic meter, sitting silently in the bore. Bore
              volume is roughly 0.3 m³, so the field holds about{' '}
              <strong className="text-text font-medium">1 MJ</strong> — comparable to a stick of
              dynamite. This is why dropped wrenches become guided missiles inside an MRI room, and
              why a quench (sudden loss of superconductivity) can boil off hundreds of liters of
              liquid helium in seconds
              <Cite id="jackson-1999" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.9"
        question={
          <>
            A camera-flash capacitor stores <strong className="text-text font-medium">1 J</strong>{' '}
            at <strong className="text-text font-medium">300 V</strong>. What is its capacitance? If
            its volume is about 1 cm³, what is the average energy density?
          </>
        }
        answer={
          <>
            <Formula>
              U = ½ C V² &nbsp;⇒&nbsp; C = 2U/V² = 2/(9×10⁴) ≈{' '}
              <strong className="text-text font-medium">22 µF</strong>
            </Formula>
            <Formula>
              u<sub>avg</sub> = U / V<sub>vol</sub> = 1 J / 10⁻⁶ m³ ={' '}
              <strong className="text-text font-medium">10⁶ J/m³ = 1 MJ/m³</strong>
            </Formula>
            <p className="mb-prose-3">
              An electrolytic flash cap reaches MJ/m³ by exploiting tantalum-oxide dielectrics of
              order tens of nanometers thick — gap thickness in the dielectric is what matters most,
              by the formula C/(Ad) = ε<sub>0</sub>ε<sub>r</sub>/d².
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.10"
        question={
          <>
            A car battery: <strong className="text-text font-medium">12 V × 100 A·hr</strong>. How
            many joules? Compare to magnetic energy in 1 m³ at 1 T.
          </>
        }
        answer={
          <>
            <Formula>
              U = V · Q = 12 V · (100 · 3600 C) ≈{' '}
              <strong className="text-text font-medium">4.3×10⁶ J = 4.3 MJ</strong>
            </Formula>
            <p className="mb-prose-3">
              A 1 m³ box of 1 T magnetic field holds 400 kJ — about{' '}
              <strong className="text-text font-medium">10×</strong> less than a car battery's
              chemical energy. Chemical bonds beat magnetic fields by a comfortable factor for
              portable energy storage. Magnetic energy at MJ/m³ density requires fields of several
              T, which require either superconducting magnets or extremely brief pulses
              <Cite id="jackson-1999" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.3.11"
        question={
          <>
            The Sun's surface magnetic field averages{' '}
            <strong className="text-text font-medium">B ≈ 1 G = 10⁻⁴ T</strong> (with sunspot peaks
            near 0.1 T). What's u<sub>B</sub> at the surface? Compare to the energy density of
            visible sunlight at Earth (~10⁻⁵ J/m³).
          </>
        }
        answer={
          <>
            <Formula>
              u<sub>B</sub> ≈ (10⁻⁴)² / (2·4π×10⁻⁷) = 10⁻⁸ / (2.5×10⁻⁶) ≈{' '}
              <strong className="text-text font-medium">4×10⁻³ J/m³</strong>
            </Formula>
            <p className="mb-prose-3">
              About 400× the visible-light energy density at Earth's orbit. In sunspot regions,
              where B reaches 0.1 T, u<sub>B</sub>
              jumps to ~4 kJ/m³ — eight orders of magnitude denser than ambient sunlight. The Sun's
              magnetic field dominates its surface energetics; that field's collapse and
              reconnection drives flares and coronal mass ejections
              <Cite id="griffiths-2017" in={SOURCES} />.
            </p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="The Joule Cost of a Field"
      labId="energy-density-4.3 / u = ½ε₀E² + B²/2µ₀"
      labContent={labContent}
      prose={prose}
    />
  );
}
