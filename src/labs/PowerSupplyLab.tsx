/**
 * Lab A.7 — Power Supply Designer
 *
 *   V_ripple ≈ I_load / (f_ripple C)
 *
 * A system lab for the classic linear AC-to-DC supply: transformer,
 * rectifier, reservoir capacitor, regulator, and load.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import {prettyJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'power-supply';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

type RectifierKind = 'half' | 'full-center' | 'bridge';
type RegulatorKind = 'none' | '5V' | '12V';

interface SupplyPreset {
  id: string;
  label: string;
  mainsVrms: number;
  lineHz: number;
  secondaryVrms: number;
  rectifier: RectifierKind;
  diodeDropV: number;
  capUF: number;
  loadA: number;
  copperLossPct: number;
  regulator: RegulatorKind;
}

const PRESETS: SupplyPreset[] = [
  {
    id: 'usb',
    label: '5 V linear supply',
    mainsVrms: 120,
    lineHz: 60,
    secondaryVrms: 9,
    rectifier: 'bridge',
    diodeDropV: 0.8,
    capUF: 2200,
    loadA: 0.7,
    copperLossPct: 8,
    regulator: '5V' },
  {
    id: 'relay',
    label: '12 V relay rail',
    mainsVrms: 120,
    lineHz: 60,
    secondaryVrms: 15,
    rectifier: 'bridge',
    diodeDropV: 0.9,
    capUF: 3300,
    loadA: 1.2,
    copperLossPct: 9,
    regulator: '12V' },
  {
    id: 'ripple',
    label: 'Undersized capacitor',
    mainsVrms: 120,
    lineHz: 60,
    secondaryVrms: 12,
    rectifier: 'bridge',
    diodeDropV: 0.85,
    capUF: 470,
    loadA: 1.5,
    copperLossPct: 10,
    regulator: '12V' },
  {
    id: 'center',
    label: 'Center-tap full-wave',
    mainsVrms: 230,
    lineHz: 50,
    secondaryVrms: 18,
    rectifier: 'full-center',
    diodeDropV: 0.75,
    capUF: 4700,
    loadA: 1.0,
    copperLossPct: 7,
    regulator: '12V' },
];

function rectifierLabel(kind: RectifierKind) {
  if (kind === 'half') return 'Half-wave';
  if (kind === 'full-center') return 'Full-wave CT';
  return 'Bridge';
}

function regulatorTarget(kind: RegulatorKind) {
  if (kind === '5V') return 5;
  if (kind === '12V') return 12;
  return null;
}

export default function PowerSupplyLab() {
  const [cfg, setCfg] = useState<SupplyPreset>(PRESETS[0]);

  const computed = useMemo(() => {
    const rippleHz = cfg.rectifier === 'half' ? cfg.lineHz : 2 * cfg.lineHz;
    const conductingDiodes = cfg.rectifier === 'bridge' ? 2 : 1;
    const capF = cfg.capUF * 1e-6;
    const vPeakIdeal = cfg.secondaryVrms * Math.SQRT2;
    const vPeak = Math.max(0, vPeakIdeal - conductingDiodes * cfg.diodeDropV);
    const rippleV = cfg.loadA / Math.max(1e-9, rippleHz * capF);
    const vMin = Math.max(0, vPeak - rippleV);
    const vDc = Math.max(0, vPeak - rippleV / 2);
    const target = regulatorTarget(cfg.regulator);
    const dropoutV = target === null ? 0 : 2;
    const vOut = target === null ? vDc : (vMin >= target + dropoutV ? target : Math.max(0, vMin - dropoutV));
    const inRegulation = target === null || Math.abs(vOut - target) < 0.05;
    const pLoad = vOut * cfg.loadA;
    const pCapBus = vDc * cfg.loadA;
    const diodeHeat = conductingDiodes * cfg.diodeDropV * cfg.loadA;
    const regulatorHeat = Math.max(0, (vDc - vOut) * cfg.loadA);
    const copperHeat = pCapBus * cfg.copperLossPct / 100;
    const pIn = pLoad + diodeHeat + regulatorHeat + copperHeat;
    const efficiency = pIn > 0 ? 100 * pLoad / pIn : 0;
    const ripplePct = vDc > 0 ? 100 * rippleV / vDc : 0;
    return {
      rippleHz,
      conductingDiodes,
      vPeak,
      rippleV,
      vMin,
      vDc,
      target,
      dropoutV,
      vOut,
      inRegulation,
      pLoad,
      diodeHeat,
      regulatorHeat,
      copperHeat,
      pIn,
      efficiency,
      ripplePct };
  }, [cfg]);

  const stateRef = useRef({ cfg, computed });
  useEffect(() => {
    stateRef.current = { cfg, computed };
  }, [cfg, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function block(x: number, y: number, width: number, label: string, color: string) {
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x - width / 2, y - 30, width, 60, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 4);
    }

    function draw() {
      const { cfg, computed } = stateRef.current;
      phase += 0.025;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = colors.canvasBg;
      ctx.fillRect(0, 0, w, h);

      const y = 96;
      const xs = [70, w * 0.27, w * 0.46, w * 0.65, w - 76];
      block(xs[0], y, 82, 'AC', colors.textDim);
      block(xs[1], y, 112, 'XFMR', colors.teal);
      block(xs[2], y, 118, rectifierLabel(cfg.rectifier).toUpperCase(), colors.accent);
      block(xs[3], y, 96, 'CAP', colors.blue);
      block(xs[4], y, 92, cfg.regulator === 'none' ? 'LOAD' : 'REG', colors.pink);

      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 2;
      for (let i = 0; i < xs.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(xs[i] + 44, y);
        ctx.lineTo(xs[i + 1] - 56, y);
        ctx.stroke();
      }

      const waveX = 42;
      const waveY = 184;
      const waveW = w - 84;
      const waveH = 170;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.strokeRect(waveX, waveY, waveW, waveH);
      ctx.fillStyle = colors.textDim;
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('secondary AC → rectified capacitor bus', waveX, waveY - 12);

      const mid = waveY + waveH * 0.58;
      const scale = waveH * 0.36 / Math.max(1, computed.vPeak);
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(waveX, mid);
      ctx.lineTo(waveX + waveW, mid);
      ctx.stroke();

      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      for (let i = 0; i <= waveW; i++) {
        const t = (i / waveW) * Math.PI * 6 + phase;
        const v = Math.sin(t) * cfg.secondaryVrms * Math.SQRT2;
        const px = waveX + i;
        const py = mid - v * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= waveW; i++) {
        const cycle = (i / waveW) * 6 + phase / Math.PI;
        const frac = cycle - Math.floor(cycle);
        const rectified = cfg.rectifier === 'half'
          ? Math.max(0, Math.sin(cycle * Math.PI))
          : Math.abs(Math.sin(cycle * Math.PI));
        const charge = computed.vPeak * rectified;
        const saw = computed.vPeak - computed.rippleV * frac;
        const bus = Math.max(computed.vMin, Math.max(charge, saw));
        const px = waveX + i;
        const py = mid - bus * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      if (computed.target !== null) {
        ctx.strokeStyle = computed.inRegulation ? colors.pink : colors.textMuted;
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 7]);
        const py = mid - computed.target * scale;
        ctx.beginPath();
        ctx.moveTo(waveX, py);
        ctx.lineTo(waveX + waveW, py);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = colors.textDim;
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(`Vpeak ${computed.vPeak.toFixed(1)} V`, waveX + 10, waveY + 20);
      ctx.fillText(`ripple ${computed.rippleV.toFixed(2)} Vpp`, waveX + 10, waveY + 40);
      ctx.fillText(computed.inRegulation ? 'regulator has headroom' : 'regulator dropout', waveX + 10, waveY + 60);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const labContent = (
    <>
      <div className="flex flex-wrap gap-sm mb-lg">
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            className="eyebrow-muted tracking-3 px-md py-sm rounded-pill border border-border-1 bg-bg-card text-text-dim hover:text-text hover:border-border-2"
            onClick={() => setCfg({ ...preset })}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <LabGrid
        canvas={<AutoResizeCanvas height={390} setup={setupCanvas} />}
        legend={
          <>
            <LegendItem swatchColor="var(--teal)">Secondary AC</LegendItem>
            <LegendItem swatchColor="var(--accent)">Capacitor bus</LegendItem>
            <LegendItem swatchColor="var(--pink)">Regulated target</LegendItem>
          </>
        }
        inputs={
          <>
            <div className="slider-group">
              <div className="slider-head">
                <span className="slider-label"><span className="sym">∿</span>Rectifier</span>
                <span className="slider-value">{rectifierLabel(cfg.rectifier)}</span>
              </div>
              <select
                className="material-select"
                value={cfg.rectifier}
                onChange={e => setCfg(prev => ({ ...prev, rectifier: e.target.value as RectifierKind }))}
              >
                <option value="half">Half-wave</option>
                <option value="full-center">Full-wave center tap</option>
                <option value="bridge">Bridge</option>
              </select>
            </div>
            <div className="slider-group">
              <div className="slider-head">
                <span className="slider-label"><span className="sym">Vreg</span>Regulator</span>
                <span className="slider-value">{cfg.regulator === 'none' ? 'None' : cfg.regulator}</span>
              </div>
              <select
                className="material-select"
                value={cfg.regulator}
                onChange={e => setCfg(prev => ({ ...prev, regulator: e.target.value as RegulatorKind }))}
              >
                <option value="none">No regulator</option>
                <option value="5V">5 V linear regulator</option>
                <option value="12V">12 V linear regulator</option>
              </select>
            </div>
            <Slider
              sym="V₂" label="Transformer secondary"
              value={cfg.secondaryVrms} min={4} max={30} step={0.1}
              format={v => `${v.toFixed(1)} Vrms`}
              metaLeft="4 V" metaRight="30 V"
              onChange={secondaryVrms => setCfg(prev => ({ ...prev, secondaryVrms }))}
            />
            <Slider
              sym="f" label="Line frequency"
              value={cfg.lineHz} min={50} max={60} step={10}
              format={v => `${v.toFixed(0)} Hz`}
              metaLeft="50 Hz" metaRight="60 Hz"
              onChange={lineHz => setCfg(prev => ({ ...prev, lineHz }))}
            />
            <Slider
              sym="C" label="Reservoir capacitor"
              value={cfg.capUF} min={100} max={10000} step={10}
              format={v => `${v.toFixed(0)} µF`}
              metaLeft="100 µF" metaRight="10000 µF"
              onChange={capUF => setCfg(prev => ({ ...prev, capUF }))}
            />
            <Slider
              sym="I" label="Load current"
              value={cfg.loadA} min={0.05} max={3} step={0.01}
              format={v => `${v.toFixed(2)} A`}
              metaLeft="50 mA" metaRight="3 A"
              onChange={loadA => setCfg(prev => ({ ...prev, loadA }))}
            />
            <Slider
              sym="Vd" label="Diode drop"
              value={cfg.diodeDropV} min={0.25} max={1.1} step={0.01}
              format={v => `${v.toFixed(2)} V`}
              metaLeft="Schottky" metaRight="silicon"
              onChange={diodeDropV => setCfg(prev => ({ ...prev, diodeDropV }))}
            />
          </>
        }
        outputs={
          <>
            <Readout sym="Vout" label="Output voltage" value={`${computed.vOut.toFixed(2)}`} unit="V" highlight />
            <Readout sym="ΔV" label="Ripple" value={`${computed.rippleV.toFixed(2)}`} unit="Vpp" />
            <Readout sym="Vmin" label="Capacitor valley" value={`${computed.vMin.toFixed(2)}`} unit="V" />
            <Readout sym="fᵣ" label="Ripple frequency" value={`${computed.rippleHz.toFixed(0)}`} unit="Hz" />
            <Readout sym="η" label="Efficiency" value={`${computed.efficiency.toFixed(1)}`} unit="%" />
            <Readout sym="Pload" label="Load power" value={prettyJsx(computed.pLoad)} unit="W" />
            <Readout sym="Pd" label="Diode heat" value={prettyJsx(computed.diodeHeat)} unit="W" />
            <Readout sym="Preg" label="Regulator heat" value={prettyJsx(computed.regulatorHeat)} unit="W" />
            <Readout sym="q" label="State" value={computed.inRegulation ? 'In regulation' : 'Dropout'} />
          </>
        }
      />
    </>
  );

  const prose = (
    <>
      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Context</h3>
      <p className="mb-prose-3">
        This is the old-school supply hiding inside thousands of instruments: line AC enters a transformer, the transformer
        sets the safe secondary voltage, the rectifier folds the waveform, the capacitor stores charge between peaks, and the
        regulator burns excess voltage into heat. It is simpler than a modern switch-mode converter, which is exactly why it
        makes the physics visible<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The transformer belongs to Faraday's law and magnetic coupling; the rectifier belongs to semiconductor junctions; the
        capacitor ripple is charge conservation; the heat is Joule's law. Power-electronics texts package the same ideas into
        more efficient switched converters, but the accounting begins here<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Formula</h3>
      <MathBlock>ΔV ≈ I<sub>load</sub> / (f<sub>ripple</sub> C)</MathBlock>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">ΔV</strong> is the approximate peak-to-peak capacitor ripple in volts, <strong className="text-text font-medium">I<sub>load</sub></strong> is
        the DC load current in amperes, <strong className="text-text font-medium">f<sub>ripple</sub></strong> is the recharge rate after rectification, and
        <strong className="text-text font-medium">C</strong> is the reservoir capacitance in farads. Half-wave rectifiers recharge once per line cycle; full-wave
        and bridge rectifiers recharge twice per line cycle.
      </p>

      <MathBlock>V<sub>pk</sub> ≈ √2 V<sub>rms</sub> − n V<sub>d</sub></MathBlock>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">V<sub>pk</sub></strong> is the capacitor's ideal peak voltage, <strong className="text-text font-medium">V<sub>rms</sub></strong> is the
        transformer secondary RMS voltage, <strong className="text-text font-medium">n</strong> is the number of conducting diodes in the current path, and
        <strong className="text-text font-medium">V<sub>d</sub></strong> is the forward drop per diode.
      </p>

      <Pullout>
        A power supply is a negotiation: enough voltage for regulation, enough capacitance for ripple, and not so much excess
        that the heat sink becomes the real circuit.
      </Pullout>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Reasoning</h3>
      <p className="mb-prose-3">
        Load current makes ripple larger because the capacitor is drained faster between recharge peaks. Bigger capacitance
        makes ripple smaller because the same charge removal causes less voltage sag. A bridge rectifier costs two diode drops
        but uses the whole transformer winding on both half-cycles; a center-tapped full-wave rectifier costs one diode drop
        but needs a split secondary. The regulator only works while the capacitor valley stays above the target plus dropout.
      </p>
      <p className="mb-prose-3">
        The deliberately bad preset is the lesson: the average DC bus may look high enough, but the valley falls under the
        regulator headroom. That is why real supplies are designed from worst-case line voltage, maximum load, diode heating,
        transformer regulation, and capacitor tolerance rather than from a single pleasant nominal number<Cite id="mclyman-2004" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labId="power-supply / transformer + rectifier + capacitor"
      labSubtitle="AC-to-DC supply design"
      labContent={labContent}
      prose={prose}
    />
  );
}
