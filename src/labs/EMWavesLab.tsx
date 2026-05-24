import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Formula, M } from '@/components/Formula';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { drawArrow } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { PHYS, sciJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'em-waves';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

function fmtFreq(v: number) {
  if (v < 1e6) return `${(v / 1e3).toFixed(0)} kHz`;
  if (v < 1e9) return `${(v / 1e6).toFixed(1)} MHz`;
  return `${(v / 1e9).toFixed(2)} GHz`;
}

export default function EMWavesLab() {
  const [freq, setFreq] = useState(2.4e9);
  const [e0, setE0] = useState(120);
  const [er, setEr] = useState(1);
  const [mur, setMur] = useState(1);

  const computed = useMemo(() => {
    const n = Math.sqrt(er * mur);
    const v = PHYS.c / n;
    const lambda = v / freq;
    const b0 = e0 / v;
    const eta = Math.sqrt((PHYS.mu_0 * mur) / (PHYS.eps_0 * er));
    const intensity = (0.5 * e0 * e0) / eta;
    return { n, v, lambda, b0, eta, intensity };
  }, [freq, e0, er, mur]);

  const stateRef = useRef({ freq, e0, er, mur, computed });
  useEffect(() => {
    stateRef.current = { freq, e0, er, mur, computed };
  }, [freq, e0, er, mur, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { e0, computed } = stateRef.current;
      const { lambda, v, n } = computed;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const midY = h * 0.5;
      const pad = 42;
      const usable = w - 2 * pad;
      const cycles = Math.max(1.2, Math.min(5.5, 0.75 / lambda));
      const amp = Math.max(28, Math.min(110, 24 + e0 * 0.45));

      ctx.strokeStyle = withAlpha(colors.borderStrong, 0.8);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, midY);
      ctx.lineTo(w - pad, midY);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.strokeStyle = colors.pink;
      ctx.beginPath();
      for (let i = 0; i <= usable; i++) {
        const x = pad + i;
        const y = midY - Math.sin((i / usable) * cycles * Math.PI * 2 - phase) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = colors.teal;
      ctx.beginPath();
      for (let i = 0; i <= usable; i++) {
        const x = pad + i;
        const y = midY + 54 - Math.sin((i / usable) * cycles * Math.PI * 2 - phase) * amp * 0.42;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const x = pad + (i + 0.5) * (usable / 8);
        const s = Math.sin(((x - pad) / usable) * cycles * Math.PI * 2 - phase);
        drawArrow(
          ctx,
          { x, y: midY },
          { x, y: midY - s * amp * 0.75 },
          {
            color: withAlpha(colors.pink, 0.72),
            lineWidth: 1.4,
          },
        );
        drawArrow(
          ctx,
          { x, y: midY + 54 },
          { x: x - s * amp * 0.28, y: midY + 54 + s * amp * 0.28 },
          { color: withAlpha(colors.teal, 0.72), lineWidth: 1.4 },
        );
      }

      const wavePx = usable / cycles;
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = withAlpha(colors.accent, 0.75);
      ctx.beginPath();
      ctx.moveTo(pad + 10, h - 58);
      ctx.lineTo(pad + 10 + wavePx, h - 58);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.accent;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`lambda = ${(lambda * 100).toFixed(1)} cm`, pad + 10 + wavePx / 2, h - 68);

      ctx.textAlign = 'left';
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`v = ${(v / 1e8).toFixed(2)}e8 m/s`, pad, 34);
      ctx.fillText(`n = ${n.toFixed(2)}`, pad, 52);
      ctx.fillText('E and B stay in phase; E x B points along propagation.', pad, h - 26);

      phase += 0.025;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={460} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--color-pink)">electric field E</LegendItem>
          <LegendItem swatchColor="var(--color-teal)">magnetic field B</LegendItem>
          <LegendItem swatchColor="var(--color-accent)">one wavelength</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            label="frequency"
            sym="f"
            value={freq}
            min={1e6}
            max={6e9}
            step={1e6}
            format={fmtFreq}
            metaLeft="1 MHz"
            metaRight="6 GHz"
            onChange={setFreq}
          />
          <Slider
            label="electric amplitude"
            sym={
              <>
                E<sub>0</sub>
              </>
            }
            value={e0}
            min={10}
            max={240}
            step={1}
            format={(v) => `${v.toFixed(0)} V/m`}
            metaLeft="10 V/m"
            metaRight="240 V/m"
            onChange={setE0}
          />
          <Slider
            label="relative permittivity"
            sym={
              <>
                ε<sub>r</sub>
              </>
            }
            value={er}
            min={1}
            max={9}
            step={0.05}
            format={(v) => v.toFixed(2)}
            metaLeft="vacuum"
            metaRight="dense glass"
            onChange={setEr}
          />
          <Slider
            label="relative permeability"
            sym={
              <>
                μ<sub>r</sub>
              </>
            }
            value={mur}
            min={1}
            max={4}
            step={0.02}
            format={(v) => v.toFixed(2)}
            metaLeft="nonmagnetic"
            metaRight="magnetic medium"
            onChange={setMur}
          />
        </>
      }
      outputs={
        <>
          <Readout sym="v" label="wave speed" value={sciJsx(computed.v, 3)} unit="m/s" highlight />
          <Readout sym="n" label="index" value={computed.n.toFixed(2)} />
          <Readout
            sym="λ"
            label="wavelength"
            value={(computed.lambda * 100).toFixed(2)}
            unit="cm"
          />
          <Readout sym="B₀" label="magnetic amplitude" value={sciJsx(computed.b0, 2)} unit="T" />
          <Readout
            sym="I"
            label="average intensity"
            value={sciJsx(computed.intensity, 2)}
            unit="W/m²"
          />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        Maxwell's 1865 paper made the decisive move: add displacement current to Ampere's law,
        combine it with Faraday's law, and the equations predict transverse waves whose speed is set
        by the electric and magnetic constants <Cite id="maxwell-1865" in={SOURCES} />. Hertz then
        generated and detected radio waves in air, confirming that Maxwell's predicted object was
        experimentally real <Cite id="hertz-1888" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        This lab treats a linear, homogeneous, source-free medium. It holds when the material can be
        summarized by constant <M tex="\varepsilon" /> and <M tex="\mu" />, and it breaks when
        dispersion, absorption, anisotropy, nonlinearity, boundaries, or near-field antenna
        structure matter <Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Formula</h3>
      <Formula tex="v = \dfrac{1}{\sqrt{\mu \varepsilon}} = \dfrac{c}{\sqrt{\mu_r \varepsilon_r}}" />
      <p className="mb-prose-2">Variable glossary:</p>
      <ul className="mb-prose-3 pl-xl text-5 text-text-dim list-disc leading-5">
        <li>
          <M tex="v" /> is the phase speed of the wave in m/s.
        </li>
        <li>
          <M tex="\varepsilon = \varepsilon_r\varepsilon_0" /> is permittivity in F/m.
        </li>
        <li>
          <M tex="\mu = \mu_r\mu_0" /> is permeability in H/m.
        </li>
        <li>
          <M tex="\varepsilon_r" /> and <M tex="\mu_r" /> are dimensionless material ratios.
        </li>
        <li>
          <M tex="c = 299\,792\,458\ \text{m/s}" /> is the exact vacuum speed of light{' '}
          <Cite id="codata-2018" in={SOURCES} />.
        </li>
        <li>
          <M tex="\lambda = v/f" /> is wavelength in meters for frequency <M tex="f" /> in hertz.
        </li>
      </ul>

      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">
        An electromagnetic wave is not an electric ripple plus a separate magnetic ripple. It is a
        single travelling field structure. A changing electric field curls a magnetic field around
        itself; a changing magnetic field curls an electric field around itself.
      </p>
      <Pullout>
        Light moves at the speed allowed by how hard space resists making electric and magnetic
        field.
      </Pullout>
      <p className="mb-prose-3">
        Increase <M tex="\varepsilon_r" /> and the medium polarizes more strongly. Increase{' '}
        <M tex="\mu_r" /> and the magnetic response stores more field energy. More stored energy for
        the same field amplitude means the phase advances more slowly.
      </p>

      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        The equation respects the symmetry of a uniform medium: no preferred location, and no
        preferred transverse axis. The direction is set by <M tex="\vec{E}\times\vec{B}" />, the
        same Poynting vector that carried energy into a resistor in the earlier lab
        <Cite id="poynting-1884" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Dimensional analysis almost forces the form. <M tex="\mu\varepsilon" /> has units of seconds
        squared per meter squared, so <M tex="1/\sqrt{\mu\varepsilon}" /> has units of speed.
      </p>
      <p className="mb-prose-3">
        If <M tex="\varepsilon_r=\mu_r=1" />, the speed is <M tex="c" />. If either material ratio
        grows, speed drops. If frequency changes while the medium stays nondispersive, speed is
        unchanged but wavelength changes.
      </p>

      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        In a source-free linear medium, Faraday's law and the Ampere-Maxwell law form the coupling
        pair:
      </p>
      <Formula tex="\nabla\times\vec{E}=-\dfrac{\partial\vec{B}}{\partial t},\qquad \nabla\times\vec{B}=\mu\varepsilon\dfrac{\partial\vec{E}}{\partial t}" />
      <p className="mb-prose-3">
        Take the curl of Faraday's law, use the vector identity for curl of curl, set
        <M tex="\nabla\cdot\vec{E}=0" /> in a charge-free region, and substitute the Ampere-Maxwell
        law. The result is the wave equation <Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula tex="\nabla^2\vec{E}=\mu\varepsilon\dfrac{\partial^2\vec{E}}{\partial t^2},\qquad \nabla^2\vec{B}=\mu\varepsilon\dfrac{\partial^2\vec{B}}{\partial t^2}" />
      <p className="mb-prose-3">
        Compare with <M tex="\nabla^2\psi=(1/v^2)\partial^2\psi/\partial t^2" />. The coefficient
        gives <M tex="1/v^2=\mu\varepsilon" />.
      </p>
      <Formula id="speed-of-light" />

      <h3 className="lab-section-h3">Worked problems</h3>
      <TryIt
        tag="Problem 4.5.1"
        question={
          <p>
            Find the wavelength of a <strong className="text-text font-medium">2.40 GHz</strong>{' '}
            wave in air.
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">
              Use <M tex="\lambda=c/f" /> with CODATA's exact <M tex="c" />{' '}
              <Cite id="codata-2018" in={SOURCES} />.
            </p>
            <Formula tex="\lambda=\dfrac{2.9979\times10^8\ \text{m/s}}{2.40\times10^9\ \text{s}^{-1}}=1.25\times10^{-1}\ \text{m}" />
            <p>
              The wavelength is <strong className="text-text font-medium">12.5 cm</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 4.5.2"
        question={
          <p>
            A red wave has <strong className="text-text font-medium">f = 4.84×10^14 Hz</strong>.
            What is its vacuum wavelength?
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">
              Use <M tex="\lambda=c/f" />.
            </p>
            <Formula tex="\lambda=\dfrac{2.9979\times10^8}{4.84\times10^{14}}=6.19\times10^{-7}\ \text{m}" />
            <p>
              The wavelength is <strong className="text-text font-medium">619 nm</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 4.5.3"
        question={
          <p>
            If <strong className="text-text font-medium">εᵣ is quadrupled</strong> and{' '}
            <strong className="text-text font-medium">μᵣ is unchanged</strong>, by what factor does
            wave speed change?
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">
              Speed scales as the inverse square root of the material product.
            </p>
            <Formula tex="\dfrac{v_2}{v_1}=\sqrt{\dfrac{1}{4}}=\dfrac{1}{2}" />
            <p>
              The wave speed becomes{' '}
              <strong className="text-text font-medium">half as large</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 4.5.4"
        question={
          <p>
            What refractive index gives a wave speed of{' '}
            <strong className="text-text font-medium">2.00×10^8 m/s</strong>?
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">
              For a nonmagnetic optical material, <M tex="n=c/v" />.
            </p>
            <Formula tex="n=\dfrac{2.9979\times10^8}{2.00\times10^8}=1.50" />
            <p>
              The material has <strong className="text-text font-medium">n = 1.50</strong>, a
              glass-like value <Cite id="hecht-2017" in={SOURCES} />.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 4.5.5"
        question={
          <p>
            A plane wave has <strong className="text-text font-medium">E₀ = 100 V/m</strong> in
            vacuum. What is <strong className="text-text font-medium">B₀</strong>?
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">
              For a plane wave in vacuum, <M tex="B_0=E_0/c" />.
            </p>
            <Formula tex="B_0=\dfrac{100\ \text{V/m}}{2.9979\times10^8\ \text{m/s}}=3.34\times10^{-7}\ \text{T}" />
            <p>
              The magnetic amplitude is <strong className="text-text font-medium">0.334 μT</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 4.5.6"
        question={
          <p>
            Compare a <strong className="text-text font-medium">1.0 mW laser pointer</strong> spread
            over <strong className="text-text font-medium">1.0 mm²</strong> with sunlight at about{' '}
            <strong className="text-text font-medium">1360 W/m²</strong>.
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">Intensity is power per area.</p>
            <Formula tex="I_{\text{laser}}=\dfrac{1.0\times10^{-3}\ \text{W}}{1.0\times10^{-6}\ \text{m}^2}=1.0\times10^3\ \text{W/m}^2" />
            <p>
              The laser spot is <strong className="text-text font-medium">1000 W/m²</strong>,
              slightly below direct solar irradiance.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 4.5.7"
        question={
          <p>
            Two coherent radio waves have equal amplitudes, but one is{' '}
            <strong className="text-text font-medium">180° out of phase</strong>. What is the
            resulting amplitude?
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">
              Superpose the electric fields as signed sinusoidal quantities.
            </p>
            <Formula tex="E_{\text{net}}=E_0\cos\omega t+E_0\cos(\omega t+\pi)=0" />
            <p>
              The ideal net amplitude is <strong className="text-text font-medium">zero</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 4.5.8"
        question={
          <p>
            Convert a <strong className="text-text font-medium">3 dB</strong> polarization or
            mismatch loss into a power ratio.
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">
              For power ratios, <M tex="L_{\text{dB}}=10\log_{10}(P_2/P_1)" />.
            </p>
            <Formula tex="\dfrac{P_2}{P_1}=10^{-3/10}=0.50" />
            <p>
              A 3 dB loss leaves about{' '}
              <strong className="text-text font-medium">half the power</strong>{' '}
              <Cite id="balanis-2016" in={SOURCES} />.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 4.5.9"
        question={
          <p>
            Radiation pressure on an absorber is{' '}
            <strong className="text-text font-medium">p = I/c</strong>. What pressure does{' '}
            <strong className="text-text font-medium">1360 W/m²</strong> sunlight exert?
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">Pressure is intensity divided by wave speed.</p>
            <Formula tex="p=\dfrac{1360\ \text{W/m}^2}{2.9979\times10^8\ \text{m/s}}=4.54\times10^{-6}\ \text{Pa}" />
            <p>
              The pressure is <strong className="text-text font-medium">4.5 μPa</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 4.5.10"
        question={
          <p>
            A pulse is only{' '}
            <strong className="text-text font-medium">one wavelength from a small antenna</strong>.
            Why is the plane-wave formula not enough there?
          </p>
        }
        answer={
          <>
            <p className="mb-prose-1">
              The speed law still governs propagation, but the local field is not yet a simple plane
              wave.
            </p>
            <Formula tex="v=\dfrac{1}{\sqrt{\mu\varepsilon}}\quad\text{while near-field terms also scale as }1/r^2\text{ and }1/r^3" />
            <p>
              The failure mode is{' '}
              <strong className="text-text font-medium">the far-field assumption</strong>, not
              Maxwell's speed law <Cite id="feynman-II-21" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h3 className="lab-section-h3">Why the square root matters</h3>
      <p className="mb-prose-3">
        The square root is why ordinary optical materials can slow light substantially without
        needing enormous material constants. A modest dielectric change becomes a visible
        wavelength, antenna-size, and timing change.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Electromagnetic waves"
      labId="4.5"
      labContent={labContent}
      prose={prose}
    />
  );
}
