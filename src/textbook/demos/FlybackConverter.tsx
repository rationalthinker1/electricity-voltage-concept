/**
 * Demo D19.8 — Flyback converter
 *
 * The canonical isolated SMPS topology. A single magnetic component is
 * both a transformer (for galvanic isolation) and a coupled inductor
 * (for energy storage):
 *
 *   On-time:   primary switch closed → V_in across primary
 *              → primary current ramps up, storing energy in the
 *                magnetising inductance. The secondary diode is reverse-
 *                biased (note the dot convention), so the secondary winding
 *                carries no current.
 *   Off-time:  primary switch opens. The primary current can't change
 *              instantly, so the magnetic energy flips polarity, the
 *              secondary diode conducts, and the stored energy is
 *              transferred to the output cap.
 *
 * Animated: arrows on each side during on/off phase. Bar chart of stored
 * energy in the core's magnetising inductance.
 */
import { useMemo, useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const F_SW = 100e3; // 100 kHz typical flyback frequency
const Lp = 200e-6; // 200 µH primary magnetising inductance
const ETA = 0.88; // typical flyback efficiency

export function FlybackConverterDemo({ figure }: Props) {
  const [Vin, setVin] = useState(325); // 325 V = peak of rectified 230 V mains
  const [duty, setDuty] = useState(0.45);
  const [turnsN, setTurnsN] = useState(10); // primary:secondary turns ratio n = Np/Ns

  const computed = useMemo(() => {
    // Discontinuous-conduction-mode flyback output voltage:
    // V_out (DCM) = V_in · D · sqrt(T_sw / (2 · L_p · I_out / V_in))   — depends on load
    // For the demo, use the simpler CCM result:
    //   V_out = (D / (1 − D)) · (V_in / n)
    const Vout = (duty / Math.max(1 - duty, 0.01)) * (Vin / turnsN);
    const Tsw = 1 / F_SW;
    const tOn = duty * Tsw;
    const Ipk = (Vin * tOn) / Lp;
    const E_stored = 0.5 * Lp * Ipk * Ipk; // energy per cycle stored in core
    const Pout = E_stored * F_SW * ETA; // average output power
    const Iout = Pout / Math.max(Vout, 0.1);
    return { Vout, Iout, Ipk, E_stored, Pout, Tsw, tOn };
  }, [Vin, duty, turnsN]);

  const stateRef = useSimState({ ...computed, duty });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, simTime) => {
      const { Vout, Ipk, E_stored, duty } = stateRef.current;
      const t = simTime;
      const phi = (t * 1.0) % 1;
      const onPhase = phi < duty;
      let storedFrac: number;
      if (onPhase) storedFrac = phi / duty;
      else storedFrac = 1 - (phi - duty) / Math.max(1 - duty, 0.01);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const coreCX = w * 0.5;
      const coreTop = h * 0.22;
      const coreBot = h * 0.78;
      const pX = coreCX - 30;
      const sX = coreCX + 30;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(pX, coreTop);
      ctx.lineTo(pX, coreBot);
      ctx.moveTo(sX, coreTop);
      ctx.lineTo(sX, coreBot);
      ctx.moveTo(pX, coreTop);
      ctx.lineTo(sX, coreTop);
      ctx.moveTo(pX, coreBot);
      ctx.lineTo(sX, coreBot);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = colors.canvasBg;
      ctx.beginPath();
      ctx.moveTo(pX - 3, (coreTop + coreBot) / 2);
      ctx.lineTo(pX + 3, (coreTop + coreBot) / 2);
      ctx.stroke();
      drawWinding(
        ctx,
        pX - 6,
        coreTop + 10,
        coreBot - 10,
        12,
        withAlpha(colors.accent, 0.95),
        'left',
      );
      drawWinding(
        ctx,
        sX + 6,
        coreTop + 10,
        coreBot - 10,
        6,
        withAlpha(colors.teal, 0.95),
        'right',
      );
      const pCX = pX - 60;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pX - 6, coreTop + 10);
      ctx.lineTo(pCX, coreTop + 10);
      ctx.moveTo(pX - 6, coreBot - 10);
      ctx.lineTo(pCX, coreBot - 10);
      ctx.stroke();
      drawLabel(ctx, { text: 'V_in', x: pCX - 2, y: (coreTop + coreBot) / 2, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      ctx.fillStyle = onPhase ? withAlpha(colors.accent, 0.95) : withAlpha(colors.textDim, 0.45);
      ctx.fillRect(pCX + 4, coreBot - 16, 14, 12);
      drawLabel(ctx, { text: onPhase ? 'ON' : 'off', x: pCX + 11, y: coreBot - 10, color: colors.bg, size: 9, font: '9px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      const sCX = sX + 60;
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(sX + 6, coreTop + 10);
      ctx.lineTo(sCX, coreTop + 10);
      ctx.moveTo(sX + 6, coreBot - 10);
      ctx.lineTo(sCX, coreBot - 10);
      ctx.stroke();
      const dY = coreTop + 10;
      const dCol = onPhase ? withAlpha(colors.textDim, 0.35) : withAlpha(colors.teal, 0.95);
      ctx.fillStyle = dCol;
      ctx.beginPath();
      ctx.moveTo(sCX - 8, dY - 5);
      ctx.lineTo(sCX - 8, dY + 5);
      ctx.lineTo(sCX, dY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = dCol;
      ctx.beginPath();
      ctx.moveTo(sCX, dY - 5);
      ctx.lineTo(sCX, dY + 5);
      ctx.stroke();
      drawLabel(ctx, { text: `V_out = ${Vout.toFixed(1)} V`, x: sCX + 6, y: (coreTop + coreBot) / 2, color: colors.teal, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });
      ctx.fillStyle = onPhase ? withAlpha(colors.accent, 0.95) : 'rgba(255,255,255,0.10)';
      drawArrowDown(ctx, pX - 18, coreTop + 30, 14);
      ctx.fillStyle = !onPhase ? withAlpha(colors.teal, 0.95) : 'rgba(255,255,255,0.10)';
      drawArrowUp(ctx, sX + 18, coreBot - 30, 14);
      drawLabel(ctx, { text: onPhase ? 'ON  —  storing energy in L_p' : 'OFF  —  dumping into C_out', x: w / 2, y: 6, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      const barX = w - 28;
      const barH = h * 0.6;
      const barTop = (h - barH) / 2;
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barTop, 14, barH);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.accent;
      const fillH = barH * Math.max(0, Math.min(1, storedFrac));
      ctx.fillRect(barX, barTop + barH - fillH, 14, fillH);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.75;
      drawLabel(ctx, { text: '½L·I²', x: barX + 7, y: barTop - 2, size: 9, font: '9px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.7;
      drawLabel(ctx, {
        x: w / 2,
        y: h - 18,
        text: `turns ratio n = N_p/N_s`,
        color: colors.textDim,
        align: 'center',
        baseline: 'top',
      });
      ctx.restore();
      ctx.strokeStyle = colors.borderStrong;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(coreCX, 22);
      ctx.lineTo(coreCX, h - 26);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.globalAlpha = 0.65;
      drawLabel(ctx, {
        x: 6,
        y: h - 16,
        text: `I_pk = ${Ipk.toFixed(2)} A,  E/cycle = ${(E_stored * 1e6).toFixed(1)} µJ`,
        color: colors.textDim,
        size: 9,
        baseline: 'top',
      });
      ctx.restore();
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Flyback: one magnet, two phases"
      question="Watch the energy bar. The primary fills the core; the secondary empties it. The transformer never carries both sides at once."
      caption={
        <>
          A flyback uses a coupled inductor as both energy store and isolation barrier. On-time:
          primary switch closed, current ramps as V<sub>in</sub>/L<sub>p</sub>, energy accumulates
          as ½ L<sub>p</sub> I². Off-time: switch opens, the magnetic field collapses, the secondary
          diode conducts, and the stored energy is delivered into the output cap through the
          isolated secondary winding. Output voltage (CCM, ideal):
          <strong>
            {' '}
            V<sub>out</sub> = (D / (1 − D)) · V<sub>in</sub> / n
          </strong>
          , where n = N<sub>p</sub>/N<sub>s</sub>. This is the topology inside almost every USB
          charger above ~5 W.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_in (rect.)"
          value={Vin}
          min={50}
          max={400}
          step={5}
          format={(v) => Math.round(v) + ' V'}
          onChange={setVin}
        />
        <MiniSlider
          label="duty D"
          value={duty}
          min={0.1}
          max={0.8}
          step={0.01}
          format={(v) => (v * 100).toFixed(0) + ' %'}
          onChange={setDuty}
        />
        <MiniSlider
          label="n = N_p/N_s"
          value={turnsN}
          min={2}
          max={30}
          step={1}
          format={(v) => `${Math.round(v)} : 1`}
          onChange={(v) => setTurnsN(Math.round(v))}
        />
        <MiniReadout label="V_out" value={<Num value={computed.Vout} digits={1} />} unit="V" />
        <MiniReadout
          label="I_out (avg)"
          value={<Num value={computed.Iout} digits={2} />}
          unit="A"
        />
        <MiniReadout
          label="I_pk primary"
          value={<Num value={computed.Ipk} digits={2} />}
          unit="A"
        />
        <MiniReadout label="P_out" value={<Num value={computed.Pout} digits={2} />} unit="W" />
      </DemoControls>
      <EquationStrip
        leftLabel="Flyback output voltage (CCM)"
        left={<InlineMath tex="V_{\text{out}} = \frac{D}{1-D} \cdot \frac{V_{\text{in}}}{n}" />}
        rightLabel="At current settings"
        right={<InlineMath tex={`\\frac{${(duty * 100).toFixed(0)}\\%}{${((1 - duty) * 100).toFixed(0)}\\%} \\cdot \\frac{${Math.round(Vin)}}{${Math.round(turnsN)}} = ${computed.Vout.toFixed(1)}\\,\\text{V}`} />}
      />
    </Demo>
  );
}

function drawWinding(
  ctx: CanvasRenderingContext2D,
  cx: number,
  yTop: number,
  yBot: number,
  turns: number,
  color: string,
  side: 'left' | 'right',
) {
  const dy = (yBot - yTop) / turns;
  for (let i = 0; i < turns; i++) {
    const y = yTop + (i + 0.5) * dy;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    if (side === 'left') {
      ctx.ellipse(cx, y, 10, dy * 0.45, 0, Math.PI / 2, (3 * Math.PI) / 2);
    } else {
      ctx.ellipse(cx, y, 10, dy * 0.45, 0, -Math.PI / 2, Math.PI / 2);
    }
    ctx.stroke();
  }
}

function drawArrowDown(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x + 4, y);
  ctx.lineTo(x + 4, y + h - 6);
  ctx.lineTo(x + 8, y + h - 6);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x - 8, y + h - 6);
  ctx.lineTo(x - 4, y + h - 6);
  ctx.closePath();
  ctx.fill();
}
function drawArrowUp(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x + 4, y);
  ctx.lineTo(x + 4, y - h + 6);
  ctx.lineTo(x + 8, y - h + 6);
  ctx.lineTo(x, y - h);
  ctx.lineTo(x - 8, y - h + 6);
  ctx.lineTo(x - 4, y - h + 6);
  ctx.closePath();
  ctx.fill();
}
