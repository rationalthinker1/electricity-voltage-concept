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
import { PHYS, eng, sci } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

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
      const x0 = cx - half, y0 = cy - half;

      const intensity = Math.max(0.06, Math.min(0.6, Math.log10(uE + 1) * 0.10 + 0.05));
      ctx.shadowColor = `rgba(255,59,110,${intensity})`;
      ctx.shadowBlur = 28;
      ctx.fillStyle = `rgba(255,59,110,${intensity * 0.18})`;
      roundRect(x0, y0, size, size, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255,59,110,0.55)';
      ctx.lineWidth = 1.4;
      roundRect(x0, y0, size, size, 6);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,59,110,0.25)';
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x0 + 16, y0 - 14);
      ctx.moveTo(x0 + size, y0); ctx.lineTo(x0 + size + 16, y0 - 14);
      ctx.lineTo(x0 + size + 16, y0 + size - 14);
      ctx.lineTo(x0 + size, y0 + size);
      ctx.moveTo(x0 + 16, y0 - 14); ctx.lineTo(x0 + size + 16, y0 - 14);
      ctx.stroke();

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
          ctx.strokeStyle = 'rgba(255,59,110,0.7)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px, topY); ctx.lineTo(px, tipY);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,59,110,0.9)';
          ctx.beginPath();
          ctx.moveTo(px, tipY);
          ctx.lineTo(px - 3, tipY - 5);
          ctx.lineTo(px + 3, tipY - 5);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.fillStyle = '#ff3b6e';
      ctx.font = 'italic 22px Fraunces, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('E field', cx, y0 - 26);

      ctx.fillStyle = '#ff6b2a';
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillText(`u_E = ${eng(uE, 2, 'J/m³')}`, cx, y0 + size + 26);
    }

    function drawBCube(cx: number, cy: number, size: number, _Bval: number, uB: number) {
      const half = size / 2;
      const x0 = cx - half, y0 = cy - half;

      const intensity = Math.max(0.06, Math.min(0.6, Math.log10(uB + 1) * 0.10 + 0.05));
      ctx.shadowColor = `rgba(108,197,194,${intensity})`;
      ctx.shadowBlur = 28;
      ctx.fillStyle = `rgba(108,197,194,${intensity * 0.18})`;
      roundRect(x0, y0, size, size, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(108,197,194,0.55)';
      ctx.lineWidth = 1.4;
      roundRect(x0, y0, size, size, 6);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(108,197,194,0.25)';
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x0 + 16, y0 - 14);
      ctx.moveTo(x0 + size, y0); ctx.lineTo(x0 + size + 16, y0 - 14);
      ctx.lineTo(x0 + size + 16, y0 + size - 14);
      ctx.lineTo(x0 + size, y0 + size);
      ctx.moveTo(x0 + 16, y0 - 14); ctx.lineTo(x0 + size + 16, y0 - 14);
      ctx.stroke();

      const rings = 4;
      for (let r = 1; r <= rings; r++) {
        const radius = (r / rings) * (size * 0.42);
        const dots = 10 + r * 4;
        const spin = phase * (0.3 + r * 0.05);
        ctx.strokeStyle = `rgba(108,197,194,${0.18 + (0.12 * r) / rings})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < dots; i++) {
          const a = spin + (i / dots) * Math.PI * 2;
          const px = cx + Math.cos(a) * radius;
          const py = cy + Math.sin(a) * radius;
          ctx.fillStyle = `rgba(108,197,194,${0.4 + (0.5 * r) / rings})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = '#6cc5c2';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⊙', cx, cy);

      ctx.fillStyle = '#6cc5c2';
      ctx.font = 'italic 22px Fraunces, serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('B field', cx, y0 - 26);

      ctx.fillStyle = '#ff6b2a';
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillText(`u_B = ${eng(uB, 2, 'J/m³')}`, cx, y0 + size + 26);
    }

    function drawComparisonBar(cx: number, cy: number, totalW: number, uE: number, uB: number) {
      const total = uE + uB;
      if (total <= 0) {
        ctx.fillStyle = 'rgba(160,158,149,0.5)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('zero field — set E or B above', cx, cy);
        return;
      }
      const fracE = uE / total;
      const h = 12;
      const x0 = cx - totalW / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(x0, cy - h / 2, totalW, h, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,59,110,0.85)';
      roundRect(x0, cy - h / 2, totalW * fracE, h, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(108,197,194,0.85)';
      roundRect(x0 + totalW * fracE, cy - h / 2, totalW * (1 - fracE), h, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(160,158,149,0.95)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `u_E : u_B  =  ${(fracE * 100).toFixed(1)}% : ${((1 - fracE) * 100).toFixed(1)}%`,
        cx,
        cy + 24,
      );
    }

    function draw() {
      const s = stateRef.current;
      const out = s.computed;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);
      phase += 0.02;

      const cubeSize = Math.min(W * 0.32, H * 0.62);
      const yMid = H * 0.48;
      const xL_E = W * 0.25;
      const xL_B = W * 0.75;

      drawECube(xL_E, yMid, cubeSize, s.E, out.uE);
      drawBCube(xL_B, yMid, cubeSize, s.B, out.uB);
      drawComparisonBar(W / 2, H - 56, Math.min(W * 0.55, 520), out.uE, out.uB);

      ctx.fillStyle = '#ff6b2a';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`u_total = ${eng(out.u, 3, 'J/m³')}`, 24, 28);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
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
            sym="E" label="Electric field magnitude"
            value={E} min={0} max={1e7} step={1e3}
            format={(v) => sci(v, 1) + ' V/m'}
            metaLeft="0" metaRight="10⁷ V/m"
            onChange={setE}
          />
          <Slider
            sym="B" label="Magnetic field magnitude"
            value={B} min={0} max={5} step={0.01}
            format={(v) => v.toFixed(2) + ' T'}
            metaLeft="0 T" metaRight="5 T"
            onChange={setB}
          />
          <Slider
            sym="V" label="Volume of region"
            value={Vol} min={0.001} max={1000} step={0.001}
            format={(v) => eng(v, 3, 'm³')}
            metaLeft="10⁻³ m³" metaRight="10³ m³"
            onChange={setVol}
          />
        </>
      }
      outputs={
        <>
          <Readout sym={<>u<sub>E</sub></>} label="Electric energy density" valueHTML={eng(computed.uE, 3, 'J/m³')} />
          <Readout sym={<>u<sub>B</sub></>} label="Magnetic energy density" valueHTML={eng(computed.uB, 3, 'J/m³')} />
          <Readout sym="u" label="Total energy density" valueHTML={eng(computed.u, 3, 'J/m³')} highlight />
          <Readout sym="U" label="Energy in volume" valueHTML={eng(computed.U, 3, 'J')} />
          <Readout sym="E*" label="E to match this B (= c·B)" valueHTML={eng(computed.EeqB, 3, 'V/m')} />
          <Readout sym="≈" label="Friendly comparison" value={computed.comp} />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>Fields carry energy. Period.</h3>
      <p>
        You could, in principle, write all of electrostatics with no fields at all — just Coulomb's law and direct, instantaneous,
        action-at-a-distance forces between charges. The math would be ugly but consistent. The fields would seem like a bookkeeping
        convenience.
      </p>
      <p>
        The trouble starts the moment you ask: <em>where is the energy?</em> Assemble a configuration of charges from infinity. You do positive
        work against their mutual repulsion. That work has to go somewhere. The charges themselves haven't changed. The only thing that's changed
        is the field. Maxwell, and then Heaviside and Poynting, did the bookkeeping carefully and arrived at an inescapable conclusion: the energy
        is in the field, distributed continuously throughout the volume of space it occupies<Cite id="poynting-1884" in={SOURCES} />.
      </p>

      <h3>Where the formulas come from</h3>
      <p>
        Take a parallel-plate capacitor. Charge it up. The total stored energy is <strong>U = ½CV²</strong>. Substitute
        <strong> C = ε<sub>0</sub> A/d</strong> and <strong>V = Ed</strong>:
      </p>
      <MathBlock>U = ½ (ε<sub>0</sub> A / d) (Ed)² = ½ ε<sub>0</sub> E² · (A d)</MathBlock>
      <p>
        That <strong>Ad</strong> is the volume of the region between the plates — the region where the field lives. So the energy per
        unit volume is<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <MathBlock>u<sub>E</sub> = ½ ε<sub>0</sub> E²</MathBlock>
      <p>
        Same trick on an inductor's interior, using <strong>U = ½LI²</strong> and <strong>B = μ<sub>0</sub>nI</strong><Cite id="jackson-1999" in={SOURCES} />:
      </p>
      <MathBlock>u<sub>B</sub> = B² / (2μ<sub>0</sub>)</MathBlock>
      <p>
        Both expressions <em>only</em> reference the local field strength. They make no mention of the charges or currents that source it. The
        claim is much stronger than what we showed: this energy density formula holds for <em>any</em> electromagnetic field<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3>The symmetry</h3>
      <p>Total electromagnetic energy density at a point in space:</p>
      <MathBlock>u = ½ ε<sub>0</sub> E² + B² / (2μ<sub>0</sub>)</MathBlock>
      <p>
        In a plane electromagnetic wave propagating in vacuum, the two fields are locked together by Maxwell's equations: <strong>B = E/c</strong>.
        Plug this in and the two terms become identical<Cite id="jackson-1999" in={SOURCES} />. Half the wave's energy is in the electric field,
        half in the magnetic field, at every instant, at every point along the wave.
      </p>
      <Pullout>
        There is no such thing as "empty space" when there's a field there. Empty space is the cheap seats; field space is
        paying rent in <em>joules per cubic meter</em>.
      </Pullout>

      <h3>Why the c factor matters when comparing E and B</h3>
      <p>
        The numerical asymmetry between E and B is dramatic. A field of <strong>1 V/m</strong> carries an energy density of
        <strong> ε<sub>0</sub>/2 ≈ 4.4×10<sup>−12</sup></strong> J/m³<Cite id="codata-2018" in={SOURCES} />. Meanwhile a magnetic field of
        <strong> 1 T</strong> carries <strong>1/(2μ<sub>0</sub>) ≈ 4×10<sup>5</sup></strong> J/m³<Cite id="codata-2018" in={SOURCES} />.
      </p>
      <p>
        Seventeen orders of magnitude apart at the same numerical value. The reason is that <strong>E</strong> and <strong>B</strong> have different
        units. To get the same energy density, you'd need <strong>E = cB</strong>. A 1 T field is energetically equivalent to an electric field
        of <strong>3×10<sup>8</sup> V/m</strong> — about a hundred times the breakdown strength of air. This is the lab's
        <strong> E*</strong> readout.
      </p>

      <h3>Comparing field energy to other things you've felt</h3>
      <p>
        Field energy densities are abstract until you put them next to other forms. Some anchor points
        (each computed directly from <em>u = ½ε₀E² + B²/2μ₀</em>)<Cite id="codata-2018" in={SOURCES} />:
      </p>
      <MathBlock>
        Earth's magnetic field (~50 µT): &nbsp; ~10<sup>−3</sup> J/m³ <br />
        Capacitor at air's breakdown (3×10<sup>6</sup> V/m): &nbsp; ~40 J/m³ <br />
        MRI magnet at 3 T: &nbsp; ~3.6×10<sup>6</sup> J/m³
      </MathBlock>
      <p>
        An MRI machine, in other words, has roughly a million joules per cubic meter sitting silently in its magnetic field at all times. That
        number explains why the bore is enormous, why the dewar is enormous, why every dropped wrench becomes a guided missile, and why
        quench events evaporate liters of helium in seconds: the field is a real, mechanical, energetic <em>thing</em>.
      </p>
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
