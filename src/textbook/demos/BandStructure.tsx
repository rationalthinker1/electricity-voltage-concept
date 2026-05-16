/**
 * Demo D14.1 — Band structure of common semiconductors
 *
 * A 1D energy diagram: filled valence band on the bottom, empty conduction
 * band on top, with the bandgap E_g between. The reader picks Si, Ge,
 * GaAs, or diamond; each has a distinct bandgap. A temperature slider
 * changes the carrier population through the Boltzmann factor
 *
 *     n / N_0 ∝ exp(−E_g / 2 kT)
 *
 * (the 2 in the denominator is the standard intrinsic-semiconductor
 * factor; see Streetman & Banerjee §3.3). The conduction band fills with
 * a density proportional to that occupation factor, drawn as a faint
 * orange band at the top.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';

interface Props {
  figure?: string;
}

type MatKind = 'si' | 'ge' | 'gaas' | 'diamond';

// Bandgap energies in eV — from CRC Handbook / Streetman & Banerjee Ch.3.
const MATERIALS: Record<MatKind, { label: string; Eg: number; color: string }> = {
  si: { label: 'Silicon (Si)', Eg: 1.12, color: 'rgba(255,107,42,0.95)' },
  ge: { label: 'Germanium (Ge)', Eg: 0.67, color: 'rgba(108,197,194,0.95)' },
  gaas: { label: 'Gallium arsenide (GaAs)', Eg: 1.42, color: 'rgba(255,59,110,0.95)' },
  diamond: { label: 'Diamond (C)', Eg: 5.5, color: 'rgba(91,174,248,0.95)' },
};

const EV = 1.602176634e-19; // J per eV — matches PHYS.e

function occupancy(Eg: number, T: number): number {
  // Boltzmann tail at the conduction-band edge for an intrinsic
  // semiconductor: n/N_C ≈ exp(−E_g / 2 kT).
  const kT_J = PHYS.k_B * T;
  const kT_eV = kT_J / EV;
  return Math.exp(-Eg / (2 * kT_eV));
}

export function BandStructureDemo({ figure }: Props) {
  const [mat, setMat] = useState<MatKind>('si');
  const [T, setT] = useState(300);

  const { Eg, label } = MATERIALS[mat];
  const occ = useMemo(() => occupancy(Eg, T), [Eg, T]);
  const kT_meV = ((PHYS.k_B * T) / EV) * 1000;

  const stateRef = useRef({ mat, T });
  useEffect(() => {
    stateRef.current = { mat, T };
  }, [mat, T]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { mat, T } = stateRef.current;
      const { Eg, color } = MATERIALS[mat];
      const occ = occupancy(Eg, T);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 70,
        padR = 30,
        padT = 28,
        padB = 30;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // y-axis covers 0..6 eV; map energy → y.
      const Emax = 6.5;
      const yOf = (e: number) => padT + plotH * (1 - e / Emax);

      // axis
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // y-axis ticks every 1 eV
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let e = 0; e <= 6; e++) {
        ctx.fillText(`${e} eV`, padL - 6, yOf(e));
        ctx.restore();
        ctx.strokeStyle = colors.border;
        ctx.beginPath();
        ctx.moveTo(padL, yOf(e));
        ctx.lineTo(padL + plotW, yOf(e));
        ctx.stroke();
      }

      // Valence band: a filled slab from 0 to E_v ≡ 0 (we put VB top at 0).
      // We'll show the VB as a filled slab from y(−0.7) up to y(0).
      const vbTop = 0;
      const vbBot = -0.8;
      const cbBot = Eg;
      const cbTop = Eg + 0.8;

      // VB filled — full
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = colors.blue;
      ctx.fillRect(padL, yOf(vbTop), plotW, yOf(vbBot) - yOf(vbTop));
      ctx.restore();

      // CB filled in proportion to occupancy
      const cbHeight = yOf(cbBot) - yOf(cbTop);
      // Use sqrt(occ) for visibility — pure exp dies below printable opacity.
      const cbFillH = Math.min(cbHeight, cbHeight * Math.sqrt(occ) * 4);
      const cbFillTop = yOf(cbBot) - cbFillH;
      ctx.fillStyle = color.replace('0.95', String(Math.min(0.85, 0.05 + 6 * Math.sqrt(occ))));
      ctx.fillRect(padL, cbFillTop, plotW, cbFillH);

      // band edges as thin solid lines
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(padL, yOf(vbTop));
      ctx.lineTo(padL + plotW, yOf(vbTop));
      ctx.moveTo(padL, yOf(cbBot));
      ctx.lineTo(padL + plotW, yOf(cbBot));
      ctx.stroke();
      ctx.restore();

      // gap arrow + label
      const arrowX = padL + 60;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(arrowX, yOf(vbTop));
      ctx.lineTo(arrowX, yOf(cbBot));
      ctx.stroke();
      // arrowheads
      ctx.beginPath();
      ctx.moveTo(arrowX, yOf(vbTop));
      ctx.lineTo(arrowX - 4, yOf(vbTop) - 6);
      ctx.lineTo(arrowX + 4, yOf(vbTop) - 6);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(arrowX, yOf(cbBot));
      ctx.lineTo(arrowX - 4, yOf(cbBot) + 6);
      ctx.lineTo(arrowX + 4, yOf(cbBot) + 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = colors.text;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`E_g = ${Eg.toFixed(2)} eV`, arrowX + 10, (yOf(vbTop) + yOf(cbBot)) / 2);

      // band labels
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.fillText('valence band (full)', padL + plotW - 150, yOf(-0.4));
      ctx.fillText('conduction band', padL + plotW - 150, yOf(cbBot + 0.4));

      // header
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `${MATERIALS[mat].label}   T = ${T.toFixed(0)} K   kT = ${(((PHYS.k_B * T) / EV) * 1000).toFixed(1)} meV   exp(−E_g/2kT) ≈ ${occ.toExponential(2)}`,
        padL,
        6,
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.1'}
      title="Energy bands and the bandgap"
      question="Why is silicon a useful semiconductor and diamond not? Pick a material and a temperature; watch the conduction band fill."
      caption={
        <>
          At T = 0 the valence band is full and the conduction band is empty — no conduction. At
          finite T, thermally-excited electrons populate the CB with a Boltzmann factor
          exp(−E_g/2kT). Si (1.12 eV) and Ge (0.67 eV) give measurable conduction at room
          temperature; diamond (5.50 eV) is a near-perfect insulator; GaAs (1.42 eV) is the standard
          direct-gap material for LEDs and lasers.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <label className="mini-slider">
          <span className="mini-slider-label">material</span>
          <select
            value={mat}
            onChange={(e) => setMat(e.target.value as MatKind)}
            style={{
              background: '#1c1c22',
              color: '#ecebe5',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 4,
              padding: '2px 8px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
            }}
          >
            {(Object.keys(MATERIALS) as MatKind[]).map((k) => (
              <option key={k} value={k}>
                {MATERIALS[k].label}
              </option>
            ))}
          </select>
        </label>
        <MiniSlider
          label="T"
          value={T}
          min={50}
          max={800}
          step={5}
          format={(v) => v.toFixed(0) + ' K'}
          onChange={setT}
        />
        <MiniReadout label="E_g" value={Eg.toFixed(2)} unit="eV" />
        <MiniReadout label="kT" value={kT_meV.toFixed(1)} unit="meV" />
        <MiniReadout label="occ." value={<Num value={occ} />} />
        <MiniReadout label="label" value={label} />
      </DemoControls>
    </Demo>
  );
}
