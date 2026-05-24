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
import { sciJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'ac-impedance';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

function fmtFreq(v: number) {
  return v < 1000 ? `${v.toFixed(0)} Hz` : `${(v / 1000).toFixed(2)} kHz`;
}

export default function ACImpedanceLab() {
  const [r, setR] = useState(100);
  const [lMh, setLMh] = useState(80);
  const [cUf, setCUf] = useState(10);
  const [freq, setFreq] = useState(60);
  const [vRms, setVRms] = useState(120);

  const computed = useMemo(() => {
    const omega = 2 * Math.PI * freq;
    const L = lMh / 1000;
    const C = cUf * 1e-6;
    const xL = omega * L;
    const xC = 1 / (omega * C);
    const x = xL - xC;
    const zMag = Math.hypot(r, x);
    const phi = Math.atan2(x, r);
    const iRms = vRms / zMag;
    const pf = Math.cos(phi);
    const pReal = vRms * iRms * pf;
    const qReactive = vRms * iRms * Math.sin(phi);
    const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
    return { omega, xL, xC, x, zMag, phi, iRms, pf, pReal, qReactive, f0 };
  }, [r, lMh, cUf, freq, vRms]);

  const stateRef = useRef({ r, lMh, cUf, freq, vRms, computed });
  useEffect(() => {
    stateRef.current = { r, lMh, cUf, freq, vRms, computed };
  }, [r, lMh, cUf, freq, vRms, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let t = 0;

    function draw() {
      const { r, computed } = stateRef.current;
      const cx = w * 0.36;
      const cy = h * 0.48;
      const scale = Math.min(1.2, 160 / Math.max(computed.zMag, 1));
      const rx = computed.zMag ? r * scale : 0;
      const xy = -computed.x * scale;
      const zx = rx;
      const zy = xy;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 190, cy);
      ctx.lineTo(cx + 210, cy);
      ctx.moveTo(cx, cy - 160);
      ctx.lineTo(cx, cy + 160);
      ctx.stroke();

      drawArrow(
        ctx,
        { x: cx, y: cy },
        { x: cx + rx, y: cy },
        {
          color: colors.pink,
          lineWidth: 3,
        },
      );
      drawArrow(
        ctx,
        { x: cx + rx, y: cy },
        { x: cx + rx, y: cy + xy },
        {
          color: computed.x >= 0 ? colors.teal : colors.blue,
          lineWidth: 3,
        },
      );
      drawArrow(
        ctx,
        { x: cx, y: cy },
        { x: cx + zx, y: cy + zy },
        {
          color: colors.accent,
          lineWidth: 4,
        },
      );

      ctx.fillStyle = colors.pink;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('R', cx + rx / 2, cy - 14);
      ctx.fillStyle = computed.x >= 0 ? colors.teal : colors.blue;
      ctx.fillText('X', cx + rx + 18, cy + xy / 2);
      ctx.fillStyle = colors.accent;
      ctx.fillText('|Z|', cx + zx / 2 + 20, cy + zy / 2 - 12);

      const plotX = w * 0.64;
      const plotY = h * 0.25;
      const plotW = w * 0.3;
      const plotH = h * 0.38;
      ctx.strokeStyle = colors.borderStrong;
      ctx.strokeRect(plotX, plotY, plotW, plotH);
      ctx.beginPath();
      ctx.moveTo(plotX, plotY + plotH / 2);
      ctx.lineTo(plotX + plotW, plotY + plotH / 2);
      ctx.stroke();

      const phase = computed.phi;
      for (const [color, offset, label] of [
        [colors.accent, 0, 'v'],
        [colors.teal, -phase, 'i'],
      ] as const) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= plotW; i++) {
          const y =
            plotY + plotH / 2 - Math.sin((i / plotW) * Math.PI * 4 + t + offset) * plotH * 0.32;
          if (i === 0) ctx.moveTo(plotX + i, y);
          else ctx.lineTo(plotX + i, y);
        }
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fillText(
          label,
          plotX + plotW + 14,
          plotY + plotH / 2 - Math.sin(t + offset) * plotH * 0.32,
        );
      }

      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.fillText(
        `phase = ${((computed.phi * 180) / Math.PI).toFixed(1)} deg`,
        plotX,
        plotY + plotH + 28,
      );
      ctx.fillText(
        computed.x >= 0 ? 'inductive: current lags' : 'capacitive: current leads',
        plotX,
        plotY + plotH + 46,
      );

      t += 0.035;
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
          <LegendItem swatchColor="var(--color-pink)">resistance R</LegendItem>
          <LegendItem swatchColor="var(--color-teal)">inductive reactance</LegendItem>
          <LegendItem swatchColor="var(--color-blue)">capacitive reactance</LegendItem>
          <LegendItem swatchColor="var(--color-accent)">impedance magnitude</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            label="resistance"
            sym="R"
            value={r}
            min={5}
            max={500}
            step={1}
            format={(v) => `${v.toFixed(0)} Ω`}
            metaLeft="5 Ω"
            metaRight="500 Ω"
            onChange={setR}
          />
          <Slider
            label="inductance"
            sym="L"
            value={lMh}
            min={1}
            max={500}
            step={1}
            format={(v) => `${v.toFixed(0)} mH`}
            metaLeft="1 mH"
            metaRight="500 mH"
            onChange={setLMh}
          />
          <Slider
            label="capacitance"
            sym="C"
            value={cUf}
            min={0.5}
            max={100}
            step={0.1}
            format={(v) => `${v.toFixed(1)} µF`}
            metaLeft="0.5 µF"
            metaRight="100 µF"
            onChange={setCUf}
          />
          <Slider
            label="frequency"
            sym="f"
            value={freq}
            min={10}
            max={5000}
            step={1}
            format={fmtFreq}
            metaLeft="10 Hz"
            metaRight="5 kHz"
            onChange={setFreq}
          />
          <Slider
            label="source voltage"
            sym={
              <>
                V<sub>rms</sub>
              </>
            }
            value={vRms}
            min={1}
            max={240}
            step={1}
            format={(v) => `${v.toFixed(0)} V`}
            metaLeft="1 V"
            metaRight="240 V"
            onChange={setVRms}
          />
        </>
      }
      outputs={
        <>
          <Readout
            sym="|Z|"
            label="impedance magnitude"
            value={computed.zMag.toFixed(2)}
            unit="Ω"
            highlight
          />
          <Readout sym="X" label="net reactance" value={computed.x.toFixed(2)} unit="Ω" />
          <Readout
            sym="φ"
            label="phase angle"
            value={((computed.phi * 180) / Math.PI).toFixed(1)}
            unit="deg"
          />
          <Readout sym="I" label="rms current" value={sciJsx(computed.iRms, 2)} unit="A" />
          <Readout sym="pf" label="power factor" value={computed.pf.toFixed(3)} />
          <Readout sym="P" label="real power" value={computed.pReal.toFixed(1)} unit="W" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        Complex impedance is the mathematical compression that made alternating-current engineering
        practical. Steinmetz popularized complex numbers for AC circuit analysis in the 1890s, so
        sinusoidal steady-state circuits could be solved with Ohm-like algebra instead of
        differential equations every time <Cite id="steinmetz-1893" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        This lab assumes a linear lumped circuit driven by one sinusoidal frequency after transients
        have died away. It holds when components are linear, wires are short compared with
        wavelength, and parasitic effects are negligible. It breaks for saturation, switching, arcs,
        distributed transmission lines, or wave-sized layouts{' '}
        <Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Formula</h3>
      <Formula tex="Z = R + jX,\qquad X = \omega L-\dfrac{1}{\omega C},\qquad |Z|=\sqrt{R^2+X^2}" />
      <p className="mb-prose-2">Variable glossary:</p>
      <ul className="mb-prose-3 pl-xl text-5 text-text-dim list-disc leading-5">
        <li>
          <M tex="Z" /> is complex impedance in ohms; it relates RMS phasors by{' '}
          <M tex="\tilde V=\tilde I Z" />.
        </li>
        <li>
          <M tex="R" /> is resistance in ohms; it dissipates real power.
        </li>
        <li>
          <M tex="X" /> is reactance in ohms; positive is inductive, negative is capacitive.
        </li>
        <li>
          <M tex="\omega=2\pi f" /> is angular frequency in rad/s.
        </li>
        <li>
          <M tex="L" /> is inductance in henries and <M tex="C" /> is capacitance in farads.
        </li>
        <li>
          <M tex="\phi=\tan^{-1}(X/R)" /> is the voltage-current phase angle.
        </li>
      </ul>

      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">
        A resistor asks current and voltage to point the same way in time. An inductor asks current
        to lag because the magnetic field has to be built. A capacitor asks current to lead because
        charge must move before the voltage across the plates has changed much.
      </p>
      <Pullout>
        Impedance is Ohm's law with memory: resistance plus the phase cost of storing energy.
      </Pullout>
      <p className="mb-prose-3">
        The triangle on the canvas is the whole story. The horizontal leg is dissipative resistance.
        The vertical leg is stored-and-returned energy. The diagonal tells the source how much RMS
        current it gets for a given RMS voltage.
      </p>

      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        The imaginary unit is not decoration; it records a quarter-cycle phase shift. Inductors have{' '}
        <M tex="Z_L=j\omega L" /> because voltage leads current. Capacitors have
        <M tex="Z_C=1/(j\omega C)=-j/(\omega C)" /> because current leads voltage.
      </p>
      <p className="mb-prose-3">
        The limits are diagnostic. At low frequency, the capacitor's reactance grows and blocks
        current. At high frequency, the inductor's reactance grows. At resonance,
        <M tex="\omega L=1/(\omega C)" />, so net reactance vanishes and the series circuit looks
        purely resistive.
      </p>
      <p className="mb-prose-3">
        Real power depends on the in-phase part of voltage and current:
        <M tex="P=V_{\text{rms}}I_{\text{rms}}\cos\phi" />. Utilities care about power factor
        because current that only sloshes reactive energy still heats wires.
      </p>

      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        Start with the component laws in sinusoidal steady state. Differentiating a phasor
        multiplies it by <M tex="j\omega" />, and integrating divides by
        <M tex="j\omega" />.
      </p>
      <Formula tex="V_R=IR,\qquad V_L=L\dfrac{dI}{dt}\rightarrow \tilde V_L=j\omega L\tilde I,\qquad I_C=C\dfrac{dV}{dt}\rightarrow \tilde V_C=\dfrac{\tilde I}{j\omega C}" />
      <p className="mb-prose-3">
        Series voltage drops add as phasors, so the total voltage is current times the sum of the
        component impedances <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />:
      </p>
      <Formula tex="\tilde V=\tilde I\left(R+j\omega L+\dfrac{1}{j\omega C}\right)=\tilde I\left[R+j\left(\omega L-\dfrac{1}{\omega C}\right)\right]" />

      <h3 className="lab-section-h3">Worked problems</h3>
      <TryIt
        tag="Problem 3.5.1"
        question={
          <p>
            Find <strong className="text-text font-medium">X_L</strong> for{' '}
            <strong className="text-text font-medium">L = 100 mH</strong> at{' '}
            <strong className="text-text font-medium">60 Hz</strong>.
          </p>
        }
        answer={
          <>
            <p>Use inductive reactance.</p>
            <Formula tex="X_L=2\pi fL=2\pi(60)(0.100)=37.7\ \Omega" />
            <p>
              The inductor contributes <strong className="text-text font-medium">+j37.7 Ω</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 3.5.2"
        question={
          <p>
            Find <strong className="text-text font-medium">X_C</strong> for{' '}
            <strong className="text-text font-medium">C = 10 µF</strong> at{' '}
            <strong className="text-text font-medium">60 Hz</strong>.
          </p>
        }
        answer={
          <>
            <p>Use capacitive reactance.</p>
            <Formula tex="X_C=\dfrac{1}{2\pi fC}=\dfrac{1}{2\pi(60)(10\times10^{-6})}=265\ \Omega" />
            <p>
              The capacitor contributes <strong className="text-text font-medium">-j265 Ω</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 3.5.3"
        question={
          <p>
            If frequency doubles, what happens to{' '}
            <strong className="text-text font-medium">X_L</strong> and{' '}
            <strong className="text-text font-medium">X_C</strong>?
          </p>
        }
        answer={
          <>
            <p>Use the frequency scaling of each reactance.</p>
            <Formula tex="X_L\propto f,\qquad X_C\propto 1/f" />
            <p>
              <strong className="text-text font-medium">X_L doubles</strong> and{' '}
              <strong className="text-text font-medium">X_C halves</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 3.5.4"
        question={
          <p>
            A series RLC has <strong className="text-text font-medium">R = 50 Ω</strong> and{' '}
            <strong className="text-text font-medium">X = 120 Ω</strong>. Find{' '}
            <strong className="text-text font-medium">|Z|</strong>.
          </p>
        }
        answer={
          <>
            <p>Use the impedance triangle.</p>
            <Formula tex="|Z|=\sqrt{50^2+120^2}=130\ \Omega" />
            <p>
              The magnitude is <strong className="text-text font-medium">130 Ω</strong>, a 5-12-13
              triangle.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 3.5.5"
        question={
          <p>
            What is the resonant frequency for{' '}
            <strong className="text-text font-medium">L = 80 mH</strong> and{' '}
            <strong className="text-text font-medium">C = 10 µF</strong>?
          </p>
        }
        answer={
          <>
            <p>
              Set <M tex="\omega L=1/(\omega C)" />.
            </p>
            <Formula tex="f_0=\dfrac{1}{2\pi\sqrt{LC}}=\dfrac{1}{2\pi\sqrt{(0.080)(10\times10^{-6})}}=178\ \text{Hz}" />
            <p>
              The circuit is series-resonant at{' '}
              <strong className="text-text font-medium">178 Hz</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 3.5.6"
        question={
          <p>
            A <strong className="text-text font-medium">120 V RMS</strong> source drives{' '}
            <strong className="text-text font-medium">|Z| = 240 Ω</strong>. Find RMS current.
          </p>
        }
        answer={
          <>
            <p>Use phasor Ohm's law magnitudes.</p>
            <Formula tex="I_{\text{rms}}=\dfrac{V_{\text{rms}}}{|Z|}=\dfrac{120}{240}=0.500\ \text{A}" />
            <p>
              The current is <strong className="text-text font-medium">0.500 A RMS</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 3.5.7"
        question={
          <p>
            A load has <strong className="text-text font-medium">V = 120 V</strong>,{' '}
            <strong className="text-text font-medium">I = 2 A</strong>, and{' '}
            <strong className="text-text font-medium">pf = 0.80</strong>. Find real power.
          </p>
        }
        answer={
          <>
            <p>Real power is the in-phase part.</p>
            <Formula tex="P=VI\cos\phi=(120)(2)(0.80)=192\ \text{W}" />
            <p>
              The load consumes <strong className="text-text font-medium">192 W</strong>; the rest
              of the VA is reactive exchange.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 3.5.8"
        question={
          <p>
            Convert a phase angle of <strong className="text-text font-medium">36.9°</strong> into
            power factor.
          </p>
        }
        answer={
          <>
            <p>Power factor is cosine of the phase angle.</p>
            <Formula tex="\text{pf}=\cos(36.9^\circ)=0.800" />
            <p>
              The power factor is <strong className="text-text font-medium">0.800</strong>.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 3.5.9"
        question={
          <p>
            Why does impedance fail as a single number for a{' '}
            <strong className="text-text font-medium">square-wave inverter output</strong>?
          </p>
        }
        answer={
          <>
            <p>A square wave contains many frequencies, and reactance is frequency-dependent.</p>
            <Formula tex="X_L=\omega L,\qquad X_C=1/(\omega C)" />
            <p>
              The failure mode is{' '}
              <strong className="text-text font-medium">multi-frequency drive</strong>: each
              harmonic sees a different impedance.
            </p>
          </>
        }
      />
      <TryIt
        tag="Problem 3.5.10"
        question={
          <p>
            In three-phase balanced operation, three equal sinusoids are separated by{' '}
            <strong className="text-text font-medium">120°</strong>. What is their instantaneous
            sum?
          </p>
        }
        answer={
          <>
            <p>Use phasor symmetry around the unit circle.</p>
            <Formula tex="1\angle0^\circ+1\angle{-120^\circ}+1\angle{+120^\circ}=0" />
            <p>
              The balanced sum is <strong className="text-text font-medium">zero</strong>, which is
              why neutral current cancels in an ideal balanced system.
            </p>
          </>
        }
      />

      <h3 className="lab-section-h3">Why phasors matter</h3>
      <p className="mb-prose-3">
        Phasors are not a trick for avoiding calculus. They are a way to expose what matters in
        sinusoidal steady state: magnitude, phase, frequency, and where the energy is dissipated
        rather than merely stored and returned.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="AC circuits"
      labId="3.5"
      labContent={labContent}
      prose={prose}
    />
  );
}
