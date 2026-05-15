/**
 * Lab A.6 — RF Link / Antenna Matching
 *
 *   Γ = (Z_ant − Z₀) / (Z_ant + Z₀)
 *
 * A system lab: transmitter → coax → matching reactance → antenna → free
 * space → receive antenna. It combines transmission-line mismatch, antenna
 * gain, cable loss, and Friis free-space path loss.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { PHYS, pretty } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'rf-link';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;
const Z0 = 50;

interface RFPreset {
  id: string;
  label: string;
  freqMHz: number;
  txDbm: number;
  distanceM: number;
  cableM: number;
  lossDbPer100M: number;
  antR: number;
  antX: number;
  matchX: number;
  txGainDbi: number;
  rxGainDbi: number;
}

const PRESETS: RFPreset[] = [
  {
    id: 'wifi',
    label: '2.4 GHz patch link',
    freqMHz: 2450,
    txDbm: 18,
    distanceM: 20,
    cableM: 2,
    lossDbPer100M: 55,
    antR: 50,
    antX: 0,
    matchX: 0,
    txGainDbi: 6,
    rxGainDbi: 2,
  },
  {
    id: 'vhf',
    label: 'FM half-wave dipole',
    freqMHz: 98,
    txDbm: 30,
    distanceM: 1000,
    cableM: 12,
    lossDbPer100M: 4,
    antR: 73,
    antX: 8,
    matchX: -8,
    txGainDbi: 2.15,
    rxGainDbi: 2.15,
  },
  {
    id: 'whip',
    label: '433 MHz short whip',
    freqMHz: 433,
    txDbm: 10,
    distanceM: 60,
    cableM: 0.5,
    lossDbPer100M: 15,
    antR: 12,
    antX: -110,
    matchX: 85,
    txGainDbi: -4,
    rxGainDbi: 0,
  },
  {
    id: 'yagi',
    label: 'Directional Yagi hop',
    freqMHz: 915,
    txDbm: 27,
    distanceM: 5000,
    cableM: 8,
    lossDbPer100M: 20,
    antR: 50,
    antX: 0,
    matchX: 0,
    txGainDbi: 11,
    rxGainDbi: 11,
  },
];

function dbmToW(dbm: number) {
  return 10 ** ((dbm - 30) / 10);
}

function fmtDb(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)} dB`;
}

export default function RFLinkLab() {
  const [cfg, setCfg] = useState<RFPreset>(PRESETS[0]);

  const computed = useMemo(() => {
    const freqHz = cfg.freqMHz * 1e6;
    const lambdaM = PHYS.c / freqHz;
    const xTotal = cfg.antX + cfg.matchX;
    const zr = cfg.antR;
    const zi = xTotal;
    const numRe = zr - Z0;
    const denRe = zr + Z0;
    const denMag2 = denRe * denRe + zi * zi;
    const gammaRe = (numRe * denRe + zi * zi) / denMag2;
    const gammaIm = (zi * denRe - numRe * zi) / denMag2;
    const gammaMag = Math.min(0.999, Math.hypot(gammaRe, gammaIm));
    const vswr = (1 + gammaMag) / (1 - gammaMag);
    const mismatchLossDb = -10 * Math.log10(Math.max(1e-6, 1 - gammaMag * gammaMag));
    const reflectedPct = gammaMag * gammaMag * 100;
    const cableLossDb = cfg.cableM * cfg.lossDbPer100M / 100;
    const deliveredDbm = cfg.txDbm - cableLossDb - mismatchLossDb;
    const fsplDb = 20 * Math.log10((4 * Math.PI * Math.max(cfg.distanceM, 0.1)) / lambdaM);
    const rxDbm = deliveredDbm + cfg.txGainDbi + cfg.rxGainDbi - fsplDb;
    const deliveredW = dbmToW(deliveredDbm);
    const rxW = dbmToW(rxDbm);
    const matchQuality =
      vswr < 1.5 ? 'Excellent' :
      vswr < 2.5 ? 'Usable' :
      vswr < 5 ? 'Touchy' :
      'Bad match';
    return {
      lambdaM,
      xTotal,
      gammaMag,
      vswr,
      mismatchLossDb,
      reflectedPct,
      cableLossDb,
      deliveredDbm,
      deliveredW,
      fsplDb,
      rxDbm,
      rxW,
      matchQuality,
    };
  }, [cfg]);

  const stateRef = useRef({ cfg, computed });
  useEffect(() => {
    stateRef.current = { cfg, computed };
  }, [cfg, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function drawAntenna(x: number, y: number, gain: number, color: string) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + 56);
      ctx.lineTo(x, y - 42);
      ctx.moveTo(x - 28, y - 6);
      ctx.lineTo(x, y - 42);
      ctx.lineTo(x + 28, y - 6);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${gain.toFixed(1)} dBi`, x, y + 76);
    }

    function draw() {
      const { cfg, computed } = stateRef.current;
      phase += 0.035;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = colors.canvasBg;
      ctx.fillRect(0, 0, w, h);

      const y = h * 0.52;
      const txX = 72;
      const matchX = w * 0.35;
      const antX = w * 0.48;
      const rxX = w - 76;

      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const yy = 48 + i * 54;
        ctx.beginPath();
        ctx.moveTo(30, yy);
        ctx.lineTo(w - 30, yy);
        ctx.stroke();
      }

      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(txX - 42, y - 34, 84, 68, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.text;
      ctx.font = '13px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('TX', txX, y - 5);
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`${cfg.txDbm.toFixed(0)} dBm`, txX, y + 16);

      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(txX + 42, y);
      ctx.lineTo(matchX - 26, y);
      ctx.stroke();

      ctx.strokeStyle = colors.pink;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(matchX - 28, y - 12);
      ctx.lineTo(txX + 48, y - 12);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colors.surfaceHover;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(matchX - 26, y - 24, 52, 48, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.font = '12px JetBrains Mono';
      ctx.fillText('MATCH', matchX, y + 4);

      drawAntenna(antX, y, cfg.txGainDbi, colors.accent);

      const radiusBase = Math.min(w * 0.2, 130);
      for (let i = 0; i < 5; i++) {
        const radius = 26 + i * (radiusBase / 4) + ((phase * 12) % 18);
        ctx.strokeStyle = i % 2 === 0 ? colors.accent : colors.teal;
        ctx.globalAlpha = Math.max(0.08, 0.38 - i * 0.055);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(antX, y, radius, -0.75, 0.75);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      drawAntenna(rxX, y, cfg.rxGainDbi, colors.blue);

      ctx.fillStyle = colors.text;
      ctx.font = '13px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('RX', rxX, y - 84);
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`${cfg.distanceM >= 1000 ? (cfg.distanceM / 1000).toFixed(1) + ' km' : cfg.distanceM.toFixed(0) + ' m'}`, (antX + rxX) / 2, y - 108);

      ctx.fillStyle = colors.textDim;
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(`λ = ${computed.lambdaM.toFixed(3)} m`, 34, h - 58);
      ctx.fillText(`Z_ant = ${cfg.antR.toFixed(0)} ${computed.xTotal >= 0 ? '+' : '−'} j${Math.abs(computed.xTotal).toFixed(0)} Ω`, 34, h - 36);
      ctx.fillText(`VSWR ${computed.vswr.toFixed(2)} · reflected ${computed.reflectedPct.toFixed(1)}%`, 34, h - 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const applyPreset = (preset: RFPreset) => {
    setCfg({ ...preset });
  };

  const labContent = (
    <>
      <div className="flex flex-wrap gap-sm mb-lg">
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            className="eyebrow-muted tracking-[.08em] px-md py-sm rounded-pill border border-border-1 bg-color-3 text-color-5 hover:text-color-4 hover:border-border-2"
            onClick={() => applyPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <LabGrid
        canvas={<AutoResizeCanvas height={430} setup={setupCanvas} />}
        legend={
          <>
            <LegendItem swatchColor="var(--teal)">Forward coax power</LegendItem>
            <LegendItem swatchColor="var(--pink)">Reflected wave</LegendItem>
            <LegendItem swatchColor="var(--accent)">Radiated field</LegendItem>
            <LegendItem swatchColor="var(--blue)">Receive antenna</LegendItem>
          </>
        }
        inputs={
          <>
            <Slider
              sym="f" label="Frequency"
              value={cfg.freqMHz} min={30} max={3000} step={1}
              format={v => `${v.toFixed(0)} MHz`}
              metaLeft="30 MHz" metaRight="3 GHz"
              onChange={freqMHz => setCfg(prev => ({ ...prev, freqMHz }))}
            />
            <Slider
              sym="P" label="Transmitter power"
              value={cfg.txDbm} min={-10} max={40} step={1}
              format={v => `${v.toFixed(0)} dBm`}
              metaLeft="0.1 mW" metaRight="10 W"
              onChange={txDbm => setCfg(prev => ({ ...prev, txDbm }))}
            />
            <Slider
              sym="d" label="Path distance"
              value={cfg.distanceM} min={1} max={10000} step={1}
              format={v => v >= 1000 ? `${(v / 1000).toFixed(2)} km` : `${v.toFixed(0)} m`}
              metaLeft="1 m" metaRight="10 km"
              onChange={distanceM => setCfg(prev => ({ ...prev, distanceM }))}
            />
            <Slider
              sym="ℓ" label="Coax length"
              value={cfg.cableM} min={0} max={50} step={0.1}
              format={v => `${v.toFixed(1)} m`}
              metaLeft="0 m" metaRight="50 m"
              onChange={cableM => setCfg(prev => ({ ...prev, cableM }))}
            />
            <Slider
              sym="R" label="Antenna resistance"
              value={cfg.antR} min={5} max={150} step={1}
              format={v => `${v.toFixed(0)} Ω`}
              metaLeft="5 Ω" metaRight="150 Ω"
              onChange={antR => setCfg(prev => ({ ...prev, antR }))}
            />
            <Slider
              sym="X" label="Antenna reactance"
              value={cfg.antX} min={-200} max={200} step={1}
              format={v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} Ω`}
              metaLeft="capacitive" metaRight="inductive"
              onChange={antX => setCfg(prev => ({ ...prev, antX }))}
            />
            <Slider
              sym="Xₘ" label="Series matching reactance"
              value={cfg.matchX} min={-200} max={200} step={1}
              format={v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} Ω`}
              metaLeft="series C" metaRight="series L"
              onChange={matchX => setCfg(prev => ({ ...prev, matchX }))}
            />
          </>
        }
        outputs={
          <>
            <Readout sym="Pᵣ" label="Received power" value={`${computed.rxDbm.toFixed(1)}`} unit="dBm" highlight />
            <Readout sym="S" label="VSWR" value={computed.vswr > 20 ? '>20' : computed.vswr.toFixed(2)} />
            <Readout sym="Γ²" label="Reflected power" value={`${computed.reflectedPct.toFixed(1)}`} unit="%" />
            <Readout sym="Lₘ" label="Mismatch loss" value={fmtDb(-computed.mismatchLossDb)} />
            <Readout sym="L꜀" label="Cable loss" value={fmtDb(-computed.cableLossDb)} />
            <Readout sym="Lfs" label="Free-space path loss" value={fmtDb(-computed.fsplDb)} />
            <Readout sym="Pₐ" label="Delivered to antenna" valueHTML={pretty(computed.deliveredW)} unit="W" />
            <Readout sym="q" label="Match quality" value={computed.matchQuality} />
          </>
        }
      />
    </>
  );

  const prose = (
    <>
      <h3>Context</h3>
      <p>
        This lab is a miniature radio system. The transmitter does not simply "send power to an antenna"; it drives a
        transmission line, the line presents the antenna impedance back to the source, and any mismatch reflects energy back
        toward the transmitter. Transmission-line theory is the same field story from the Poynting chapter, just squeezed into
        coaxial geometry<Cite id="pozar-2011" in={SOURCES} />.
      </p>
      <p>
        Once power leaves the antenna, the receiving end is governed by the Friis transmission equation: gain helps, distance
        hurts, and wavelength sets the scale<Cite id="friis-1946" in={SOURCES} />. Antenna textbooks treat the half-wave
        dipole as the reference creature here: it is not magical, but it gives a clean impedance and a reproducible radiation
        pattern<Cite id="balanis-2016" in={SOURCES} />.
      </p>

      <h3>Formula</h3>
      <MathBlock>Γ = (Z<sub>ant</sub> − Z₀) / (Z<sub>ant</sub> + Z₀)</MathBlock>
      <p>
        Here <strong>Γ</strong> is the voltage reflection coefficient, <strong>Z<sub>ant</sub></strong> is the antenna impedance
        after any matching reactance, and <strong>Z₀</strong> is the line impedance. The reflected power fraction is
        <strong>|Γ|²</strong>. A perfect match has Γ = 0; a bad match sends useful transmitter power back down the cable.
      </p>

      <MathBlock>P<sub>r</sub> = P<sub>t</sub> G<sub>t</sub> G<sub>r</sub> (λ / 4πd)²</MathBlock>
      <p>
        This is the Friis free-space link equation. <strong>P<sub>t</sub></strong> is power delivered to the transmitting
        antenna, <strong>G<sub>t</sub></strong> and <strong>G<sub>r</sub></strong> are antenna gains as linear ratios,
        <strong>λ</strong> is wavelength, and <strong>d</strong> is separation. The lab displays the same accounting in dB
        because radio engineers live inside sums of gains and losses.
      </p>

      <Pullout>
        A radio link is not one idea. It is circuit impedance, wave propagation, antenna geometry, and energy accounting
        all refusing to be separated.
      </Pullout>

      <h3>Reasoning</h3>
      <p>
        Try the short-whip preset first. Its radiation resistance is small and its capacitive reactance is large, so the
        mismatch is ugly. Add positive series reactance: you are using an inductor to cancel the antenna's capacitive part.
        The VSWR falls because the line now sees something closer to 50 Ω. Then increase distance and watch the link budget
        lose power with the square of range.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labId="rf-link / Γ + Friis"
      labSubtitle="RF link budget + antenna match"
      labContent={labContent}
      prose={prose}
    />
  );
}
