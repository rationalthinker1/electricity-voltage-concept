/**
 * Demo D7.x — Magnet falling through a copper tube
 *
 * Side view of a vertical copper-walled tube with a small bar magnet
 * falling through the bore. As the magnet moves, the changing flux through
 * each thin slice of tube wall induces an azimuthal eddy current loop;
 * those loops produce a magnetic field that opposes the motion (Lenz),
 * exerting a drag F_drag ∝ v on the magnet.
 *
 * Steady-state terminal velocity is reached when gravity balances drag:
 *   m g  =  k v_term,
 * where the effective drag coefficient k scales as
 *   k ≈ (B² L² / R)
 * for a thin-walled tube of resistance R per ring and effective coupling
 * length L. We expose tube wall thickness as a slider; thicker walls
 * lower R, raise k, drop v_term.
 *
 * The demo is qualitative — the absolute number is wrong by an O(1)
 * factor — but the *scaling* is real: double the wall thickness and the
 * terminal velocity halves.
 */
import { useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { withAlpha } from '@/lib/canvasTheme';
import { drawLabel } from '@/lib/canvasLayout';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

interface EddyCtx {
  y: number; // magnet position in world metres (0 = top of tube)
  v: number; // velocity m/s, downward positive
}

// World scale: tube is 1.0 m long. Magnet starts at y = 0 (top of bore).
const TUBE_LEN_M = 1.0;
const MAGNET_MASS_KG = 0.05; // 50 g neodymium-sized
const G = 9.81;

// Effective drag-coefficient model. The user's slider controls "wall thickness"
// (mm); we map that into a coefficient k (N·s/m). At 2 mm wall the magnet
// reaches a few cm/s — the canonical demo number for a strong neo magnet
// through a thick copper pipe.
function dragCoeff(wall_mm: number): number {
  // k ∝ wall thickness for a thin wall (resistance ∝ 1/t → conductance ∝ t).
  // Pick a constant so 2 mm gives k ≈ 0.5 N·s/m → v_term ≈ 1 m/s for m=0.05 kg.
  // Then a 10× drop yields v_term in the few-cm/s regime classic copper-tube
  // demos display.
  return 0.5 * (wall_mm / 2);
}

export function EddyCurrentTubeDemo({ figure }: Props) {
  const [wall_mm, setWallMm] = useState(2.0);
  const [running, setRunning] = useState(true);

  // Settable button to reset the magnet to the top
  const [resetTick, setResetTick] = useState(0);

  const stateRef = useSimState({ wall_mm, running });

  // Live readouts
  const [v, setV] = useState(0);
  const setVRef = useRef(setV);
  setVRef.current = setV;

  // Terminal velocity: mg = kv → v_term = mg/k.
  const k = dragCoeff(wall_mm);
  const v_term = (MAGNET_MASS_KG * G) / k;

  // Reset on demand
  useEffect(() => {
    // resetTick increments → useSimLoop deps change → re-init context
  }, [resetTick]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, dt, simTime, c: EddyCtx) => {
      const { wall_mm, running } = state;

      // Integrate motion. m dv/dt = m g − k v, with k a function of wall.
      const kNow = dragCoeff(wall_mm);
      if (running) {
        const dvdt = G - (kNow * c.v) / MAGNET_MASS_KG;
        c.v += dvdt * dt;
        c.y += c.v * dt;
        // Bottom-of-tube boundary: stop falling once magnet exits.
        if (c.y > TUBE_LEN_M + 0.15) {
          c.v = 0;
          c.y = TUBE_LEN_M + 0.15;
        }
      }

      // Sample readout every ~12 Hz
      const flickerPhase = Math.floor(simTime * 12);
      if (flickerPhase !== (c as unknown as { _flick: number })._flick) {
        (c as unknown as { _flick: number })._flick = flickerPhase;
        setVRef.current(c.v);
      }

      // Background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Layout. The tube runs vertically near the centre of the canvas.
      const padT = 30,
        padB = 30;
      const tubeYTop = padT;
      const tubeYBot = h - padB;
      const cx = w / 2;
      const tubeOuter = 90;
      const tubeBore = 50;
      // Map world y in [0, TUBE_LEN_M] to canvas y in [tubeYTop, tubeYBot]
      const yPx = (yWorld: number) => tubeYTop + (yWorld / TUBE_LEN_M) * (tubeYBot - tubeYTop);

      // Tube walls (two vertical rectangles flanking the bore)
      const leftWallX = cx - tubeOuter / 2;
      const rightWallX = cx + tubeBore / 2;
      const wallW = (tubeOuter - tubeBore) / 2;
      ctx.fillStyle = withAlpha(colors.accent, 0.18);
      ctx.fillRect(leftWallX, tubeYTop, wallW, tubeYBot - tubeYTop);
      ctx.fillRect(rightWallX, tubeYTop, wallW, tubeYBot - tubeYTop);
      ctx.strokeStyle = withAlpha(colors.accent, 0.6);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(leftWallX, tubeYTop, wallW, tubeYBot - tubeYTop);
      ctx.strokeRect(rightWallX, tubeYTop, wallW, tubeYBot - tubeYTop);

      // Bore guide (faint vertical dashed line)
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = colors.borderStrong;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, tubeYTop);
      ctx.lineTo(cx, tubeYBot);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Magnet — small bar (N on bottom, S on top) at current y
      const magW = 36,
        magH = 22;
      const magYpx = yPx(c.y);
      const magX = cx - magW / 2;
      if (c.y >= -0.1 && c.y <= TUBE_LEN_M + 0.15) {
        // S half (top, blue)
        ctx.fillStyle = colors.blue;
        ctx.fillRect(magX, magYpx - magH / 2, magW, magH / 2);
        // N half (bottom, pink)
        ctx.fillStyle = colors.pink;
        ctx.fillRect(magX, magYpx, magW, magH / 2);
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 1;
        ctx.strokeRect(magX, magYpx - magH / 2, magW, magH);
        ctx.restore();
        drawLabel(ctx, {
          text: 'S',
          x: cx,
          y: magYpx - magH / 4,
          color: colors.bg,
          weight: 'bold',
          font: '10px "JetBrains Mono"',
          align: 'center',
          baseline: 'middle',
        });
        drawLabel(ctx, {
          text: 'N',
          x: cx,
          y: magYpx + magH / 4,
          color: colors.bg,
          weight: 'bold',
          font: '10px "JetBrains Mono"',
          align: 'center',
          baseline: 'middle',
        });
      }

      // Eddy-current rings. Two glowing teal rings:
      //   - one ABOVE the magnet (where flux is increasing → induced
      //     current opposes the magnet, generating B that pushes magnet up)
      //   - one BELOW the magnet (where flux is decreasing → induced
      //     current sustains flux, pulling magnet back up)
      // Both produce upward-on-magnet forces. We render them as horizontal
      // ellipses at fixed offset above/below the magnet, with brightness
      // tied to |v|.
      const speedRel = Math.min(1, Math.abs(c.v) / Math.max(0.1, v_term));
      const ringAlpha = 0.25 + 0.6 * speedRel;
      const ringYAbove = magYpx - 28;
      const ringYBelow = magYpx + 28;
      const ringRy = 8;
      const ringRx = (tubeOuter + tubeBore) / 4 + wallW / 2;
      for (const [yR, label] of [
        [ringYAbove, 'Φ ↑ · current opposes'],
        [ringYBelow, 'Φ ↓ · current sustains'],
      ] as [number, string][]) {
        if (yR < tubeYTop + 5 || yR > tubeYBot - 5) continue;
        // Two rings — one on each wall
        for (const wx of [cx - (tubeOuter + tubeBore) / 4, cx + (tubeOuter + tubeBore) / 4]) {
          ctx.strokeStyle = withAlpha(colors.teal, ringAlpha);
          ctx.lineWidth = 1.6 + 1.4 * speedRel;
          ctx.beginPath();
          ctx.ellipse(wx, yR, ringRx, ringRy, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Direction arrowhead on the right edge
          ctx.fillStyle = withAlpha(colors.teal, ringAlpha);
          ctx.beginPath();
          ctx.moveTo(wx + ringRx - 1, yR);
          ctx.lineTo(wx + ringRx - 6, yR - 4);
          ctx.lineTo(wx + ringRx - 6, yR + 4);
          ctx.closePath();
          ctx.fill();
        }
        // Annotation
        if (speedRel > 0.05) {
          drawLabel(ctx, {
            text: label,
            x: rightWallX + wallW + 12,
            y: yR,
            color: withAlpha(colors.teal, 0.85),
            font: '10px "JetBrains Mono", monospace',
            baseline: 'middle',
          });
        }
      }

      // Drag-force arrow on the magnet (red/blue upward arrow when falling)
      if (Math.abs(c.v) > 0.01) {
        const dragLen = 14 + 30 * speedRel;
        ctx.strokeStyle = withAlpha(colors.pink, 0.9);
        ctx.fillStyle = withAlpha(colors.pink, 0.9);
        ctx.lineWidth = 2;
        const aTop = magYpx - magH / 2 - 4;
        ctx.beginPath();
        ctx.moveTo(cx, aTop);
        ctx.lineTo(cx, aTop - dragLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, aTop - dragLen);
        ctx.lineTo(cx - 4, aTop - dragLen + 6);
        ctx.lineTo(cx + 4, aTop - dragLen + 6);
        ctx.closePath();
        ctx.fill();
        drawLabel(ctx, {
          text: 'F_drag',
          x: cx + 8,
          y: aTop - dragLen / 2,
          color: colors.pink,
          font: '10px "JetBrains Mono", monospace',
          baseline: 'middle',
        });
      }

      // Gravity arrow (always down)
      const gLen = 16;
      ctx.strokeStyle = withAlpha(colors.textDim, 0.6);
      ctx.fillStyle = withAlpha(colors.textDim, 0.6);
      ctx.lineWidth = 1.4;
      const gTop = magYpx + magH / 2 + 4;
      ctx.beginPath();
      ctx.moveTo(cx, gTop);
      ctx.lineTo(cx, gTop + gLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, gTop + gLen);
      ctx.lineTo(cx - 3, gTop + gLen - 5);
      ctx.lineTo(cx + 3, gTop + gLen - 5);
      ctx.closePath();
      ctx.fill();
      drawLabel(ctx, {
        text: 'm g',
        x: cx + 8,
        y: gTop + gLen / 2,
        color: colors.textDim,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'middle',
      });

      // Speedometer panel (top-left)
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      drawLabel(ctx, {
        text: `v = ${c.v.toFixed(3)} m/s`,
        x: 14,
        y: 14,
        color: colors.text,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `v_term ≈ ${v_term.toFixed(3)} m/s`,
        x: 14,
        y: 30,
        color: colors.accent,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `wall = ${wall_mm.toFixed(2)} mm`,
        x: 14,
        y: 46,
        color: colors.teal,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
    },
    [resetTick],
    () => ({
      context: { y: 0.0, v: 0.0, _flick: 0 } as unknown as EddyCtx,
    }),
  );

  return (
    <Demo
      figure={figure}
      title="The magnet that won't fall — eddy currents in a copper tube"
      question="Why does a neodymium magnet take seconds to fall through a copper pipe it could free-fall through in a third of a second?"
      caption={
        <>
          The magnet's changing flux through each ring of the copper wall drives a circulating eddy
          current; that current creates its own B-field, which by Lenz's law pulls back on the
          magnet. The drag force scales linearly with velocity, so the magnet accelerates only until{' '}
          <strong>m g = k v</strong> and then drifts down at a terminal speed orders of magnitude
          below free-fall. Thicker walls mean lower ring resistance, larger k, slower terminal v.
        </>
      }
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={360} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="wall thickness"
          value={wall_mm}
          min={0.2}
          max={6}
          step={0.05}
          format={(v) => v.toFixed(2) + ' mm'}
          onChange={setWallMm}
        />
        <MiniToggle
          label={running ? 'falling' : 'paused'}
          checked={running}
          onChange={setRunning}
        />
        <MiniSlider
          label="(reset to top)"
          value={0}
          min={0}
          max={1}
          step={1}
          format={() => 'click to reset'}
          onChange={() => setResetTick((t) => t + 1)}
        />
        <MiniReadout label="v (now)" value={<Num value={v} />} unit="m/s" />
        <MiniReadout label="v_term" value={<Num value={v_term} />} unit="m/s" />
      </DemoControls>
      <EquationStrip
        leftLabel="Linear drag from induction"
        left={<M tex={`F_{\\text{drag}} \\;=\\; k v, \\quad k \\propto \\dfrac{B^{2} L^{2}}{R}`} />}
        rightLabel="Terminal velocity"
        right={
          <M
            tex={`v_{\\text{term}} \\;=\\; \\dfrac{m g}{k} \\;\\approx\\; ${v_term.toFixed(3)}\\ \\text{m/s}`}
          />
        }
      />
    </Demo>
  );
}
