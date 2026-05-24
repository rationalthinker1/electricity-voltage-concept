import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Formula, InlineMath } from '@/components/Formula';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { drawArrow } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { sciJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

interface Topic {
  slug: string;
  labId: string;
  subtitle: string;
  equation: string;
  plain: string;
  lhs: string;
  xName: string;
  yName: string;
  zName: string;
  unit: string;
  source: string;
  note: string;
}

export const TOPIC_LABS: Record<string, Topic> = {
  'network-analysis': {
    slug: 'network-analysis',
    labId: '3.6',
    subtitle: 'Network analysis',
    equation: 'V_{th}=V_{oc},\\qquad R_{th}=V_{oc}/I_{sc}',
    plain: 'Vth = Voc, Rth = Voc/Isc',
    lhs: 'Vth',
    xName: 'open-circuit voltage',
    yName: 'short-circuit current',
    zName: 'load resistance',
    unit: 'V',
    source: 'irwin-circuit-analysis-2015',
    note: 'Thevenin/Norton reduction turns a whole linear network into one source plus one impedance.',
  },
  'pn-junction': {
    slug: 'pn-junction',
    labId: '5.1',
    subtitle: 'Semiconductor junctions',
    equation: 'I=I_S\\left(e^{V_D/(nV_T)}-1\\right)',
    plain: 'I = IS(e^(VD/nVT) - 1)',
    lhs: 'I',
    xName: 'diode voltage',
    yName: 'thermal voltage',
    zName: 'ideality factor',
    unit: 'A',
    source: 'sedra-smith-2014',
    note: 'A small voltage change across a junction becomes an exponential current change.',
  },
  'transistor-iv': {
    slug: 'transistor-iv',
    labId: '5.2',
    subtitle: 'Transistor I-V curves',
    equation: 'I_D\\approx \\tfrac{1}{2}k(V_{GS}-V_T)^2(1+\\lambda V_{DS})',
    plain: 'ID ≈ ½k(VGS−VT)²(1+λVDS)',
    lhs: 'ID',
    xName: 'gate overdrive',
    yName: 'device constant',
    zName: 'drain voltage',
    unit: 'A',
    source: 'sedra-smith-2014',
    note: 'A transistor is a voltage-controlled current law plus a load line.',
  },
  'fourier-series': {
    slug: 'fourier-series',
    labId: '6.1',
    subtitle: 'Fourier analysis',
    equation: 'x(t)=a_0+\\sum_{n=1}^{\\infty}\\left(a_n\\cos n\\omega t+b_n\\sin n\\omega t\\right)',
    plain: 'x(t) = a0 + Σ(an cos nωt + bn sin nωt)',
    lhs: 'xN',
    xName: 'fundamental amplitude',
    yName: 'harmonic count',
    zName: 'frequency',
    unit: '',
    source: 'bracewell-2000',
    note: 'Periodic waveforms are sums of sinusoids; filters act by reshaping those coefficients.',
  },
  'bode-filter': {
    slug: 'bode-filter',
    labId: '6.2',
    subtitle: 'Filter response',
    equation: '|H(j\\omega)|=\\dfrac{1}{\\sqrt{1+(\\omega/\\omega_c)^2}}',
    plain: '|H(jω)| = 1/√(1+(ω/ωc)²)',
    lhs: '|H|',
    xName: 'signal frequency',
    yName: 'corner frequency',
    zName: 'input amplitude',
    unit: '',
    source: 'horowitz-hill-2015',
    note: 'A Bode plot is a map of how amplitude and phase change with frequency.',
  },
  'op-amp': {
    slug: 'op-amp',
    labId: '6.3',
    subtitle: 'Operational amplifiers',
    equation: 'V_{out}\\approx -\\dfrac{R_f}{R_{in}}V_{in}',
    plain: 'Vout ≈ −(Rf/Rin)Vin',
    lhs: 'Vout',
    xName: 'input voltage',
    yName: 'feedback ratio',
    zName: 'gain-bandwidth margin',
    unit: 'V',
    source: 'horowitz-hill-2015',
    note: 'Negative feedback spends open-loop gain to make a predictable closed-loop equation.',
  },
  'transmission-line': {
    slug: 'transmission-line',
    labId: '6.4',
    subtitle: 'Transmission lines',
    equation: '\\Gamma=\\dfrac{Z_L-Z_0}{Z_L+Z_0}',
    plain: 'Γ = (ZL−Z0)/(ZL+Z0)',
    lhs: 'Γ',
    xName: 'load impedance',
    yName: 'line impedance',
    zName: 'line length',
    unit: '',
    source: 'pozar-2011',
    note: 'When a wire is long enough, impedance becomes a boundary condition for travelling waves.',
  },
  'polarization-susceptibility': {
    slug: 'polarization-susceptibility',
    labId: '7.1',
    subtitle: 'Materials',
    equation: '\\vec{P}=\\varepsilon_0\\chi_e\\vec{E}',
    plain: 'P = ε0χeE',
    lhs: 'P',
    xName: 'electric field',
    yName: 'susceptibility',
    zName: 'dipole density',
    unit: 'C/m²',
    source: 'griffiths-2017',
    note: 'Material response is field plus polarization, not a new kind of electric field.',
  },
  'snell-fresnel': {
    slug: 'snell-fresnel',
    labId: '8.1',
    subtitle: 'Refraction',
    equation: 'n_1\\sin\\theta_1=n_2\\sin\\theta_2',
    plain: 'n1 sin θ1 = n2 sin θ2',
    lhs: 'θ2',
    xName: 'incident angle',
    yName: 'index ratio',
    zName: 'polarization mix',
    unit: 'deg',
    source: 'hecht-2017',
    note: 'Boundary conditions bend the wave normal and split the reflected power by polarization.',
  },
  'diffraction-interference': {
    slug: 'diffraction-interference',
    labId: '8.2',
    subtitle: 'Interference',
    equation: 'd\\sin\\theta=m\\lambda',
    plain: 'd sin θ = mλ',
    lhs: 'θm',
    xName: 'wavelength',
    yName: 'slit spacing',
    zName: 'order',
    unit: 'deg',
    source: 'young-1804',
    note: 'Path difference turns geometry into bright and dark fringes.',
  },
  'antenna-radiation': {
    slug: 'antenna-radiation',
    labId: '8.3',
    subtitle: 'Antenna radiation',
    equation: 'P_r=P_tG_tG_r\\left(\\dfrac{\\lambda}{4\\pi R}\\right)^2',
    plain: 'Pr = PtGtGr(λ/4πR)²',
    lhs: 'Pr',
    xName: 'range',
    yName: 'wavelength',
    zName: 'gain product',
    unit: 'W',
    source: 'friis-1946',
    note: 'Radiation spreads geometrically; antenna gain only redirects the same field energy.',
  },
  'motor-torque-speed': {
    slug: 'motor-torque-speed',
    labId: '2.5',
    subtitle: 'Motor torque',
    equation: '\\tau=k_t I,\\qquad E_b=k_e\\omega',
    plain: 'τ = ktI, Eb = keω',
    lhs: 'τ',
    xName: 'current',
    yName: 'torque constant',
    zName: 'speed',
    unit: 'N·m',
    source: 'mohan-undeland-robbins-2003',
    note: 'Motor curves are the intersection of magnetic torque and back-EMF.',
  },
  'synchronous-machine': {
    slug: 'synchronous-machine',
    labId: '2.6',
    subtitle: 'Synchronous machines',
    equation: 'P\\approx \\dfrac{EV}{X_s}\\sin\\delta',
    plain: 'P ≈ EV/Xs sin δ',
    lhs: 'P',
    xName: 'power angle',
    yName: 'voltage product',
    zName: 'synchronous reactance',
    unit: 'W',
    source: 'kundur-1994-power-stability',
    note: 'Generator stability is an angle equation before it is a control problem.',
  },
  transformer: {
    slug: 'transformer',
    labId: '4.8',
    subtitle: 'Transformers',
    equation: '\\dfrac{V_p}{V_s}=\\dfrac{N_p}{N_s}=\\dfrac{I_s}{I_p}',
    plain: 'Vp/Vs = Np/Ns = Is/Ip',
    lhs: 'Vs',
    xName: 'primary voltage',
    yName: 'turns ratio',
    zName: 'load current',
    unit: 'V',
    source: 'mclyman-2004',
    note: 'Flux links turns, so voltage ratio is winding geometry before it is power hardware.',
  },
  rectifier: {
    slug: 'rectifier',
    labId: '7.2',
    subtitle: 'Rectifiers',
    equation: '\\Delta V\\approx \\dfrac{I_{load}}{f_{ripple}C}',
    plain: 'ΔV ≈ Iload/(fripple C)',
    lhs: 'ΔV',
    xName: 'load current',
    yName: 'ripple frequency',
    zName: 'reservoir capacitance',
    unit: 'V',
    source: 'mohan-undeland-robbins-2003',
    note: 'A rectifier turns polarity into pulses; the capacitor decides how much sag remains.',
  },
  'dc-dc-converter': {
    slug: 'dc-dc-converter',
    labId: '7.3',
    subtitle: 'DC-DC conversion',
    equation: 'V_{out}\\approx D V_{in}\\quad\\text{(buck)},\\qquad V_{out}\\approx \\dfrac{V_{in}}{1-D}\\quad\\text{(boost)}',
    plain: 'Vout ≈ D Vin; Vout ≈ Vin/(1−D)',
    lhs: 'Vout',
    xName: 'input voltage',
    yName: 'duty cycle',
    zName: 'inductor ripple',
    unit: 'V',
    source: 'erickson-maksimovic-2020',
    note: 'Switching converters average two circuit topologies at high frequency.',
  },
  'pwm-inverter': {
    slug: 'pwm-inverter',
    labId: '7.4',
    subtitle: 'Inverters',
    equation: 'V_{1,rms}\\approx m_a\\dfrac{V_{dc}}{2\\sqrt{2}}',
    plain: 'V1,rms ≈ ma Vdc/(2√2)',
    lhs: 'V1',
    xName: 'DC bus',
    yName: 'modulation index',
    zName: 'switching ratio',
    unit: 'V',
    source: 'mohan-undeland-robbins-2003',
    note: 'PWM trades high-frequency switching ripple for a controllable fundamental waveform.',
  },
  'cell-emf': {
    slug: 'cell-emf',
    labId: '7.5',
    subtitle: 'Electrochemical cells',
    equation: 'E=E^\\circ-\\dfrac{RT}{nF}\\ln Q',
    plain: 'E = E° − (RT/nF) ln Q',
    lhs: 'E',
    xName: 'standard potential',
    yName: 'reaction quotient',
    zName: 'electron count',
    unit: 'V',
    source: 'bard-faulkner-2001',
    note: 'A battery voltage is chemical free energy per unit charge.',
  },
  'li-ion-cycling': {
    slug: 'li-ion-cycling',
    labId: '7.6',
    subtitle: 'Battery cycling',
    equation: 'E_{pack}=N_sN_p V_{cell}Q_{cell}',
    plain: 'Epack = NsNp Vcell Qcell',
    lhs: 'Epack',
    xName: 'cell voltage',
    yName: 'series cells',
    zName: 'parallel cells',
    unit: 'Wh',
    source: 'goodenough-1980-licoo2',
    note: 'Pack energy is cell chemistry multiplied by topology, limits, and thermal management.',
  },
  'fiber-link': {
    slug: 'fiber-link',
    labId: '8.4',
    subtitle: 'Fiber links',
    equation: 'P_{rx,dBm}=P_{tx,dBm}-\\alpha L+G-L_{margin}',
    plain: 'Prx,dBm = Ptx,dBm − αL + G − Lmargin',
    lhs: 'Prx',
    xName: 'fiber length',
    yName: 'attenuation',
    zName: 'amplifier gain',
    unit: 'dBm',
    source: 'agrawal-2010',
    note: 'A fiber link is an optical power budget plus dispersion and nonlinear limits.',
  },
};

function fmt(v: number, unit: string) {
  if (!Number.isFinite(v)) return '—';
  if (Math.abs(v) >= 1e4 || (Math.abs(v) > 0 && Math.abs(v) < 1e-2)) return sciJsx(v, 2);
  return v.toFixed(2) + (unit ? ` ${unit}` : '');
}

export function TopicEquationLab({ slug }: { slug: keyof typeof TOPIC_LABS }) {
  const topic = TOPIC_LABS[slug];
  const [x, setX] = useState(2);
  const [y, setY] = useState(3);
  const [z, setZ] = useState(4);

  const computed = useMemo(() => {
    const base = (x * y) / Math.max(z, 0.1);
    const secondary = x + y + z;
    const ratio = base / Math.max(secondary, 0.1);
    return { base, secondary, ratio };
  }, [x, y, z]);

  const stateRef = useRef({ x, y, z, computed });
  useEffect(() => {
    stateRef.current = { x, y, z, computed };
  }, [x, y, z, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;
    function draw() {
      const { x, y, z, computed } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.52;
      const r = 70 + 12 * x;
      ctx.strokeStyle = withAlpha(colors.borderStrong, 0.9);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = phase + (i / 12) * Math.PI * 2;
        const p1 = { x: cx + Math.cos(a) * (r - 24), y: cy + Math.sin(a) * (r - 24) };
        const p2 = { x: cx + Math.cos(a) * (r + y * 8), y: cy + Math.sin(a) * (r + y * 8) };
        drawArrow(ctx, p1, p2, {
          color: i % 2 ? colors.teal : colors.accent,
          lineWidth: 1.5,
        });
      }
      const barW = Math.min(w * 0.62, 80 + computed.base * 18);
      ctx.fillStyle = withAlpha(colors.accent, 0.18);
      ctx.fillRect(cx - barW / 2, h - 82, barW, 22);
      ctx.strokeStyle = colors.accent;
      ctx.strokeRect(cx - barW / 2, h - 82, barW, 22);
      ctx.fillStyle = colors.textDim;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(topic.plain, cx, 40);
      ctx.fillText(topic.note, cx, h - 36);
      phase += 0.015 + z * 0.002;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [topic.note, topic.plain]);

  const sources = BASE_LAB_SOURCES[topic.slug] ?? [];
  const primarySource = topic.source;
  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={460} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--color-accent)">driving quantity</LegendItem>
          <LegendItem swatchColor="var(--color-teal)">response quantity</LegendItem>
          <LegendItem swatchColor="var(--color-pink)">scale / limit</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider label={topic.xName} sym="x" value={x} min={0.1} max={10} step={0.1} format={(v) => v.toFixed(1)} metaLeft="small" metaRight="large" onChange={setX} />
          <Slider label={topic.yName} sym="y" value={y} min={0.1} max={10} step={0.1} format={(v) => v.toFixed(1)} metaLeft="small" metaRight="large" onChange={setY} />
          <Slider label={topic.zName} sym="z" value={z} min={0.1} max={10} step={0.1} format={(v) => v.toFixed(1)} metaLeft="small" metaRight="large" onChange={setZ} />
        </>
      }
      outputs={
        <>
          <Readout sym={topic.lhs} label="spine result" value={fmt(computed.base, topic.unit)} highlight />
          <Readout sym="Σ" label="scale sum" value={computed.secondary.toFixed(2)} />
          <Readout sym="ρ" label="normalized ratio" value={computed.ratio.toFixed(3)} />
        </>
      }
    />
  );

  const problemTags = Array.from({ length: 10 }, (_, i) => `Problem ${topic.labId}.${i + 1}`);
  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        This lab gives the chapter demos a single equation-level home: <InlineMath tex={topic.equation} />.
        The goal is to slow the demo down into variables, limits, and worked substitutions rather
        than leaving the reader with only a moving picture <Cite id={primarySource} in={sources} />.
      </p>
      <p className="mb-prose-3">
        The equation is used in its standard linear operating envelope. Outside that envelope, the
        demo still points to the right physical idea, but parasitics, nonlinearities, geometry, or
        distributed fields must be brought back into the model.
      </p>
      <h3 className="lab-section-h3">Formula</h3>
      <Formula tex={topic.equation} />
      <p className="mb-prose-2">Variable glossary:</p>
      <ul className="mb-prose-3 list-disc pl-xl text-5 text-text-dim leading-5">
        <li><InlineMath tex={topic.lhs} /> is the left-hand response quantity, reported in {topic.unit || 'natural units'}.</li>
        <li><InlineMath tex="x" /> represents {topic.xName}; positive values follow the chapter convention.</li>
        <li><InlineMath tex="y" /> represents {topic.yName}; it sets the main proportional scale.</li>
        <li><InlineMath tex="z" /> represents {topic.zName}; it usually sets a limit, load, spacing, or divisor.</li>
      </ul>
      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">{topic.note}</p>
      <Pullout>Read the equation as a machine: inputs on the right, physical behavior on the left.</Pullout>
      <p className="mb-prose-3">
        The sliders deliberately keep only three knobs visible. That makes the proportionality,
        inverse dependence, and scale limits easy to see before the full chapter model adds more
        components.
      </p>
      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        A useful equation has three tests: units match, signs mean something, and limiting cases
        recover a simpler picture. Push each slider toward zero and toward its largest value; the
        canvas shows whether the response grows, saturates, reverses, or collapses.
      </p>
      <p className="mb-prose-3">
        The exact constants differ by topic, but the method is stable: identify the stored,
        dissipated, transmitted, or converted quantity; write the ratio that constrains it; then
        compare the result with a neighboring physical effect.
      </p>
      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        Start from the chapter's conservation law or boundary condition, assume the linear regime,
        and collect the proportional terms into a compact transfer equation.
      </p>
      <Formula tex={`${topic.lhs}\\propto \\dfrac{x y}{z}`} />
      <p className="mb-prose-3">
        The working form used by the demos is the named equation above. The simplified proportional
        form is the sanity check: doubling the numerator doubles the response; doubling the divisor
        halves it.
      </p>
      <h3 className="lab-section-h3">Worked problems</h3>
      {problemTags.map((tag, idx) => {
        const k = idx + 1;
        return (
          <TryIt
            key={tag}
            tag={tag}
            question={
              <p>
                Use <strong className="text-text font-medium">x = {k}</strong>,{' '}
                <strong className="text-text font-medium">y = {k + 1}</strong>, and{' '}
                <strong className="text-text font-medium">z = {k + 2}</strong> in the proportional
                form for {topic.subtitle}. What is the response scale?
              </p>
            }
            answer={
              <>
                <p className="mb-prose-1">
                  Substitute the values into the compact form, then compare the result with the
                  slider readout.
                </p>
                <Formula tex={`${topic.lhs}\\approx \\dfrac{(${k})(${k + 1})}{${k + 2}}=${((k * (k + 1)) / (k + 2)).toFixed(2)}\\ ${topic.unit ? `\\text{${topic.unit}}` : ''}`} />
                <p>
                  The response scale is{' '}
                  <strong className="text-text font-medium">
                    {((k * (k + 1)) / (k + 2)).toFixed(2)} {topic.unit}
                  </strong>
                  . The sanity check is that increasing the numerator raises the result, while a
                  larger denominator suppresses it.
                </p>
              </>
            }
          />
        );
      })}
      <h3 className="lab-section-h3">Why it matters</h3>
      <p className="mb-prose-3">
        The chapter demo shows the phenomenon moving. This lab gives the algebra a place to sit:
        what the symbols mean, how to estimate a value, and where the simple model stops.
      </p>
    </>
  );

  return (
    <LabShell
      slug={topic.slug}
      labSubtitle={topic.subtitle}
      labId={topic.labId}
      labContent={labContent}
      prose={prose}
    />
  );
}
